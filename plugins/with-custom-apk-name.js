// plugins/with-custom-apk-name.js
const { withAppBuildGradle } = require('expo/config-plugins');

module.exports = function withCustomApkName(config) {
  return withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    // 这段 Gradle 代码会遍历所有构建变体 (variants)，并修改输出文件名
    // 它会自动读取 app.json 里的版本号
    const renameScript = `
    // --- Custom APK Name Config Start ---
    android.applicationVariants.all { variant ->
        variant.outputs.all { output ->
            // 获取 app.json 里的版本号 (通过 BuildConfig 或者 project 属性)
            def version = variant.versionName
            def appName = "smallCount" // 你想要的前缀名称
            
            // 最终文件名格式: smallCount-v1.0.0.apk
            outputFileName = "\${appName}-v\${version}.apk"
        }
    }
    // --- Custom APK Name Config End ---
`;

    // 检查是否已经添加过，避免重复添加
    if (!buildGradle.includes('Custom APK Name Config Start')) {
      // 将脚本插入到文件的最后
      config.modResults.contents = buildGradle + '\n' + renameScript;
    }

    return config;
  });
};
