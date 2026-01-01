import { APP_NAME } from "@/constants/data";
import { Account } from "@/db/repositories/AccountRepository";
import { TransactionWithDetailInfo } from "@/db/services/TransactionService";
import {
    documentDirectory,
    EncodingType,
    writeAsStringAsync,
} from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import * as XLSX from "xlsx";
import { generateUUID } from "./uuid";
/**
 * 获取字符串的第一个字符，并转为大写（支持多语言：中文、英文、Unicode字符等）
 * @param str 输入字符串（可传入任意类型，内部会做类型校验）
 * @returns 处理后的首字符（无效输入返回空字符串）
 */
export function getFirstCharToUpper(str: unknown): string {
  // 1. 类型校验：如果不是字符串，直接返回空字符串
  if (typeof str !== "string") {
    console.warn("输入不是有效的字符串，返回空字符串");
    return "";
  }

  // 2. 处理空字符串或仅含空白字符的情况
  const trimmedStr = str.trim();
  if (trimmedStr.length === 0) {
    console.warn("输入字符串为空或仅包含空白字符，返回空字符串");
    return "";
  }

  // 3. 安全获取第一个字符（支持所有Unicode字符，包括中文、emoji等）
  // Array.from 能正确处理Unicode surrogate pair（如某些emoji、特殊字符）
  const firstChar = Array.from(trimmedStr)[0];

  // 4. 转为大写：使用 toLocaleUpperCase() 而非 toUpperCase()，更好支持多语言
  // 例如：土耳其语的 'i' 会转为 'İ'，德语的 'ß' 会转为 'SS'，中文不受影响（原样返回）
  const upperFirstChar = firstChar.toLocaleUpperCase();

  return upperFirstChar;
}

export async function exportDataToXlsx(
  transactionsByAccount: Record<
    string,
    { account: Account; transactions: TransactionWithDetailInfo[] }
  >,
  workSheetHeadData?: string[][],
  fileName = `${APP_NAME}-账单数据.xlsx`
) {
  try {
    // 创建新的工作簿
    const workbook = XLSX.utils.book_new();

    // 为每个账户创建一个工作表
    Object.keys(transactionsByAccount).forEach((accountId) => {
      const { account, transactions } = transactionsByAccount[accountId];

      if (transactions.length === 0) return;

      const workSheetData = [
        [
          `--------------------------${APP_NAME.toUpperCase()}---------------------------`,
        ],
        ["日期", "类型", "金额", "描述", "分类", "支付方式", "备注"],
      ];
      // 准备工作表数据
      const worksheetData =
        workSheetHeadData?.concat(workSheetData) || workSheetData;

      // 添加交易数据
      transactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.transactionDate);
        const formattedDate = `${transactionDate.getFullYear()}-${(transactionDate.getMonth() + 1).toString().padStart(2, "0")}-${transactionDate.getDate().toString().padStart(2, "0")}`;

        worksheetData.push([
          formattedDate,
          transaction.type === "expense" ? "支出" : "收入",
          transaction.amount.toString(),
          transaction.description || "",
          transaction.tag?.name || "",
          transaction.paymentMethod?.name || "",
          transaction.notes || "",
        ]);
      });

      // 创建工作表
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, account.name);
    });

    // 生成 Excel 文件的二进制数据
    const excelBuffer = XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    });

    // 将二进制数据转换为 base64
    const base64 = btoa(
      new Uint8Array(excelBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    // 创建文件名
    fileName = !fileName ? `${APP_NAME}_${generateUUID()}.xlsx` : fileName;
    const fileUri = documentDirectory + fileName;

    // 将文件写入本地
    await writeAsStringAsync(fileUri, base64, {
      encoding: EncodingType.Base64,
    });

    Alert.alert("导出成功", `文件已保存到: ${fileUri}`, [
      {
        text: "确定",
        style: "default",
        onPress: () => {
          Toast.show({
            type: "success",
            text1: "导出成功",
            text2: "文件已保存到: " + fileUri,
          });
        },
      },
      {
        text: "分享",
        onPress: async () => {
          // 分享文件
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              mimeType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              dialogTitle: "导出记账记录",
            });
          } else {
            console.log("分享不可用，文件已保存到:", fileUri);
            Toast.show({
              type: "warning",
              text1: `分享不可用（文件已保存到：${fileUri}）`,
              text2: "请手动分享文件",
            });
          }
        },
        style: "default",
      },
    ]);

    console.log("Excel 文件导出成功:", fileUri);
  } catch (error) {
    console.error("导出 Excel 文件时出错:", error);
  }
}

