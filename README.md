<div align="center">

# ⚫⚪ WeiQi · 围棋

**围棋打谱与对弈工具 · Go Game Studio**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-222222?logo=github-pages&logoColor=white)](https://arin-chin.github.io/Weiqi-Arin/)

> 🏮 供围棋爱好者打谱研究、自娱自乐。轻量纯前端，打开即用，无需后端。
> A lightweight Go/Baduk game studio for replaying, studying, and playing. No backend required.

---

</div>

## ✨ Features / 功能

### English
- **Play Mode** — Black and White take turns, full capture & ko rules
- **Review Mode** — freely place stones on any intersection for game analysis
- **Endgame Scoring** — submit finish → mark dead stones → auto-calculate result
- **Komi Settings** — Chinese (3¾), Japanese/Korean (6.5), no komi
- **Undo / Reset** — step back or start a fresh game anytime
- **Stats Panel** — live count of stones on board and captured
- **Hover Preview** — see where you"re placing before you click
- **Fully offline** — single HTML file + JS, zero dependencies

### 中文
- **对战模式** — 黑先白后轮流落子，完整提子与打劫规则
- **打谱模式** — 自由放置黑白棋子，方便棋局复盘与研究
- **终局数子** — 提交终局 → 标记死子 → 自动计算胜负
- **贴目设置** — 支持中国规则（3¾子）、日韩规则（6.5目）、无贴目
- **悔棋与重置** — 随时撤销上一步或重新开始
- **统计面板** — 实时显示黑白双方在盘数与吃子数
- **悬停预览** — 落子前看到棋子位置，减少误点
- **完全离线** — 单 HTML + JS，零依赖

---

## 🚀 Quick Start / 快速开始

### 🌐 Online (GitHub Pages)
[Click here to play online](https://arin-chin.github.io/Weiqi-Arin/)

### 📦 Local
Just open \`index.html\` in any modern browser — that"s it.

```bash
git clone https://github.com/Arin-Chin/Weiqi-Arin.git
cd Weiqi-Arin
# open index.html in your browser
```

---

## 🖱 How to Use / 使用方法

| Mode | Action |
|------|--------|
| **Play** | Click any intersection to place a stone. Turns alternate automatically. |
| **Review** | Toggle to review mode, pick black or white, place freely for analysis. |
| **Endgame** | Click "提交终局" → mark dead stones → "计算胜负" for the result. |
| **Komi** | Select komi from the dropdown before or during the game. |
| **Undo** | Click "悔棋" to step back. |
| **Reset** | Click "重新开始" for a clean board. |

---

## 📁 Project Structure / 项目结构

```
Weiqi-Arin/
├── index.html          # ⚫⚪ 主页面（棋盘 + 面板）
├── weiqi.js            # 🧠 核心逻辑（Board / Stone / GameRule / UI / Game）
├── README.md           # 📖 项目文档
├── LICENSE             # ⚖️ MIT 开源许可
└── .gitignore          # 🙈 Git 忽略规则
```

---

## 🛠 Tech Stack / 技术栈

- **Vanilla JavaScript** (ES6 Class) — no frameworks, no build tools
- **HTML5 Canvas** — board rendering & stone drawing
- **Offscreen Canvas** — cached background for performance
- **CSS Flexbox** — responsive three-panel layout

---

## 📄 License / 许可

[MIT](LICENSE) © 2026 ArinChin

---

<div align="center">

Made with ❤️ and Go stones

</div>
