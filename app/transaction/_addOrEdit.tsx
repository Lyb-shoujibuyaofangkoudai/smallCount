// app/add-transaction.tsx
import AccountSelectModal from "@/components/ui/AddTransaction/AccountSelectModal";
import { AmountDisplay } from "@/components/ui/AddTransaction/AmountDisplay";
import { CategoryGrid } from "@/components/ui/AddTransaction/CategoryGrid";
import { Header } from "@/components/ui/AddTransaction/Header";
import { NumberPad } from "@/components/ui/AddTransaction/NumberPad";
import { TicketImage } from "@/components/ui/AddTransaction/TicketImageModal";
import { Toolbar } from "@/components/ui/AddTransaction/Toolbar";
import TransferGrid from "@/components/ui/AddTransaction/TransferGrid";
import { PaymentMethod } from "@/db/repositories/PaymentMethodRepository";
import { NewTag } from "@/db/repositories/TagRepository";
import { AttachmentService } from "@/db/services/AttachmentService";
import { TransactionService } from "@/db/services/TransactionService";
import useDataStore from "@/storage/store/useDataStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface TransactionFormProps {
  mode: "add" | "edit" | "transfer";
  transactionId?: string; // 仅在 edit 模式下需要
}

export default function AddTransactionScreen({
  mode,
  transactionId,
}: TransactionFormProps) {
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
    currentUser,
  } = useDataStore();
  const isEdit = mode === "edit";
  const id = transactionId || "";

  const [type, setType] = useState<"expense" | "income" | "transfer">(
    "expense"
  );
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  //   const [isEdit, setIsEdit] = useState(false);
  // 使用数据存储获取标签状态

  // 根据类型过滤标签
  const expenseList = tags.filter((tag) => tag.type === "expense");
  const incomeList = tags.filter((tag) => tag.type === "income");
  const transferList = tags.filter((tag) => tag.type === "transfer");

  // 2. 根据类型获取当前显示的列表
  // 转账(transfer)默认使用支出分类，也可以使用专门的 transfer 分类
  const currentCategories =
    type === "income"
      ? incomeList
      : type === "transfer"
        ? transferList
        : expenseList;

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
  const [showTransferAccountModal, setShowTransferAccountModal] =
    useState(false);
  const selectedAccount = activeAccount;

  // 转账专用：转入账户状态
  const [transferAccount, setTransferAccount] = useState<
    (typeof accounts)[0] | null
  >(null);

  // 7. 添加票据图片状态管理
  const [ticketImages, setTicketImages] = useState<TicketImage[]>([]);

  //   useEffect(() => {
  //     if (str !== "add") {
  //       setIsEdit(true);
  //     }
  //   }, [str]);

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

          // 设置转出账户（编辑模式下）
          if (transactionDetail.fromAccountId) {
            const foundFromAccount = accounts.find(
              (account) => account.id === transactionDetail.fromAccountId
            );
            if (foundFromAccount) {
              switchActiveAccount(foundFromAccount.id);
            }
          }

          // 设置转入账户（编辑模式下）
          if (transactionDetail.transferAccountId) {
            const foundTransferAccount = accounts.find(
              (account) => account.id === transactionDetail.transferAccountId
            );
            if (foundTransferAccount) {
              setTransferAccount(foundTransferAccount);
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
            console.log(
              "找到支付方式",
              foundPaymentMethod,
              transactionDetail.paymentMethodId,
              paymentMethods
            );
            if (foundPaymentMethod) {
              setSelectedPaymentMethod(foundPaymentMethod);
            }
          }

          // 设置票据图片
          if (
            transactionDetail.attachments &&
            transactionDetail.attachments.length > 0
          ) {
            const initialTicketImages = transactionDetail.attachments.map(
              (attachment) => ({
                uri: attachment.fileUrl,
                fileUrl: attachment.fileUrl,
                fileName: attachment.fileName,
                fileType: attachment.fileType || "",
                fileSize: attachment.fileSize || 0,
              })
            );
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
  }, [currentCategories, selectedCategory, type]);

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

      // 转账模式额外校验
      if (type === "transfer") {
        if (!transferAccount) {
          Toast.show({
            type: "error",
            text1: "转入账户错误",
            text2: "请选择转入账户",
          });
          return;
        }
        if (selectedAccount?.id === transferAccount.id) {
          Toast.show({
            type: "error",
            text1: "账户选择错误",
            text2: "转出账户和转入账户不能相同",
          });
          return;
        }
        // 转账余额校验
        const transferAmount = parseFloat(amount);
        const currentBalance = selectedAccount?.balance ?? 0;
        if (currentBalance <= 0) {
          Toast.show({
            type: "error",
            text1: "余额不足",
            text2: `${selectedAccount?.name} 账户余额为 0，无法转账`,
          });
          return;
        }
        if (transferAmount > currentBalance) {
          Toast.show({
            type: "error",
            text1: "余额不足",
            text2: `转账金额 ¥${transferAmount} 超过账户余额 ¥${currentBalance}`,
          });
          return;
        }
      }

      console.log("selectedPaymentMethod", selectedPaymentMethod);
      console.log("selectedAccount", selectedAccount);
      console.log("selectedCategory", selectedCategory);
      console.log("transferAccount", transferAccount);

      setIsSubmitting(true);

      // TODO: 构建交易数据
      const transactionData = {
        type: type as "expense" | "income" | "transfer",
        amount: parseFloat(amount),
        tagId: selectedCategory.id,
        accountId: selectedAccount!.id,
        description:
          note ||
          `${selectedCategory.name}${type === "income" ? "收入" : type === "transfer" ? "转账" : "支出"}`,
        transactionDate: new Date(selectedDate),
        paymentMethodId: (selectedPaymentMethod as PaymentMethod).id,
        notes: note || "",
        fromAccountId: type === "transfer" ? selectedAccount!.id : null,
        transferAccountId: type === "transfer" ? transferAccount!.id : null,
        location: null,
        receiptImageUrl: null,
        isRecurring: false,
        recurringRule: null,
        isConfirmed: true,
        attachmentIds: null,
      };

      if (isEdit && id) {
        await updateTransaction(id, transactionData);

        if (currentUser) {
          // 先删除该交易的所有旧附件
          await AttachmentService.deleteAttachmentsByTransaction(
            id,
            currentUser.id
          );

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
          text1: isEdit ? "交易更新成功" : "交易创建成功",
          text2:
            type === "transfer"
              ? `已成功转账¥${amount}（${selectedAccount?.name} → ${transferAccount?.name}）`
              : `已成功${type === "income" ? "收入" : "支出"}¥${amount}`,
          position: "bottom",
        });
      } else {
        if (type === "transfer") {
          const transferAmountVal = parseFloat(amount);
          const transferOutTag = transferList.find(t => t.name === "转账支出" && t.isDefault);
          const transferInTag = transferList.find(t => t.name === "转账收入" && t.isDefault);
          const paymentMethod = paymentMethods.find(p => p.name === '其他');
          
          const outTransactionData = {
            type: "transfer" as const,
            amount: transferAmountVal,
            tagId: transferOutTag!.id,
            accountId: selectedAccount!.id,
            description: note || `从 ${selectedAccount?.name} 转出`,
            transactionDate: new Date(selectedDate),
            paymentMethodId: paymentMethod!.id,
            notes: note || "",
            fromAccountId: selectedAccount!.id,
            transferAccountId: transferAccount!.id,
            location: null,
            receiptImageUrl: null,
            isRecurring: false,
            recurringRule: null,
            isConfirmed: true,
            attachmentIds: null,
          };
          
          const inTransactionData = {
            type: "transfer" as const,
            amount: transferAmountVal,
            tagId: transferInTag!.id,
            accountId: transferAccount!.id,
            description: note || `转入 ${transferAccount?.name}`,
            transactionDate: new Date(selectedDate),
            paymentMethodId: paymentMethod!.id,
            notes: note || "",
            fromAccountId: selectedAccount!.id,
            transferAccountId: transferAccount!.id,
            location: null,
            receiptImageUrl: null,
            isRecurring: false,
            recurringRule: null,
            isConfirmed: true,
            attachmentIds: null,
          };
          
          const outTransaction = await addTransaction(outTransactionData);
          const inTransaction = await addTransaction(inTransactionData);
          
          if (ticketImages.length > 0) {
            await addTicketImagesToTransaction(
              ticketImages.map((item) => ({
                transactionId: outTransaction.id,
                ...item,
              })),
              outTransaction.id
            );
          }
          
          Toast.show({
            type: "success",
            text1: "转账成功",
            text2: `已成功转账¥${amount}（${selectedAccount?.name} → ${transferAccount?.name}）`,
          });
        } else {
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

          Toast.show({
            type: "success",
            text1: "交易创建成功",
            text2: `已成功记录${type === "income" ? "收入" : "支出"}¥${amount}`,
          });
        }
      }

      // 重置表单状态
      setAmount("");
      setNote("");

      // 返回上一页
      router.back();
    } catch (error) {
      console.error(
        isEdit ? "点击修改交易更新交易失败:" : "创建交易失败:",
        error
      );

      // 显示错误提示
      Toast.show({
        type: "error",
        text1: isEdit ? "更新失败" : "创建失败",
        text2:
          error instanceof Error
            ? error.message
            : `${isEdit ? "更新" : "创建"}交易时发生错误`,
      });
    } finally {
      // 无论成功还是失败，都重置提交状态
      setIsSubmitting(false);
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
          const newList =
            newType === "income"
              ? incomeList
              : newType === "transfer"
              ? transferList
              : expenseList;
          if (newList.length > 0) {
            setSelectedCategory(newList[0]);
          }
        }}
        onCancel={() => router.back()}
      />

      {/* 2. Amount Display */}
      <AmountDisplay
        type={type}
        amount={amount}
        categoryName={selectedCategory?.name}
        categoryIcon={selectedCategory?.icon}
        categoryColor={selectedCategory?.color as string}
        accountName={selectedAccount?.name || ""}
        note={note}
        onNoteChange={setNote}
      />

      {/* 3. Category Grid / Transfer Grid */}
      {type === "transfer" ? (
        <TransferGrid
          fromAccount={selectedAccount}
          toAccount={transferAccount}
          amount={amount}
          onCycleFrom={() => setShowAccountModal(true)}
          onCycleTo={() => setShowTransferAccountModal(true)}
          onSwap={() => {
            const temp = transferAccount;
            setTransferAccount(selectedAccount);
            if (temp) {
              switchActiveAccount(temp.id);
            }
          }}
        />
      ) : (
        <CategoryGrid
          categories={currentCategories}
          selectedId={selectedCategory?.id}
          onSelect={setSelectedCategory}
          onUpdateCategories={handleUpdateCategories}
          currentType={type}
        />
      )}

      {/* 4. Toolbar */}
      <Toolbar
        type={type}
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
          type={type}
          isSubmitting={isSubmitting}
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

      {/* 7. 转账账户选择弹窗 */}
      <AccountSelectModal
        visible={showTransferAccountModal}
        onClose={() => setShowTransferAccountModal(false)}
        onSelect={(account) => {
          setTransferAccount(account);
          setShowTransferAccountModal(false);
        }}
        selectedId={transferAccount?.id}
        data={accounts.filter((acc) => acc.id !== selectedAccount?.id)}
      />
    </SafeAreaView>
  );
}
