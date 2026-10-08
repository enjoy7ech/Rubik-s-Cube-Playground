# CI 与 Release

分支推送、Pull Request 和手动运行都会检查 JavaScript、魔方引擎和教程样例，并上传包含 `dist.zip` 的 Actions 产物。

推送任意 tag 时，检查通过后创建同名 GitHub Release，把 `dist.zip` 附在 Release 的 Assets 中。重复运行同一个 tag 会更新同名附件，不会重复创建 Release。使用内置 `GITHUB_TOKEN`，不需要添加个人访问令牌。

先把工作流、`dist/`、`scripts/` 和验证脚本提交并推送到 GitHub，再推送指向该提交的 tag，例如：

```sh
git tag v1.0.0
git push origin v1.0.0
```

项目是静态网站，发布时直接打包已提交的 `dist/`，不运行那些用于一次性修改页面的脚本，也不部署 Sites。

`dist.zip` 解压后根目录直接包含 `index.html`，可用任意静态 HTTP 服务运行。压缩包包含本地 Three.js 与许可证，不包含 Git、依赖目录或 Sites 元数据。

本地执行相同检查与打包：

```sh
node scripts/check-js.mjs
npm test
node verify-white-cross.mjs
node verify-walkthrough.mjs
node verify-middle-diagram.mjs
pwsh -File scripts/package-dist.ps1
```
