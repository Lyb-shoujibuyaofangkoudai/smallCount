// useAppUpdate.ts
import * as Application from 'expo-application';
import {
  cacheDirectory,
  createDownloadResumable,
  DownloadResumable,
  getContentUriAsync
} from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
// @ts-ignore
import compareVersions from 'semver-compare';

// --- 类型定义 ---
interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

interface ReleaseResponse {
  tag_name: string;
  body: string;
  assets: ReleaseAsset[];
}

interface DownloadProgress {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
}

// --- 配置区域 ---
const GITHUB_USER = 'Lyb-shoujibuyaofangkoudai';
const GITHUB_REPO = 'smallCount';
const NOTIFICATION_CHANNEL_ID = 'download-channel';
const NOTIFICATION_CATEGORY_ID = 'download-control'; // 新增：通知分类ID
const ACTION_CANCEL_ID = 'cancel-download'; // 新增：取消按钮ID

// --- 初始化通知表现 ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// --- 辅助函数：请求通知权限 ---
async function requestNotificationPermissions() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('请求通知权限失败:', error);
    return false;
  }
};

/**
 * 全局下载管理器
 */
class UpdateManager {
  isDownloading = false;
  downloadProgress = 0;
  downloadResumable: DownloadResumable | null = null;
  
  private listeners: ((progress: number, isDownloading: boolean) => void)[] = [];

  constructor() {
    this.initNotificationSetup();
  }

  // 初始化通知渠道和交互分类
  async initNotificationSetup() {
    if (Platform.OS === 'android') {
      // 1. 设置渠道
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: '应用更新',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2196F3',
      });

      // 2. 设置交互分类（添加按钮）
      await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORY_ID, [
        {
          identifier: ACTION_CANCEL_ID,
          buttonTitle: '取消下载', // 按钮文字
          options: {
            isDestructive: true, // 样式：警示性（通常为红色）
            opensAppToForeground: false, // 点击后不强制打开APP，在后台处理停止
          },
        },
      ]);
    }
  }

  // 订阅模式
  subscribe(listener: (progress: number, isDownloading: boolean) => void) {
    this.listeners.push(listener);
    listener(this.downloadProgress, this.isDownloading);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.downloadProgress, this.isDownloading));
  }

  // 更新通知栏进度
  private async updateNotification(progress: number) {
    const percent = Math.round(progress * 100);
    
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '正在下载新版本...',
          body: `已下载 ${percent}%`,
          data: { progress, type: 'downloading' },
          color: '#2196F3',
          sticky: true, // Android: 常驻
          autoDismiss: false, // Android: 不自动消失
          categoryIdentifier: NOTIFICATION_CATEGORY_ID, // <--- 关键：绑定带按钮的分类
        },
        trigger: null, // 立即触发
        identifier: 'download-progress',
      });
    } catch (error) {
      console.error('发送通知失败:', error);
    }
  }

  // 下载完成通知
  private async finishNotification() {
    try {
      await Notifications.dismissNotificationAsync('download-progress');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '下载完成',
          body: '点击此处进行安装',
          data: { type: 'install' },
        },
        trigger: null
      });
    } catch (error) {
      console.error('发送完成通知失败:', error);
    }
  }

  // 停止下载
  async stopDownload() {
    if (!this.downloadResumable) return;

    try {
      console.log('执行停止下载...');
      await this.downloadResumable.cancelAsync();
    } catch (error) {
      console.warn('停止下载时出错（可能是任务已结束）:', error);
    } finally {
      this.isDownloading = false;
      this.downloadProgress = 0;
      this.downloadResumable = null;
      this.notifyListeners();
      
      // 停止后立即清除进度条通知
      await Notifications.dismissNotificationAsync('download-progress');
      
      // 发送一条“已取消”的提示（可选，3秒后自动消失）
      await Notifications.scheduleNotificationAsync({
        content: { title: '下载已取消', body: '' },
        trigger: null,
      });
    }
  }

  // 开始下载
  async startDownload(url: string) {
    if (this.isDownloading) return;

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      Alert.alert('提示', '需要通知权限才能显示下载进度');
      return;
    }

    try {
      this.isDownloading = true;
      this.downloadProgress = 0;
      this.notifyListeners();

      const localUri = `${cacheDirectory}update.apk`;

      // 立即发送初始通知
      await this.updateNotification(0);

      let lastNotificationTime = 0;

      this.downloadResumable = createDownloadResumable(
        url,
        localUri,
        {},
        (data: DownloadProgress) => {
          const progress = data.totalBytesWritten / data.totalBytesExpectedToWrite;
          
          this.downloadProgress = progress;
          this.notifyListeners();

          const now = Date.now();
          // 节流：1秒更新一次通知
          if (now - lastNotificationTime > 1000) {
            this.updateNotification(progress);
            lastNotificationTime = now;
          }
        }
      );

      const result = await this.downloadResumable.downloadAsync();

      if (result && result.uri) {
        this.isDownloading = false;
        this.downloadProgress = 1;
        this.notifyListeners();
        await this.finishNotification();
        this.installApk(result.uri);
      }
    } catch (error) {
      // 如果是用户手动取消导致的错误，不弹窗报错
      if (this.isDownloading === false) return; 

      this.isDownloading = false;
      this.notifyListeners();
      console.error('下载错误:', error);
      
      await Notifications.dismissNotificationAsync('download-progress');
      Alert.alert('错误', '下载失败，请检查网络');
    }
  }

  async installApk(localUri: string) {
    try {
      const contentUri = await getContentUriAsync(localUri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1,
        type: 'application/vnd.android.package-archive',
      });
    } catch (e) {
      Alert.alert('安装失败', '无法唤起安装程序');
    }
  }
}

