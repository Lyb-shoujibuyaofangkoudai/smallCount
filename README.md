# 个人财务管理应用 (Personal Finance Manager)

一个基于Expo和React Native开发的跨平台个人财务管理应用，支持iOS、Android和Web平台。

## 功能特性

- 💰 **交易管理**：记录收入、支出和转账交易
- 🏦 **账户管理**：支持多种账户类型（现金、银行卡、信用卡等）
- 📊 **统计分析**：提供交易数据的可视化分析
- 📅 **预算管理**：设置和管理预算目标
- 🏷️ **标签分类**：为交易添加标签进行分类
- 📱 **多平台支持**：iOS、Android和Web
- 🌙 **主题切换**：支持亮色/暗色主题
- 🔒 **本地存储**：数据存储在本地SQLite数据库

## 技术栈

- **框架**：Expo SDK 54, React Native 0.81
- **路由**：Expo Router
- **数据库**：SQLite + Drizzle ORM
- **样式**：Tailwind CSS + NativeWind
- **导航**：React Navigation
- **状态管理**：React Context
- **类型检查**：TypeScript

## 项目结构

```
test_expo_app/
├── app/                 # 应用页面 (Expo Router)
├── assets/             # 静态资源
├── components/         # 可复用组件
│   ├── biz/           # 业务组件
│   ├── ui/            # UI组件
│   └── widgets/       # 小部件
├── constants/          # 常量定义
├── context/           # React Context
├── db/                # 数据库相关
│   ├── migrations/   # 数据库迁移
│   ├── repositories/ # 数据访问层
│   └── services/     # 业务服务
├── hooks/             # 自定义Hooks
├── navigation/        # 导航配置
├── theme/            # 主题配置
└── utils/            # 工具函数
```

## 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn
- Expo CLI (可选)

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 启动开发服务器
npm start

# 或直接运行特定平台
npm run android    # Android
npm run ios        # iOS (需要macOS)
npm run web        # Web
```

### 数据库迁移

当数据库schema发生变化时，需要生成迁移文件：

```bash
npx drizzle-kit generate
```

## 数据库设计

应用使用SQLite数据库，主要包含以下表：

- **users** - 用户信息
- **accounts** - 账户信息
- **transactions** - 交易记录
- **budgets** - 预算设置
- **tags** - 交易标签
- **attachments** - 附件管理

## 主要功能模块

### 1. 交易管理
- 添加收入/支出/转账交易
- 交易分类和标签
- 交易时间记录
- 收据图片上传

### 2. 账户管理
- 多种账户类型支持
- 账户余额跟踪
- 信用卡账单管理

### 3. 统计分析
- 收支趋势分析
- 分类统计
- 预算执行情况

### 4. 预算管理
- 周期预算设置
- 预算进度跟踪
- 预算提醒

## 开发指南

### 添加新页面

1. 在 `app/` 目录下创建新的tsx文件
2. 使用Expo Router的文件系统路由
3. 导出默认组件

### 数据库操作

使用Repository模式进行数据库操作：

```typescript
import { AccountRepository } from '@/db/repositories/AccountRepository';

const accountRepo = new AccountRepository();
const accounts = await accountRepo.findAll();
```

### 样式开发

使用Tailwind CSS类名：

```tsx
<View className="flex-1 bg-white dark:bg-gray-900">
  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
    标题
  </Text>
</View>
```

## 构建发布

### 构建应用

```bash
# 构建Android APK
expo build:android

# 构建iOS IPA (需要macOS)
expo build:ios

# 构建Web静态文件
expo build:web
```

### EAS构建

使用Expo Application Services进行云构建：

```bash
# 安装EAS CLI
npm install -g @expo/eas-cli

# 配置EAS
eas build:configure

# 构建
eas build --platform android
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：

- 邮箱：developer@example.com
- GitHub Issues：项目Issues页面