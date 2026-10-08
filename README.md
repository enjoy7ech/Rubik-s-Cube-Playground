# 方寸 · 三阶魔方游乐场

一个简约可爱的三阶魔方游戏：支持拖层操作、公式浮窗、按当前局面还原，以及同一局样例的连续图文教程。

## 本地开发

需要 Node.js 24。项目没有 npm 依赖，Three.js 已保存在 `src/vendor/`，直接启动即可：

```sh
npm start
```

打开 <http://127.0.0.1:4173/>。修改 `src/` 中的文件后刷新页面。

## 检查与生成

```sh
npm run check
npm test
```

修改样例的初始局面或生成逻辑后，执行 `npm run generate`，再运行上述检查。生成结果保存在 `src/tutorial-walkthrough.js` 和 `src/cfop-cross-example.js`，需一起提交。

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
