import { NewTag } from "@/db/repositories/TagRepository";
import { PaymentMethod } from "./type";

export const CURRENCIES: Record<string, { name: string; value: string; char: string }> = {
  // 亚洲主要货币
  CNY: { name: '人民币', value: 'CNY', char: '￥' },
  HKD: { name: '港币', value: 'HKD', char: 'HK$' },
  TWD: { name: '新台币', value: 'TWD', char: 'NT$' },
  JPY: { name: '日元', value: 'JPY', char: '¥' },
  KRW: { name: '韩元', value: 'KRW', char: '₩' },
  SGD: { name: '新加坡元', value: 'SGD', char: 'S$' },
  THB: { name: '泰铢', value: 'THB', char: '฿' },
  INR: { name: '印度卢比', value: 'INR', char: '₹' },
  
  // 欧美主要货币
  USD: { name: '美元', value: 'USD', char: '$' },
  EUR: { name: '欧元', value: 'EUR', char: '€' },
  GBP: { name: '英镑', value: 'GBP', char: '£' },
  CHF: { name: '瑞士法郎', value: 'CHF', char: 'CHF' },
  CAD: { name: '加拿大元', value: 'CAD', char: 'C$' },
  AUD: { name: '澳大利亚元', value: 'AUD', char: 'A$' },
  NZD: { name: '新西兰元', value: 'NZD', char: 'NZ$' },
  
  // 其他常用货币
  RUB: { name: '俄罗斯卢布', value: 'RUB', char: '₽' },
  BRL: { name: '巴西雷亚尔', value: 'BRL', char: 'R$' },
  ZAR: { name: '南非兰特', value: 'ZAR', char: 'R' },
  AED: { name: '阿联酋迪拉姆', value: 'AED', char: 'د.إ' },
  SAR: { name: '沙特里亚尔', value: 'SAR', char: 'ر.س' },
  MXN: { name: '墨西哥比索', value: 'MXN', char: '$' },
  IDR: { name: '印度尼西亚盾', value: 'IDR', char: 'Rp' },
  MYR: { name: '马来西亚林吉特', value: 'MYR', char: 'RM' }
};

export const DEFAULT_USERNAME = 'default_user';
export const DEFAULT_EMAIL = 'default@local';
export const DEFAULT_ACCOUNT_NAME = 'default';
export const DEFAULT_TAGS: {
  expenses: Omit<NewTag, 'id' | 'accountIds' | 'createdAt'>[];
  incomes: Omit<NewTag, 'id' | 'accountIds' | 'createdAt'>[];
} = {
  // ===========================
  // 支出分类 (Expenses)
  // ===========================
  expenses: [
    {
      name: '餐饮美食',
      icon: 'fast-food', 
      color: '#ff7675', // 柔红
      type: 'expense',
      isDefault: true,
    },
    {
      name: '交通出行',
      icon: 'bus',
      color: '#74b9ff', // 天蓝
      type: 'expense',
      isDefault: true,
    },
    {
      name: '居家物业',
      icon: 'home',
      color: '#fdcb6e', // 暖黄
      type: 'expense',
      isDefault: true,
    },
    {
      name: '日常购物',
      icon: 'cart',
      color: '#e17055', // 橘红
      type: 'expense',
      isDefault: true,
    },
    {
      name: '服饰美容',
      icon: 'shirt',
      color: '#fd79a8', // 粉色
      type: 'expense',
      isDefault: true,
    },
    {
      name: '娱乐消遣',
      icon: 'game-controller',
      color: '#a29bfe', // 淡紫
      type: 'expense',  
      isDefault: true,
    },
    {
      name: '医疗健康',
      icon: 'medkit',
      color: '#00b894', // 绿色
      type: 'expense',  
      isDefault: true,
    },
    {
      name: '教育学习',
      icon: 'school',
      color: '#55efc4', // 青绿
      type: 'expense',  
      isDefault: true,
    },
    {
      name: '人情社交',
      icon: 'gift',
      color: '#d63031', // 深红
      type: 'expense',  
      isDefault: true,
    },
    {
      name: '数码科技',
      icon: 'phone-portrait',
      color: '#636e72', // 灰色
      type: 'expense',  
      isDefault: true,
    },
    {
      name: '孩子宝贝',
      icon: 'balloon', // Ionicons没有婴儿图标，用气球代表孩子/玩乐
      color: '#fab1a0', // 浅橘
      type: 'expense',  
      isDefault: true,
    },
    {
      name: '宠物喵汪',
      icon: 'paw',
      color: '#e67e22', // 棕橘
      type: 'expense',  
      isDefault: true,
    },
    {
      name: '旅行出游',
      icon: 'airplane',
      color: '#0984e3', // 深蓝
      type: 'expense',  
      isDefault: true,
    },
    {
      name: '维修服务',
      icon: 'construct',
      color: '#2d3436', // 深灰
      type: 'expense',  
      isDefault: true,
    },
    {
      name: '其他支出',
      icon: 'apps',
      color: '#b2bec3', // 浅灰
      type: 'expense',  
      isDefault: true,
    }
  ],

  // ===========================
  // 收入分类 (Income)
  // ===========================
  incomes: [
    {
      name: '工资薪水',
      icon: 'wallet',
      color: '#F7B731', // 金黄
      type: 'income',  
      isDefault: true,
    },
    {
      name: '奖金补贴',
      icon: 'trophy',
      color: '#FA8231', // 橙色
      type: 'income',  
      isDefault: true,
    },
    {
      name: '理财投资',
      icon: 'trending-up',
      color: '#20BF6B', // 鲜绿
      type: 'income',  
      isDefault: true,
    },
    {
      name: '兼职外快',
      icon: 'briefcase',
      color: '#45AAF2', // 亮蓝
      type: 'income',  
      isDefault: true,
    },
    {
      name: '人情红包',
      icon: 'mail-open', // 类似拆开的信封/红包
      color: '#EB3B5A', // 红色
      type: 'income',  
      isDefault: true,
    },
    {
      name: '退款入账',
      icon: 'arrow-undo',
      color: '#A55EEA', // 紫色
      type: 'income',   
      isDefault: true,
    },
    {
      name: '二手交易',
      icon: 'repeat',
      color: '#778ca3', // 蓝灰
      type: 'income',   
      isDefault: true,
    },
    {
      name: '借入款项',
      icon: 'cash',
      color: '#4b6584', // 深蓝灰
      type: 'income',   
      isDefault: true,
    },
    {
      name: '意外所得',
      icon: 'sparkles', // 星星/闪光，代表好运
      color: '#f1c40f', // 亮黄
      type: 'income',   
      isDefault: true,
    },
    {
      name: '其他收入',
      icon: 'grid',
      color: '#95afc0', // 银色
      type: 'income',   
      isDefault: true,
    }
  ]
};
export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'wechat', name: '微信支付', icon: 'logo-wechat' },
  { id: 'alipay', name: '支付宝', icon: 'logo-alipay' }, 
  { id: 'cash', name: '现金', icon: 'cash-outline' },
  { id: 'bank', name: '银行卡', icon: 'card-outline' },
  { id: 'friend', name: '朋友代付', icon: 'people-outline' },
  { id: 'other', name: '其他', icon: 'ellipsis-horizontal-circle-outline' },
];