import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
`;

const GameTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
`;

const GameInfo = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const GameDescription = styled.p`
  line-height: 1.6;
  margin-bottom: 1rem;
  color: #555;
  max-width: 600px;
`;

const GameArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: wrap;
`;

const CanvasContainer = styled.div`
  position: relative;
  width: 448px;
  height: 496px;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const GameCanvas = styled.canvas`
  display: block;
`;

const ScorePanel = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  color: white;
  font-size: 16px;
  font-family: 'Press Start 2P', monospace;
  z-index: 10;
`;

const LivesPanel = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
  font-size: 16px;
  font-family: 'Press Start 2P', monospace;
  z-index: 10;
  display: flex;
  align-items: center;
`;

const PacmanLife = styled.div`
  width: 15px;
  height: 15px;
  background-color: yellow;
  border-radius: 50%;
  margin-left: 5px;
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 250px;
`;

const ControlPanel = styled.div`
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 8px;
`;

const ControlTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const ControlButton = styled.button`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 0.8rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #388E3C;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const GameOverModal = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: ${props => props.isVisible ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
`;

const ModalTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #333;
`;

const ModalText = styled.p`
  margin-bottom: 1.5rem;
  color: #555;
`;

const ModalButton = styled.button`
  padding: 0.5rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #388E3C;
  }
