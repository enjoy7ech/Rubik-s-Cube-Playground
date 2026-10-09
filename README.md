# 就转一下 · 三阶魔方游乐场

一个简约可爱的三阶魔方游戏：支持拖层操作、公式浮窗、按当前局面还原，以及同一局样例的连续图文教程。

教程采用七步层先法，以固定公式讲解用途、摆放、重复方法和停止条件；摆放图与单次演示可按需展开，同一局样例另有连续演示。小鱼翻色和“我的下一步”始终使用同一条 Sune 公式，通过重新摆放、最多三轮完成顶面翻色。基础换角使用 9 步三角循环，分成三组记忆，保留黄顶与前两层；进阶课仍提供 T 置换。PLL 21 种置换另有独立图鉴。所有平面图来自真实模型，黄色十字、小鱼的 27 种角朝向、24 种角排列、完整侧面均有校验。

教程页提供基础教程、CFOP、Roux 与 PLL 图鉴入口，点击才打开教程弹窗。CFOP 讲解直接十字、F2L 配对、OLL 与 PLL；Roux 讲解左右造块、CMLL 与 M/U 收尾。进阶课使用独立的三维练习例子，并可直接跳到对应公式库类别。关闭课堂会停止演示。

## 本地开发

需要 Node.js 24。项目没有 npm 依赖，Three.js 已保存在 `src/vendor/`，直接启动即可：

```sh
npm start
```

打开 <http://127.0.0.1:4173/>。修改 `src/` 中的文件后刷新页面。

## 手机演示与 PWA

教程和公式演示支持展开查看、逐步播放及速度调节。手机竖屏采用大按钮，横屏展开时魔方和操作区分列显示。

生产部署先运行 `npm run build`，将 `dist/` 或 Release 的 `dist.zip` 内容作为网站根目录，通过 HTTPS 访问。支持安装到桌面，首次加载并完成缓存后，游戏、公式库和教程可离线使用。Android 在浏览器允许安装时显示“安装”；iPhone/iPad 可在 Safari 的分享菜单中选择“添加到主屏幕”。新版本提示“更新并刷新”，不会自动打断当前操作。

普通 localhost 开发不启用离线缓存。验证构建产物的 PWA：`npm run build` 后执行 `node scripts/preview.mjs --dist`，在地址后加 `?pwa=1`。先停止已占用 4173 端口的预览服务，或通过 `PORT` 环境变量使用另一个端口。图标可用 `node scripts/generate-icons.mjs` 重新生成。

## 检查与生成

```sh
npm run check
npm test
```

修改样例的初始局面或生成逻辑后，执行 `npm run generate`，再运行上述检查。生成结果保存在 `src/tutorial-walkthrough.js`，需一起提交。

## 项目目录

| 目录 | 用途 |
| --- | --- |
| `src/` | 网站源码和运行资源，直接作为静态网站运行 |
| `src/vendor/` | 本地 Three.js 文件及许可证 |
| `dist/` | `npm run build` 生成的静态产物，不提交到仓库 |
| `scripts/` | 预览、检查、生成样例与打包工具 |
| `tests/` | 魔方逻辑、连续教程、白十字与平面图检查 |
| `.github/` | CI 与 tag Release 工作流 |


推送 tag 会发布包含 `dist.zip` 的 GitHub Release；操作说明见 [RELEASING.md](RELEASING.md)。

公式数据和 Three.js 的来源与许可证分别保存在 `src/ALGORITHM-LICENSE.txt`、`src/vendor/THREE-LICENSE.txt`。
