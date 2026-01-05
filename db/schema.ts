import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// 辅助函数：生成 UUID (SQLite 默认没有 uuid() 函数，需在应用层生成或使用 polyfill)
// 这里假设在插入时由应用层传入 ID，或者使用 text 默认值 (如果使用了 native 扩展)
// 为了通用性，在 Repository 层处理 ID 生成。

// 用户表 (users)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // 用户唯一标识符，UUID 主键
  username: text("username").notNull().unique(), // 用户名，唯一且不能为空
  email: text("email").unique(), // 邮箱地址
  passwordHash: text("password_hash"), // 密码哈希值
  phone: text("phone"), // 手机号码
  avatarUrl: text("avatar_url"), // 头像图片 URL
  displayName: text("display_name"), // 显示名称
  currency: text("currency").default("CNY"), // 默认货币代码，如 CNY/USD
  isActive: integer("is_active", { mode: "boolean" }).default(true), // 账户是否激活
  isArchived: integer("is_archived", { mode: "boolean" }).default(false), // 是否已归档
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ), // 创建时间（Unix 时间戳）
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ), // 最后更新时间（需代码层维护）
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }), // 最后登录时间
});

export const ACCOUNT_TYPES = {
  CASH: "cash",
  BANK: "bank",
  CREDIT_CARD: "credit_card",
  DIGITAL_WALLET: "digital_wallet",
  INVESTMENT: "investment",
  LOAN: "loan",
} as const;

// 账户表 (accounts)
export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(), // 账户唯一标识符，UUID 主键
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(), // 关联的用户 ID
  name: text("name").notNull(), // 账户名称
  // type: ENUM 映射为 text
  type: text("type", {
    enum: [
      ACCOUNT_TYPES.CASH,
      ACCOUNT_TYPES.BANK,
      ACCOUNT_TYPES.CREDIT_CARD,
      ACCOUNT_TYPES.DIGITAL_WALLET,
      ACCOUNT_TYPES.INVESTMENT,
      ACCOUNT_TYPES.LOAN,
    ],
  }).notNull(), // 账户类型
  balance: real("balance").default(0.0), // 当前余额
  // 初始账户金额，用于计算账户余额
  initialBalance: real("initial_balance").default(0.0),
  currency: text("currency").default("CNY"), // 账户货币类型，默认 CNY
  icon: text("icon"), // 图标（emoji 或代码）
  color: text("color"), // 颜色（十六进制）
  accountNumber: text("account_number"), // 银行账号或卡号
  bankName: text("bank_name"), // 银行名称
  creditLimit: real("credit_limit").default(0.0), // 信用卡额度
  billingDay: integer("billing_day"), // 账单日（1-31）
  dueDay: integer("due_day"), // 还款日（1-31）
  isActive: integer("is_active", { mode: "boolean" }).default(false), // 是否激活
  isDefault: integer("is_default", { mode: "boolean" }).default(false), // 是否默认账户
  isArchived: integer("is_archived", { mode: "boolean" }).default(false), // 是否已归档
  notes: text("notes"), // 备注
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ), // 创建时间
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ), // 最后更新时间
});

// 交易记录表 (transactions)
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(), // 交易唯一标识符，UUID 主键
  tagId: text("tag_id")
    .references(() => tags.id)
    .notNull(), // 关联的标签 ID
  paymentMethodId: text("payment_method_id")
    .references(() => paymentMethods.id)
    .notNull(), // 关联的支付方式 ID
  accountId: text("account_id")
    .references(() => accounts.id)
    .notNull(), // 关联的账户 ID
  attachmentIds: text("attachment_ids"), // 关联的附件 ID 列表（逗号分隔）
  type: text("type", { enum: ["expense", "income", "transfer"] }).notNull(), // 交易类型：支出/收入/转账
  amount: real("amount").notNull(), // 交易金额（正数）
  notes: text("notes"), // 备注
  description: text("description"), // 交易描述（如：午餐、工资）
  fromAccountId: text("from_account_id").references(() => accounts.id), // 转账来源账户 ID（仅转账）
  transferAccountId: text("transfer_account_id").references(() => accounts.id), // 转账目标账户 ID（仅转账）
  transactionDate: integer("transaction_date", { mode: "timestamp" }).notNull(), // 交易日期（Unix 时间戳）
  location: text("location"), // 交易地点
  receiptImageUrl: text("receipt_image_url"), // 收据图片 URL
  isRecurring: integer("is_recurring", { mode: "boolean" }).default(false), // 是否为周期性交易
  recurringRule: text("recurring_rule"), // 周期性规则描述
  isConfirmed: integer("is_confirmed", { mode: "boolean" }).default(true), // 是否已确认
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ), // 创建时间
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ), // 最后更新时间
});

// 预算表 (budgets)
export const budgets = sqliteTable("budgets", {
  id: text("id").primaryKey(), // 预算唯一标识符，UUID 主键
  accountId: text("account_id")
    .references(() => accounts.id, { onDelete: "cascade" })
    .notNull(), // 关联的账户 ID（预算按账户维度）
  amount: real("amount").notNull(), // 预算金额
  period: text("period", {
    enum: ["daily", "weekly", "monthly", "yearly"],
  }).default("monthly"), // 预算周期
  year: integer("year").notNull(), // 预算年份
  month: integer("month"), // 预算月份（1-12）
  week: integer("week"), // 预算周数（1-52）
  isActive: integer("is_active", { mode: "boolean" }).default(true), // 是否激活
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ), // 创建时间
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ), // 最后更新时间
});

// 分类标签表 (tags)
export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(), // 标签唯一标识符，UUID 主键
  accountIds: text("account_ids"), // 关联的账户 ID 列表（逗号分隔）
  name: text("name").notNull(), // 标签名称
  color: text("color"), // 标签颜色（十六进制）
  icon: text("icon"), // 图标（emoji 或代码） Ionicons图标
  type: text("type", { enum: ["expense", "income", "transfer"] }).notNull(), // 标签类型：支出/收入/转账
  isDefault: integer("is_default", { mode: "boolean" }).default(false), // 是否默认标签
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ), // 创建时间
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ), // 最后更新时间
});

// 支付方式表 (payment_methods)
export const paymentMethods = sqliteTable("payment_methods", {
  id: text("id").primaryKey(), // 支付方式唯一标识符，UUID 主键
  accountIds: text("account_ids"), // 关联的账户 ID 列表（逗号分隔）
  name: text("name").notNull(), // 支付方式名称
  icon: text("icon").default(""), // 图标（emoji 或代码）
  isDefault: integer("is_default", { mode: "boolean" }).default(false), // 是否默认支付方式
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ), // 创建时间
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ), // 最后更新时间
});

// 6. 附件表 (attachments)
export const attachments = sqliteTable("attachments", {
  id: text("id").primaryKey(), // 附件唯一标识符，UUID 主键
  transactionId: text("transaction_id")
    .references(() => transactions.id, { onDelete: "cascade" })
    .notNull(), // 关联的交易 ID
  fileName: text("file_name").notNull(), // 文件原始名称
  fileUrl: text("file_url").notNull(), // 文件存储 URL 地址
  fileType: text("file_type"), // 文件类型（如 image/jpeg）
  fileSize: integer("file_size"), // 文件大小（字节）
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ), // 创建时间
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ), // 最后更新时间

});