`;

// Định nghĩa các hằng số cho trò chơi
const CELL_SIZE = 16; // Kích thước của mỗi ô trong ma trận
const GRID_WIDTH = 28; // Số ô theo chiều ngang
const GRID_HEIGHT = 31; // Số ô theo chiều dọc
const CANVAS_WIDTH = GRID_WIDTH * CELL_SIZE; // Chiều rộng canvas
const CANVAS_HEIGHT = GRID_HEIGHT * CELL_SIZE; // Chiều cao canvas

// Định nghĩa các kiểu dữ liệu
type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface Position {
  x: number;
  y: number;
}

interface PacmanState {
  position: Position;
  direction: Direction;
  nextDirection: Direction;
  mouthOpen: boolean;
  mouthAngle: number;
  speed: number;
}

interface GhostState {
  position: Position;
  direction: Direction;
  color: string;
  speed: number;
  mode: 'chase' | 'scatter' | 'frightened';
  startPosition: Position;
  name: string;
}

interface GameState {
  grid: number[][];
  pacman: PacmanState;
  ghosts: GhostState[];
  score: number;
  lives: number;
  level: number;
  gameOver: boolean;
  gameWon: boolean;
  paused: boolean;
  dotsRemaining: number;
  powerPelletActive: boolean;
  powerPelletTimer: number | null;
}

// Mã số cho các loại ô trong ma trận
const EMPTY = 0;
const WALL = 1;
const DOT = 2;
const POWER_PELLET = 3;
const GHOST_DOOR = 4;

// Ma trận mô tả bản đồ Pac-Man
const initialGrid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 3, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 3, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 4, 4, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 3, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 3, 1],
  [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
  [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
  [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Hàm đếm số điểm còn lại trên bản đồ
const countRemainingDots = (grid: number[][]): number => {
  let count = 0;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === DOT || grid[y][x] === POWER_PELLET) {
        count++;
      }
    }
  }
  return count;
};

// Khởi tạo trạng thái ban đầu của trò chơi
const initialGameState: GameState = {
  grid: JSON.parse(JSON.stringify(initialGrid)),
  pacman: {
    position: { x: 14 * CELL_SIZE, y: 23 * CELL_SIZE },
    direction: 'none',
    nextDirection: 'none',
    mouthOpen: true,
    mouthAngle: 0.2,
    speed: 2
  },
  ghosts: [
    {
      name: 'Blinky',
      position: { x: 14 * CELL_SIZE, y: 11 * CELL_SIZE },
      startPosition: { x: 14 * CELL_SIZE, y: 11 * CELL_SIZE },
      direction: 'up',
      color: 'red',
      speed: 1.8,
      mode: 'scatter'
    },
    {
      name: 'Pinky',
      position: { x: 14 * CELL_SIZE, y: 14 * CELL_SIZE },
      startPosition: { x: 14 * CELL_SIZE, y: 14 * CELL_SIZE },
      direction: 'down',
      color: 'pink',
      speed: 1.6,
      mode: 'scatter'
    },
    {
      name: 'Inky',
      position: { x: 12 * CELL_SIZE, y: 14 * CELL_SIZE },
      startPosition: { x: 12 * CELL_SIZE, y: 14 * CELL_SIZE },
      direction: 'up',
      color: 'cyan',
      speed: 1.7,
      mode: 'scatter'
    },
    {
      name: 'Clyde',
      position: { x: 16 * CELL_SIZE, y: 14 * CELL_SIZE },
      startPosition: { x: 16 * CELL_SIZE, y: 14 * CELL_SIZE },
      direction: 'up',
      color: 'orange',
      speed: 1.5,
      mode: 'scatter'
    }
  ],
  score: 0,
  lives: 3,
  level: 1,
  gameOver: false,
  gameWon: false,
  paused: false,
  dotsRemaining: countRemainingDots(initialGrid),
  powerPelletActive: false,
  powerPelletTimer: null
};

const PacMan: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const gameLoopRef = useRef<number | null>(null);
  
  // Khởi tạo trò chơi
  const initGame = useCallback(() => {
    setGameState({
      ...initialGameState,
      grid: JSON.parse(JSON.stringify(initialGrid)),
      dotsRemaining: countRemainingDots(initialGrid)
    });
    setGameStarted(true);
  }, []);
  
  // Vẽ bản đồ
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, grid: number[][]) => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        const cellX = x * CELL_SIZE;
        const cellY = y * CELL_SIZE;
        
        switch (cell) {
          case WALL:
            ctx.fillStyle = '#2121ff';
            ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
            break;
          case DOT:
            ctx.fillStyle = '#ffb8ae';
            ctx.beginPath();
            ctx.arc(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2, 2, 0, Math.PI * 2);
            ctx.fill();
            break;
          case POWER_PELLET:
            ctx.fillStyle = '#ffb8ae';
            ctx.beginPath();
            ctx.arc(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2, 6, 0, Math.PI * 2);
            ctx.fill();
            break;
          case GHOST_DOOR:
            ctx.fillStyle = '#ffb8ff';
            ctx.fillRect(cellX, cellY + CELL_SIZE / 2 - 1, CELL_SIZE, 2);
            break;
        }
      }
    }
  }, []);
  
  // Vẽ Pac-Man
  const drawPacman = useCallback((ctx: CanvasRenderingContext2D, pacman: PacmanState) => {
    const { position, direction, mouthOpen, mouthAngle } = pacman;
    
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    
    // Tính toán góc bắt đầu và kết thúc cho miệng Pac-Man
    let startAngle = 0;
    let endAngle = 2 * Math.PI;
    
    if (mouthOpen) {
      switch (direction) {
        case 'right':
          startAngle = mouthAngle;
          endAngle = 2 * Math.PI - mouthAngle;
          break;
        case 'left':
          startAngle = Math.PI + mouthAngle;
          endAngle = Math.PI - mouthAngle;
          break;
        case 'up':
          startAngle = 1.5 * Math.PI + mouthAngle;
          endAngle = 1.5 * Math.PI - mouthAngle;
          break;
        case 'down':
          startAngle = 0.5 * Math.PI + mouthAngle;
          endAngle = 0.5 * Math.PI - mouthAngle;
          break;
        default:
          // Mặc định hướng sang phải nếu không có hướng
          startAngle = mouthAngle;
          endAngle = 2 * Math.PI - mouthAngle;
      }
    }
    
    ctx.arc(
      position.x + CELL_SIZE / 2,
      position.y + CELL_SIZE / 2,
      CELL_SIZE / 2,
      startAngle,
      endAngle
    );
    
    if (mouthOpen) {
      ctx.lineTo(position.x + CELL_SIZE / 2, position.y + CELL_SIZE / 2);
    }
    
    ctx.fill();
  }, []);
  
  // Vẽ ma
  const drawGhosts = useCallback((ctx: CanvasRenderingContext2D, ghosts: GhostState[], powerPelletActive: boolean) => {
    ghosts.forEach(ghost => {
      const { position, color, mode } = ghost;
      
      // Xác định màu của ma dựa trên chế độ
      let ghostColor = color;
      if (powerPelletActive) {
        if (mode === 'frightened') {
          // Ma sợ hãi khi Pac-Man ăn Power Pellet
          ghostColor = 'blue';
        }
      }
      
      // Vẽ thân ma
      ctx.fillStyle = ghostColor;
      ctx.beginPath();
      ctx.arc(
        position.x + CELL_SIZE / 2,
        position.y + CELL_SIZE / 2 - 2,
        CELL_SIZE / 2,
        Math.PI,
        0
      );
      ctx.rect(
        position.x,
        position.y + CELL_SIZE / 2 - 2,
        CELL_SIZE,
        CELL_SIZE / 2
      );
      ctx.fill();
      
      // Vẽ phần dưới của ma (hình răng cưa)
      ctx.fillStyle = ghostColor;
      const waveHeight = 3;
      const segments = 3;
      const segmentWidth = CELL_SIZE / segments;
      
      for (let i = 0; i < segments; i++) {
        ctx.beginPath();
        ctx.moveTo(position.x + i * segmentWidth, position.y + CELL_SIZE - 2);
        ctx.lineTo(position.x + i * segmentWidth, position.y + CELL_SIZE - waveHeight - 2);
        ctx.lineTo(position.x + (i + 0.5) * segmentWidth, position.y + CELL_SIZE - 2);
        ctx.lineTo(position.x + (i + 1) * segmentWidth, position.y + CELL_SIZE - waveHeight - 2);
        ctx.lineTo(position.x + (i + 1) * segmentWidth, position.y + CELL_SIZE - 2);
        ctx.fill();
      }
      
      // Vẽ mắt
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(position.x + CELL_SIZE / 3, position.y + CELL_SIZE / 2 - 2, 3, 0, 2 * Math.PI);
      ctx.arc(position.x + 2 * CELL_SIZE / 3, position.y + CELL_SIZE / 2 - 2, 3, 0, 2 * Math.PI);
      ctx.fill();
      
      // Vẽ đồng tử
      ctx.fillStyle = 'black';
      
      // Vị trí đồng tử phụ thuộc vào hướng di chuyển
      let pupilOffsetX = 0;
      let pupilOffsetY = 0;
      
      switch (ghost.direction) {
        case 'left':
          pupilOffsetX = -1;
          break;
        case 'right':
          pupilOffsetX = 1;
          break;
        case 'up':
          pupilOffsetY = -1;
          break;
        case 'down':
          pupilOffsetY = 1;
          break;
      }
      
      ctx.beginPath();
      ctx.arc(
        position.x + CELL_SIZE / 3 + pupilOffsetX,
        position.y + CELL_SIZE / 2 - 2 + pupilOffsetY,
        1.5,
        0,
        2 * Math.PI
      );
      ctx.arc(
        position.x + 2 * CELL_SIZE / 3 + pupilOffsetX,
        position.y + CELL_SIZE / 2 - 2 + pupilOffsetY,
        1.5,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });
  }, []);
  
  // Cập nhật trạng thái miệng Pac-Man
  const updatePacmanMouth = useCallback((pacman: PacmanState): PacmanState => {
    const mouthSpeed = 0.02;
    let { mouthOpen, mouthAngle } = pacman;
    
    if (mouthOpen) {
      mouthAngle += mouthSpeed;
      if (mouthAngle >= 0.5) {
        mouthOpen = false;
      }
    } else {
      mouthAngle -= mouthSpeed;
      if (mouthAngle <= 0.05) {
        mouthOpen = true;
      }
    }
    
    return { ...pacman, mouthOpen, mouthAngle };
  }, []);
  
  // Kiểm tra xem có thể di chuyển đến ô tiếp theo không
  const canMove = useCallback((grid: number[][], x: number, y: number): boolean => {
    // Chuyển đổi từ tọa độ pixel sang tọa độ lưới
    const gridX = Math.floor(x / CELL_SIZE);
    const gridY = Math.floor(y / CELL_SIZE);
    
    // Kiểm tra xem có nằm trong giới hạn bản đồ không
    if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
      return false;
    }
    
    // Kiểm tra xem ô có phải là tường không
    return grid[gridY][gridX] !== WALL;
  }, []);
  
  // Di chuyển Pac-Man
  const movePacman = useCallback((gameState: GameState): GameState => {
    const { pacman, grid } = gameState;
    let { position, direction, nextDirection, speed } = pacman;
    
    // Thử áp dụng hướng tiếp theo nếu có thể
    if (nextDirection !== 'none') {
      let canChangeDirection = false;
      let newX = position.x;
      let newY = position.y;
      
      switch (nextDirection) {
        case 'up':
          newY -= speed;
          canChangeDirection = canMove(grid, position.x, newY);
          break;
        case 'down':
          newY += speed;
          canChangeDirection = canMove(grid, position.x, newY);
          break;
        case 'left':
          newX -= speed;
          canChangeDirection = canMove(grid, newX, position.y);
          break;
        case 'right':
          newX += speed;
          canChangeDirection = canMove(grid, newX, position.y);
          break;
      }
      
      if (canChangeDirection) {
        direction = nextDirection;
      }
    }
    
    // Di chuyển theo hướng hiện tại
    let newX = position.x;
    let newY = position.y;
    
    switch (direction) {
      case 'up':
        newY -= speed;
        break;
      case 'down':
        newY += speed;
        break;
      case 'left':
        newX -= speed;
        break;
      case 'right':
        newX += speed;
        break;
    }
    
    // Kiểm tra xem có thể di chuyển đến vị trí mới không
    if (direction !== 'none' && canMove(grid, newX, newY)) {
      position = { x: newX, y: newY };
    }
    
    // Xử lý đường hầm (teleport)
    if (position.x < 0) {
      position.x = CANVAS_WIDTH - CELL_SIZE;
    } else if (position.x >= CANVAS_WIDTH) {
      position.x = 0;
    }
    
    // Cập nhật trạng thái miệng
    const updatedPacman = updatePacmanMouth({ ...pacman, position, direction });
    
    return { ...gameState, pacman: updatedPacman };
  }, [canMove, updatePacmanMouth]);
  
  // Kiểm tra va chạm với điểm và power pellet
  const checkDotCollision = useCallback((gameState: GameState): GameState => {
    const { pacman, grid, score, dotsRemaining, powerPelletActive, powerPelletTimer } = gameState;
    const { position } = pacman;
    
    // Chuyển đổi từ tọa độ pixel sang tọa độ lưới
    const gridX = Math.floor((position.x + CELL_SIZE / 2) / CELL_SIZE);
    const gridY = Math.floor((position.y + CELL_SIZE / 2) / CELL_SIZE);
    
    // Kiểm tra xem có nằm trong giới hạn bản đồ không
    if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
      return gameState;
    }
    
    let newScore = score;
    let newDotsRemaining = dotsRemaining;
    let newPowerPelletActive = powerPelletActive;
    let newPowerPelletTimer = powerPelletTimer;
    let updatedGrid = [...grid];
    
    // Kiểm tra va chạm với điểm
    if (grid[gridY][gridX] === DOT) {
      newScore += 10;
      newDotsRemaining--;
      updatedGrid[gridY][gridX] = EMPTY;
    }
    // Kiểm tra va chạm với power pellet
    else if (grid[gridY][gridX] === POWER_PELLET) {
      newScore += 50;
      newDotsRemaining--;
      updatedGrid[gridY][gridX] = EMPTY;
      newPowerPelletActive = true;
      
      // Đặt hẹn giờ cho power pellet (khoảng 10 giây)
      if (newPowerPelletTimer !== null) {
        clearTimeout(newPowerPelletTimer);
      }
      
      const timer = window.setTimeout(() => {
        setGameState(prevState => ({
          ...prevState,
          powerPelletActive: false,
          powerPelletTimer: null,
          ghosts: prevState.ghosts.map(ghost => ({
            ...ghost,
            mode: ghost.mode === 'frightened' ? 'chase' : ghost.mode
          }))
        }));
      }, 10000);
      
      newPowerPelletTimer = timer as unknown as number;
      
      // Chuyển tất cả ma sang chế độ sợ hãi
      const updatedGhosts = gameState.ghosts.map(ghost => ({
        ...ghost,
        mode: 'frightened' as 'chase' | 'scatter' | 'frightened'
      }));
      
      return {
        ...gameState,
        grid: updatedGrid,
        score: newScore,
        dotsRemaining: newDotsRemaining,
        powerPelletActive: newPowerPelletActive,
        powerPelletTimer: newPowerPelletTimer,
        ghosts: updatedGhosts
      };
    }
    
    // Kiểm tra xem đã ăn hết điểm chưa
    if (newDotsRemaining === 0) {
      return {
        ...gameState,
        grid: updatedGrid,
        score: newScore,
        dotsRemaining: newDotsRemaining,
        gameWon: true
      };
    }
    
    return {
      ...gameState,
      grid: updatedGrid,
      score: newScore,
      dotsRemaining: newDotsRemaining
    };
  }, []);
  
  // Di chuyển ma
  const moveGhosts = useCallback((gameState: GameState): GameState => {
    const { ghosts, pacman, grid } = gameState;
    
    const updatedGhosts = ghosts.map(ghost => {
      let { position, direction, speed, mode } = ghost;
      
      // Giảm tốc độ ma khi ở chế độ sợ hãi
      const currentSpeed = mode === 'frightened' ? speed * 0.6 : speed;
      
      // Tính toán các hướng có thể di chuyển
      const possibleDirections: Direction[] = [];
      
      // Không cho phép ma quay đầu trừ khi ở chế độ sợ hãi
      const oppositeDirection: { [key in Direction]: Direction } = {
        'up': 'down',
        'down': 'up',
        'left': 'right',
        'right': 'left',
        'none': 'none'
      };
      
      // Kiểm tra các hướng có thể di chuyển
      if (direction !== 'down' || mode === 'frightened') {
        const newY = position.y - currentSpeed;
        if (canMove(grid, position.x, newY)) {
          possibleDirections.push('up');
        }
      }
      
      if (direction !== 'up' || mode === 'frightened') {
        const newY = position.y + currentSpeed;
        if (canMove(grid, position.x, newY)) {
          possibleDirections.push('down');
        }
      }
      
      if (direction !== 'right' || mode === 'frightened') {
        const newX = position.x - currentSpeed;
        if (canMove(grid, newX, position.y)) {
          possibleDirections.push('left');
        }
      }
      
      if (direction !== 'left' || mode === 'frightened') {
        const newX = position.x + currentSpeed;
        if (canMove(grid, newX, position.y)) {
          possibleDirections.push('right');
        }
      }
      
      // Nếu không có hướng nào có thể di chuyển, quay đầu
      if (possibleDirections.length === 0) {
        possibleDirections.push(oppositeDirection[direction]);
      }
      
      // Chọn hướng di chuyển dựa trên chế độ của ma
      let newDirection = direction;
      
      if (mode === 'frightened') {
        // Chế độ sợ hãi: di chuyển ngẫu nhiên
        newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
      } else if (mode === 'chase') {
        // Chế độ đuổi: di chuyển về phía Pac-Man
        // Tính khoảng cách Manhattan từ mỗi hướng có thể đến Pac-Man
        const distances = possibleDirections.map(dir => {
          let newX = position.x;
          let newY = position.y;
          
          switch (dir) {
            case 'up':
              newY -= currentSpeed;
              break;
            case 'down':
              newY += currentSpeed;
              break;
            case 'left':
              newX -= currentSpeed;
              break;
            case 'right':
              newX += currentSpeed;
              break;
          }
          
          // Khoảng cách Manhattan
          return Math.abs(newX - pacman.position.x) + Math.abs(newY - pacman.position.y);
        });
        
        // Chọn hướng có khoảng cách nhỏ nhất
        const minDistance = Math.min(...distances);
        const minIndex = distances.indexOf(minDistance);
        newDirection = possibleDirections[minIndex];
      } else if (mode === 'scatter') {
        // Chế độ phân tán: di chuyển về góc riêng của mỗi ma
        // Đơn giản hóa: chỉ di chuyển ngẫu nhiên
        newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
      }
      
      // Di chuyển ma theo hướng đã chọn
      let newX = position.x;
      let newY = position.y;
      
      switch (newDirection) {
        case 'up':
          newY -= currentSpeed;
          break;
        case 'down':
          newY += currentSpeed;
          break;
        case 'left':
          newX -= currentSpeed;
          break;
        case 'right':
          newX += currentSpeed;
          break;
      }
      
      // Xử lý đường hầm (teleport)
      if (newX < 0) {
        newX = CANVAS_WIDTH - CELL_SIZE;
      } else if (newX >= CANVAS_WIDTH) {
        newX = 0;
      }
      
      return {
        ...ghost,
        position: { x: newX, y: newY },
        direction: newDirection
      };
    });
    
    return { ...gameState, ghosts: updatedGhosts };
  }, [canMove]);
  
  // Kiểm tra va chạm giữa Pac-Man và ma
  const checkGhostCollision = useCallback((gameState: GameState): GameState => {
    const { pacman, ghosts, lives, powerPelletActive, score } = gameState;
    
    for (const ghost of ghosts) {
      // Tính khoảng cách giữa Pac-Man và ma
      const distance = Math.sqrt(
        Math.pow(pacman.position.x - ghost.position.x, 2) +
        Math.pow(pacman.position.y - ghost.position.y, 2)
      );
      
      // Nếu khoảng cách đủ gần, xem như va chạm
      if (distance < CELL_SIZE * 0.8) {
        if (powerPelletActive && ghost.mode === 'frightened') {
          // Pac-Man ăn ma
          const updatedGhosts = ghosts.map(g => {
            if (g === ghost) {
              // Đưa ma về vị trí ban đầu
              return {
                ...g,
                position: { ...g.startPosition },
                direction: 'up' as Direction,
                mode: 'chase' as 'chase' | 'scatter' | 'frightened'
              };
            }
            return g;
          });
          
          // Tăng điểm khi ăn ma
          return {
            ...gameState,
            ghosts: updatedGhosts,
            score: score + 200
          };
        } else {
          // Ma bắt được Pac-Man
          const newLives = lives - 1;
          
          if (newLives <= 0) {
            // Hết mạng, game over
            return {
              ...gameState,
              lives: 0,
              gameOver: true
            };
          } else {
            // Còn mạng, đặt lại vị trí
            const resetPacman = {
              ...pacman,
              position: { x: 14 * CELL_SIZE, y: 23 * CELL_SIZE },
              direction: 'none' as Direction,
              nextDirection: 'none' as Direction
            };
            
            const resetGhosts = ghosts.map(g => ({
              ...g,
              position: { ...g.startPosition },
              direction: 'up' as Direction,
              mode: 'scatter' as 'chase' | 'scatter' | 'frightened'
            }));
            
            return {
              ...gameState,
              pacman: resetPacman,
              ghosts: resetGhosts,
              lives: newLives
            };
          }
        }
      }
    }
    
    return gameState;
  }, []);
  
  // Cập nhật trạng thái trò chơi
  const updateGame = useCallback(() => {
    if (!gameStarted || gameState.paused || gameState.gameOver || gameState.gameWon) {
      return;
    }
    
    setGameState(prevState => {
      // Di chuyển Pac-Man
      let newState = movePacman(prevState);
      
      // Kiểm tra va chạm với điểm
      newState = checkDotCollision(newState);
      
      // Di chuyển ma
      newState = moveGhosts(newState);
      
      // Kiểm tra va chạm với ma
      newState = checkGhostCollision(newState);
      
      return newState;
    });
  }, [gameStarted, gameState.paused, gameState.gameOver, gameState.gameWon, movePacman, checkDotCollision, moveGhosts, checkGhostCollision]);
  
  // Vẽ trò chơi
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Xóa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Vẽ bản đồ
    drawGrid(ctx, gameState.grid);
    
    // Vẽ Pac-Man
    drawPacman(ctx, gameState.pacman);
    
    // Vẽ ma
    drawGhosts(ctx, gameState.ghosts, gameState.powerPelletActive);
  }, [gameState, drawGrid, drawPacman, drawGhosts]);
  
  // Game loop
  useEffect(() => {
    if (!gameStarted) return;
    
    const gameLoop = () => {
      updateGame();
      drawGame();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, updateGame, drawGame]);
  
  // Xử lý sự kiện phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameOver || gameState.gameWon) return;
      
      switch (e.key) {
        case 'ArrowUp':
          setGameState(prevState => ({
            ...prevState,
            pacman: {
              ...prevState.pacman,
              nextDirection: 'up'
            }
          }));
          break;
        case 'ArrowDown':
          setGameState(prevState => ({
            ...prevState,
            pacman: {
              ...prevState.pacman,
              nextDirection: 'down'
            }
          }));
          break;
        case 'ArrowLeft':
          setGameState(prevState => ({
            ...prevState,
            pacman: {
              ...prevState.pacman,
              nextDirection: 'left'
            }
          }));
          break;
        case 'ArrowRight':
          setGameState(prevState => ({
            ...prevState,
            pacman: {
              ...prevState.pacman,
              nextDirection: 'right'
            }
          }));
          break;
        case 'p':
          setGameState(prevState => ({
            ...prevState,
            paused: !prevState.paused
          }));
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState.gameOver, gameState.gameWon]);
  
  // Khởi tạo canvas khi component được mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Vẽ màn hình bắt đầu
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = 'yellow';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAC-MAN', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
    
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Nhấn nút Bắt đầu để chơi', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }, []);
  
  // Tạm dừng trò chơi
  const togglePause = () => {
    if (gameState.gameOver || gameState.gameWon || !gameStarted) return;
    
    setGameState(prevState => ({
      ...prevState,
      paused: !prevState.paused
    }));
  };
  
  return (
    <GameContainer>
      <GameTitle>Pac-Man</GameTitle>
      
      <GameInfo>
        <GameDescription>
          Điều khiển Pac-Man ăn tất cả các điểm trên bản đồ trong khi tránh các con ma. 
          Ăn Power Pellet để tạm thời có thể ăn được ma.
        </GameDescription>
      </GameInfo>
      
      <GameArea>
        <CanvasContainer>
          <GameCanvas ref={canvasRef} />
          
          <ScorePanel>
            Điểm: {gameState.score}
          </ScorePanel>
          
          <LivesPanel>
            Mạng: 
            {Array(gameState.lives).fill(0).map((_, i) => (
              <PacmanLife key={i} />
            ))}
          </LivesPanel>
        </CanvasContainer>
        
        <SidePanel>
          <ControlPanel>
            <ControlTitle>Điều khiển</ControlTitle>
            
            {!gameStarted || gameState.gameOver || gameState.gameWon ? (
              <ControlButton onClick={initGame}>
                {gameState.gameOver || gameState.gameWon ? 'Chơi lại' : 'Bắt đầu'}
              </ControlButton>
            ) : (
              <ControlButton onClick={togglePause}>
                {gameState.paused ? 'Tiếp tục' : 'Tạm dừng'}
              </ControlButton>
            )}
            
            <p>Sử dụng các phím mũi tên để di chuyển Pac-Man.</p>
            <p>Nhấn phím P để tạm dừng trò chơi.</p>
          </ControlPanel>
          
          <ControlPanel>
            <ControlTitle>Hướng dẫn</ControlTitle>
            <p>Ăn tất cả các điểm trên bản đồ để hoàn thành màn chơi.</p>
            <p>Ăn Power Pellet (điểm lớn) để có thể ăn được ma trong thời gian ngắn.</p>
            <p>Tránh các con ma khi chúng không ở chế độ sợ hãi (màu xanh).</p>
          </ControlPanel>
        </SidePanel>
      </GameArea>
      
      <GameOverModal isVisible={gameState.gameOver}>
        <ModalContent>
          <ModalTitle>Trò chơi kết thúc!</ModalTitle>
          <ModalText>
            Bạn đã đạt được điểm số: {gameState.score}
          </ModalText>
          <ModalButton onClick={initGame}>Chơi lại</ModalButton>
        </ModalContent>
      </GameOverModal>
      
      <GameOverModal isVisible={gameState.gameWon}>
        <ModalContent>
          <ModalTitle>Chúc mừng!</ModalTitle>
          <ModalText>
            Bạn đã hoàn thành màn chơi với điểm số: {gameState.score}
          </ModalText>
          <ModalButton onClick={initGame}>Chơi lại</ModalButton>
        </ModalContent>
      </GameOverModal>
    </GameContainer>
  );
};

export default PacMan;