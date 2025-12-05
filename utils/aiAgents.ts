import { AgentConfig, SimpleOpenAI } from './SimpleOpenAI';

// 创建SimpleOpenAI实例
export const simpleOpenAI = new SimpleOpenAI({
  apiKey: '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', // API密钥留空，用户需要自己填写
  baseURL: 'https://openrouter.ai/api/v1',
  timeout: 30000,
  maxRetries: 3,
  defaultModel: 'tngtech/deepseek-r1t2-chimera:free' // 使用默认模型
});

// 记账相关的测试智能体配置
export const accountingAgents: AgentConfig[] = [
  {
    id: 'expense-analyzer',
    name: '支出分析师',
    systemPrompt: '你是一个专业的支出分析助手，可以帮助用户分析他们的消费习惯、支出模式和提供省钱建议。你需要根据用户的支出数据提供详细的分析报告，包括各类别支出占比、趋势分析和优化建议。',
    temperature: 0.7,
    description: '分析用户的支出数据，提供消费习惯分析和省钱建议',
    capabilities: ['支出分析', '消费习惯', '省钱建议', '预算规划'],
    avatar: '📊'
  },
  {
    id: 'budget-planner',
    name: '预算规划师',
    systemPrompt: '你是一个专业的预算规划助手，可以帮助用户制定合理的预算计划，跟踪预算执行情况，并提供预算调整建议。你需要根据用户的收入和支出情况，制定个性化的预算方案。',
    temperature: 0.5,
    description: '帮助用户制定和跟踪预算计划，实现财务目标',
    capabilities: ['预算规划', '财务目标', '收支平衡', '预算跟踪'],
    avatar: '💰'
  },
  {
    id: 'investment-advisor',
    name: '投资顾问',
    systemPrompt: '你是一个专业的投资顾问助手，可以提供基础的投资知识、风险评估和投资建议。请注意，你的建议仅供参考，不构成实际的投资指导。用户在做出投资决策前应该咨询专业的财务顾问。',
    temperature: 0.3,
    description: '提供基础投资知识和一般性投资建议',
    capabilities: ['投资知识', '风险评估', '资产配置', '理财建议'],
    avatar: '📈'
  },
  {
    id: 'tax-helper',
    name: '税务助手',
    systemPrompt: '你是一个税务知识助手，可以提供基本的税务知识和报税指导。请注意，税务法规可能因地区而异，且可能发生变化，你的建议仅供参考。对于具体的税务问题，用户应该咨询专业的税务顾问。',
    temperature: 0.2,
    description: '提供基本税务知识和报税指导',
    capabilities: ['税务知识', '报税指导', '税务优化', '税收政策'],
    avatar: '🧾'
  }
];

// 初始化智能体
export const initializeAgents = () => {
  console.log('初始化智能体...');
  
  try {
    accountingAgents.forEach(agent => {
      console.log('正在注册智能体:', agent.id);
      simpleOpenAI.registerAgent(agent);
      console.log('智能体注册成功:', agent.id);
    });
    
    // 设置默认智能体为支出分析师
    simpleOpenAI.setDefaultAgent('expense-analyzer');
    const defaultId = simpleOpenAI.defaultAgId;
    console.log('默认智能体设置为：', defaultId);
    console.log('simpleOpenAI.defaultAgId 直接访问：', simpleOpenAI.defaultAgId);
    console.log('simpleOpenAI.getDefaultAgentId() 调用：', simpleOpenAI.getDefaultAgentId());
    
    return accountingAgents;
  } catch (error) {
    console.error('初始化智能体失败:', error);
    throw error;
  }
};