# 记账应用数据库表结构设计

## 概述

本文档详细描述了记账应用的数据库表结构设计，特别针对多账号功能进行了优化。核心业务数据以 `account_id` 归属账户以避免冗余：通过 `accounts.user_id` 实现用户数据隔离，分类与预算按账户维度管理，交易直接关联账户，不再重复存储 `user_id`。

## 数据库关系图

```
用户表 (users)
    ↓ 拥有
账户表 (accounts) ←→ 交易记录表 (transactions)
    ↓ 预算                ↓ 标签
预算表 (budgets) ←→ 标签表 (tags)
    ↓ 来源账户            ↓ 附件（交易维度）
附件表 (attachments)

关键关系说明：
- users → accounts: 一对多（一个用户拥有多个账户）
- accounts → budgets: 一对多（预算按账户维度管理）
- accounts → transactions: 一对多（交易归属账户；转账含源/目标账户）
- transactions → accounts: 转账关系（源账户和目标账户）
```

## 表结构详情

### 1. 用户表 (users)

存储用户基本信息和个人化设置。

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    display_name VARCHAR(100),
    currency VARCHAR(3) DEFAULT 'CNY',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);
```

**字段详细说明：**
| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | VARCHAR(36) | ✅ | uuid() | 用户唯一标识符，主键 |
| username | VARCHAR(50) | ✅ | - | 用户名，唯一且不能为空 |
| email | VARCHAR(100) | ✅ | - | 邮箱地址，唯一且不能为空 |
| password_hash | VARCHAR(255) | ✅ | - | 密码哈希值，存储加密后的密码 |
| phone | VARCHAR(20) | ❌ | NULL | 手机号码 |
| avatar_url | VARCHAR(255) | ❌ | NULL | 头像图片URL地址 |
| display_name | VARCHAR(100) | ❌ | NULL | 显示名称，可不同于用户名 |
| currency | VARCHAR(3) | ❌ | 'CNY' | 默认货币代码（CNY、USD等） |
| is_active | BOOLEAN | ❌ | TRUE | 账户是否激活状态 |
| created_at | TIMESTAMP | ❌ | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | ❌ | CURRENT_TIMESTAMP | 最后更新时间 |
| last_login_at | TIMESTAMP | ❌ | NULL | 最后登录时间 |

### 2. 账户表 (accounts)

管理用户的各类金融账户。

```sql
CREATE TABLE accounts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('cash', 'bank', 'credit_card', 'digital_wallet', 'investment', 'loan') NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'CNY',
    icon VARCHAR(10),
    color VARCHAR(7),
    account_number VARCHAR(100),
    bank_name VARCHAR(100),
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    billing_day INT,
    due_day INT,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**字段详细说明：**
| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | VARCHAR(36) | ✅ | uuid() | 账户唯一标识符，主键 |
| user_id | VARCHAR(36) | ✅ | - | 关联的用户ID，外键 |
| name | VARCHAR(100) | ✅ | - | 账户名称（如：招商银行卡） |
| type | ENUM | ✅ | - | 账户类型：现金/银行/信用卡/数字钱包/投资/贷款 |
| balance | DECIMAL(15,2) | ❌ | 0.00 | 账户当前余额 |
| currency | VARCHAR(3) | ❌ | 'CNY' | 账户货币类型 |
| icon | VARCHAR(10) | ❌ | NULL | 账户图标（emoji或图标代码） |
| color | VARCHAR(7) | ❌ | NULL | 账户颜色（十六进制颜色代码） |
| account_number | VARCHAR(100) | ❌ | NULL | 银行账号或卡号 |
| bank_name | VARCHAR(100) | ❌ | NULL | 银行名称 |
| credit_limit | DECIMAL(15,2) | ❌ | 0.00 | 信用卡额度（仅信用卡类型） |
| billing_day | INT | ❌ | NULL | 信用卡账单日（1-31） |
| due_day | INT | ❌ | NULL | 信用卡还款日（1-31） |
| is_active | BOOLEAN | ❌ | TRUE | 账户是否激活 |
| is_default | BOOLEAN | ❌ | FALSE | 是否为默认账户 |
| notes | TEXT | ❌ | NULL | 账户备注信息 |
| created_at | TIMESTAMP | ❌ | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | ❌ | CURRENT_TIMESTAMP | 最后更新时间 |

