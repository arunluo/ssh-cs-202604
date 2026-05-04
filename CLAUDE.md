# AI 开发规范

本文件为 AI 辅助开发提供编码规范和项目上下文。

## 项目概述

- **项目名称**：喝喝水小程序
- **类型**：微信小程序
- **核心功能**：喝水记录、进度追踪、智能提醒、成就系统
- **数据存储**：纯本地存储（wx.setStorageSync），不上传服务器

## 技术栈

- 微信原生 API
- JavaScript（微信不支持 TypeScript 编译）
- WeUI 扩展库
- ECharts for 微信小程序
- CSS 动画

## 代码规范

### 文件组织

```
src/
├── app.js              # 应用入口
├── app.json           # 路由配置
├── app.wxss           # 全局样式
├── pages/             # 页面
│   └── [page]/
│       ├── [page].js  # 页面逻辑
│       ├── [page].wxml # 页面结构
│       └── [page].wxss # 页面样式
├── components/        # 公共组件
├── utils/            # 工具函数
└── styles/images/    # 静态资源
```

### 命名规范

- 页面文件：kebab-case（如 `record.js`）
- 组件文件：PascalCase（如 `CupSelector`）
- CSS 类名：kebab-case
- 常量：UPPER_SNAKE_CASE

### 数据类型

微信小程序的 `dataset` 返回值均为**字符串类型**，必须使用 `Number()` 转换后再进行数值运算。

```javascript
// 错误
const amount = e.currentTarget.dataset.amount; // string "200"
total += amount; // 字符串拼接 "200" + "150" = "200150"

// 正确
const amount = Number(e.currentTarget.dataset.amount);
total += amount; // 数值相加 200 + 150 = 350
```

### 存储键值约定

| 键 | 用途 | 类型 |
|----|------|------|
| `drink_records` | 饮水记录 | 数组 |
| `user_profile` | 用户信息 | 对象 |
| `reminder_config` | 提醒配置 | 对象 |
| `achievements` | 成就数据 | 数组 |
| `streak_data` | 连续达标 | 对象 |
| `app_settings` | 应用设置 | 对象 |

### 核心函数（utils/storage.js）

- `addDrinkRecord(amount)` - 添加饮水记录
- `deleteDrinkRecord(id)` - 删除记录
- `calculateTodayProgress()` - 计算今日进度
- `checkAndUpdateStreak()` - 检查并更新连续达标

## 禁止事项

1. **禁止使用 `import`**，微信不支持 ES Module 语法，必须用 `require()`
2. **禁止在 dataset 取值后直接进行数值运算**，必须先 `Number()` 转换
3. **禁止硬编码存储键**，必须使用 `KEYS` 常量对象
4. **禁止上传用户数据到任何服务器**

## 提交规范

遵循约定式提交，参考 CONTRIBUTING.md
