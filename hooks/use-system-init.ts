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
  const stage: 'MIGRATING' | 'SEEDING' | 'READY' = !migrationSuccess ? 'MIGRATING' : (isReady ? 'READY' : 'SEEDING');
  
  return {
    isReady, // 只有当 迁移成功 AND 种子数据初始化成功 后才为 true
    error: migrationError || initError, // 返回任意一个阶段的错误
    stage
  };
};