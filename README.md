# 英语学习 App

## 项目说明
英语词汇学习 + 中文学习 App，每天学习常用英语单词及中文词汇。

### 核心功能
- 📚 **学习模式**：闪卡式英语单词学习（3000+ 词汇）
- 🀄 **中文学习**：闪卡式中文学习（3000+ 词汇）
- 📝 **语句填空**：根据中文翻译填写英文单词
- ✍️ **词汇测试**：选择题测试词汇量
- 📖 **单词列表**：分级浏览全部词汇
- ⭐ **收藏复习**：收藏重点单词
- 🎯 **每日目标**：设定每日学习目标

## 项目结构
```
D:\\englearn\\           # PWA 网页版本（可直接使用）
  ├── index.html          # 主页面
  ├── manifest.json       # PWA 清单
  ├── sw.js              # Service Worker（离线支持）
  ├── css/style.css      # 样式文件
  ├── js/
  │   ├── app.js         # 核心逻辑
  │   ├── data.js        # 英语词汇数据（2310 词）
  │   └── chinese-data.js # 中文词汇数据（3007 词）
  └── icons/             # App 图标

D:\\englearn_backup\\     # 备份目录

D:\\englearn-capacitor\\  # Capacitor 原生 App 工程
  ├── ios/               # Xcode 项目（需 macOS 编译）
  └── capacitor.config.json
```

## 使用方法

### 方式一：PWA 网页版（推荐，直接使用）
1. 在浏览器中打开 `D:\\englearn\\index.html`
2. 在 iOS Safari 中点击「分享」→「添加到主屏幕」
3. 即可像原生 App 一样使用

### 方式二：Capacitor 原生 App（需 macOS）
需要 macOS + Xcode 环境编译：

## macOS 编译步骤

### 环境要求
- macOS 14+ (Sonoma)
- Xcode 16+
- CocoaPods (`sudo gem install cocoapods`)
- Node.js 20+

### 编译步骤

```bash
# 1. 将项目复制到 Mac
# 2. 进入 Capacitor 项目目录
cd D:\\englearn-capacitor

# 3. 安装依赖
npm install

# 4. 同步最新 Web 资源
npx cap sync ios

# 5. 打开 Xcode 项目
npx cap open ios

# 6. 在 Xcode 中：
#    - 选择真机或模拟器
#    - 配置签名（需 Apple Developer 账号）
#    - 按 Cmd+R 运行
#    - 或 Product → Archive 打包上架
```

### 权限配置
如需使用更多设备功能，在 Xcode 中配置 `Info.plist`：
- NSPhotoLibraryUsageDescription - 保存截图
- NSMicrophoneUsageDescription - 语音输入（如需）

## 技术栈
- **前端**：原生 HTML + CSS + JavaScript
- **打包**：Capacitor (Ionic)
- **PWA**：Service Worker + Manifest

## 数据
- **英语词汇**：2310 个，分 3 个级别（基础/常用/进阶）
- **中文词汇**：3007 个（HSK 分级）
