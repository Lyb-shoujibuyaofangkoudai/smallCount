// useAppUpdate.ts
import * as Application from 'expo-application';
import { cacheDirectory, createDownloadResumable, getContentUriAsync } from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
// @ts-ignore
import compareVersions from 'semver-compare';

// GitHub Release Asset interface
interface ReleaseAsset {
  id: number;
  name: string;
  size: number;
  url: string;
  browser_download_url: string;
  content_type: string;
}

// GitHub Release Response interface
interface ReleaseResponse {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  assets: ReleaseAsset[];
  assets_url: string;
  html_url: string;
  created_at: string;
  published_at: string;
}

// Download Progress interface
interface DownloadProgress {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
}


const GITHUB_USER = 'Lyb-shoujibuyaofangkoudai'; 
const GITHUB_REPO = 'smallCount';

// Hook return type
interface UseAppUpdateReturn {
  checkUpdate: () => Promise<void>;
  isChecking: boolean;
  isDownloading: boolean;
  downloadProgress: number;
}

export const useAppUpdate = (): UseAppUpdateReturn => {
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  /**
   * 1. 检查更新
   */
  const checkUpdate = async (): Promise<void> => {
    if (Platform.OS !== 'android') {
      Alert.alert('提示', 'iOS 不支持应用内 APK 更新，请前往 TestFlight 或 App Store。');
      return;
    }

    try {
      setIsChecking(true);
      // 获取 GitHub 最新 Release 信息
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases/latest`
      );
      
      if (!response.ok) throw new Error('无法获取版本信息');
      
      const data: ReleaseResponse = await response.json();
      
      // 处理版本号：去掉 'v' 前缀 (例如 v1.0.0 -> 1.0.0)
      const latestVersion = data.tag_name.replace(/^v/, '');
      const currentVersion = Application.nativeApplicationVersion || '0.0.0';

      // 对比版本：如果最新版本 > 当前版本
      if (compareVersions(latestVersion, currentVersion) === 1) {
        // 寻找 apk 下载地址
        const apkAsset = data.assets.find((asset: ReleaseAsset) => asset.name.endsWith('.apk'));
        
        if (apkAsset) {
          Alert.alert(
            '发现新版本',
            `版本号: ${latestVersion}\n\n${data.body || '修复了一些bug'}`,
            [
              { text: '取消', style: 'cancel' },
              { text: '立即更新', onPress: () => downloadAndInstall(apkAsset.browser_download_url) }
            ]
          );
        } else {
          Alert.alert('错误', '新版本发布中未找到 APK 文件');
        }
      } else {
        Alert.alert('提示', '当前已是最新版本');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('错误', '检查更新失败');
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * 2. 下载并安装 APK
   */
  const downloadAndInstall = async (url: string): Promise<void> => {
    try {
      setIsDownloading(true);
      
      // 定义下载路径 (缓存目录)
      const localUri = `${cacheDirectory}update.apk`;

      // 创建下载任务
      const downloadResumable = createDownloadResumable(
        url,
        localUri,
        {},
        (downloadProgressData: DownloadProgress) => {
          const progress = downloadProgressData.totalBytesWritten / downloadProgressData.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );

      // 开始下载
      const result = await downloadResumable.downloadAsync();
      
      if (result && result.uri) {
        setIsDownloading(false);
        installApk(result.uri);
      }
    } catch (error: unknown) {
      setIsDownloading(false);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      Alert.alert('下载失败', errorMessage);
    }
  };

  /**
   * 3. 唤起安装
   */
  const installApk = async (localUri: string): Promise<void> => {
    try {
      // 获取 Content URI (Android 需要通过 ContentProvider 访问文件)
      const contentUri = await getContentUriAsync(localUri);
      
      // 调用 Android Intent 进行安装
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        type: 'application/vnd.android.package-archive',
      });
    } catch (e) {
      Alert.alert('安装失败', '无法打开安装程序，请检查权限。');
    }
  };

  return {
    checkUpdate,
    isChecking,
    isDownloading,
    downloadProgress
  };
};