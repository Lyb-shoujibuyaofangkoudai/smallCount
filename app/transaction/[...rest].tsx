// app/add-transaction.tsx
import AccountSelectModal from "@/components/ui/AddTransaction/AccountSelectModal";
import { AmountDisplay } from "@/components/ui/AddTransaction/AmountDisplay";
import { CategoryGrid } from "@/components/ui/AddTransaction/CategoryGrid";
import { Header } from "@/components/ui/AddTransaction/Header";
import { NumberPad } from "@/components/ui/AddTransaction/NumberPad";
import { TicketImage } from "@/components/ui/AddTransaction/TicketImageModal";
import { Toolbar } from "@/components/ui/AddTransaction/Toolbar";
import { PaymentMethod } from "@/db/repositories/PaymentMethodRepository";
import { NewTag } from "@/db/repositories/TagRepository";
import { AttachmentService } from "@/db/services/AttachmentService";
import { TransactionService } from "@/db/services/TransactionService";
import useDataStore from "@/storage/store/useDataStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function AddTransactionScreen() {
  const router = useRouter();
  const {
    tags,
    loadTags,
    accounts,
    addTransaction,
    addTicketImagesToTransaction,
    paymentMethods,
    updateTransaction,
    activeAccount,
    switchActiveAccount,
    currentUser
  } = useDataStore();

  const {
    rest: [str, id],
  } = useLocalSearchParams<{ rest: string[] }>();

  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [isEdit, setIsEdit] = useState(false);
  // 使用数据存储获取标签状态

  // 根据类型过滤标签
  const expenseList = tags.filter((tag) => tag.type === "expense");
  const incomeList = tags.filter((tag) => tag.type === "income");

  // 2. 根据类型获取当前显示的列表
  // 注意：转账(transfer)通常使用支出分类，或者你可以为其单独创建 transferList
  const currentCategories = type === "income" ? incomeList : expenseList;

  // 3. 初始化选中项 (注意：这里要依赖当前的 list state，而不是静态数据)
  const [selectedCategory, setSelectedCategory] = useState<NewTag>(
    currentCategories[0]
  );

  // 4. 添加日期状态管理
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // 默认日期为当日日期，格式为YYYY-MM-dd
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // 5. 添加支付方式状态管理
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>();

  // 6. 使用全局store中的账户状态管理
  const [showAccountModal, setShowAccountModal] = useState(false);
  const selectedAccount = activeAccount;

  // 7. 添加票据图片状态管理
  const [ticketImages, setTicketImages] = useState<TicketImage[]>([]);

  useEffect(() => {
    if (str !== "add") {
      setIsEdit(true);
    }
  }, [str]);

  useEffect(() => {
    if (id) {
      TransactionService.getTransactionDetail(id).then((transactionDetail) => {
        console.log("transactionDetail", JSON.stringify(transactionDetail));
        if (transactionDetail) {
          // 填充表单数据
          setType(transactionDetail.type as "expense" | "income");
          setAmount(transactionDetail.amount.toString());
          setNote(transactionDetail.notes || "");

          // 设置分类
          if (transactionDetail.tag) {
            const foundTag = tags.find(
              (tag) => tag.id === transactionDetail.tagId
            );
            if (foundTag) {
              setSelectedCategory(foundTag);
            }
          }

          // 设置账户
          if (transactionDetail.accountId) {
            const foundAccount = accounts.find(
              (account) => account.id === transactionDetail.accountId
            );
            if (foundAccount) {
              switchActiveAccount(foundAccount.id);
            }
          }

          // 设置日期
          if (transactionDetail.transactionDate) {
            const date = new Date(transactionDetail.transactionDate);
            setSelectedDate(date.toISOString().split("T")[0]);
          }

          // 设置支付方式
          if (transactionDetail.paymentMethodId) {
            const foundPaymentMethod = paymentMethods.find(
              (method) => method.id === transactionDetail.paymentMethodId
            );
            console.log("找到支付方式", foundPaymentMethod,transactionDetail.paymentMethodId,paymentMethods);
            if (foundPaymentMethod) {
              setSelectedPaymentMethod(foundPaymentMethod);
            }
          }

          // 设置票据图片
          if (transactionDetail.attachments && transactionDetail.attachments.length > 0) {
            const initialTicketImages = transactionDetail.attachments.map(attachment => ({
              uri: attachment.fileUrl,
              fileUrl: attachment.fileUrl,
              fileName: attachment.fileName,
              fileType: attachment.fileType || '',
              fileSize: attachment.fileSize || 0
            }));
            setTicketImages(initialTicketImages);
          } else {
            setTicketImages([]);
          }
        }
      });
    }
  }, [id]);

  // 当标签数据变化时，确保选中分类正确
  useEffect(() => {
    if (currentCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(currentCategories[0]);
    }
  }, [currentCategories, selectedCategory]);

  // 处理数字键盘输入
  const handlePressNum = (num: string) => {
    if (num === "." && amount.includes(".")) return;
    if (amount.includes(".") && amount.split(".")[1].length >= 2) return;
    setAmount((prev) => prev + num);
  };

  const handleDelete = () => {
    setAmount((prev) => prev.slice(0, -1));
  };


  const handleSubmit = async () => {
    try {
      // 基本校验
      if (!amount || parseFloat(amount) <= 0) {
        Toast.show({
          type: "error",
          text1: "金额错误",
          text2: "请输入有效的金额",
        });
        return;
      }

      if (!selectedAccount) {
        Toast.show({
          type: "error",
          text1: "账户错误",
          text2: "请选择账户",
        });
        return;
      }

      if (!selectedCategory) {
        Toast.show({
          type: "error",
          text1: "分类错误",
          text2: "请选择分类",
        });
        return;
      }

      console.log("selectedPaymentMethod", selectedPaymentMethod);
      console.log("selectedAccount", selectedAccount);
      console.log("selectedCategory", selectedCategory);

      // 构建交易数据
      const transactionData = {
        type: type,
        amount: parseFloat(amount),
        tagId: selectedCategory.id,
        accountId: selectedAccount.id,
        description:
          note ||
          `${selectedCategory.name}${type === "income" ? "收入" : "支出"}`,
        transactionDate: new Date(selectedDate),
        paymentMethodId: (selectedPaymentMethod as PaymentMethod).id,
        notes: note || "",
        transferAccountId: null, // 简化版本不支持转账
        location: null, // 简化版本不支持位置
        receiptImageUrl: null, // 简化版本不支持收据图片
        isRecurring: false, // 简化版本不支持周期性交易
        recurringRule: null, // 简化版本不支持周期性规则
        isConfirmed: true, // 默认已确认
        attachmentIds: null,
      };

      if (isEdit && id) {
        // 编辑模式：更新交易
        console.log('正在更新交易:', id,transactionData);
        await updateTransaction(id, transactionData);
        console.log('先删除该交易的所有旧附件',currentUser);

        if (currentUser) {
          // 先删除该交易的所有旧附件
          await AttachmentService.deleteAttachmentsByTransaction(id, currentUser.id);
          
          // 然后添加新的附件
          if (ticketImages.length > 0) {
            await addTicketImagesToTransaction(
              ticketImages.map((item) => ({
                transactionId: id,
                ...item,
              })),
              id
            );
          }
        }

        // 显示成功提示
        Toast.show({
          type: "success",
          text1: "交易更新成功",
          text2: `已成功更新${type === "income" ? "收入" : "支出"}¥${amount}`,
          position: "bottom",
        });
      } else {
        // 创建模式：新增交易
        console.log("正在创建交易:", transactionData);
        const newTransaction = await addTransaction(transactionData);

        if (newTransaction && ticketImages.length) {
          await addTicketImagesToTransaction(
            ticketImages.map((item) => ({
              transactionId: newTransaction.id,
              ...item,
            })),
            newTransaction.id
          );
        }

        // 显示成功提示
        Toast.show({
          type: "success",
          text1: "交易创建成功",
          text2: `已成功记录${type === "income" ? "收入" : "支出"}¥${amount}`,
        });
      }

      // 重置表单状态
      setAmount("");
      setNote("");

      // 返回上一页
      router.back();
    } catch (error) {

      console.error(isEdit ? "点击修改交易更新交易失败:" : "创建交易失败:", error);

      // 显示错误提示
      Toast.show({
        type: "error",
        text1: isEdit ? "更新失败" : "创建失败",
        text2:
          error instanceof Error
            ? error.message
            : `${isEdit ? "更新" : "创建"}交易时发生错误`,
      });
    }
  };

  const handleUpdateCategories = (newCategories: NewTag[]) => {
    loadTags();

    const isSelectedStillValid = newCategories.some(
      (c) => c.id === selectedCategory?.id
    );
    if (!isSelectedStillValid && newCategories.length > 0) {
      setSelectedCategory(newCategories[0]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-card">
      <StatusBar barStyle="dark-content" />

      {/* 1. Header */}
      <Header
        title={isEdit ? "编辑" : "记一笔"}
        currentType={type}
        onChangeType={(newType) => {
          setType(newType);
          // 切换类型时，重置选中项为新类型列表的第一个
          const newList = newType === "income" ? incomeList : expenseList;
          if (newList.length > 0) {
            setSelectedCategory(newList[0]);
          }
        }}
        onCancel={() => router.back()}
      />

      {/* 2. Amount Display */}
      <AmountDisplay
        amount={amount}
        categoryName={selectedCategory?.name}
        categoryIcon={selectedCategory?.icon}
        categoryColor={selectedCategory?.color as string}
        accountName={selectedAccount?.name || ""}
        note={note}
        onNoteChange={setNote}
      />

      {/* 3. Category Grid (Scrollable Area) */}
      <CategoryGrid
        categories={currentCategories}
        selectedId={selectedCategory?.id}
        onSelect={setSelectedCategory}
        // 传递新增的 Props
        onUpdateCategories={handleUpdateCategories}
        currentType={type} // 转账暂时复用支出类型，或根据需求调整
      />

      {/* 4. Toolbar */}
      <Toolbar
        date={selectedDate}
        onDateChange={setSelectedDate}
        onPaymentMethodChange={setSelectedPaymentMethod}
        payMethod={selectedPaymentMethod}
        onTicketImagesChange={setTicketImages}
        initialTicketImages={ticketImages}
      />

      {/* 5. Number Pad (Fixed at bottom) */}
      <View className="pb-safe">
        <NumberPad
          onPressNum={handlePressNum}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          onSelectAccount={() => setShowAccountModal(true)}
          selectedAccountName={selectedAccount?.name || "微信"}
        />
      </View>

      {/* 6. 账户选择弹窗 */}
      <AccountSelectModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onSelect={(account) => {
          switchActiveAccount(account.id);
          setShowAccountModal(false);
        }}
        selectedId={selectedAccount?.id}
        data={accounts}
      />
    </SafeAreaView>
  );
}