**账户类型说明：**
- `cash`: 现金账户
- `bank`: 银行储蓄账户
- `credit_card`: 信用卡账户
- `digital_wallet`: 数字钱包（微信、支付宝等）
- `investment`: 投资账户（股票、基金等）
- `loan`: 贷款账户

### 3. 交易记录表 (transactions)

核心交易数据表。

```sql
CREATE TABLE transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
    type ENUM('expense', 'income', 'transfer') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    transfer_account_id VARCHAR(36),
    transaction_date DATE NOT NULL,
    transaction_time TIME,
    payment_method ENUM('cash', 'credit_card', 'debit_card', 'digital_wallet', 'bank_transfer', 'other', 'wechat_pay', 'alipay') NOT NULL,
    location VARCHAR(255),
    notes TEXT,
    receipt_image_url VARCHAR(255),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_rule VARCHAR(100),
    is_confirmed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (transfer_account_id) REFERENCES accounts(id)
);
```

**字段详细说明：**
| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | VARCHAR(36) | ✅ | uuid() | 交易唯一标识符，主键 |
| type | ENUM | ✅ | - | 交易类型：支出/收入/转账 |
| amount | DECIMAL(15,2) | ✅ | - | 交易金额，正数 |
| description | VARCHAR(255) | ✅ | - | 交易描述（如：午餐、工资） |
| account_id | VARCHAR(36) | ✅ | - | 关联的账户ID（支出/收入的账户） |
| transfer_account_id | VARCHAR(36) | ❌ | NULL | 转账目标账户ID（仅转账类型） |
| transaction_date | DATE | ✅ | - | 交易日期 |
| transaction_time | TIME | ❌ | NULL | 交易时间 |
| payment_method | ENUM | ✅ | - | 支付方式：现金/信用卡/借记卡/数字钱包/银行转账 |
| location | VARCHAR(255) | ❌ | NULL | 交易地点 |
| notes | TEXT | ❌ | NULL | 交易备注 |
| receipt_image_url | VARCHAR(255) | ❌ | NULL | 收据图片URL |
| is_recurring | BOOLEAN | ❌ | FALSE | 是否为周期性交易 |
| recurring_rule | VARCHAR(100) | ❌ | NULL | 周期性规则（如：每月1号） |
| is_confirmed | BOOLEAN | ❌ | TRUE | 交易是否已确认 |
| created_at | TIMESTAMP | ❌ | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | ❌ | CURRENT_TIMESTAMP | 最后更新时间 |

**转账处理说明：**
- 转账交易记录源账户（`account_id`）和目标账户（`transfer_account_id`）
- 转账金额在源账户为支出，在目标账户为收入
- 转账交易需要同时更新两个账户的余额

### 4. 预算表 (budgets)

管理用户预算设置。

```sql
CREATE TABLE budgets (
    id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
    account_id VARCHAR(36) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    period ENUM('daily', 'weekly', 'monthly', 'yearly') DEFAULT 'monthly',
    year INT NOT NULL,
    month INT,
    week INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);
```

**字段详细说明：**
| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | VARCHAR(36) | ✅ | uuid() | 预算唯一标识符，主键 |
| account_id | VARCHAR(36) | ✅ | - | 关联的账户ID，外键 |
| amount | DECIMAL(15,2) | ✅ | - | 预算金额 |
| period | ENUM | ❌ | 'monthly' | 预算周期：日/周/月/年 |
| year | INT | ✅ | - | 预算年份 |
| month | INT | ❌ | NULL | 预算月份（1-12，仅月/年周期） |
| week | INT | ❌ | NULL | 预算周数（1-52，仅周周期） |
| is_active | BOOLEAN | ❌ | TRUE | 预算是否激活 |
| created_at | TIMESTAMP | ❌ | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | ❌ | CURRENT_TIMESTAMP | 最后更新时间 |

