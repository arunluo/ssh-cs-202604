# 贡献指南

感谢您对比片墙的关注！请遵循以下指南提交贡献。

## 开发流程

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'feat: 添加新功能'`
4. 推送分支：`git push origin feature/your-feature`
5. 创建 Pull Request

## Commit 规范

采用 [约定式提交](https://www.conventionalcommits.org/)：

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档变更 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具变更 |

## 分支策略

| 分支 | 用途 |
|------|------|
| `main` | 生产环境 |

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion

## 本地开发

```bash
npm install
npm run dev
npm run build
```

## 部署

本项目配置了 Vercel，一键部署。

## 问题反馈

- 提交 Bug 请使用 GitHub Issues
- 描述问题时请包含复现步骤
