// components/AddTransaction/Toolbar.tsx
import DatePickerModal from '@/components/widgets/DatePickerModal';
import { NewPaymentMethod, PaymentMethod } from '@/db/repositories/PaymentMethodRepository';
import useDataStore from '@/storage/store/useDataStore';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import PaymentMethodModal from './PaymentMethodModal';
import TicketImageModal, { TicketImage } from './TicketImageModal';

interface ToolbarProps {
  date: string;
  onDateChange?: (date: string) => void;
  onPaymentMethodChange?: (method: PaymentMethod) => void;
  payMethod?: PaymentMethod;
  onTicketImagesChange?: (images: TicketImage[]) => void;
  initialTicketImages?: TicketImage[];
  type?: "expense" | "income" | "transfer";
}

export const Toolbar: React.FC<ToolbarProps> = ({ date,onDateChange, onPaymentMethodChange, payMethod, onTicketImagesChange, initialTicketImages = [], type }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showTicketImageModal, setShowTicketImageModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | NewPaymentMethod | null>(null);
  const [ticketImages, setTicketImages] = useState<TicketImage[]>(initialTicketImages);
  const { paymentMethods } = useDataStore();
  
  useEffect(() => {
    if (paymentMethods.length > 0) {
      const defaultMethod = paymentMethods.find(method => method.isDefault) || paymentMethods[0];
        setSelectedPaymentMethod(defaultMethod);
        if (onPaymentMethodChange) {
          if(payMethod) {
            setSelectedPaymentMethod(payMethod);
          } else onPaymentMethodChange(defaultMethod as PaymentMethod);
        }
    }
  }, [payMethod]);

  useEffect(() => {
    setTicketImages(initialTicketImages);
  }, [initialTicketImages]);



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

  const handleTicketImagePress = () => {
    setShowTicketImageModal(true);
  };

  const handleTicketImageConfirm = (images: TicketImage[]) => {
    console.log('查看选择的图片：', images);
    setTicketImages(images);
    setShowTicketImageModal(false);
    
    if (onTicketImagesChange) {
      onTicketImagesChange(images);
    }
  };

  const handleTicketImageClose = () => {
    setShowTicketImageModal(false);
  };

  return (
    <>
      <View className="flex-row gap-3 px-4 py-2 bg-background border-b border-border">
        <TouchableOpacity 
          className="bg-card px-3 py-1.5 rounded-md shadow-sm border border-border"
          onPress={handleDatePress}
        >
          <Text className="text-xs text-textSecondary">📅 {formatDateForDisplay(date)}</Text>
        </TouchableOpacity>
        {type !== "transfer" && (
          <TouchableOpacity 
            className="bg-card px-3 py-1.5 rounded-md shadow-sm border border-border"
            onPress={handlePaymentMethodPress}
          >
            <Text className="text-xs text-textSecondary">
              💰 支付方式：{selectedPaymentMethod ? selectedPaymentMethod.name : ''}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          className="bg-card px-3 py-1.5 rounded-md shadow-sm border border-border"
          onPress={handleTicketImagePress}
        >
          <Text className="text-xs text-textSecondary">
            📷 票据{ticketImages.length > 0 ? ` (${ticketImages.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 日期选择弹窗 */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={handleDateClose}
        onConfirm={handleDateConfirm}
        currentDate={date}
      />

      {/* 支付方式选择弹窗 */}
      <PaymentMethodModal
        visible={showPaymentMethodModal}
        onClose={handlePaymentMethodClose}
        onSelect={handlePaymentMethodSelect}
        selectedId={selectedPaymentMethod?.id}
        data={paymentMethods}
      />

      {/* 票据图片弹窗 */}
      <TicketImageModal
        visible={showTicketImageModal}
        onClose={handleTicketImageClose}
        onConfirm={handleTicketImageConfirm}
        initialImages={ticketImages}
        maxImages={9}
      />
    </>
  );
};