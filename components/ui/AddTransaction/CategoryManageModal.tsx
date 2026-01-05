import { useTheme } from "@/context/ThemeContext";
import { NewTag } from "@/db/repositories/TagRepository";
import { TagService } from "@/db/services/TagService";
import useDataStore from "@/storage/store/useDataStore";
import { addAlphaToColor } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";

// 定义分类的数据接口
// export interface NewTag {
//   id: string;
//   name: string;
//   icon: string;
//   color: string;
//   type: string;
// }

interface CategoryManageModalProps {
  visible: boolean;
  onClose: () => void;
  categories: NewTag[];
  currentType: NewTag["type"];
  onUpdateCategories: (categories: NewTag[]) => void;
  // 选择功能相关属性
  enableSelection?: boolean; // 是否启用选择模式
  selectionMode?: 'single' | 'multiple'; // 选择模式：单选或多选
  selectedIds?: string[]; // 已选中的分类ID数组
  onSelectionChange?: (selectedIds: string[]) => void; // 选择变化时的回调
  maxSelection?: number; // 多选模式下最大选择数量
  confirmButtonText?: string; // 确认按钮文本
  showEditButtons?: boolean; // 是否显示编辑和删除按钮
}

// 预设的可选图标
const AVAILABLE_ICONS = [
  "fast-food",
  "bus",
  "cart",
  "home",
  "game-controller",
  "medkit",
  "school",
  "car",
  "gift",
  "settings",
  "airplane",
  "construct",
  "fitness",
  "musical-notes",
  "paw",
  "cafe",
  "shirt",
  "hammer",
  "book",
  "briefcase",
];

// 预设的可选颜色
const AVAILABLE_COLORS = [
  "#ff7675",
  "#74b9ff",
  "#a29bfe",
  "#fab1a0",
  "#fd79a8",
  "#00b894",
  "#0984e3",
  "#636e72",
  "#e17055",
  "#b2bec3",
  "#F7B731",
  "#FA8231",
  "#20bf6b",
  "#4b7bec",
  "#eb3b5a",
];

