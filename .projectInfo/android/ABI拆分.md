# 方法一：直接修改android/app/build.gradle文件

如果希望打包出来后的APK文件包含多个ABI版本（会有多个对应指定版的APK包），需要修改android/app/build.gradle文件下的android splits abi配置。

修改android/app/build.gradle文件下的android splits abi配置

```
android {
    splits {
            abi {
                enable true // 启用 ABI 拆分
                reset() // 清除默认配置
                include "arm64-v8a", "armeabi-v7a", "x86", "x86_64" // 指定要包含的 ABI
                universalApk true // 同时生成 universal APK
            }
        }
}
```
# 方法二：使用expo-build-properties插件配置ABI拆分
最终打包出来的APK文件只会有一个release版本，包含所有指定的ABI架构。不会有多个apk包

使用expo-build-properties插件配置ABI拆分
```
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "splits": {
              "abi": {
                "enable": true,
                "reset": true,
                "include": [
                  "arm64-v8a",
                  "armeabi-v7a",
                  "x86",
                  "x86_64"
                ],
                "universalApk": true
              }
            }
          }
        }
      ]
    ]
  }
}
```
