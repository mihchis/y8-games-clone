import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const GameBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(15, 40px);
  grid-template-rows: repeat(13, 40px);
  gap: 0;
  background-color: #8bac0f;
  border: 4px solid #333;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Cell = styled.div<{ type: string }>`
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => {
    switch (props.type) {
      case 'wall': return '#333';
      case 'brick': return '#a52a2a';
      case 'empty': return '#8bac0f';
      case 'bomb': return '#8bac0f';
      case 'explosion': return '#ff6600';
      case 'powerup': return '#8bac0f';
      default: return '#8bac0f';
    }
  }};
  position: relative;
`;

const Player = styled.div<{ playerNumber: number }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => props.playerNumber === 1 ? '#0066cc' : '#cc0000'};
  position: absolute;
  z-index: 10;
  transition: transform 0.1s ease-out;
`;

const BombElement = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: #000;
  position: relative;
  animation: pulse 1s infinite;
  
  @keyframes pulse {
    0% { transform: scale(0.9); }
    50% { transform: scale(1.1); }
    100% { transform: scale(0.9); }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 5px;
    right: 5px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #fff;
  }
`;

const ExplosionElement = styled.div`
  width: 100%;
  height: 100%;
  background-color: #ff6600;
  animation: explode 0.5s;
  
  @keyframes explode {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

const BrickElement = styled.div`
  width: 100%;
  height: 100%;
  background-color: #a52a2a;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2px;
  
  &::before, &::after {
    content: '';
    height: 4px;
    background-color: #8b4513;
  }
  
  &::before {
    margin-top: 4px;
  }
  
  &::after {
    margin-bottom: 4px;
  }
`;

const WallElement = styled.div`
  width: 100%;
  height: 100%;
  background-color: #333;
  border: 2px solid #555;
  box-sizing: border-box;
`;

const PowerupElement = styled.div<{ type: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => {
    switch (props.type) {
      case 'bomb': return '#ff0000';
      case 'flame': return '#ff9900';
      case 'speed': return '#0099ff';
      default: return '#ffffff';
    }
  }};
  border: 2px solid #fff;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.7);
  animation: glow 1.5s infinite alternate;
  
  @keyframes glow {
    from { box-shadow: 0 0 5px rgba(255, 255, 255, 0.7); }
    to { box-shadow: 0 0 15px rgba(255, 255, 255, 0.9); }
  }
`;

const ControlPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  width: 100%;
  max-width: 600px;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const ControlButton = styled.button`
  padding: 0.8rem 1.5rem;
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

const ScorePanel = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 1rem;
`;

const PlayerScore = styled.div<{ playerNumber: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: ${props => props.playerNumber === 1 ? '#e6f2ff' : '#ffe6e6'};
  border: 2px solid ${props => props.playerNumber === 1 ? '#0066cc' : '#cc0000'};
  border-radius: 4px;
  min-width: 120px;
`;

const PlayerName = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
`;

const ScoreValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
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

const KeyboardControls = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f0f0f0;
  border-radius: 8px;
`;

const ControlsColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ControlsTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

const ControlsList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const ControlItem = styled.li`
  margin-bottom: 0.3rem;
  color: #555;
`;

const KeyboardKey = styled.span`
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background-color: #ddd;
  border: 1px solid #bbb;
  border-radius: 3px;
  font-family: monospace;
  margin: 0 0.3rem;
`;

// Định nghĩa các kiểu dữ liệu
type CellType = 'empty' | 'wall' | 'brick' | 'bomb' | 'explosion' | 'powerup';
type PowerupType = 'bomb' | 'flame' | 'speed';
type Direction = 'up' | 'down' | 'left' | 'right';

interface Position {
  x: number;
  y: number;
}

interface PlayerState {
  position: Position;
  bombCount: number;
  maxBombs: number;
  bombPower: number;
  speed: number;
  score: number;
  isAlive: boolean;
}

interface BombState {
  position: Position;
  timer: number;
  power: number;
  playerId: number;
}

interface PowerupState {
  position: Position;
  type: PowerupType;
}

interface GameState {
  grid: CellType[][];
  players: PlayerState[];
  bombs: BombState[];
  explosions: Position[];
  powerups: PowerupState[];
  gameStarted: boolean;
  gameOver: boolean;
  winner: number | null;
}

const GRID_WIDTH = 15;
const GRID_HEIGHT = 13;
const INITIAL_BOMB_COUNT = 1;
const INITIAL_BOMB_POWER = 1;
const INITIAL_PLAYER_SPEED = 1;
const BOMB_TIMER = 3000; // 3 seconds
const EXPLOSION_DURATION = 1000; // 1 second
const POWERUP_CHANCE = 0.3; // 30% chance for a powerup when breaking a brick

const Bomberman: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    players: [],
    bombs: [],
    explosions: [],
    powerups: [],
    gameStarted: false,
    gameOver: false,
    winner: null
  });
  
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  // Khởi tạo bảng chơi
  const initializeGame = useCallback(() => {
    // Tạo lưới trống
    const newGrid: CellType[][] = Array(GRID_HEIGHT).fill(null).map(() => 
      Array(GRID_WIDTH).fill('empty')
    );
    
    // Thêm tường cố định (không thể phá hủy)
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        // Tường viền
        if (x === 0 || y === 0 || x === GRID_WIDTH - 1 || y === GRID_HEIGHT - 1) {
          newGrid[y][x] = 'wall';
        }
        // Tường bên trong (mẫu cố định)
        else if (x % 2 === 0 && y % 2 === 0) {
          newGrid[y][x] = 'wall';
        }
      }
    }
    
    // Thêm gạch (có thể phá hủy)
    for (let y = 1; y < GRID_HEIGHT - 1; y++) {
      for (let x = 1; x < GRID_WIDTH - 1; x++) {
        // Bỏ qua các ô tường cố định
        if (newGrid[y][x] === 'wall') continue;
        
        // Để lại không gian trống cho người chơi bắt đầu
        if ((x === 1 && y === 1) || // Góc trên bên trái (người chơi 1)
            (x === 1 && y === 2) ||
            (x === 2 && y === 1) ||
            (x === GRID_WIDTH - 2 && y === GRID_HEIGHT - 2) || // Góc dưới bên phải (người chơi 2)
            (x === GRID_WIDTH - 2 && y === GRID_HEIGHT - 3) ||
            (x === GRID_WIDTH - 3 && y === GRID_HEIGHT - 2)) {
          continue;
        }
        
        // 60% cơ hội tạo gạch
        if (Math.random() < 0.6) {
          newGrid[y][x] = 'brick';
        }
      }
    }
    
    // Khởi tạo người chơi
    const newPlayers: PlayerState[] = [
      {
        position: { x: 1, y: 1 }, // Góc trên bên trái
        bombCount: 0,
        maxBombs: INITIAL_BOMB_COUNT,
        bombPower: INITIAL_BOMB_POWER,
        speed: INITIAL_PLAYER_SPEED,
        score: 0,
        isAlive: true
      },
      {
        position: { x: GRID_WIDTH - 2, y: GRID_HEIGHT - 2 }, // Góc dưới bên phải
        bombCount: 0,
        maxBombs: INITIAL_BOMB_COUNT,
        bombPower: INITIAL_BOMB_POWER,
        speed: INITIAL_PLAYER_SPEED,
        score: 0,
        isAlive: true
      }
    ];
    
    setGameState({
      grid: newGrid,
      players: newPlayers,
      bombs: [],
      explosions: [],
      powerups: [],
      gameStarted: true,
      gameOver: false,
      winner: null
    });
    
    // Bắt đầu vòng lặp trò chơi
    lastUpdateTimeRef.current = performance.now();
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, []);
  
  // Vòng lặp trò chơi
  const gameLoop = useCallback((timestamp: number) => {
    if (!lastUpdateTimeRef.current) lastUpdateTimeRef.current = timestamp;
    const deltaTime = timestamp - lastUpdateTimeRef.current;
    
    // Cập nhật trò chơi 60 lần mỗi giây
    if (deltaTime >= 1000 / 60) {
      updateGame(deltaTime / 1000); // Chuyển đổi sang giây
      lastUpdateTimeRef.current = timestamp;
    }
    
    // Tiếp tục vòng lặp
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, []);
  
  // Cập nhật trạng thái trò chơi
  const updateGame = useCallback((deltaTime: number) => {
    setGameState(prevState => {
      if (!prevState.gameStarted || prevState.gameOver) return prevState;
      
      // Tạo bản sao của trạng thái trò chơi
      const newState = { ...prevState };
      
      // Cập nhật vị trí người chơi
      const newPlayers = [...prevState.players];
      
      // Di chuyển người chơi 1
      if (newPlayers[0].isAlive) {
        movePlayer(0, newPlayers, prevState.grid, prevState.bombs, deltaTime);
      }
      
      // Di chuyển người chơi 2
      if (newPlayers[1].isAlive) {
        movePlayer(1, newPlayers, prevState.grid, prevState.bombs, deltaTime);
      }
      
      // Cập nhật bom
      const newBombs = [...prevState.bombs];
      const newExplosions = [...prevState.explosions];
      const newGrid = prevState.grid.map(row => [...row]);
      const newPowerups = [...prevState.powerups];
      
      // Kiểm tra bom nổ
      for (let i = newBombs.length - 1; i >= 0; i--) {
        const bomb = newBombs[i];
        bomb.timer -= deltaTime * 1000; // Chuyển đổi deltaTime thành mili giây
        
        if (bomb.timer <= 0) {
          // Xóa bom
          newBombs.splice(i, 1);
          
          // Tăng số lượng bom có sẵn cho người chơi
          newPlayers[bomb.playerId - 1].bombCount--;
          
          // Tạo vụ nổ
          const explosionPositions = createExplosion(
            bomb.position,
            bomb.power,
            newGrid,
            newPowerups
          );
          
          // Thêm vị trí nổ vào danh sách
          explosionPositions.forEach(pos => {
            newExplosions.push(pos);
            
            // Kiểm tra xem người chơi có bị nổ không
            newPlayers.forEach((player, playerIndex) => {
              if (player.isAlive && player.position.x === pos.x && player.position.y === pos.y) {
                player.isAlive = false;
                
                // Tăng điểm cho người chơi đặt bom
                if (bomb.playerId - 1 !== playerIndex) {
                  newPlayers[bomb.playerId - 1].score += 100;
                } else {
                  // Trừ điểm nếu tự sát
                  newPlayers[bomb.playerId - 1].score -= 50;
                }
              }
            });
          });
          
          // Đặt hẹn giờ để xóa vụ nổ
          setTimeout(() => {
            setGameState(prevState => {
              const newExplosions = prevState.explosions.filter(exp => 
                !explosionPositions.some(pos => pos.x === exp.x && pos.y === exp.y)
              );
              
              return {
                ...prevState,
                explosions: newExplosions
              };
            });
          }, EXPLOSION_DURATION);
        }
      }
      
      // Kiểm tra người chơi nhặt powerup
      newPlayers.forEach((player, playerIndex) => {
        if (!player.isAlive) return;
        
        const powerupIndex = newPowerups.findIndex(
          p => p.position.x === player.position.x && p.position.y === player.position.y
        );
        
        if (powerupIndex !== -1) {
          const powerup = newPowerups[powerupIndex];
          
          // Áp dụng hiệu ứng powerup
          switch (powerup.type) {
            case 'bomb':
              player.maxBombs++;
              break;
            case 'flame':
              player.bombPower++;
              break;
            case 'speed':
              player.speed += 0.2;
              break;
          }
          
          // Xóa powerup
          newPowerups.splice(powerupIndex, 1);
          newGrid[powerup.position.y][powerup.position.x] = 'empty';
          
          // Tăng điểm
          player.score += 10;
        }
      });
      
      // Kiểm tra kết thúc trò chơi
      let gameOver = false;
      let winner = null;
      
      if (!newPlayers[0].isAlive && !newPlayers[1].isAlive) {
        // Hòa
        gameOver = true;
      } else if (!newPlayers[0].isAlive) {
        // Người chơi 2 thắng
        gameOver = true;
        winner = 2;
      } else if (!newPlayers[1].isAlive) {
        // Người chơi 1 thắng
        gameOver = true;
        winner = 1;
      }
      
      return {
        ...newState,
        grid: newGrid,
        players: newPlayers,
        bombs: newBombs,
        explosions: newExplosions,
        powerups: newPowerups,
        gameOver,
        winner
      };
    });
  }, []);
  
  // Di chuyển người chơi
  const movePlayer = (
    playerIndex: number,
    players: PlayerState[],
    grid: CellType[][],
    bombs: BombState[],
    deltaTime: number
  ) => {
    const player = players[playerIndex];
    const moveDistance = player.speed * deltaTime * 5; // Điều chỉnh tốc độ di chuyển
    let newX = player.position.x;
    let newY = player.position.y;
    
    // Xác định hướng di chuyển dựa trên phím được nhấn
    if (playerIndex === 0) {
      // Người chơi 1 (WASD)
      if (keysPressed.has('w')) newY -= moveDistance;
      if (keysPressed.has('s')) newY += moveDistance;
      if (keysPressed.has('a')) newX -= moveDistance;
      if (keysPressed.has('d')) newX += moveDistance;
      
      // Đặt bom (Space)
      if (keysPressed.has(' ') && player.bombCount < player.maxBombs) {
        placeBomb(playerIndex, player, bombs, grid);
      }
    } else {
      // Người chơi 2 (Arrow keys)
      if (keysPressed.has('ArrowUp')) newY -= moveDistance;
      if (keysPressed.has('ArrowDown')) newY += moveDistance;
      if (keysPressed.has('ArrowLeft')) newX -= moveDistance;
      if (keysPressed.has('ArrowRight')) newX += moveDistance;
      
      // Đặt bom (Enter)
      if (keysPressed.has('Enter') && player.bombCount < player.maxBombs) {
        placeBomb(playerIndex, player, bombs, grid);
      }
    }
    
    // Làm tròn vị trí để kiểm tra va chạm
    const roundedX = Math.round(newX);
    const roundedY = Math.round(newY);
    
    // Kiểm tra va chạm theo trục X
    if (roundedX !== Math.round(player.position.x)) {
      if (isValidMove(roundedX, Math.round(player.position.y), grid, bombs)) {
        player.position.x = newX;
      }
    }
    
    // Kiểm tra va chạm theo trục Y
    if (roundedY !== Math.round(player.position.y)) {
      if (isValidMove(Math.round(newX), roundedY, grid, bombs)) {
        player.position.y = newY;
      }
    }
  };
  
  // Kiểm tra xem vị trí có hợp lệ để di chuyển không
  const isValidMove = (x: number, y: number, grid: CellType[][], bombs: BombState[]): boolean => {
    // Kiểm tra giới hạn bản đồ
    if (x < 0 || y < 0 || x >= GRID_WIDTH || y >= GRID_HEIGHT) return false;
    
    // Kiểm tra va chạm với tường hoặc gạch
    if (grid[y][x] === 'wall' || grid[y][x] === 'brick') return false;
    
    // Kiểm tra va chạm với bom
    for (const bomb of bombs) {
      if (Math.round(bomb.position.x) === x && Math.round(bomb.position.y) === y) {
        return false;
      }
    }
    
    return true;
  };
  
  // Đặt bom
  const placeBomb = (
    playerIndex: number,
    player: PlayerState,
    bombs: BombState[],
    grid: CellType[][]
  ) => {
    // Làm tròn vị trí để đặt bom vào ô lưới
    const x = Math.round(player.position.x);
    const y = Math.round(player.position.y);
    
    // Kiểm tra xem đã có bom ở vị trí này chưa
    for (const bomb of bombs) {
      if (Math.round(bomb.position.x) === x && Math.round(bomb.position.y) === y) {
        return;
      }
    }
    
    // Thêm bom mới
    bombs.push({
      position: { x, y },
      timer: BOMB_TIMER,
      power: player.bombPower,
      playerId: playerIndex + 1
    });
    
    // Tăng số lượng bom đã đặt
    player.bombCount++;
  };
  
  // Tạo vụ nổ
  const createExplosion = (
    position: Position,
    power: number,
    grid: CellType[][],
    powerups: PowerupState[]
  ): Position[] => {
    const explosionPositions: Position[] = [];
    const { x, y } = position;
    
    // Thêm vị trí trung tâm
    explosionPositions.push({ x, y });
    grid[y][x] = 'explosion';
    
    // Hàm kiểm tra và thêm vị trí nổ
    const checkAndAddExplosion = (x: number, y: number): boolean => {
      // Kiểm tra giới hạn bản đồ
      if (x < 0 || y < 0 || x >= GRID_WIDTH || y >= GRID_HEIGHT) return false;
      
      // Kiểm tra va chạm với tường
      if (grid[y][x] === 'wall') return false;
      
      // Kiểm tra va chạm với gạch
      if (grid[y][x] === 'brick') {
        grid[y][x] = 'explosion';
        explosionPositions.push({ x, y });
        
        // Tạo powerup ngẫu nhiên
        if (Math.random() < POWERUP_CHANCE) {
          const powerupTypes: PowerupType[] = ['bomb', 'flame', 'speed'];
          const randomType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
          
          powerups.push({
            position: { x, y },
            type: randomType
          });
          
          // Đánh dấu ô có powerup
          grid[y][x] = 'powerup';
        } else {
          // Đánh dấu ô trống sau khi nổ
          setTimeout(() => {
            setGameState(prevState => {
              const newGrid = prevState.grid.map(row => [...row]);
              if (newGrid[y][x] === 'explosion') {
                newGrid[y][x] = 'empty';
              }
              return { ...prevState, grid: newGrid };
            });
          }, EXPLOSION_DURATION);
        }
        
        return false;
      }
      
      // Kiểm tra va chạm với bom khác
      // Nếu có bom khác, nó sẽ được kích nổ trong vòng lặp tiếp theo
      
      // Thêm vị trí nổ
      grid[y][x] = 'explosion';
      explosionPositions.push({ x, y });
      
      // Đánh dấu ô trống sau khi nổ
      setTimeout(() => {
        setGameState(prevState => {
          const newGrid = prevState.grid.map(row => [...row]);
          if (newGrid[y][x] === 'explosion') {
            newGrid[y][x] = 'empty';
          }
          return { ...prevState, grid: newGrid };
        });
      }, EXPLOSION_DURATION);
      
      return true;
    };
    
    // Lan truyền vụ nổ theo 4 hướng
    const directions = [
      { dx: 0, dy: -1 }, // Lên
      { dx: 0, dy: 1 },  // Xuống
      { dx: -1, dy: 0 }, // Trái
      { dx: 1, dy: 0 }   // Phải
    ];
    
    directions.forEach(dir => {
      for (let i = 1; i <= power; i++) {
        const newX = x + dir.dx * i;
        const newY = y + dir.dy * i;
        
        // Nếu không thể lan truyền tiếp, dừng lại
        if (!checkAndAddExplosion(newX, newY)) break;
      }
    });
    
    return explosionPositions;
  };
  
  // Xử lý sự kiện phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeysPressed(prev => {
        const newKeys = new Set(prev);
        newKeys.add(e.key);
        return newKeys;
      });
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key);
        return newKeys;
      });
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Dọn dẹp khi component bị hủy
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);
  
  // Bắt đầu trò chơi mới
  const startNewGame = () => {
    initializeGame();
  };
  
  // Hiển thị các phần tử trên bảng chơi
  const renderCell = (cell: CellType, x: number, y: number) => {
    switch (cell) {
      case 'wall':
        return <WallElement />;
      case 'brick':
        return <BrickElement />;
      case 'bomb':
        return <BombElement />;
      case 'explosion':
        return <ExplosionElement />;
      case 'powerup':
        const powerup = gameState.powerups.find(p => p.position.x === x && p.position.y === y);
        return powerup ? <PowerupElement type={powerup.type} /> : null;
      default:
        return null;
    }
  };
  
  return (
    <GameContainer>
      <GameTitle>Bomberman</GameTitle>
      
      <GameInfo>
        <GameDescription>
          Đặt bom để phá vỡ các khối gạch và tiêu diệt đối thủ. Thu thập các vật phẩm để tăng sức mạnh.
          Người chơi cuối cùng còn sống sẽ chiến thắng!
        </GameDescription>
      </GameInfo>
      
      <ScorePanel>
        <PlayerScore playerNumber={1}>
          <PlayerName>Người chơi 1</PlayerName>
          <ScoreValue>{gameState.players[0]?.score || 0}</ScoreValue>
        </PlayerScore>
        
        <PlayerScore playerNumber={2}>
          <PlayerName>Người chơi 2</PlayerName>
          <ScoreValue>{gameState.players[1]?.score || 0}</ScoreValue>
        </PlayerScore>
      </ScorePanel>
      
      <GameArea>
        <GameBoard>
          {gameState.grid.map((row, y) => 
            row.map((cell, x) => (
              <Cell key={`${x}-${y}`} type={cell}>
                {renderCell(cell, x, y)}
                {gameState.players[0]?.isAlive && 
                  Math.round(gameState.players[0].position.x) === x && 
                  Math.round(gameState.players[0].position.y) === y && (
                  <Player 
                    playerNumber={1} 
                    style={{
                      transform: `translate(
                        ${(gameState.players[0].position.x - Math.round(gameState.players[0].position.x)) * 40}px, 
                        ${(gameState.players[0].position.y - Math.round(gameState.players[0].position.y)) * 40}px
                      )`
                    }}
                  />
                )}
                {gameState.players[1]?.isAlive && 
                  Math.round(gameState.players[1].position.x) === x && 
                  Math.round(gameState.players[1].position.y) === y && (
                  <Player 
                    playerNumber={2}
                    style={{
                      transform: `translate(
                        ${(gameState.players[1].position.x - Math.round(gameState.players[1].position.x)) * 40}px, 
                        ${(gameState.players[1].position.y - Math.round(gameState.players[1].position.y)) * 40}px
                      )`
                    }}
                  />
                )}
                {gameState.bombs.map((bomb, index) => 
                  Math.round(bomb.position.x) === x && Math.round(bomb.position.y) === y ? (
                    <BombElement key={index} />
                  ) : null
                )}
              </Cell>
            ))
          )}
        </GameBoard>
        
        <ControlPanel>
          <ButtonRow>
            <ControlButton onClick={startNewGame}>
              {gameState.gameStarted ? 'Trò chơi mới' : 'Bắt đầu trò chơi'}
            </ControlButton>
          </ButtonRow>
          
          <KeyboardControls>
            <ControlsColumn>
              <ControlsTitle>Người chơi 1</ControlsTitle>
              <ControlsList>
                <ControlItem><KeyboardKey>W</KeyboardKey> Di chuyển lên</ControlItem>
                <ControlItem><KeyboardKey>A</KeyboardKey> Di chuyển trái</ControlItem>
                <ControlItem><KeyboardKey>S</KeyboardKey> Di chuyển xuống</ControlItem>
                <ControlItem><KeyboardKey>D</KeyboardKey> Di chuyển phải</ControlItem>
                <ControlItem><KeyboardKey>Space</KeyboardKey> Đặt bom</ControlItem>
              </ControlsList>
            </ControlsColumn>
            
            <ControlsColumn>
              <ControlsTitle>Người chơi 2</ControlsTitle>
              <ControlsList>
                <ControlItem><KeyboardKey>↑</KeyboardKey> Di chuyển lên</ControlItem>
                <ControlItem><KeyboardKey>←</KeyboardKey> Di chuyển trái</ControlItem>
                <ControlItem><KeyboardKey>↓</KeyboardKey> Di chuyển xuống</ControlItem>
                <ControlItem><KeyboardKey>→</KeyboardKey> Di chuyển phải</ControlItem>
                <ControlItem><KeyboardKey>Enter</KeyboardKey> Đặt bom</ControlItem>
              </ControlsList>
            </ControlsColumn>
          </KeyboardControls>
        </ControlPanel>
      </GameArea>
      
      <GameOverModal isVisible={gameState.gameOver}>
        <ModalContent>
          <ModalTitle>
            {gameState.winner ? `Người chơi ${gameState.winner} chiến thắng!` : 'Hòa!'}
          </ModalTitle>
          <ModalText>
            {gameState.winner 
              ? `Người chơi ${gameState.winner} đã giành chiến thắng với ${gameState.players[gameState.winner - 1]?.score || 0} điểm!` 
              : 'Cả hai người chơi đều bị tiêu diệt!'}
          </ModalText>
          <ModalButton onClick={startNewGame}>
            Chơi lại
          </ModalButton>
        </ModalContent>
      </GameOverModal>
    </GameContainer>
  );
};

export default Bomberman;