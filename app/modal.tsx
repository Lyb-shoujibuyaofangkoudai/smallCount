// app/add-transaction.tsx
import AccountSelectModal from '@/components/ui/AddTransaction/AccountSelectModal';
import { AmountDisplay } from '@/components/ui/AddTransaction/AmountDisplay';
import { CategoryGrid } from '@/components/ui/AddTransaction/CategoryGrid';
import { Header } from '@/components/ui/AddTransaction/Header';
import { NumberPad } from '@/components/ui/AddTransaction/NumberPad';
import { Toolbar } from '@/components/ui/AddTransaction/Toolbar';
import { PaymentMethod } from '@/constants/type';
import { Account } from '@/db/repositories/AccountRepository';
import { NewTag } from '@/db/repositories/TagRepository';
import { AccountService } from '@/db/services/AccountService';
import { TagService } from '@/db/services/TagService';
import { TransactionService } from '@/db/services/TransactionService';
import { defaultStorageManager } from '@/utils/storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';

export default function AddTransactionScreen() {
  const router = useRouter();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState(''); // 新增备注状态
  
  // 1. 将静态数据转换为 State，以便支持动态修改
  const [expenseList, setExpenseList] = useState<NewTag[]>([]);
  const [incomeList, setIncomeList] = useState<NewTag[]>([]);

  // 2. 根据类型获取当前显示的列表
  // 注意：转账(transfer)通常使用支出分类，或者你可以为其单独创建 transferList
  const currentCategories = type === 'income' ? incomeList : expenseList;

  // 3. 初始化选中项 (注意：这里要依赖当前的 list state，而不是静态数据)
  const [selectedCategory, setSelectedCategory] = useState<NewTag>(currentCategories[0]);

  // 4. 添加日期状态管理
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // 默认日期为当日日期，格式为YYYY-MM-dd
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // 5. 添加支付方式状态管理
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>();

  // 6. 添加账户状态管理
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const getTagList = async () => {
    const expenseTags = await TagService.getTagsByType('expense');
    const incomeTags = await TagService.getTagsByType('income');
    setExpenseList(expenseTags);
    setIncomeList(incomeTags);
    setSelectedCategory(expenseTags[0]);
  };

  // 获取账户列表
  const getAccountList = async () => {
    try {
      const user = await defaultStorageManager.get<Account>('user')
      // 这里需要传入当前用户的ID，暂时使用默认用户ID
      if (!user) {
        console.error('用户信息不存在');
        return;
      }
      const userAccounts = await AccountService.getUserAssets(user.id);
      setAccounts(userAccounts.accounts || []);
      
      // 设置默认账户
      const defaultAccount = userAccounts.accounts.find(account => account.isDefault) || accounts[0];
      if (defaultAccount) {
        setSelectedAccount(defaultAccount);
      }
    } catch (error) {
      console.error('获取账户列表失败:', error);
    }
  };

  useEffect(() => {
    getTagList();
    getAccountList();
  }, []);

  // 处理数字键盘输入
  const handlePressNum = (num: string) => {
    if (num === '.' && amount.includes('.')) return;
    if (amount.includes('.') && amount.split('.')[1].length >= 2) return;
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
          type: 'error',
          text1: '金额错误',
          text2: '请输入有效的金额',
          position: 'bottom'
        });
        return;
      }
      
      if (!selectedAccount) {
        Toast.show({
          type: 'error',
          text1: '账户错误',
          text2: '请选择账户',
          position: 'bottom'
        });
        return;
      }
      
      if (!selectedCategory) {
        Toast.show({
          type: 'error',
          text1: '分类错误',
          text2: '请选择分类',
          position: 'bottom'
        });
        return;
      }
      
      // 构建交易数据
      const transactionData = {
        accountId: selectedAccount.id,
        type: type,
        amount: parseFloat(amount),
        tagId: selectedCategory.id,
        description: note || `${selectedCategory.name}${type === 'income' ? '收入' : '支出'}`,
        transactionDate: new Date(selectedDate),
        paymentMethodId: (selectedPaymentMethod as PaymentMethod).id,
        note: note || '',
        attachmentIds: '', // 简化版本不支持附件
      };
      
      console.log('正在创建交易:', transactionData);
      
      // 调用交易服务创建记录
      const createdTransaction = await TransactionService.createSimpleTransaction(transactionData);
      
      console.log('交易创建成功:', createdTransaction);
      
      // 显示成功提示
      Toast.show({
        type: 'success',
        text1: '交易创建成功',
        text2: `已成功记录${type === 'income' ? '收入' : '支出'}¥${amount}`,
        position: 'bottom'
      });
      
      // 重置表单状态
      setAmount('');
      setNote('');
      
      // 返回上一页
      router.back();
      
    } catch (error) {
      console.error('创建交易失败:', error);
      
      // 显示错误提示
      Toast.show({
        type: 'error',
        text1: '创建失败',
        text2: error instanceof Error ? error.message : '创建交易时发生错误',
        position: 'bottom'
      });
    }
  };

  // 4. 新增：处理分类数据的更新（新增/修改/删除）
  const handleUpdateCategories = (newCategories: NewTag[]) => {
    if (type === 'income') {
      setIncomeList(newCategories);
    } else {
      setExpenseList(newCategories);
    }

    // 关键逻辑：如果当前选中的分类被删除了，将选中项重置为列表第一个，防止 UI 错误
    const isSelectedStillValid = newCategories.some(c => c.id === selectedCategory?.id);
    if (!isSelectedStillValid && newCategories.length > 0) {
      setSelectedCategory(newCategories[0]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-card">
      <StatusBar barStyle="dark-content" />
      
      {/* 1. Header */}
      <Header 
        currentType={type} 
        onChangeType={(newType) => {
          setType(newType);
          // 切换类型时，重置选中项为新类型列表的第一个
          const newList = newType === 'income' ? incomeList : expenseList;
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
        accountName={selectedAccount?.name || ''}
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
        dateStr="11月20日" // 这个参数现在在Toolbar内部处理，但保留以保持接口兼容
        onDateChange={setSelectedDate}
        onPaymentMethodChange={setSelectedPaymentMethod}
      />

      {/* 5. Number Pad (Fixed at bottom) */}
      <View className="pb-safe">
        <NumberPad 
          onPressNum={handlePressNum} 
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          onSelectAccount={() => setShowAccountModal(true)}
          selectedAccountName={selectedAccount?.name || '微信'}
        />
      </View>

      {/* 6. 账户选择弹窗 */}
      <AccountSelectModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onSelect={(account) => {
          setSelectedAccount(account);
          setShowAccountModal(false);
        }}
        selectedId={selectedAccount?.id}
        data={accounts}
      />
    </SafeAreaView>
  );
}