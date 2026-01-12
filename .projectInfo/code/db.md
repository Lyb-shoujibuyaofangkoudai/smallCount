# 数据库expo-sqlite

## 1. 安装expo-sqlite
```cmd
npx expo install expo-sqlite
```

## 2. 配置app.json
```json
{
  "expo": {
    "plugins": [
      [
        "expo-sqlite",
        {
          "enableFTS": true,
          "useSQLCipher": true,
          "android": {
            // Override the shared configuration for Android
            "enableFTS": false,
            "useSQLCipher": false
          },
          "ios": {
            // You can also override the shared configurations for iOS
            "customBuildFlags": ["-DSQLITE_ENABLE_DBSTAT_VTAB=1 -DSQLITE_ENABLE_SNAPSHOT=1"]
          }
        }
      ]
    ]
  }
}
```

## 3. 兼容web
metro.config.js
```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('sql');

// Add wasm asset support
config.resolver.assetExts.push('wasm');
 
// Add COEP and COOP headers to support SharedArrayBuffer
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    middleware(req, res, next);
  };
};
module.exports = withNativeWind(config);

```

## 4. 目录结构

```
db/
├── db.ts                    # 数据库连接配置和初始化
├── schema.ts               # 数据库表结构定义
├── migrations/             # 数据库迁移文件
│   ├── 0000_stiff_goliath.sql  # 初始迁移脚本
│   ├── migrations.js       # 迁移配置
│   └── meta/               # 迁移元数据
│       ├── 0000_snapshot.json  # 数据库快照
│       └── _journal.json   # 迁移日志
├── repositories/           # 数据访问层
│   ├── BaseRepository.ts   # 基础仓库类
│   ├── UserRepository.ts   # 用户数据仓库
└── services/               # 业务逻辑层
    └── SeedService.ts      # 数据种子服务
```
## 5. 数据库连接配置
db.ts
```typescript
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync, openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';
import * as schema from './schema';

const DB_NAME = 'small_count_app.db';

export type DbType = ReturnType<typeof drizzle<typeof schema>>;

let _db: DbType | null = null;
let _initPromise: Promise<void> | null = null; // 防止并发调用

// ==========================================
// 1. SQL 定义 这里要通过命令生成的sql，直接复制粘贴即可，但是表之间如果有引用，需要手动修改表顺序，因为命令生成的表顺序可能不是我们期望的，他是按照字母顺序生成的
// ==========================================
const MIGRATION_SQL = `
-- 1. Users
CREATE TABLE IF NOT EXISTS \`users\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`username\` text NOT NULL,
	\`email\` text,
	\`password_hash\` text,
	\`phone\` text,
	\`avatar_url\` text,
	\`display_name\` text,
	\`currency\` text DEFAULT 'CNY',
	\`is_active\` integer DEFAULT true,
	\`created_at\` integer DEFAULT (strftime('%s', 'now')),
	\`updated_at\` integer DEFAULT (strftime('%s', 'now')),
	\`last_login_at\` integer
);

`;

// ==========================================
// 2. 辅助函数
// ==========================================

async function runWebMigrations(expoDb: SQLiteDatabase) {
  const statements = MIGRATION_SQL.split('--> statement-breakpoint');

  for (const statement of statements) {
    const cleanSql = statement.trim();
    // 过滤掉空语句或纯注释
    if (!cleanSql || cleanSql.startsWith('--') && !cleanSql.includes('\n')) {
        continue;
    }

    try {
      await expoDb.execAsync(cleanSql);
    } catch (e: any) {
      console.error('Migration failed on SQL:', cleanSql.substring(0, 100));
      console.error('Error detail:', e);
      // 防止出现 "no such table"
      throw new Error(`Migration stopped due to error: ${e.message}`);
    }
  }
}

// ==========================================
// 3. 初始化逻辑
// ==========================================

