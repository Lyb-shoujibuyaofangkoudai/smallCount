import type { InferInsertModel } from 'drizzle-orm';
import { AttachmentRepository } from '../repositories/AttachmentRepository';
import { attachments } from '../schema';

type NewAttachment = InferInsertModel<typeof attachments>;

const attachmentRepo = new AttachmentRepository();

export const AttachmentService = {
  /**
   * 创建附件记录
   * @param attachmentData - 附件数据
   * @returns 创建的附件对象
   */
  async createAttachment(attachmentData: Omit<NewAttachment, 'id' | 'uploadedAt'>) {
    // 业务规则校验
    if (!attachmentData.transactionId || attachmentData.transactionId.trim().length === 0) {
      throw new Error('交易ID不能为空');
    }
    
    if (!attachmentData.fileName || attachmentData.fileName.trim().length === 0) {
      throw new Error('文件名不能为空');
    }
    
    if (!attachmentData.fileUrl || attachmentData.fileUrl.trim().length === 0) {
      throw new Error('文件URL不能为空');
    }
    
    if (attachmentData.fileName.length > 255) {
      throw new Error('文件名过长');
    }
    
    
    return await attachmentRepo.create(attachmentData);
  },
  /**
   * 批量创建附件记录
   * @param attachmentData - 附件数据数组
   * @returns 创建的附件对象数组
   */
  async createBatch(attachmentData: Omit<NewAttachment, 'id' | 'uploadedAt'>[]) {
    // 业务规则校验
    if (!attachmentData || attachmentData.length === 0) {
      throw new Error('附件数据不能为空');
    }
    
    // 批量创建附件记录
    return await attachmentRepo.createBatch(attachmentData);
  },

  /**
   * 通过ID获取附件详情
   * @param id - 附件ID
   * @param userId - 用户ID（用于权限验证）
   * @returns 附件详情
   */
  async getAttachmentById(id: string, userId: string) {
    if (!id || id.trim().length === 0) {
      throw new Error('附件ID不能为空');
    }
    
    const attachment = await attachmentRepo.findById(id, userId);
    if (!attachment) {
      throw new Error(`附件不存在: ${id}`);
    }
    
    return attachment;
  },

  /**
   * 获取交易的所有附件
   * @param transactionId - 交易ID
   * @param userId - 用户ID（用于权限验证）
   * @returns 附件列表
   */
  async getAttachmentsByTransaction(transactionId: string, userId: string) {
    if (!transactionId || transactionId.trim().length === 0) {
      throw new Error('交易ID不能为空');
    }
    
    return await attachmentRepo.findByTransaction(transactionId, userId);
  },

  /**
   * 获取用户的所有附件（分页）
   * @param userId - 用户ID
   * @param pagination - 分页参数
   * @returns 分页的附件列表
   */
  async getUserAttachments(userId: string, pagination?: { page?: number; pageSize?: number }) {
    return await attachmentRepo.findByUser(userId, pagination);
  },

  /**
   * 删除附件
   * @param id - 附件ID
   * @param userId - 用户ID（用于权限验证）
   * @returns 删除结果
   */
  async deleteAttachment(id: string, userId: string) {
    if (!id || id.trim().length === 0) {
      throw new Error('附件ID不能为空');
    }
    
    // 验证用户是否有权限删除
    const hasAccess = await attachmentRepo.hasAccess(id, userId);
    if (!hasAccess) {
      throw new Error('没有权限删除此附件');
    }
    
    return await attachmentRepo.delete(id, userId);
  },

  /**
   * 批量删除附件
   * @param ids - 附件ID数组
   * @param userId - 用户ID（用于权限验证）
   * @returns 删除结果
   */
  async deleteMultipleAttachments(ids: string[], userId: string) {
    if (!ids || ids.length === 0) {
      throw new Error('附件ID列表不能为空');
    }
    
    if (ids.length > 100) {
      throw new Error('批量删除附件数量不能超过100个');
    }
    
    return await attachmentRepo.deleteMultiple(ids, userId);
  },

  /**
   * 删除交易的所有附件
   * @param transactionId - 交易ID
   * @param userId - 用户ID（用于权限验证）
   * @returns 删除结果
   */
  async deleteAttachmentsByTransaction(transactionId: string, userId: string) {
    if (!transactionId || transactionId.trim().length === 0) {
      throw new Error('交易ID不能为空');
    }
    
    return await attachmentRepo.deleteByTransaction(transactionId, userId);
  },

  /**
   * 更新附件信息
   * @param id - 附件ID
   * @param userId - 用户ID（用于权限验证）
   * @param updateData - 更新数据
   * @returns 更新后的附件
   */
  async updateAttachment(
    id: string, 
    userId: string,
    updateData: Partial<Omit<NewAttachment, 'id' | 'transactionId' | 'uploadedAt'>>
  ) {
    if (!id || id.trim().length === 0) {
      throw new Error('附件ID不能为空');
    }
    
    if (updateData.fileName && updateData.fileName.length > 255) {
      throw new Error('文件名过长');
    }
    
    
    return await attachmentRepo.update(id, userId, updateData);
  },

  /**
   * 获取附件统计信息
   * @param userId - 用户ID
   * @returns 附件统计信息
   */
  async getAttachmentStats(userId: string) {
    return await attachmentRepo.getAttachmentStats(userId);
  },

  /**
   * 获取最近上传的附件
   * @param userId - 用户ID
   * @param limit - 限制数量
   * @returns 最近附件列表
   */
  async getRecentAttachments(userId: string, limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new Error('限制数量必须在1-100之间');
    }
    
    return await attachmentRepo.getRecentAttachments(userId, limit);
  },

  /**
   * 查找指定类型的附件
   * @param userId - 用户ID
   * @param fileType - 文件类型
   * @returns 匹配的附件列表
   */
  async findAttachmentsByFileType(userId: string, fileType: string) {
    if (!fileType || fileType.trim().length === 0) {
      throw new Error('文件类型不能为空');
    }
    
    return await attachmentRepo.findByFileType(userId, fileType);
  },

  /**
   * 重命名附件
   * @param id - 附件ID
   * @param userId - 用户ID（用于权限验证）
   * @param newFileName - 新文件名
   * @returns 重命名后的附件
   */
  async renameAttachment(id: string, userId: string, newFileName: string) {
    if (!id || id.trim().length === 0) {
      throw new Error('附件ID不能为空');
    }
    
    if (!newFileName || newFileName.trim().length === 0) {
      throw new Error('新文件名不能为空');
    }
    
    if (newFileName.length > 255) {
      throw new Error('文件名过长');
    }
    
    return await attachmentRepo.rename(id, userId, newFileName);
  },

  /**
   * 验证用户是否有附件访问权限
   * @param id - 附件ID
   * @param userId - 用户ID
   * @returns 是否有权限
   */
  async hasAccess(id: string, userId: string) {
    return await attachmentRepo.hasAccess(id, userId);
  }
};