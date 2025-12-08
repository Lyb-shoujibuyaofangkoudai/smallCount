# smallCount 📊 个人财务管理应用

![GitHub](https://img.shields.io/github/license/smallCount/smallCount)
![GitHub last commit](https://img.shields.io/github/last-commit/smallCount/smallCount)


## 为什么要开发这个项目
由于离职了，目前也还没有找工作的打算，看到了trae、cursor这些产品的AI功能变得更强了，正好自己想尝试一下学习成果，所以就开发了这个项目。

## 项目介绍
一个功能强大、界面美观的跨平台个人财务管理应用，基于Expo和React Native开发，支持iOS、Android平台，帮助用户轻松管理个人财务，追踪收支，分析消费习惯。

## 📱 界面展示

下面是应用的主要界面展示，展示了各项核心功能和美观的UI设计，包含亮色和暗色两种主题模式：

### 亮色模式

#### 主界面与交易管理

| 主界面-明细列表 | 主界面-日历视图 | 图表统计 |
|--------|----------|----------|
| ![主界面-明细列表](demo/1.png) | ![主界面-日历视图](demo/2.png) | ![图表统计](demo/3.png) |

#### 统计分析与账户管理

| 新增交易单 | 账户管理 | 设置中心 |
|----------|----------|----------|
| ![新增交易单](demo/4.png) | ![账户管理](demo/5.png) | ![设置中心](demo/6.png) |

### 暗色模式

#### 主界面与交易管理

| 主界面-明细列表(暗色) | 主界面-日历视图(暗色) | 图表统计(暗色) |
|--------|----------|----------|
| ![主界面-明细列表(暗色)](demo/7.png) | ![主界面-日历视图(暗色)](demo/8.png) | ![图表统计(暗色)](demo/9.png) |

#### 统计分析与账户管理

| 新增交易单(暗色) | 账户管理(暗色) | 设置中心(暗色) |
|----------|----------|----------|
| ![新增交易单(暗色)](demo/10.png) | ![账户管理(暗色)](demo/11.png) | ![设置中心](demo/12.png) |

#### 新增AI功能

| AI入口(暗色) | AI页面(暗色) | AI设置(暗色) |
|----------|----------|----------|
| ![AI入口(暗色)](demo/13.png) | ![AI页面(暗色)](demo/14.png) | ![AI设置(暗色)](demo/15.png) |

## 🚀 功能特性

- 💰 **全面的交易管理**
  - 支持收入、支出和转账交易记录
  - 快速添加交易，支持备注和收据图片
  - 交易历史记录查询和管理

- 🤖 **AI智能助手**
  - 智能分析消费习惯，提供个性化理财建议
  - 自然语言交互，轻松查询财务状况
  - 支持账单智能分类和标签推荐
  - AI驱动的预算规划和消费预警

- 📥 **便捷的数据导入导出**
  - 支持支付宝、微信账单一键导入
  - 系统账单数据导出为CSV/JSON格式
  - 跨平台数据迁移和备份恢复功能
  - 智能识别和转换第三方账单格式

- 🏦 **多账户支持**
  - 支持多种账户类型（现金、银行卡、信用卡等）
  - 账户余额实时显示和管理
  - 账户间便捷转账

- 📊 **智能统计分析**
  - 支出和收入分类统计图表
  - 月度、周度财务分析
  - 消费习惯可视化展示

- 🏷️ **灵活的标签系统**
  - 自定义收入和支出分类标签
  - 标签颜色和图标自定义
  - 快速按标签筛选和分析交易

- 🎨 **现代化UI体验**
  - 支持亮色/暗色主题切换
  - 流畅的动画和交互效果
  - 响应式设计，适配多种设备

- 🔒 **安全与隐私**
  - 数据存储在本地SQLite数据库，保障隐私安全
  - 支持数据备份和恢复
  - 无云端依赖，完全本地运行

## 🛠️ 技术栈

| 类别 | 技术/库 | 版本 |
|------|---------|------|
| **框架** | Expo SDK | ~54.0.25 |
| **核心语言** | React Native | 0.81.5 |
| **前端框架** | React | 19.1.0 |
| **路由管理** | Expo Router | ~6.0.15 |
| **数据库** | SQLite + Drizzle ORM | ~16.0.9 / ^0.44.7 |
| **UI样式** | Tailwind CSS + NativeWind | ^3.4.18 / ^4.2.1 |
| **状态管理** | Zustand | ^5.0.8 |
| **类型系统** | TypeScript | ~5.9.2 |
| **图表可视化** | react-native-chart-kit | ^6.12.0 |
| **UI组件** | React Navigation | ^7.1.8 |
| **本地存储** | AsyncStorage | 2.2.0 |

## 📁 项目结构

```
smallCount/
├── app/                 # 应用页面 (Expo Router)
│   ├── (tabs)/         # 标签页面（主页、统计、账户、个人中心）
│   └── transaction/    # 交易相关页面
├── assets/             # 静态资源
│   └── images/         # 图片资源
├── components/         # 可复用组件
│   ├── biz/           # 业务组件
│   │   └── charts/    # 图表组件
│   ├── ui/            # UI组件
│   │   └── AddTransaction/ # 添加交易相关UI
│   └── widgets/       # 小部件（日历、余额显示等）
├── constants/          # 常量定义
├── context/           # React Context（主题、数据库）
├── db/                # 数据库相关
│   ├── migrations/   # 数据库迁移
│   ├── repositories/ # 数据访问层
│   └── services/     # 业务服务
├── hooks/             # 自定义Hooks
├── storage/           # 存储相关
│   └── store/        # Zustand状态管理
├── theme/             # 主题配置
└── utils/             # 工具函数
```

## 🎯 数据库设计

应用采用SQLite数据库，通过Drizzle ORM进行操作，主要包含以下表结构：

### 1. users（用户表）
- **id**: 主键，用户唯一标识
- **username**: 用户名
- **email**: 邮箱（唯一）
- **created_at**: 创建时间
- **updated_at**: 更新时间
- **last_login_at**: 最后登录时间

### 2. accounts（账户表）
- **id**: 主键，账户唯一标识
- **user_id**: 外键，关联用户
- **name**: 账户名称
- **type**: 账户类型（现金、银行卡、信用卡等）
- **balance**: 当前余额
- **initial_balance**: 初始余额
- **currency**: 货币类型
- **color**: 账户颜色
- **account_number**: 账号
- **bank_name**: 银行名称
- **credit_limit**: 信用额度（信用卡）
- **billing_day**: 账单日（信用卡）
- **due_day**: 还款日（信用卡）

### 3. transactions（交易表）
- **id**: 主键，交易唯一标识
- **account_id**: 外键，关联账户
- **type**: 交易类型（支出、收入、转账）
- **amount**: 交易金额
- **description**: 交易描述
- **tag_id**: 外键，关联标签
- **transfer_account_id**: 转账目标账户
- **transaction_date**: 交易日期
- **payment_method_id**: 外键，关联支付方式
- **notes**: 备注
- **receipt_image_url**: 收据图片URL
- **is_recurring**: 是否周期性交易

### 4. tags（标签表）
- **id**: 主键，标签唯一标识
- **name**: 标签名称
- **color**: 标签颜色
- **icon**: 标签图标
- **type**: 标签类型（支出、收入）
- **is_default**: 是否默认标签

### 5. payment_methods（支付方式表）
- **id**: 主键，支付方式唯一标识
- **name**: 支付方式名称
- **icon**: 支付方式图标

### 6. budgets（预算表）
- **id**: 主键，预算唯一标识
- **account_id**: 外键，关联账户
- **amount**: 预算金额
- **period**: 预算周期
- **year**: 预算年份
- **month**: 预算月份

## 🚀 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- npm 8.x 或 yarn 1.x
- Expo CLI（推荐使用最新版本）
- Android Studio（用于Android开发）
- Xcode（用于iOS开发，仅macOS）

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/smallCount/smallCount.git
cd smallCount
```

2. **安装依赖**

```bash
# 使用npm
npm install

# 或使用yarn
yarn install
```

3. **数据库初始化**
参考[数据库使用文档](https://drizzle.zhcndoc.com/docs/get-started/expo-new)
```bash
# 生成初始迁移文件
npx drizzle-kit generate
```

4. **启动开发服务器**

```bash
npx expo start
```

5. **运行应用**

- **使用Expo Go应用**：扫描终端中的二维码
- **运行到Android设备/模拟器**：按 `a`
- **运行到iOS设备/模拟器**：按 `i`（需要macOS）
- **运行到Web**：按 `w`

## 📱 运行命令

```bash
# 启动开发服务器
npm start

# 运行到特定平台
npm run android    # Android
npm run ios        # iOS (需要macOS)
npm run web        # Web

# 代码检查
npm run lint
```

## 📝 开发指南

### 添加新功能

1. 遵循项目的代码风格和架构模式
2. 确保所有组件支持亮暗两种主题
3. 数据库操作遵循分层架构：数据库操作层（db/repositories）、业务逻辑层（db/services）
4. 使用zustand进行状态管理（storage/stores）
5. 为新功能添加适当的注释和文档

### 代码规范

- 样式编写使用NativeWind（Tailwind CSS）
- 组件命名使用PascalCase
- 函数和变量命名使用camelCase
- 常量使用UPPER_SNAKE_CASE
- 使用TypeScript进行类型检查

## 🗓️ 项目规划

项目目前为第一版，已完成最基础的功能。

### 已完成功能
- [x] 交易管理（添加、编辑、删除交易）
- [x] 账户管理（创建、编辑账户）
- [x] 标签系统（自定义收入/支出标签）
- [x] 基础统计图表
- [x] 亮暗主题切换
- [x] AI智能助手功能
- [x] 支付宝/微信账单导入
- [x] 系统账单数据导入导出

### 计划功能
- ⏳ **预算管理**：设置月度/年度预算，超支提醒
- ⏳ **云同步功能**：实现跨设备数据同步
- ⏳ **周期性交易**：支持设置固定周期的自动交易
- ⏳ **多币种支持**：支持多种货币账户和汇率转换
- ⏳ **高级报表功能**：自定义报表和财务分析报告

## 📄 License

本项目采用 **CC BY-NC 4.0 协议** 进行开源（详细条款见 [LICENSE](LICENSE) 文件）：
- ✅ 允许：个人非商业用途的使用，如：修改、分享（需注明原作者）、学习等非商业用途；
- ❌ 禁止：未经授权的商业使用（包括但不限于出售、商业化部署、嵌入商业产品、盈利性服务等）；
- 📞 商业授权：如需将本项目用于商业场景，请联系 [leed]（邮箱：1103782715@qq.com）协商授权事宜。

> 注：任何违反协议的商业使用，作者保留追究法律责任的权利。

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！请通过以下方式参与：

1. Fork本仓库
2. 创建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交更改（`git commit -m 'Add some amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 开启Pull Request

## 📬 联系方式

如有问题或建议，请通过以下方式联系：

- 邮箱：1103782715@qq.com
- GitHub Issues：项目Issues页面

## 🎉 致谢

感谢所有为项目做出贡献的开发者和用户！

## 💝 捐赠支持

如果您觉得这个项目对您有帮助，不妨请作者喝一杯咖啡☕️，让作者继续肝代码！您的每一份支持都是我持续改进的超级动力💪！

| 微信捐赠二维码 |
|--------|
| ![微信捐赠二维码](demo/juanzheng.jpg) |

---

Made with ❤️ by smallCount Team