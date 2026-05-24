# 中轴寻迹 · 北京中轴线 AI 游览原型

“中轴寻迹”是一个围绕北京中轴线文化遗产设计的交互式 AI 小程序原型。项目通过 AI 吉祥物“小衡”引导用户完成偏好选择、路线推荐、定位讲解、纹样识别和个人成就分享，模拟移动端小程序的完整体验链路。

## 在线预览

- 预览地址：[https://jakielei.github.io/Beijing-Central-Axis-Travel-Guide/](https://jakielei.github.io/Beijing-Central-Axis-Travel-Guide/)
- 说明：该链接需要在 GitHub 仓库中启用 GitHub Pages 后生效，部署源选择 `main` 分支的根目录。

## 功能亮点

- **AI 吉祥物引导**：使用“小衡”作为交互引导角色，增强文化导览的亲和力。
- **个性化偏好收集**：支持玩法、兴趣、讲解方式，以及年龄、学历、兴趣爱好等补充信息。
- **中轴线路线推荐**：提供“听见时间”“看见礼序”“走过中轴”“回到天地”四条主题路线。
- **定位式 AI 讲解**：基于浏览器定位能力匹配附近中轴线节点，并生成不同风格的讲解内容。
- **古建纹样寻宝**：模拟拍照识别藻井、斗拱、屋脊兽等古建筑纹样，形成收集成就。
- **中轴寻迹卡**：在个人中心生成二级分享页面，展示路线、纹样、徽章和偏好标签。

## 页面流程

1. **首页**：展示品牌视觉、小衡形象和“开始寻迹”入口。
2. **偏好选择**：收集用户游览偏好和额外个性化信息。
3. **路线推荐**：根据用户偏好展示四条中轴线主题路线。
4. **AI 讲解**：模拟定位、景点识别、快捷提问和自定义提问。
5. **限时活动**：模拟古建纹样拍照识别和卡片收集。
6. **我的足迹**：展示路线数、纹样收集进度、徽章和分享入口。
7. **分享卡页面**：生成可截图保存的“中轴寻迹纪念卡”。

## 技术栈

- **HTML5**：单页应用结构，模拟小程序多页面流程。
- **CSS3**：国风视觉、移动端容器、响应式布局、动画和卡片样式。
- **Vanilla JavaScript**：页面切换、状态管理、定位模拟、摄像头调用和交互反馈。
- **GitHub Pages**：用于静态页面在线部署和预览。

## 本地运行

项目无需安装依赖，推荐通过本地 HTTP 服务运行，避免定位和摄像头能力在 `file://` 协议下受限。

```bash
cd /Users/bytedance/Desktop/Central-Axis-main
python3 -m http.server 8080
```

浏览器访问：

```text
http://localhost:8080
```

## 项目结构

```text
.
├── assets/
│   └── images/          # 小衡形象、纹样和背景图片
├── css/
│   └── styles.css       # 全局样式和页面视觉
├── js/
│   ├── app.js           # 页面交互、状态同步和模拟逻辑
│   └── data.js          # 景点、纹样和全局状态数据
├── index.html           # 单页应用入口
└── README.md            # 项目说明文档
```

## 部署说明

1. 将项目推送到 GitHub 仓库：`https://github.com/jakielei/Beijing-Central-Axis-Travel-Guide.git`。
2. 打开仓库的 `Settings` 页面。
3. 进入 `Pages` 配置。
4. `Source` 选择 `Deploy from a branch`。
5. `Branch` 选择 `main`，目录选择 `/root`。
6. 保存后等待 GitHub Pages 构建完成。
7. 构建完成后访问：[https://jakielei.github.io/Beijing-Central-Axis-Travel-Guide/](https://jakielei.github.io/Beijing-Central-Axis-Travel-Guide/)。

## 注意事项

- 摄像头和定位能力需要在 `localhost` 或 `HTTPS` 环境下使用。
- 当前项目是静态网页原型，不是原生微信小程序工程。
- 若需要正式上线为微信小程序，可进一步迁移为原生小程序、Taro 或 uni-app 工程。
