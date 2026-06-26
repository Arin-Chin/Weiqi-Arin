/**
 * 1. Board类：负责棋盘渲染、坐标转换、星位绘制（纯视觉+坐标逻辑）
 */
class Board {
  constructor(canvasId, boardSize = 19) {
    // 画布基础配置
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.boardSize = boardSize;
    // 核心调整：缩小边距（从40→25），适配600x600画布
    this.margin = 25; 
    // 重新计算单元格尺寸：(600 - 2*25)/(19-1) = 550/18 ≈30.555
    this.cellSize = (this.canvas.width - 2 * this.margin) / (this.boardSize - 1);

    // 离屏画布（性能优化：仅绘制一次棋盘背景）
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.canvas.width;
    this.offscreenCanvas.height = this.canvas.height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    
    // 初始化棋盘背景
    this.drawBoardBackground();
  }

  /**
   * 绘制棋盘背景（网格+星位，仅初始化时绘制一次）
   */
  drawBoardBackground() {
    const ctx = this.offscreenCtx;
    // 棋盘底色改为rgb(251,199,114)，保留边缘渐变过渡
    const gradient = ctx.createLinearGradient(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    gradient.addColorStop(0, 'rgb(251,199,114)');
    gradient.addColorStop(1, 'rgb(245,189,94)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    
    // 绘制网格
    ctx.strokeStyle = '#1d1d1f';
    ctx.lineWidth = 1;
    for (let col = 0; col < this.boardSize; col++) {
      const x = this.margin + col * this.cellSize;
      ctx.beginPath();
      ctx.moveTo(x, this.margin);
      ctx.lineTo(x, this.canvas.height - this.margin);
      ctx.stroke();
    }
    for (let row = 0; row < this.boardSize; row++) {
      const y = this.margin + row * this.cellSize;
      ctx.beginPath();
      ctx.moveTo(this.margin, y);
      ctx.lineTo(this.canvas.width - this.margin, y);
      ctx.stroke();
    }

    // 绘制星位
    const starPoints = [
      { col: 3, row: 3 }, { col: 3, row: 9 }, { col: 3, row: 15 },
      { col: 9, row: 3 }, { col: 9, row: 9 }, { col: 9, row: 15 },
      { col: 15, row: 3 }, { col: 15, row: 9 }, { col: 15, row: 15 }
    ];
    ctx.fillStyle = '#1d1d1f';
    starPoints.forEach(({ col, row }) => {
      const x = this.margin + col * this.cellSize;
      const y = this.margin + row * this.cellSize;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  /**
   * 绘制坐标标注（仅打谱模式显示，紧凑适配600x600画布）
   * @param {boolean} isReviewMode 是否为打谱模式
   */
  drawCoordinates(isReviewMode) {
    if (!isReviewMode) return;
    const ctx = this.ctx;
    ctx.fillStyle = '#1d1d1f';
    // 调整：缩小字体（14→12px），减少占用空间
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 左侧数字标注（从下到上1~19）
    // 调整：缩小标注到框线的间距（margin-20→margin-12）
    for (let row = 0; row < this.boardSize; row++) {
      const y = this.canvas.height - this.margin - row * this.cellSize;
      ctx.fillText((row + 1).toString(), this.margin - 12, y);
    }

    // 底侧字母标注（从左到右A-T，跳过I）
    // 调整：缩小标注到框线的间距（margin+25→margin+12）
    const letters = 'ABCDEFGHJKLMNOPQRST';
    for (let col = 0; col < this.boardSize; col++) {
      const x = this.margin + col * this.cellSize;
      ctx.fillText(letters[col], x, this.canvas.height - this.margin + 12);
    }
  }

  /**
   * 绘制棋盘（将离屏画布绘制到主画布）
   * @param {boolean} isReviewMode 是否为打谱模式
   */
  draw(isReviewMode) {
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    // 绘制坐标标注（仅打谱模式）
    this.drawCoordinates(isReviewMode);
  }

  /**
   * 鼠标坐标转换为棋盘行列
   * @param {number} clientX 鼠标X坐标
   * @param {number} clientY 鼠标Y坐标
   * @returns {object} {col, row} 棋盘行列
   */
  convertMouseToBoardPos(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    let col = Math.round((x - this.margin) / this.cellSize);
    let row = Math.round((y - this.margin) / this.cellSize);
    // 边界保护：确保坐标在棋盘范围内
    col = Math.max(0, Math.min(this.boardSize - 1, col));
    row = Math.max(0, Math.min(this.boardSize - 1, row));
    
    return { col, row };
  }

  /**
   * 棋盘坐标转换为画布像素坐标
   * @param {number} col 列
   * @param {number} row 行
   * @returns {object} {x, y} 画布像素坐标
   */
  convertBoardToPixelPos(col, row) {
    return {
      x: this.margin + col * this.cellSize,
      y: this.margin + row * this.cellSize
    };
  }

  /**
   * 棋盘坐标转换为（字母·数字）格式
   * @param {number} col 列
   * @param {number} row 行
   * @returns {string} 坐标字符串（如：C·5）
   */
  convertToAlphanumeric(col, row) {
    const letters = 'ABCDEFGHJKLMNOPQRST';
    const letter = letters[col];
    const number = this.boardSize - row; // 从下到上为1~19
    return `${letter}·${number}`;
  }

  /**
   * 判断坐标是否在棋盘内
   * @param {number} col 列
   * @param {number} row 行
   * @returns {boolean} 是否有效
   */
  isValidPosition(col, row) {
    return col >= 0 && col < this.boardSize && row >= 0 && row < this.boardSize;
  }

  /**
   * 获取棋子绘制半径
   * @returns {number} 半径
   */
  getStoneRadius() {
    return this.cellSize * 0.4;
  }
}

/**
 * 2. Stone类：负责棋子绘制、动画、死子标记（纯视觉逻辑）
 */
class Stone {
  constructor(board) {
    this.board = board; // 关联Board实例，获取尺寸/坐标
    this.ctx = board.ctx;
  }

  /**
   * 绘制棋子（优化颜色过渡+阴影效果）
   * @param {number} col 列
   * @param {number} row 行
   * @param {string} color 颜色（black/white）
   */
  draw(col, row, color, isLastMove = false) {
    const { x: centerX, y: centerY } = this.board.convertBoardToPixelPos(col, row);
    const radius = this.board.getStoneRadius();
    
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    
    // 优化：棋子颜色过渡+阴影效果（匹配参考图）
    const gradient = this.ctx.createRadialGradient(
      centerX - radius * 0.25, centerY - radius * 0.25, 0,
      centerX, centerY, radius
    );
    
    if (color === 'black') {
      // 黑棋：深灰到纯黑渐变，添加投影
      gradient.addColorStop(0, '#3a3a3a');
      gradient.addColorStop(0.5, '#2a2a2a');
      gradient.addColorStop(1, '#1a1a1a');
      this.ctx.fillStyle = gradient;
      this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
      this.ctx.shadowBlur = 6;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
    } else {
      // 白棋：纯白到浅灰渐变，添加柔和阴影
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.5, '#f8f8f8');
      gradient.addColorStop(1, '#f0f0f0');
      this.ctx.fillStyle = gradient;
      this.ctx.shadowColor = 'rgba(0,0,0,0.15)';
      this.ctx.shadowBlur = 4;
      this.ctx.shadowOffsetX = 1;
      this.ctx.shadowOffsetY = 1;
    }
    
    this.ctx.fill();
    // 重置阴影，避免影响后续绘制
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;

    // 最后落子的棋子：右下角小三角标记
    if (isLastMove) {
      const markSize = radius * 0.3;
      const mx = centerX + radius * 0.45;
      const my = centerY + radius * 0.45;
      const markColor = color === 'black' ? '#ffffff' : '#ff3b30';
      this.ctx.fillStyle = markColor;
      this.ctx.beginPath();
      this.ctx.moveTo(mx, my - markSize);
      this.ctx.lineTo(mx + markSize, my);
      this.ctx.lineTo(mx, my + markSize);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }

  /**
   * 绘制死子标记（红色半透明覆盖）
   * @param {number} col 列
   * @param {number} row 行
   */
  drawDeadMark(col, row) {
    const { x: centerX, y: centerY } = this.board.convertBoardToPixelPos(col, row);
    const radius = this.board.getStoneRadius();
    
    this.ctx.fillStyle = 'rgba(229, 62, 62, 0.5)';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  /**
   * 绘制Hover效果
   * @param {number} col 列
   * @param {number} row 行
   * @param {string} color 颜色（black/white）
   * @param {boolean} isDeadMode 是否死子标记模式
   */
  drawHover(col, row, color, isDeadMode = false) {
    if (!this.board.isValidPosition(col, row)) return;
    
    const { x: centerX, y: centerY } = this.board.convertBoardToPixelPos(col, row);
    const radius = this.board.getStoneRadius();
    
    // 死子模式下hover显示红色
    if (isDeadMode) {
      this.ctx.fillStyle = 'rgba(229, 62, 62, 0.3)';
    } else {
      this.ctx.fillStyle = color === 'black' 
        ? 'rgba(29, 29, 31, 0.25)'
        : 'rgba(245, 245, 247, 0.6)';
    }
    
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  /**
   * 提子动画（透明度渐变消失）
   * @param {array} group 提子组 [{col, row}]
   * @param {function} onComplete 动画完成回调
   */
  animateCapture(group, onComplete) {
    let opacity = 1;
    const animate = () => {
      opacity -= 0.1;
      if (opacity <= 0) {
        onComplete();
        return;
      }
      
      this.ctx.globalAlpha = opacity;
      group.forEach(stone => {
        this.draw(stone.col, stone.row, this.boardState[stone.row][stone.col]);
      });
      this.ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };
    animate();
  }
}

/**
 * 3. Rule类：封装所有围棋规则（纯业务逻辑，无视觉/DOM）
 */
class Rule {
  /** 四方向偏移常量（上、下、左、右） */
  static DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  constructor(boardSize = 19) {
    this.boardSize = boardSize;
    this.reset(); // 初始化规则状态
  }

  /**
   * 重置规则状态
   */
  reset() {
    // 棋盘状态（二维数组）
    this.boardState = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
    // 提子数统计
    this.captured = { black: 0, white: 0 };
    // 打劫位置
    this.koPos = null;
    // 终局相关
    this.isEndgameSubmitted = false;
    this.isDeadStoneMode = false;
    this.deadStones = new Set(); // 死子坐标（col,row）
    this.komi = 3.75; // 贴目
  }

  /**
   * 对战模式落子逻辑
   * @param {number} col 列
   * @param {number} row 行
   * @param {string} currentPlayer 当前玩家（black/white）
   * @returns {object} {success: boolean, message: string, captured: number, koPos: object}
   */
  makeMove(col, row, currentPlayer) {
    // 1. 验证位置有效性
    if (!this.isValidPosition(col, row) || this.boardState[row][col] !== null) {
      return { success: false, message: '该位置无法落子！' };
    }

    // 2. 验证打劫规则
    if (this.koPos && this.koPos.col === col && this.koPos.row === row) {
      return { success: false, message: '打劫！禁止立即提回' };
    }

    const opponent = currentPlayer === 'black' ? 'white' : 'black';
    this.boardState[row][col] = currentPlayer;
    
    let capturedStones = 0;
    let koCandidate = null;
    const directions = Rule.DIRECTIONS;

    // 3. 检查提子
    for (let [dr, dc] of directions) {
      const r = row + dr;
      const c = col + dc;
      if (this.isValidPosition(c, r) && this.boardState[r][c] === opponent) {
        const group = this.getGroup(c, r);
        if (this.getLiberties(group) === 0) {
          this.removeGroup(group);
          capturedStones += group.length;
          if (group.length === 1) {
            koCandidate = { col: group[0].col, row: group[0].row };
          }
        }
      }
    }

    // 4. 检查自杀
    const selfGroup = this.getGroup(col, row);
    if (this.getLiberties(selfGroup) === 0 && capturedStones === 0) {
      this.boardState[row][col] = null;
      return { success: false, message: '禁止自杀！' };
    }

    // 5. 更新打劫位置
    if (capturedStones === 1 && koCandidate) {
      this.koPos = { col, row };
    } else {
      this.koPos = null;
    }

    // 6. 更新提子数
    this.captured[opponent] += capturedStones;

    return {
      success: true,
      message: '落子成功',
      captured: capturedStones,
      koPos: this.koPos
    };
  }

  /**
   * 打谱模式落子逻辑
   * @param {number} col 列
   * @param {number} row 行
   * @param {string} currentColor 当前选择颜色（black/white）
   * @returns {object} {success: boolean, message: string, captured: number}
   */
  handleReviewMove(col, row, currentColor) {
    if (!this.isValidPosition(col, row)) {
      return { success: false, message: '位置无效' };
    }

    // 已有棋子：切换/移除
    if (this.boardState[row][col] !== null) {
      if (this.boardState[row][col] === 'black') {
        this.boardState[row][col] = 'white';
        return { success: true, message: `切换为白棋：(${col},${row})`, captured: 0 };
      } else {
        this.boardState[row][col] = null;
        return { success: true, message: `移除棋子：(${col},${row})`, captured: 0 };
      }
    }

    // 空位置：落子并检查提子
    this.boardState[row][col] = currentColor;
    const opponent = currentColor === 'black' ? 'white' : 'black';
    let capturedStones = 0;
    const directions = Rule.DIRECTIONS;
    
    for (let [dr, dc] of directions) {
      const r = row + dr;
      const c = col + dc;
      if (this.isValidPosition(c, r) && this.boardState[r][c] === opponent) {
        const group = this.getGroup(c, r);
        if (this.getLiberties(group) === 0) {
          this.removeGroup(group);
          capturedStones += group.length;
        }
      }
    }
    
    this.captured[opponent] += capturedStones;
    return {
      success: true,
      message: `落${currentColor === 'black' ? '黑' : '白'}棋：(${col},${row})，提子${capturedStones}颗`,
      captured: capturedStones
    };
  }

  /**
   * 获取棋子群组（连通的同色棋子）
   * @param {number} col 列
   * @param {number} row 行
   * @returns {array} 群组 [{col, row}]
   */
  getGroup(col, row) {
    const color = this.boardState[row][col];
    if (!color) return [];
    
    const visited = new Set();
    const queue = [{ col, row }];
    visited.add(`${col},${row}`);
    
    let idx = 0;
    while (idx < queue.length) {
      const { col: c, row: r } = queue[idx];
      idx++;
      const directions = Rule.DIRECTIONS;
      
      for (let [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        const key = `${nc},${nr}`;
        
        if (this.isValidPosition(nc, nr) && this.boardState[nr][nc] === color && !visited.has(key)) {
          visited.add(key);
          queue.push({ col: nc, row: nr });
        }
      }
    }
    
    return Array.from(visited).map(key => {
      const [c, r] = key.split(',').map(Number);
      return { col: c, row: r };
    });
  }

  /**
   * 获取群组气数
   * @param {array} group 群组 [{col, row}]
   * @returns {number} 气数
   */
  getLiberties(group) {
    const liberties = new Set();
    for (let { col, row } of group) {
      const directions = Rule.DIRECTIONS;
      for (let [dr, dc] of directions) {
        const r = row + dr;
        const c = col + dc;
        if (this.isValidPosition(c, r) && this.boardState[r][c] === null) {
          liberties.add(`${c},${r}`);
        }
      }
    }
    return liberties.size;
  }

  /**
   * 移除提子群组
   * @param {array} group 群组 [{col, row}]
   */
  removeGroup(group) {
    group.forEach(stone => {
      this.boardState[stone.row][stone.col] = null;
    });
  }

  /**
   * 标记/取消死子
   * @param {number} col 列
   * @param {number} row 行
   * @returns {object} {isMarked: boolean, message: string}
   */
  toggleDeadStone(col, row) {
    if (this.boardState[row][col] === null) {
      return { isMarked: false, message: '仅可标记有棋子的位置' };
    }
    
    const key = `${col},${row}`;
    if (this.deadStones.has(key)) {
      this.deadStones.delete(key);
      return { isMarked: false, message: `取消死子标记：(${col},${row})` };
    } else {
      this.deadStones.add(key);
      return { isMarked: true, message: `标记死子：(${col},${row})` };
    }
  }

  /**
   * 计算领地（空点归属）
   * @returns {object} {black: number, white: number, neutral: number}
   */
  calculateTerritory() {
    const visited = new Set();
    const territory = { black: 0, white: 0, neutral: 0 };

    // 遍历所有空点
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const key = `${col},${row}`;
        if (this.boardState[row][col] !== null || visited.has(key)) continue;

        // BFS查找连通空点
        const queue = [{ col, row }];
        visited.add(key);
        const group = [{ col, row }];
        const borders = new Set();

        while (queue.length > 0) {
          const { col: c, row: r } = queue.shift();
          const directions = Rule.DIRECTIONS;
          
          for (let [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            const nKey = `${nc},${nr}`;
            
            if (this.isValidPosition(nc, nr)) {
              if (this.boardState[nr][nc] === null && !visited.has(nKey)) {
                visited.add(nKey);
                queue.push({ col: nc, row: nr });
                group.push({ col: nc, row: nr });
              } else if (this.boardState[nr][nc] !== null && !this.deadStones.has(nKey)) {
                borders.add(this.boardState[nr][nc]);
              }
            }
          }
        }

        // 判断领地归属
        if (borders.size === 1) {
          if (borders.has('black')) territory.black += group.length;
          else if (borders.has('white')) territory.white += group.length;
        } else {
          territory.neutral += group.length;
        }
      }
    }

    return territory;
  }

  /**
   * 数子法计算胜负
   * @returns {object} 计分结果
   */
  calculateScore() {
    // 1. 统计活子
    let blackAlive = 0;
    let whiteAlive = 0;
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const key = `${col},${row}`;
        if (this.deadStones.has(key)) continue;
        
        if (this.boardState[row][col] === 'black') blackAlive++;
        else if (this.boardState[row][col] === 'white') whiteAlive++;
      }
    }

    // 2. 统计领地
    const territory = this.calculateTerritory();

    // 3. 总子数 = 活子 + 领地
    const blackTotal = blackAlive + territory.black;
    const whiteTotal = whiteAlive + territory.white;

    // 4. 计算最终结果
    const blackFinal = blackTotal - this.komi;
    let winner = '';
    let diff = 0;

    if (blackFinal > whiteTotal) {
      winner = '黑棋';
      diff = blackFinal - whiteTotal;
    } else if (whiteTotal > blackFinal) {
      winner = '白棋';
      diff = whiteTotal - blackFinal;
    } else {
      winner = '和棋';
      diff = 0;
    }

    return {
      blackAlive,
      whiteAlive,
      blackTerritory: territory.black,
      whiteTerritory: territory.white,
      blackTotal,
      whiteTotal,
      blackFinal,
      winner,
      diff
    };
  }

  /**
   * 悔棋
   * @param {array} moveHistory 落子历史
   * @returns {object} {success: boolean, message: string}
   */
  undoMove(moveHistory) {
    if (moveHistory.length === 0) {
      return { success: false, message: '没有可悔的棋！' };
    }
    
    const lastMove = moveHistory.pop();
    this.boardState[lastMove.row][lastMove.col] = null;
    const opponent = lastMove.player === 'black' ? 'white' : 'black';
    this.captured[opponent] -= lastMove.captured;
    this.koPos = null;
    
    return {
      success: true,
      message: `已悔棋，${lastMove.player === 'black' ? '黑方' : '白方'} 回合`,
      currentPlayer: lastMove.player
    };
  }

  /**
   * 验证坐标有效性
   * @param {number} col 列
   * @param {number} row 行
   * @returns {boolean}
   */
  isValidPosition(col, row) {
    return col >= 0 && col < this.boardSize && row >= 0 && row < this.boardSize;
  }
}

/**
 * 4. UI类：负责所有DOM交互（纯交互逻辑，无业务/视觉）
 */
class UI {
  constructor(game) {
    this.game = game; // 关联主游戏实例
    this.cacheDOM(); // 缓存DOM元素
    this.bindEvents(); // 绑定事件
  }

  /**
   * 缓存DOM元素（避免重复查询）
   */
  cacheDOM() {
    // 状态/统计
    this.statusEl = document.getElementById('status');
    this.blackOnBoardEl = document.getElementById('black-on-board');
    this.whiteOnBoardEl = document.getElementById('white-on-board');
    this.blackCapturedEl = document.getElementById('black-captured');
    this.whiteCapturedEl = document.getElementById('white-captured');
    
    // 模式切换
    this.modeToggleBtn = document.getElementById('mode-toggle-btn');
    this.stoneSwitchContainer = document.getElementById('stone-switch-container');
    this.blackStoneBtn = document.getElementById('black-stone-btn');
    this.whiteStoneBtn = document.getElementById('white-stone-btn');
    
    // 终局/计分
    this.submitEndgameBtn = document.getElementById('submitEndgameBtn');
    this.markDeadStoneBtn = document.getElementById('markDeadStoneBtn');
    this.calculateScoreBtn = document.getElementById('calculateScoreBtn');
    this.komiSelect = document.getElementById('komiSelect');
    this.scoreResultEl = document.getElementById('scoreResult');
    this.blackTotalEl = document.getElementById('blackTotal');
    this.whiteTotalEl = document.getElementById('whiteTotal');
    this.komiValueEl = document.getElementById('komiValue');
    this.winnerTextEl = document.getElementById('winnerText');
    
    // 其他按钮
    this.undoBtn = document.getElementById('undo-btn');
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.resetBtn = document.getElementById('reset-btn');
    this.turnIndicator = document.getElementById('turn-indicator');
  }

  /**
   * 绑定所有DOM事件
   */
  bindEvents() {
    // 模式切换
    this.modeToggleBtn.addEventListener('click', () => this.game.toggleMode());
    this.soundToggleBtn.addEventListener('click', () => this.game.toggleSound());
    
    // 棋子切换（打谱模式）
    this.blackStoneBtn.addEventListener('click', () => this.game.setReviewColor('black'));
    this.whiteStoneBtn.addEventListener('click', () => this.game.setReviewColor('white'));
    
    // 终局/计分
    this.submitEndgameBtn.addEventListener('click', () => this.game.submitEndgame());
    this.markDeadStoneBtn.addEventListener('click', () => this.game.toggleDeadStoneMode());
    this.calculateScoreBtn.addEventListener('click', () => this.game.calculateScore());
    this.komiSelect.addEventListener('change', (e) => {
      this.game.rule.komi = parseFloat(e.target.value);
      this.updateStatus(`贴目已设置为：${this.game.rule.komi} 子`);
    });
    
    // 悔棋/重置
    this.undoBtn.addEventListener('click', () => {
      this.game.undoMove();
      this.game.redrawBoard();
      this.updateStats();
    });
    this.resetBtn.addEventListener('click', () => {
      this.game.resetGame();
      this.game.redrawBoard();
      this.updateStats();
    });
  }

  /**
   * 更新状态提示（优化坐标格式为字母·数字）
   * @param {string} message 提示信息
   */
  updateStatus(message) {
    const prefix = this.game.mode === 'play' ? '【对战模式】' : '【打谱模式】';
    // 替换坐标格式：将（col,row）转换为（字母·数字）
    const formattedMessage = message.replace(/\((\d+),(\d+)\)/g, (_, col, row) => {
      return `(${this.game.board.convertToAlphanumeric(parseInt(col), parseInt(row))})`;
    });
    // 第一行：模式标识；第二行：消息内容
    this.statusEl.innerHTML = '<span class="status-mode">' + prefix + '</span><span class="status-msg">' + formattedMessage + '</span>';
  }

  /**
   * 更新统计面板
   */
  updateStats() {
    let blackCount = 0;
    let whiteCount = 0;
    const boardState = this.game.rule.boardState;
    
    for (let row = 0; row < this.game.board.boardSize; row++) {
      for (let col = 0; col < this.game.board.boardSize; col++) {
        if (boardState[row][col] === 'black') blackCount++;
        else if (boardState[row][col] === 'white') whiteCount++;
      }
    }
    
    this.blackOnBoardEl.textContent = blackCount;
    this.whiteOnBoardEl.textContent = whiteCount;
    this.blackCapturedEl.textContent = this.game.rule.captured.black;
    this.whiteCapturedEl.textContent = this.game.rule.captured.white;
  }

  /**
   * 更新计分结果展示
   * @param {object} score 计分结果
   */
  updateScoreResult(score) {
    this.blackTotalEl.textContent = `${score.blackTotal} (贴目后：${score.blackFinal.toFixed(2)})`;
    this.whiteTotalEl.textContent = score.whiteTotal;
    this.komiValueEl.textContent = this.game.rule.komi;
    
    if (score.winner === '和棋') {
      this.winnerTextEl.textContent = '和棋！';
    } else {
      this.winnerTextEl.textContent = `${score.winner}胜 ${score.diff.toFixed(2)} 子`;
    }
    
    this.scoreResultEl.style.display = 'block';
  }

  /**
   * 切换模式UI
   * @param {string} mode 当前模式（play/review）
   */
  updateTurnIndicator(player) {
    if (!this.turnIndicator) return;
    this.turnIndicator.className = 'turn-indicator ' + player;
  }

  toggleModeUI(mode) {
    if (mode === 'review') {
      this.stoneSwitchContainer.style.display = 'flex';
      this.modeToggleBtn.textContent = '切换到对战模式';
    } else {
      this.stoneSwitchContainer.style.display = 'none';
      this.modeToggleBtn.textContent = '切换到打谱模式';
    }
  }

  /**
   * 切换终局UI
   * @param {boolean} isEndgameSubmitted 是否提交终局
   * @param {boolean} isDeadStoneMode 是否死子标记模式
   */
  toggleEndgameUI(isEndgameSubmitted, isDeadStoneMode) {
    this.submitEndgameBtn.style.display = isEndgameSubmitted ? 'none' : 'block';
    this.markDeadStoneBtn.style.display = isEndgameSubmitted ? 'block' : 'none';
    this.calculateScoreBtn.style.display = (isEndgameSubmitted && !isDeadStoneMode) ? 'block' : 'none';
    
    this.markDeadStoneBtn.textContent = isDeadStoneMode 
      ? '取消死子标记' 
      : '标记死子（点击棋子）';
  }

  /**
   * 更新打谱模式棋子选择按钮状态
   * @param {string} color 当前选择颜色（black/white）
   */
  updateReviewColorBtn(color) {
    this.blackStoneBtn.classList.toggle('active', color === 'black');
    this.whiteStoneBtn.classList.toggle('active', color === 'white');
  }

  /**
   * 重置UI状态（根据当前模式更新提示）
   */
  resetUI() {
    if (this.turnIndicator) this.turnIndicator.className = 'turn-indicator black';
    this.scoreResultEl.style.display = 'none';
    this.toggleEndgameUI(false, false);
    this.updateReviewColorBtn('black');
    // 根据当前模式更新状态提示
    const modeText = this.game.mode === 'play' ? '对战模式' : '打谱模式';
    this.updateStatus(`游戏重置，黑方先行【${modeText}】`);
  }
}

/**
 * 5. 主游戏类：整合所有模块，协调交互
 */

/**
 * Sound 工具类：使用 Web Audio API 合成落子音效，无需外部音频文件
 */
class Sound {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  /** 切换音效开关 */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /** 确保 AudioContext 已初始化 */
  ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * 模拟棋子落在木棋盘上的声音
   * 用短脉冲噪声 + 低频共振，比纯正弦波更真实
   */
  playPlace(color) {
    if (!this.enabled) return;
    try {
      this.ensureContext();
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // 短时白噪声模拟棋子与木面的碰撞摩擦
      const bufferSize = ctx.sampleRate * 0.04;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      // 带通滤波：让噪声听起来像木质的"咔嗒"
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = color === 'black' ? 800 : 1200;
      bandpass.Q.value = 1.5;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.04);

      // 低频共振：模拟棋盘木质共鸣
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(color === 'black' ? 130 : 180, now);
      osc.frequency.exponentialRampToValueAtTime(
        color === 'black' ? 80 : 120, now + 0.12
      );
      oscGain.gain.setValueAtTime(0.15, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      // 静默失败
    }
  }

  /**
   * 模拟提子时棋子摩擦叠加的短促声音
   */
  playCapture() {
    if (!this.enabled) return;
    try {
      this.ensureContext();
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // 轻轻拾起棋子的摩擦声
      const bufferSize = ctx.sampleRate * 0.06;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1500;
      bandpass.Q.value = 0.8;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.06);
    } catch (e) {
      // 静默失败
    }
  }
}

class WeiQiGame {
  constructor() {
    // 初始化核心模块
    this.board = new Board('gameCanvas', 19);
    this.stone = new Stone(this.board);
    this.rule = new Rule(19);
    this.ui = new UI(this);
    this.sound = new Sound();

    // 游戏全局状态
    this.mode = 'play'; // play/review
    this.currentPlayer = 'black';
    this.reviewCurrentColor = 'black';
    this.hoveredPos = null;
    this.moveHistory = [];
    this.lastMove = null;

    // 绑定画布事件
    this.bindCanvasEvents();

    // 初始化渲染
    this.ui.updateStatus('游戏开始，黑方先行');
    this.board.draw(this.mode === 'review');
    this.ui.updateStats();
  }

  /**
   * 绑定画布鼠标事件
   */
  bindCanvasEvents() {
    this.board.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.board.canvas.addEventListener('click', (e) => this.handleMouseClick(e));
  }

  /**
   * 处理鼠标移动（更新hover位置）
   * @param {Event} e 鼠标事件
   */
  handleMouseMove(e) {
    const { col, row } = this.board.convertMouseToBoardPos(e.clientX, e.clientY);
    // hover 位置未变化时不触发重绘
    if (this.hoveredPos && this.hoveredPos.col === col && this.hoveredPos.row === row) return;
    this.hoveredPos = this.board.isValidPosition(col, row) ? { col, row } : null;
    this.redrawBoard();
  }

  /**
   * 处理鼠标点击（核心交互逻辑）
   * @param {Event} e 鼠标事件
   */
  handleMouseClick(e) {
    const { col, row } = this.board.convertMouseToBoardPos(e.clientX, e.clientY);
    if (!this.board.isValidPosition(col, row)) return;

    // 死子标记模式优先
    if (this.rule.isDeadStoneMode) {
      const result = this.rule.toggleDeadStone(col, row);
      this.ui.updateStatus(result.message);
      this.redrawBoard();
      return;
    }

    // 打谱模式
    if (this.mode === 'review') {
      const result = this.rule.handleReviewMove(col, row, this.reviewCurrentColor);
      if (result.success) {
        this.sound.playPlace(this.reviewCurrentColor);
        if (result.captured > 0) this.sound.playCapture();
        this.lastMove = { col, row };
        this.ui.updateStatus(result.message);
        this.redrawBoard();
        this.ui.updateStats();
      }
    } 
    // 对战模式（非终局状态）
    else if (!this.rule.isEndgameSubmitted) {
      const result = this.rule.makeMove(col, row, this.currentPlayer);
      if (result.success) {
        // 记录落子历史
        this.moveHistory.push({
          col, row,
          player: this.currentPlayer,
          captured: result.captured,
          koPos: result.koPos ? { ...result.koPos } : null
        });
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        
        this.sound.playPlace(this.currentPlayer === 'black' ? 'black' : 'white');
        if (result.captured > 0) this.sound.playCapture();
        this.lastMove = { col, row };
        this.ui.updateTurnIndicator(this.currentPlayer);
        this.ui.updateStatus(`${this.currentPlayer === 'black' ? '黑方' : '白方'} 回合`);
        this.redrawBoard();
        this.ui.updateStats();
      } else {
        this.ui.updateStatus(result.message);
      }
    }
  }

  /**
   * 切换游戏模式（play/review）
   */
  toggleSound() {
    const enabled = this.sound.toggle();
    if (this.ui.soundToggleBtn) {
      this.ui.soundToggleBtn.textContent = enabled ? '音效：开 🔊' : '音效：关 🔇';
    }
  }

  toggleMode() {
    if (this.mode === 'play') {
      this.mode = 'review';
      this.reviewCurrentColor = 'black';
      this.ui.toggleModeUI('review');
      this.ui.updateReviewColorBtn('black');
      this.ui.updateStatus(`已切换到打谱模式（当前选择黑棋）`);
    } else {
      this.mode = 'play';
      this.ui.toggleModeUI('play');
      this.ui.updateStatus(`已切换到对战模式，${this.currentPlayer === 'black' ? '黑方' : '白方'} 回合`);
    }
    this.redrawBoard();
  }

  /**
   * 设置打谱模式当前颜色
   * @param {string} color 颜色（black/white）
   */
  setReviewColor(color) {
    if (this.mode !== 'review') return;
    this.reviewCurrentColor = color;
    this.ui.updateReviewColorBtn(color);
    this.ui.updateStatus(`当前选择${color === 'black' ? '黑' : '白'}棋`);
    this.redrawBoard();
  }

  /**
   * 提交终局
   */
  submitEndgame() {
    if (this.mode !== 'play') {
      this.ui.updateStatus('仅对战模式可提交终局！');
      return;
    }
    
    this.rule.isEndgameSubmitted = true;
    this.ui.toggleEndgameUI(true, false);
    this.ui.updateStatus('已提交终局，请标记死子后计算胜负');
  }

  /**
   * 切换死子标记模式
   */
  toggleDeadStoneMode() {
    this.rule.isDeadStoneMode = !this.rule.isDeadStoneMode;
    this.ui.toggleEndgameUI(true, this.rule.isDeadStoneMode);
    
    if (this.rule.isDeadStoneMode) {
      this.ui.updateStatus('进入死子标记模式：点击棋子标记/取消死子');
    } else {
      this.ui.updateStatus('退出死子标记模式，可计算胜负');
    }
    this.redrawBoard();
  }

  /**
   * 计算胜负
   */
  calculateScore() {
    if (!this.rule.isEndgameSubmitted) {
      this.ui.updateStatus('请先提交终局！');
      return;
    }

    const score = this.rule.calculateScore();
    this.ui.updateScoreResult(score);
    this.ui.updateStatus(`计分完成：${score.winner}胜 ${score.diff.toFixed(2)} 子`);
    
    // 退出死子标记模式
    this.rule.isDeadStoneMode = false;
    this.ui.toggleEndgameUI(true, false);
  }

  /**
   * 悔棋
   */
  undoMove() {
    const result = this.rule.undoMove(this.moveHistory);
    if (result.success) {
      this.currentPlayer = result.currentPlayer;
      this.lastMove = this.moveHistory.length > 0 ? this.moveHistory[this.moveHistory.length - 1] : null;
      this.ui.updateTurnIndicator(this.currentPlayer);
      this.ui.updateStatus(result.message);
    } else {
      this.ui.updateStatus(result.message);
    }
  }

  /**
   * 重置游戏（保留当前模式不变）
   */
  resetGame() {
    // 重置规则状态
    this.rule.reset();
    
    // 重置全局状态（保留当前mode不变）
    this.currentPlayer = 'black';
    this.reviewCurrentColor = 'black';
    this.hoveredPos = null;
    this.moveHistory = [];
    this.lastMove = null;
    
    // 重置UI（根据当前模式更新）
    this.ui.resetUI();
    this.ui.toggleModeUI(this.mode);
    
    this.redrawBoard();
  }

  /**
   * 重绘棋盘（核心渲染逻辑）
   */
  redrawBoard() {
    requestAnimationFrame(() => {
      // 1. 绘制棋盘背景+坐标标注（仅打谱模式）
      this.board.draw(this.mode === 'review');
      
      // 2. 绘制所有棋子
      const boardState = this.rule.boardState;
      for (let row = 0; row < this.board.boardSize; row++) {
        for (let col = 0; col < this.board.boardSize; col++) {
          if (boardState[row][col]) {
            const isLast = this.lastMove && this.lastMove.col === col && this.lastMove.row === row;
            this.stone.draw(col, row, boardState[row][col], isLast);
            
            // 绘制死子标记
            const key = `${col},${row}`;
            if (this.rule.deadStones.has(key)) {
              this.stone.drawDeadMark(col, row);
            }
          }
        }
      }
      
      // 3. 绘制Hover效果
      if (this.hoveredPos) {
        const hoverColor = this.mode === 'review' ? this.reviewCurrentColor : this.currentPlayer;
        this.stone.drawHover(
          this.hoveredPos.col, 
          this.hoveredPos.row, 
          hoverColor, 
          this.rule.isDeadStoneMode
        );
      }
    });
  }
}

// 初始化游戏
window.addEventListener('load', () => {
  new WeiQiGame();
});