const CategoryManageModal: React.FC<CategoryManageModalProps> = ({
  visible,
  onClose,
  categories,
  currentType,
  onUpdateCategories,
  // 选择功能相关属性，设置默认值
  enableSelection = false,
  selectionMode = 'single',
  selectedIds = [],
  onSelectionChange,
  maxSelection,
  confirmButtonText = '确定',
  showEditButtons = true,
}) => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<"list" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState(AVAILABLE_ICONS[0]);
  const [formColor, setFormColor] = useState(AVAILABLE_COLORS[0]);
  
  // 选择模式状态管理
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>(selectedIds);
  
  // 当外部传入的selectedIds变化时，同步内部状态
  useEffect(() => {
    setInternalSelectedIds(selectedIds);
  }, [selectedIds]);
  
  // 处理单个项目的选择/取消选择
  const handleToggleSelection = (categoryId: string) => {
    let newSelectedIds: string[];
    
    if (selectionMode === 'single') {
      // 单选模式：直接替换为当前选中的ID
      newSelectedIds = [categoryId];
    } else {
      // 多选模式：切换选中状态
      if (internalSelectedIds.includes(categoryId)) {
        // 如果已选中，则取消选中
        newSelectedIds = internalSelectedIds.filter(id => id !== categoryId);
      } else {
        // 如果未选中，则添加选中
        // 检查是否超过最大选择数量
        if (maxSelection && internalSelectedIds.length >= maxSelection) {
          alert(`最多只能选择${maxSelection}个分类`);
          return;
        }
        newSelectedIds = [...internalSelectedIds, categoryId];
      }
    }
    
    // 更新内部状态
    setInternalSelectedIds(newSelectedIds);
    
    // 调用外部回调
    if (onSelectionChange) {
      onSelectionChange(newSelectedIds);
    }
  };
  
  // 处理确认选择
  const handleConfirmSelection = () => {
    if (onSelectionChange) {
      onSelectionChange(internalSelectedIds);
    }
    onClose();
  };
  const {
    addTag,
    updateTag
  } = useDataStore()

  // 重置表单
  const resetForm = () => {
    setEditingId(null);
    setFormName("");
    setFormIcon(AVAILABLE_ICONS[0]);
    setFormColor(AVAILABLE_COLORS[0]);
    setMode("list");
  };

  // 点击添加按钮
  const handleStartAdd = () => {
    setEditingId(null); // null 代表新增
    setFormName("");
    setFormIcon(AVAILABLE_ICONS[0]);
    setFormColor(AVAILABLE_COLORS[0]);
    setMode("edit");
  };

  // 点击编辑某一项
  const handleStartEdit = (item: NewTag) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormIcon(item.icon as string);
    setFormColor(item.color as string);
    setMode("edit");
  };

  // 保存（新增或修改）
  const handleSave = async () => {
    if (!formName.trim()) {
      alert("请输入分类名称");
      return;
    }

    let newCategories = [...categories];

    if (editingId) {
      // 修改
      newCategories = newCategories.map((cat) =>
        cat.id === editingId
          ? { ...cat, name: formName, icon: formIcon, color: formColor }
          : cat
      );
      await updateTag(editingId,{
        name: formName,
        icon: formIcon,
        color: formColor,
        type: currentType,
      })
    } else {
      // 新增 - 保存到数据库
      try {
        const newTag = await addTag({
          name: formName.trim(),
          icon: formIcon,
          color: formColor,
          type: currentType,
          isDefault: false,
        });
        // 使用数据库返回的标签ID
        newCategories.push(newTag);
        Toast.show({
          type: "success",
          text1: "分类创建成功",
        });
      } catch (error: any) {
        // 处理错误
        alert(error.message || "创建分类失败");
        return;
      }
    }

    onUpdateCategories(newCategories);
    resetForm();
    onClose();
  };

  // 删除
  const handleDelete = async (id: string) => {
    if (categories.length <= 1) {
      alert("至少保留一个分类");
      return;
    }

    // 删除确认函数
    const deleteCategory = async () => {
      try {
        // 从数据库中删除标签
        await TagService.deleteTag(id);
        
        // 更新本地状态
        onUpdateCategories(categories.filter((c) => c.id !== id));
        
      } catch (error: any) {
        // 处理错误
        alert(error.message || "删除分类失败");
      }
    };

    // Web端简单confirm，App端可以用Alert
    if (Platform.OS === "web") {
      if (confirm("确定要删除这个分类吗？")) {
        await deleteCategory();
      }
    } else {
      Alert.alert("删除分类", "确定要删除这个分类吗？", [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: async () => await deleteCategory(),
        },
      ]);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end items-center bg-black/50"
      >
        <View
          className="max-h-[80%] w-full dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: "100%",
            maxHeight: "80%",
            backgroundColor: theme.colors.card,
            borderRadius: 20,
          }}
        >
          {/* Header */}
          <View
            className="flex-row justify-between items-center p-4 border-b border-gray-300 dark:border-neutral-600 bg-card dark:bg-neutral-800"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
              backgroundColor: theme.colors.card,
            }}
          >
            <TouchableOpacity onPress={mode === "edit" ? resetForm : onClose}>
              <Text
                className="text-textSecondary text-base"
                style={{ color: theme.colors.textSecondary }}
              >
                {mode === "edit" ? "返回" : "关闭"}
              </Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-text dark:text-white">
              {enableSelection
                ? (selectionMode === 'multiple' ? '选择分类' : '选择分类')
                : (mode === "edit"
                  ? editingId
                    ? "编辑分类"
                    : "新增分类"
                  : "分类管理")}
            </Text>
            {mode === "edit" ? (
              <TouchableOpacity onPress={handleSave}>
                <Text
                  className="text-primary font-bold text-base"
                  style={{ color: theme.colors.primary }}
                >
                  保存
                </Text>
              </TouchableOpacity>
            ) : enableSelection ? (
              <TouchableOpacity onPress={handleConfirmSelection}>
                <Text
                  className="text-primary font-bold text-base"
                  style={{ color: theme.colors.primary }}
                >
                  {confirmButtonText}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleStartAdd}>
                <Ionicons name="add" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
            {mode === "list" ? (
              // --- 列表视图 ---
              <View className="pb-4">
                {categories.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    className="flex-row items-center justify-between py-3 border-b border-gray-200 dark:border-neutral-700"
                    onPress={() => enableSelection ? handleToggleSelection(item.id) : null}
                  >
                    <View className="flex-row items-center gap-3">
                      {/* 选择模式下显示选择框 */}
                      {enableSelection && (
                        <View
                          className="w-5 h-5 rounded-full border-2 items-center justify-center"
                          style={{
                            borderColor: internalSelectedIds.includes(item.id)
                              ? theme.colors.primary
                              : theme.colors.border
                          }}
                        >
                          {internalSelectedIds.includes(item.id) && (
                            <View
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: theme.colors.primary }}
                            />
                          )}
                        </View>
                      )}
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ borderWidth: 2, borderColor: item.color as string }}
                      >
                        <Ionicons
                          name={item.icon as any}
                          size={20}
                          color={item.color as string}
                        />
                      </View>
                      <Text className="text-text dark:text-gray-200 font-medium text-base">
                        {item.name}
                      </Text>
                    </View>
                    {/* 非选择模式或选择模式下允许编辑时显示编辑按钮 */}
                    {(!enableSelection || (enableSelection && showEditButtons)) && (
                      <View className="flex-row gap-4">
                        {item.isDefault || (
                          <>
                            <TouchableOpacity
                              onPress={() => handleStartEdit(item)}
                            >
                              <Ionicons
                                name="create-outline"
                                size={22}
                                className="text-textSecondary"
                                color="#6b7280"
                              />
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => handleDelete(item.id)}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={22}
                                color="#ef4444"
                              />
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
                {/* 底部占位 */}
                <View className="h-8" />
              </View>
            ) : (
              // --- 编辑/新增视图 ---
              <View className="pb-8">
                {/* 1. 名称输入 */}
                <Text
                  className="text-md text-textSecondary mb-2 font-medium"
                  style={{ color: theme.colors.text }}
                >
                  分类名称
                </Text>
                <View className="bg-gray-100 dark:bg-neutral-800 rounded-xl p-3 mb-6 flex-row items-center gap-2">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: formColor }}
                  >
                    <Ionicons name={formIcon as any} size={16} color="#fff" />
                  </View>
                  <TextInput
                    className="flex-1 text-base text-text dark:text-white ml-2"
                    placeholder="输入分类名称 (例如: 奶茶)"
                    placeholderTextColor="#9ca3af"
                    value={formName}
                    onChangeText={setFormName}
                    autoFocus={false}
                  />
                </View>

                {/* 2. 选择颜色 */}
                <Text
                  className="text-md text-textSecondary mb-3 font-medium"
                  style={{ color: theme.colors.text }}
                >
                  选择颜色
                </Text>
                <View className="flex-row flex-wrap gap-3 mb-6">
                  {AVAILABLE_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setFormColor(color)}
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: color,
                        borderWidth: formColor === color ? 2 : 0,
                        borderColor: theme.colors.text, // 使用主题文本色作为边框
                      }}
                    >
                      {formColor === color && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 3. 选择图标 */}
                <Text
                  className="text-md text-textSecondary mb-3 font-medium"
                  style={{ color: theme.colors.text }}
                >
                  选择图标
                </Text>
                <View
                  className={`flex-row flex-wrap justify-start gap-[4px] ${Platform.OS === "web" ? "gap-[4px]" : "gap-[14]"}`}
                >
                  {AVAILABLE_ICONS.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      onPress={() => setFormIcon(icon)}
                      className={`${Platform.OS === "web" ? "w-[calc((100%_-_(6_*_4px))_/_6)]" : "w-14"} h-14 rounded-xl items-center justify-center ${
                        formIcon === icon
                          ? "border border-primary"
                          : "bg-gray-100 dark:bg-neutral-800"
                      }`}
                      style={{
                        backgroundColor:
                          formIcon === icon
                            ? addAlphaToColor(theme.colors.primary, 0.2)
                            : theme.colors.card,
                        borderColor:
                          formIcon === icon
                            ? theme.colors.primary
                            : "transparent",
                      }}
                    >
                      <Ionicons
                        name={icon as any}
                        size={24}
                        color={
                          formIcon === icon
                            ? theme.colors.primary
                            : theme.colors.textSecondary
                        }
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CategoryManageModal;