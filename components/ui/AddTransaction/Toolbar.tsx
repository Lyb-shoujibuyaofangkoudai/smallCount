// components/AddTransaction/Toolbar.tsx
import DatePickerModal from '@/components/widgets/DatePickerModal';
import { PAYMENT_METHODS } from '@/constants/data';
import { PaymentMethod } from '@/constants/type';
import { NewPaymentMethod } from '@/db/repositories/PaymentMethodRepository';
import { PaymentMethodService } from '@/db/services/PaymentMethodService';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import PaymentMethodModal from './PaymentMethodModal';

interface ToolbarProps {
  dateStr: string;
  onDateChange?: (date: string) => void;
  onPaymentMethodChange?: (method: PaymentMethod) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ dateStr, onDateChange, onPaymentMethodChange }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | NewPaymentMethod | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // 默认日期为当日日期，格式为YYYY-MM-dd
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // 获取支付方式列表
  const getPaymentMethods = async () => {
    try {
      const methods = await PaymentMethodService.getAllPaymentMethods();
      console.log('获取到的支付方式:', methods.length);
      setPaymentMethods(methods as PaymentMethod[]);
      
      // 设置默认支付方式
      if (methods.length > 0) {
        const defaultMethod = methods.find(method => method.isDefault) || methods[0];
        setSelectedPaymentMethod(defaultMethod);
        if (onPaymentMethodChange) {
          onPaymentMethodChange(defaultMethod as PaymentMethod);
        }
      }
    } catch (error) {
      console.error('获取支付方式失败:', error);
      // 如果数据库获取失败，使用默认的静态数据
      setPaymentMethods(PAYMENT_METHODS);
      if (PAYMENT_METHODS.length > 0) {
        const defaultMethod = PAYMENT_METHODS.find(method => method?.isDefault) || PAYMENT_METHODS[0];
        setSelectedPaymentMethod(defaultMethod);
        if (onPaymentMethodChange) {
          onPaymentMethodChange(defaultMethod);
        }
      }
    }
  };

  useEffect(() => {
    getPaymentMethods();
  }, []);

  // 格式化日期显示为中文格式（如：11月20日）
  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份从0开始，需要+1
    const day = date.getDate();
    return `${year}年${month}月${day}日`; 
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  const handleDateConfirm = (date: string) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    // 如果有外部回调函数，调用它
    if (onDateChange) {
      onDateChange(date);
    }
  };

  const handleDateClose = () => {
    setShowDatePicker(false);
  };

  const handlePaymentMethodPress = () => {
    setShowPaymentMethodModal(true);
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setShowPaymentMethodModal(false);
    
    // 如果有外部回调函数，调用它
    if (onPaymentMethodChange) {
      onPaymentMethodChange(method);
    }
  };

  const handlePaymentMethodClose = () => {
    setShowPaymentMethodModal(false);
  };

  return (
    <>
      <View className="flex-row gap-3 px-4 py-2 bg-background border-b border-border">
        <TouchableOpacity 
          className="bg-card px-3 py-1.5 rounded-md shadow-sm border border-border"
          onPress={handleDatePress}
        >
          <Text className="text-xs text-textSecondary">📅 {formatDateForDisplay(selectedDate)}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="bg-card px-3 py-1.5 rounded-md shadow-sm border border-border"
          onPress={handlePaymentMethodPress}
        >
          <Text className="text-xs text-textSecondary">
            💰 支付方式：{selectedPaymentMethod ? selectedPaymentMethod.name : ''}
          </Text>
        </TouchableOpacity>
       {/* TODO: 票据功能 */}
        {/* <TouchableOpacity className="bg-card px-3 py-1.5 rounded-md shadow-sm border border-border">
          <Text className="text-xs text-textSecondary">📷 票据</Text>
        </TouchableOpacity> */}
      </View>

      {/* 日期选择弹窗 */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={handleDateClose}
        onConfirm={handleDateConfirm}
        currentDate={selectedDate}
      />

      {/* 支付方式选择弹窗 */}
      <PaymentMethodModal
        visible={showPaymentMethodModal}
        onClose={handlePaymentMethodClose}
        onSelect={handlePaymentMethodSelect}
        selectedId={selectedPaymentMethod?.id}
        data={paymentMethods}
      />
    </>
  );
};