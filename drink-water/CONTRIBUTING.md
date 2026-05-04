# 贡献指南

感谢您对喝喝水的关注！请遵循以下指南提交贡献。

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

### 示例

```
feat: 添加自定义饮水量输入功能

- 支持手动输入毫升数
- 验证输入范围 1-2000ml

Closes #123
```

## 分支策略

| 分支 | 用途 |
|------|------|
| `main` | 生产环境 |
| `feature/*` | 新功能开发 |
| `fix/*` | Bug 修复 |

## 代码规范

- 使用 2 空格缩进
- 变量命名采用 camelCase
- 组件采用 PascalCase
- 异步操作使用 async/await
- 所有用户输入必须验证

## 测试

提交前请在微信开发者工具中测试：

1. 引导流程完整测试
2. 记一杯功能测试
3. 删除记录功能测试
4. 成就解锁测试

## 问题反馈

- 提交 Bug 请使用 GitHub Issues
- 描述问题时请包含复现步骤