/**
 * 队列 工具类
 * 支持异步任务执行、并发控制、优先级处理
 */
export interface QueueTask<T = any> {
  id: string;
  task: () => Promise<T>;
  priority?: number;
  retries?: number;
  maxRetries?: number;
  onResolve?: (result: T) => void;
  onReject?: (error: Error) => void;
}

export class AsyncQueue {
  private queue: QueueTask[] = [];
  private running: Set<string> = new Set();
  private concurrency: number;
  private isPaused: boolean = false;

  constructor(concurrency: number = 1) {
    this.concurrency = Math.max(1, concurrency);
  }

  /**
   * 添加任务到队列
   * @param task 任务对象或任务函数
   * @param options 任务选项
   * @returns 任务ID
   */
  add<T>(
    task: (() => Promise<T>) | QueueTask<T>,
    options: {
      priority?: number;
      maxRetries?: number;
      onResolve?: (result: T) => void;
      onReject?: (error: Error) => void;
    } = {}
  ): string {
    const id = this.generateId();

    let queueTask: QueueTask<T>;

    if (typeof task === "function") {
      queueTask = {
        id,
        task,
        priority: options.priority || 0,
        retries: 0,
        maxRetries: options.maxRetries || 3,
        onResolve: options.onResolve,
        onReject: options.onReject,
      };
    } else {
      queueTask = {
        ...task,
        id: task.id || id,
      };
    }

    // 按优先级插入队列（高优先级在前）
    let inserted = false;
    for (let i = 0; i < this.queue.length; i++) {
      if (queueTask.priority! > this.queue[i].priority!) {
        this.queue.splice(i, 0, queueTask as QueueTask);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      this.queue.push(queueTask as QueueTask);
    }

    // 如果有空闲槽位且队列未暂停，立即处理
    this.process();

    return id;
  }

  /**
   * 处理队列中的任务
   */
  private async process(): Promise<void> {
    if (
      this.isPaused ||
      this.running.size >= this.concurrency ||
      this.queue.length === 0
    ) {
      return;
    }

    const task = this.queue.shift()!;
    this.running.add(task.id);

    try {
      const result = await task.task();

      // 任务成功完成
      if (task.onResolve) {
        task.onResolve(result);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // 检查是否需要重试
      if (task.retries! < task.maxRetries!) {
        task.retries!++;

        // 重新加入队列，优先级稍低以避免饥饿
        task.priority = (task.priority || 0) - 1;
        this.queue.push(task);
      } else {
        // 超过最大重试次数，调用错误回调
        if (task.onReject) {
          task.onReject(err);
        }
      }
    } finally {
      this.running.delete(task.id);

      // 继续处理队列
      this.process();
    }
  }

  /**
   * 暂停队列处理
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * 恢复队列处理
   */
  resume(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.process();
    }
  }

  /**
   * 清空队列
   * @param cancelRunning 是否取消正在运行的任务
   */
  clear(cancelRunning: boolean = false): void {
    this.queue = [];

    if (cancelRunning) {
      this.running.clear();
    }
  }

  /**
   * 获取队列状态
   */
  getStatus(): {
    pending: number;
    running: number;
    isPaused: boolean;
    concurrency: number;
  } {
    return {
      pending: this.queue.length,
      running: this.running.size,
      isPaused: this.isPaused,
      concurrency: this.concurrency,
    };
  }

  /**
   * 更新并发数
   */
  updateConcurrency(newConcurrency: number): void {
    this.concurrency = Math.max(1, newConcurrency);

    // 如果增加了并发数，尝试处理更多任务
    this.process();
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 等待所有任务完成
   */
  async waitForEmpty(): Promise<void> {
    return new Promise((resolve) => {
      const checkStatus = () => {
        if (this.queue.length === 0 && this.running.size === 0) {
          resolve();
        } else {
          setTimeout(checkStatus, 50);
        }
      };

      checkStatus();
    });
  }
}
