# AI 开发规范

本文件为 AI 辅助开发提供编码规范和项目上下文。

## 项目概述

- **项目名称**：照片墙
- **类型**：React Web 应用
- **核心功能**：照片展示、分类筛选、上传删除
- **部署平台**：Vercel

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion (动画)
- Lucide React (图标)

## 代码规范

### 组件结构

```
src/
├── App.tsx              # 主应用
├── main.tsx             # 入口
├── index.css             # 全局样式
├── components/           # 组件
│   ├── Header.tsx
│   ├── PhotoGrid.tsx
│   ├── PhotoCard.tsx
│   ├── PhotoModal.tsx
│   ├── UploadModal.tsx
│   ├── UploadPage.tsx
│   └── CategoryFilter.tsx
├── hooks/
│   └── usePhotos.ts     # 照片状态管理
└── types/
    └── photo.ts         # 类型定义
```

### 命名规范

- 组件文件：PascalCase（如 `PhotoGrid.tsx`）
- Hooks：`use` 前缀（如 `usePhotos.ts`）
- 类型文件：PascalCase（如 `photo.ts`）

### 状态管理

- 使用 React useState/useEffect
- 本地存储使用 localStorage

## 禁止事项

1. **禁止硬编码敏感信息**
2. **禁止本地存储敏感用户数据**
3. **禁止未经压缩上传大图片**

## 提交规范

遵循约定式提交，参考 CONTRIBUTING.md