**预算周期说明：**
- **日预算**：按天设置预算，仅需year字段
- **周预算**：按周设置预算，需要year和week字段
- **月预算**：按月设置预算，需要year和month字段
- **年预算**：按年设置预算，仅需year字段

### 5. 标签表 (tags)

灵活的标签管理系统，直接关联交易。

```sql
CREATE TABLE tags (
    id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
    transaction_id VARCHAR(36) NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);
```

**字段详细说明：**
| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | VARCHAR(36) | ✅ | uuid() | 标签唯一标识符，主键 |
| transaction_id | VARCHAR(36) | ✅ | - | 关联的交易ID，外键 |
| name | VARCHAR(50) | ✅ | - | 标签名称（如：重要、报销） |
| color | VARCHAR(7) | ❌ | NULL | 标签颜色（十六进制颜色代码） |
| created_at | TIMESTAMP | ❌ | CURRENT_TIMESTAMP | 创建时间 |



### 6. 附件表 (attachments)

管理交易相关的附件文件，直接关联交易。

```sql
CREATE TABLE attachments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
    transaction_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);
```

**字段详细说明：**
| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | VARCHAR(36) | ✅ | uuid() | 附件唯一标识符，主键 |
| transaction_id | VARCHAR(36) | ✅ | - | 关联的交易ID，外键 |
| file_name | VARCHAR(255) | ✅ | - | 文件原始名称 |
| file_url | VARCHAR(500) | ✅ | - | 文件存储URL地址 |
| file_type | VARCHAR(50) | ❌ | NULL | 文件类型（如：image/jpeg） |
| file_size | INT | ❌ | NULL | 文件大小（字节） |
| uploaded_at | TIMESTAMP | ❌ | CURRENT_TIMESTAMP | 上传时间 |

**附件管理说明：**
- 支持为每笔交易上传多个附件
- 附件可以是收据图片、发票等文件
- 文件URL指向实际存储位置

## 索引设计

### 主要索引
```sql
-- 用户相关索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- 账户相关索引
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(type);

-- 交易相关索引
CREATE INDEX idx_transactions_account_date ON transactions(account_id, transaction_date);
CREATE INDEX idx_transactions_account ON transactions(account_id);

-- 标签相关索引
CREATE INDEX idx_tags_transaction_id ON tags(transaction_id);

-- 预算相关索引
CREATE INDEX idx_budgets_account_period ON budgets(account_id, year, month);
```

## 多账号功能设计要点

### 1. 数据隔离
- 通过 `accounts.user_id` 实现用户数据隔离，核心业务表以 `account_id` 归属
- 外键约束确保数据完整性
- 级联删除保护数据一致性

### 2. 个性化设置
- 用户可自定义货币、语言、时区
- 支持主题切换
- 默认账户设置

### 3. 扩展性考虑
- 支持多种账户类型
- 直接关联交易的标签系统
- 附件管理功能
- 周期性交易支持

## 使用示例

### 创建新用户
```sql
INSERT INTO users (username, email, password_hash, currency, language) 
VALUES ('user123', 'user@example.com', 'hashed_password', 'CNY', 'zh-CN');
```

### 添加默认账户
```sql
INSERT INTO accounts (user_id, name, type, is_default) 
VALUES ('user-uuid', '现金', 'cash', TRUE);
```

### 记录一笔交易
```sql
INSERT INTO transactions (type, amount, description, account_id, transaction_date, payment_method)
VALUES ('expense', 50.00, '午餐', 'account-uuid', '2024-01-15', 'cash');

### 为交易添加标签
```sql
INSERT INTO tags (transaction_id, name, color)
VALUES ('transaction-uuid', '重要', '#FF5733');
```

这个表结构设计充分考虑了多账号功能的需求，确保每个用户的数据完全隔离，同时提供了丰富的功能扩展性。