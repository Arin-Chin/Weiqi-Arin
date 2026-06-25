# WeiQi-Arin · 围棋打谱与对弈工具

## 项目概述

纯前端围棋应用，两个文件构成：`index.html`（UI 结构与样式）+ `weiqi.js`（全部游戏逻辑）。无第三方依赖，打开即用。

## 代码架构

### 类继承链（weiqi.js）

```
Board     — 棋盘渲染（Canvas 网格、星位、坐标标注，离屏缓存）
Stone     — 棋子绘制（落子、悬停、死子标记）
Rule      — 围棋规则引擎（落子合法性、气/连通块/提子/打劫、数子计分）
UI        — 面板状态管理（统计更新、模式切换、终局 UI、贴目选择）
WeiQiGame — 主控协调器（鼠标事件、模式切换、悔棋/重置、终局流程）
```

### 数据流

```
鼠标点击 → WeiQiGame.handleClick()
             → Rule.placeStone()       # 落子逻辑 & 提子
             → UI.updateStats()         # 更新统计面板
             → redrawBoard()            # 重新渲染 Canvas
```

## 编码约定

- **语言**：注释使用中文，标识符使用英文 camelCase
- **DOM ID 前缀**：Canvas → `gameCanvas`，状态面板 → `status` / `black-on-board` / `white-captured` 等
- **按钮 ID**：`mode-toggle-btn` / `undo-btn` / `reset-btn` / `submitEndgameBtn` / `markDeadStoneBtn` / `calculateScoreBtn`
- **贴目选择**：ID 为 `komiSelect`，值 `3.75` / `0` / `6.5`
- **颜色值**：字符串 `"black"` / `"white"`
- **棋盘坐标**：`col`（列/文件）和 `row`（行/段），均为 0-based 整数
- **规则引擎方法**：`placeStone(col, row, color)` → `{ success, message, captured }`

## 规则引擎关键方法（Rule 类）

| 方法 | 说明 |
|------|------|
| `reset()` | 重置棋盘状态、提子数、劫争、终局标记 |
| `placeStone(col, row, color)` | 落子，返回 `{ success, message, captured? }` |
| `removeGroup(group)` | 移除连通块 |
| `calculateTerritory()` | 计算领地（BFS 泛洪） |
| `calculateScore()` | 数子计分，返回 `{ blackTotal, whiteTotal, diff, winner }` |
| `undoMove(moveHistory)` | 悔棋，返回 `{ success, currentPlayer, message }` |

## 终局流程

1. `submitEndgame()` → 设置 `isEndgameSubmitted = true`
2. `toggleDeadStoneMode()` → 切换 `isDeadStoneMode`
3. 点击棋子标记/取消死子（存入 `deadStones` Set）
4. `calculateScore()` → 数子判胜负

## 游戏模式

- **`play`**：对战模式，黑先白后轮流落子
- **`review`**：打谱模式，通过 `setReviewColor(color)` 选择颜色自由放置

## GitHub Pages

- 主页：`https://arin-chin.github.io/Weiqi-Arin/`
- 直接通过浏览器打开 `index.html` 亦可离线使用