const updateManager = new UpdateManager();

// --- Hook 封装 ---

interface UseAppUpdateReturn {
  checkUpdate: () => Promise<void>;
  stopDownload: () => Promise<void>;
  isChecking: boolean;
  isDownloading: boolean;
  downloadProgress: number;
}

export const useAppUpdate = (): UseAppUpdateReturn => {
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(updateManager.isDownloading);
  const [downloadProgress, setDownloadProgress] = useState<number>(updateManager.downloadProgress);

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  // 监听全局状态
  useEffect(() => {
    const unsubscribe = updateManager.subscribe((progress, downloading) => {
      setDownloadProgress(progress);
      setIsDownloading(downloading);
    });
    return () => unsubscribe();
  }, []);

  // 【核心修改】监听通知交互（点击通知本身 OR 点击按钮）
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const actionIdentifier = response.actionIdentifier;
      const data = response.notification.request.content.data;

      // 1. 判断是否点击了“取消下载”按钮
      if (actionIdentifier === ACTION_CANCEL_ID) {
        console.log('用户点击了通知栏的取消按钮');
        updateManager.stopDownload();
        return;
      }

      // 2. 判断点击通知本体的行为
      if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        if (data && data.type === 'install') {
          // 点击“下载完成” -> 安装
          const localUri = `${cacheDirectory}update.apk`;
          updateManager.installApk(localUri);
        } else if (data && data.type === 'downloading') {
          // 点击“正在下载” -> 这里可以不做操作，或者跳转回APP首页
          console.log('点击了进度条通知，回到APP');
        }
      }
    });

    return () => subscription.remove();
  }, []);

  const checkUpdate = async (): Promise<void> => {
    if (Platform.OS !== 'android') {
      Alert.alert('提示', 'iOS 不支持应用内 APK 更新');
      return;
    }

    try {
      setIsChecking(true);
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases/latest`
      );
      
      if (!response.ok) throw new Error('无法获取版本信息');
      
      const data: ReleaseResponse = await response.json();
      const latestVersion = data.tag_name.replace(/^v/, '');
      const currentVersion = Application.nativeApplicationVersion || '0.0.0';

      if (compareVersions(latestVersion, currentVersion) === 1) {
        const apkAsset = data.assets.find((asset) => asset.name.endsWith('.apk'));
        if (apkAsset) {
          Alert.alert(
            '发现新版本',
            `版本号: ${latestVersion}\n\n${data.body || '修复了一些bug'}`,
            [
              { text: '取消', style: 'cancel' },
              { text: '立即更新', onPress: () => updateManager.startDownload(apkAsset.browser_download_url) }
            ]
          );
        }
      } else {
        Alert.alert('提示', '当前已是最新版本');
      }
    } catch (error) {
      Alert.alert('错误', '检查更新失败');
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkUpdate,
    stopDownload: () => updateManager.stopDownload(),
    isChecking,
    isDownloading,
    downloadProgress
  };
};