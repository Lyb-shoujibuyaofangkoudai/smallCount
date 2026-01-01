import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface TicketImage {
  uri: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface TicketImageModalProps {
  visible: boolean;
  onClose?: () => void;
  onConfirm?: (images: TicketImage[]) => void;
  initialImages?: TicketImage[];
  maxImages?: number;
}

const TicketImageModal: React.FC<TicketImageModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialImages = [],
  maxImages = 9
}) => {
  const { theme,isDarkMode } = useTheme();
  const [images, setImages] = useState<TicketImage[]>(initialImages);
  const [previewImage, setPreviewImage] = useState<TicketImage | null>(null);

  React.useEffect(() => {
    if (visible) {
      setImages(initialImages);
    }
  }, [visible, initialImages]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限不足', '需要相册权限才能选择图片');
        return false;
      }
    }
    return true;
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: Platform.OS !== 'web',
        selectionLimit: maxImages - images.length,
      });

      if (!result.canceled && result.assets) {
        const newImages: TicketImage[] = result.assets.map((asset) => ({
          uri: asset.uri,
          fileUrl: asset.uri,
          fileName: asset.fileName || `image_${Date.now()}.${asset.mimeType?.split('/')[1] || 'jpg'}`,
          fileType: asset.mimeType || 'image/jpeg',
          fileSize: asset.fileSize || 0,
        }));

        setImages((prev) => [...prev, ...newImages]);
      }
    } catch (error) {
      Alert.alert('错误', '选择图片失败，请重试');
      console.error('Image picker error:', error);
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('提示', '网页版暂不支持拍照功能');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限不足', '需要相机权限才能拍照');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newImage: TicketImage = {
          uri: asset.uri,
          fileUrl: asset.uri,
          fileName: asset.fileName || `photo_${Date.now()}.${asset.mimeType?.split('/')[1] || 'jpg'}`,
          fileType: asset.mimeType || 'image/jpeg',
          fileSize: asset.fileSize || 0,
        };
        setImages((prev) => [...prev, newImage]);
      }
    } catch (error) {
      Alert.alert('错误', '拍照失败，请重试');
      console.error('Camera error:', error);
    }
  };

  const handleRemoveImage = (fileUrl: string) => {
    setImages((prev) => prev.filter((img) => img.fileUrl !== fileUrl));
  };

  const handleImagePress = (image: TicketImage) => {
    setPreviewImage(image);
  };

  const handleConfirm = () => {
    onConfirm?.(images);
    onClose?.();
  };

  const handleClearAll = () => {
    Alert.alert('确认', '确定要清空所有图片吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: () => setImages([]),
      },
    ]);
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Pressable className="flex-1" onPress={onClose} />

          <View
            className="bg-card dark:bg-card-dark w-full rounded-t-3xl shadow-2xl h-[80%]"
            style={{ backgroundColor: theme.colors.card }}
          >
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mb-4 opacity-80" />

              <View className="w-full flex-row justify-between items-center px-5 border-b border-gray-100 dark:border-slate-700 pb-3">
                <Text className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  添加票据图片
                </Text>
              </View>
            </View>

            <ScrollView
              className="flex-1 px-5"
              showsVerticalScrollIndicator={false}
            >
              {images.length === 0 ? (
                <View className="flex-1 justify-center items-center py-20">
                  <Ionicons name="image-outline" size={64} color={theme.colors.border} />
                  <Text className="text-lg text-text mt-4">暂无票据图片</Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                    点击下方按钮添加票据图片
                  </Text>
                </View>
              ) : (
                <View className="flex-row flex-wrap gap-3 py-4">
                  {images.map((image) => (
                    <Pressable
                      key={image.fileUrl}
                      onPress={() => handleImagePress(image)}
                      className="relative w-[30%] aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700"
                    >
                      <ExpoImage
                        source={{ uri: image.uri }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={200}
                        placeholder="#e5e7eb"
                      />
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(image.fileUrl);
                        }}
                        className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                        hitSlop={10}
                      >
                        <Ionicons name="close-circle" size={20} color="#fff" />
                      </Pressable>
                    </Pressable>
                  ))}
                </View>
              )}

              {images.length > 0 && (
                <View className="flex-row justify-between items-center py-3">
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    已添加 {images.length} 张图片
                    {maxImages && ` (最多${maxImages}张)`}
                  </Text>
                  <Pressable onPress={handleClearAll}>
                    <Text className="text-sm text-red-500">清空全部</Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>

            <View className="px-5 py-4 border-t border-gray-100 dark:border-slate-700">
              <View className="flex-row gap-3 mb-3">
                <Pressable
                  onPress={handlePickImage}
                  disabled={images.length >= maxImages}
                  className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
                    images.length >= maxImages
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : 'bg-blue-500'
                  }`}
                >
                  <Ionicons name="images-outline" size={20} color="#fff" />
                  <Text className="text-white font-medium ml-2">相册</Text>
                </Pressable>

                <Pressable
                  onPress={handleTakePhoto}
                  disabled={images.length >= maxImages}
                  className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
                    images.length >= maxImages
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : 'bg-green-500'
                  }`}
                >
                  <Ionicons name="camera-outline" size={20} color="#fff" />
                  <Text className="text-white font-medium ml-2">拍照</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={handleConfirm}
                className={`py-3 rounded-xl items-center justify-center bg-primary`}
              >
                <Text
                  className={`font-medium text-text`} 
                >
                  确认
                </Text>
              </Pressable>
            </View>
          </View>

          <SafeAreaView className="bg-card dark:bg-card-dark" style={{ backgroundColor: theme.colors.card }} />
        </View>
      </Modal>

      <Modal
        visible={previewImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View className="flex-1 bg-black">
          <Pressable
            onPress={() => setPreviewImage(null)}
            className="absolute top-12 right-4 z-10 bg-black/50 rounded-full p-2"
            hitSlop={10}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>

          {previewImage && (
            <View className="flex-1 justify-center items-center">
              <ExpoImage
                source={{ uri: previewImage.uri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
                transition={200}
                placeholder="#000000"
              />
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

export default TicketImageModal;
