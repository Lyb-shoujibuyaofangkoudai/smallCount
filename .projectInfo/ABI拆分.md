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