const _init = async () => {
    if (_db) return;

    if (Platform.OS === 'web') {
        try {
            const expoDb = await openDatabaseAsync(DB_NAME);
            
            // 可选：启用 WAL 模式可能有助于某些并发情况，但在 Web WASM 上支持有限
            // await expoDb.execAsync('PRAGMA journal_mode = WAL;'); 
            
            await runWebMigrations(expoDb);
            _db = drizzle(expoDb, { schema });
            console.log('✅ Web Database initialized');
        } catch (e: any) {
            // 专门处理 Web 锁错误
            if (String(e).includes('NoModificationAllowedError') || String(e).includes('Access Handles')) {
                console.error('🛑 数据库被锁定。请关闭其他标签页或完全刷新页面。');
                // 在开发环境下，这通常意味着热重载导致的句柄未释放
                // 我们可以尝试让用户知道需要硬刷新
                alert('数据库文件被锁定 (Dev Mode Lock)。请关闭所有标签页并重新打开，或清除浏览器缓存。');
            } else {
                console.error('在浏览器中初始化数据库失败: 请确保数据库文件没有被其他进程锁定，没有被其他浏览器插件影响', e);
            }
            throw e;
        }
    } else {
        const expoDb = openDatabaseSync(DB_NAME);
        _db = drizzle(expoDb, { schema });
    }
};

export const initDatabase = async (): Promise<void> => {
    // 防止并发初始化（例如 App 组件重渲染导致多次调用）
    if (!_initPromise) {
        _initPromise = _init().catch(err => {
            _initPromise = null; // 失败允许重试
            throw err;
        });
    }
    return _initPromise;
};

// ==========================================
// 4. 导出 db Proxy
// ==========================================

export const db = new Proxy({} as DbType, {
  get: (_target, prop) => {
    if (_db) return (_db as any)[prop];

    if (Platform.OS !== 'web') {
      // Native 端自动同步回退
      const expoDb = openDatabaseSync(DB_NAME);
      _db = drizzle(expoDb, { schema });
      return (_db as any)[prop];
    }

    throw new Error(
      'Database not initialized. Call "await initDatabase()" first.'
    );
  },
});
```

## 6. schema定义
schema.ts
```typescript
import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// 辅助函数：生成 UUID (SQLite 默认没有 uuid() 函数，需在应用层生成或使用 polyfill)
// 这里我们假设在插入时由应用层传入 ID，或者使用 text 默认值 (如果使用了 native 扩展)
// 为了通用性，我们在 Repository 层处理 ID 生成。

// 1. 用户表 (users)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // 用户唯一标识符，UUID 主键
  username: text('username').notNull().unique(), // 用户名，唯一且不能为空
  email: text('email').unique(), // 邮箱地址
  passwordHash: text('password_hash'), // 密码哈希值
  phone: text('phone'), // 手机号码
  avatarUrl: text('avatar_url'), // 头像图片 URL
  displayName: text('display_name'), // 显示名称
  currency: text('currency').default('CNY'), // 默认货币代码，如 CNY/USD
  isActive: integer('is_active', { mode: 'boolean' }).default(true), // 账户是否激活
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`), // 创建时间（Unix 时间戳）
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`), // 最后更新时间（需代码层维护）
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }), // 最后登录时间
});
```


## 7. 创建BaseRepository类 repositories/BaseRepository
```typescript
    import { v4 as generateUUID } from 'uuid';
    import { db } from '../db';

// 定义一个基础接口，假设所有表都有 id
interface TableWithId {
    id: any;
    updatedAt?: any;
}

export class BaseRepository<T extends TableWithId> {
    protected db = db;

    constructor(protected table: any) {}

    protected generateId(): string {
        return generateUUID();
    }

    // 可以在这里封装通用的 findById, delete 等方法
    // 但为了严谨性，建议在具体 Repository 中实现，以处理特定的关联查询
}
```






## 8. 创建用户Repository repositories/UserRepository
```typescript
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { users } from '../schema';
import { BaseRepository } from './BaseRepository';

