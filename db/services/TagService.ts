import type { InferInsertModel } from 'drizzle-orm';
import { TagRepository } from '../repositories/TagRepository';
import { tags } from '../schema';

type NewTag = InferInsertModel<typeof tags>;

const tagRepo = new TagRepository();

export const TagService = {
  /**
   * 创建新标签
   * @param tagData - 标签数据
   * @returns 创建的标签对象
   */
  async createTag(tagData: Omit<NewTag, 'id' | 'createdAt'>) {
    // 业务规则校验
    if (!tagData.name || tagData.name.trim().length === 0) {
      throw new Error('标签名称不能为空');
    }
    
    if (tagData.name.length > 50) {
      throw new Error('标签名称不能超过50个字符');
    }
    
    // 检查标签名称是否已存在
    const existingTags = await tagRepo.findAll();
    const existingTag = existingTags.find(tag => 
      tag.name.toLowerCase() === tagData.name.toLowerCase() && 
      tag.type === tagData.type
    );
    
    if (existingTag) {
      throw new Error(`已存在相同名称的${tagData.type === 'expense' ? '支出' : '收入'}标签`);
    }
    
    return await tagRepo.create(tagData);
  },

  /**
   * 获取所有标签
   * @returns 标签列表
   */
  async getAllTags() {
    return await tagRepo.findAll();
  },

  /**
   * 根据类型获取标签
   * @param type - 标签类型 (expense/income)
   * @returns 对应类型的标签列表
   */
  async getTagsByType(type: 'expense' | 'income') {
    const allTags = await tagRepo.findAll();
    return allTags.filter(tag => tag.type === type);
  },

  /**
   * 获取标签详情
   * @param tagId - 标签ID
   * @returns 标签详情
   */
  async getTagDetail(tagId: string) {
    return await tagRepo.findById(tagId);
  },

  /**
   * 更新标签信息
   * @param tagId - 标签ID
   * @param updateData - 更新数据
   * @returns 更新后的标签
   */
  async updateTag(
    tagId: string, 
    updateData: Partial<Omit<NewTag, 'id' | 'createdAt'>>
  ) {
    // 获取当前标签信息
    const existingTag = await tagRepo.findById(tagId);
    if (!existingTag) {
      throw new Error('标签不存在');
    }
    
    // 检查是否为默认标签，默认标签不允许修改
    if (existingTag.isDefault) {
      throw new Error('默认标签不允许修改');
    }
    
    // 业务规则校验
    if (updateData.name && updateData.name.trim().length === 0) {
      throw new Error('标签名称不能为空');
    }
    
    if (updateData.name && updateData.name.length > 10) {
      throw new Error('标签名称不能超过10个字符');
    }
    
    // 检查标签名称是否已存在（排除当前标签）
    if (updateData.name) {
      const allTags = await tagRepo.findAll();
      const existingTagWithSameName = allTags.find(tag => 
        tag.id !== tagId && 
        tag.name.toLowerCase() === updateData.name!.toLowerCase() && 
        tag.type === (updateData.type || existingTag.type)
      );
      
      if (existingTagWithSameName) {
        throw new Error(`已存在相同名称的${(updateData.type || existingTag.type) === 'expense' ? '支出' : '收入'}标签`);
      }
    }
    
    return await tagRepo.update(tagId, updateData);
  },

  /**
   * 删除标签
   * @param tagId - 标签ID
   * @returns 删除结果
   */
  async deleteTag(tagId: string) {
    // 获取当前标签信息
    const existingTag = await tagRepo.findById(tagId);
    if (!existingTag) {
      throw new Error('标签不存在');
    }
    
    // 检查是否为默认标签，默认标签不允许删除
    if (existingTag.isDefault) {
      throw new Error('默认标签不允许删除');
    }
    
    // 这里可以添加删除前的检查逻辑
    // 比如检查是否有交易正在使用该标签
    // 目前先实现直接删除
    return await tagRepo.delete(tagId);
  },

  /**
   * 批量创建标签
   * @param tagsData - 标签数据数组
   * @returns 创建的标签列表
   */
  async createTagsBatch(tagsData: Omit<NewTag, 'id' | 'createdAt'>[]) {
    // 批量校验
    for (const tagData of tagsData) {
      if (!tagData.name || tagData.name.trim().length === 0) {
        throw new Error('标签名称不能为空');
      }
      
      if (tagData.name.length > 50) {
        throw new Error('标签名称不能超过50个字符');
      }
    }
    
    // 检查重复名称
    const existingTags = await tagRepo.findAll();
    const existingTagNames = new Set(existingTags.map(tag => 
      `${tag.name.toLowerCase()}_${tag.type}`
    ));
    
    for (const tagData of tagsData) {
      const key = `${tagData.name.toLowerCase()}_${tagData.type}`;
      if (existingTagNames.has(key)) {
        throw new Error(`已存在相同名称的${tagData.type === 'expense' ? '支出' : '收入'}标签: ${tagData.name}`);
      }
    }
    
    return await tagRepo.createMany(tagsData);
  },

  /**
   * 搜索标签
   * @param keyword - 搜索关键词
   * @param type - 标签类型筛选
   * @returns 匹配的标签列表
   */
  async searchTags(keyword?: string, type?: 'expense' | 'income') {
    const allTags = await tagRepo.findAll();
    
    return allTags.filter(tag => {
      let match = true;
      
      // 关键词搜索
      if (keyword) {
        const searchTerm = keyword.toLowerCase();
        match = tag.name.toLowerCase().includes(searchTerm);
      }
      
      // 类型筛选
      if (type && tag.type !== type) {
        match = false;
      }
      
      return match;
    });
  },

  /**
   * TODO: 获取最常用的标签（按使用频率排序）
   * @param limit - 返回数量限制
   * @returns 常用标签列表
   */
  async getPopularTags(limit: number = 10) {
    // 这里需要关联交易表统计使用频率
    // 目前先返回所有标签，后续可以添加使用频率统计
    const allTags = await tagRepo.findAll();
    return allTags.slice(0, limit);
  }
};