type User = InferSelectModel<typeof users>;
type NewUser = InferInsertModel<typeof users>;

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(users);
  }

  async create(data: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = this.generateId();
    const [newUser] = await this.db
      .insert(users)
      .values({
        ...data,
        id,
        updatedAt: new Date(),
      })
      .returning();
    return newUser;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return await this.db.query.users.findFirst({ where: eq(users.username, username) });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.db.query.users.findFirst({ where: eq(users.email, email) });
  }

  async findAny(): Promise<User | undefined> {
    return await this.db.query.users.findFirst();
  }
}
```

## 9. 创建用户初始化的种子服务 SeedService services/SeedService
```typescript
import { AccountRepository } from '../repositories/AccountRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { UserRepository } from '../repositories/UserRepository';
import { AccountService } from './AccountService';

const DEFAULT_USERNAME = 'default_user';
const DEFAULT_EMAIL = 'default@local';

async function ensureDefaultUser() {
  const userRepo = new UserRepository();
  const existing = await userRepo.findByUsername(DEFAULT_USERNAME);
  if (existing) return existing;
  return await userRepo.create({
    username: DEFAULT_USERNAME,
    email: DEFAULT_EMAIL,
    passwordHash: 'default',
    displayName: '默认用户',
    currency: 'CNY',
    isActive: true,
  });
}

export const SeedService = {
  /**
   * 初始化默认数据
   * 根据分层架构原则，服务层负责协调不同的仓库和服务
   * 1. 确保默认用户存在
   * 
   * @returns 初始化结果，包含用户ID
   */
  async initDefaultData() {
    console.log('开始初始化默认数据...');
    
    // 1. 确保默认用户存在 - 检查数据库中是否已有用户，如无则创建
    const user = await ensureDefaultUser();
    console.log(`用户初始化完成: ${user.displayName} (ID: ${user.id})`);
    
    return {
      userId: user.id,
    };
  },
};
```

## 10 .用于初始化的hook
```typescript
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'; // 1. 静态导入 Hook
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { db, initDatabase } from '../db/db'; // 1. 静态导入 db 实例
import migrations from '../db/migrations/migrations'; // 1. 静态导入迁移文件
import { SeedService } from '../db/services/SeedService';

export const useSystemInit = () => {
  // 2. 【关键】在最顶层调用 Hook
  // useMigrations 会自动在组件挂载时运行，并返回响应式状态
  const { success: migrationSuccess, error: migrationError } = useMigrations(db, migrations);

  // 3. 管理种子数据的状态
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    if(Platform.OS != 'web') return;
    initDatabase()
  })

  useEffect(() => {
    if (!migrationSuccess) return;

    if (migrationError) return;

    const runSeeding = async () => {
      try {
        console.log('✅ 迁移完成，开始初始化业务数据...');
        
        const result = await SeedService.initDefaultData();
        console.log('种子数据初始化完成', result);

        console.log('✅ 系统初始化完全就绪');
        setIsReady(true);
      } catch (e) {
        console.error('初始化数据失败:', e);
        setInitError(e instanceof Error ? e : new Error('Unknown initialization error'));
      }
    };

    runSeeding();
  }, [migrationSuccess, migrationError]); // 依赖项：当迁移状态改变时触发

  // 5. 返回统一的状态
  return {
    isReady, // 只有当 迁移成功 AND 种子数据初始化成功 后才为 true
    error: migrationError || initError, // 返回任意一个阶段的错误
    stage: !migrationSuccess ? 'MIGRATING' : (isReady ? 'READY' : 'SEEDING')
  };
};
```

## 11. 使用方式
1. 在需要初始化系统数据的组件中引入 `useSystemInit`
2. 调用 `useSystemInit` 并根据返回值处理状态
3. 当 `isReady` 为 true 时，系统数据初始化完成




