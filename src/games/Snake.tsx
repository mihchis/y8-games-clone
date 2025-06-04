import React, { useState, useEffect, useCallback } from 'react';
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
  gap: 2rem;
  align-items: flex-start;
`;

const BoardContainer = styled.div`
  border: 2px solid #333;
  background-color: #111;
  padding: 2px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  grid-template-rows: repeat(20, 1fr);
  gap: 1px;
  background-color: #111;
`;

const Cell = styled.div<{ type: 'empty' | 'snake' | 'food' | 'head' }>`
  width: 20px;
  height: 20px;
  background-color: ${props => {
    switch (props.type) {
      case 'snake': return '#4CAF50';
      case 'head': return '#388E3C';
      case 'food': return '#F44336';
      default: return '#222';
    }
  }};
  border-radius: ${props => props.type === 'food' ? '50%' : '0'};
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ScorePanel = styled.div`
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 4px;
  width: 150px;
`;

const ScoreTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const ScoreValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  color: #333;
`;

const LevelPanel = styled.div`
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 4px;
  width: 150px;
`;

const LevelTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const LevelValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  color: #333;
`;

const GameControls = styled.div`
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  background-color: #333;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #555;
  }
`;

const GameMessage = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f0f0f0;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
`;

const ControlsInfo = styled.div`
  margin-top: 2rem;
  text-align: center;
  max-width: 600px;
`;

const ControlsTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

const ControlsList = styled.ul`
  list-style-type: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
`;

const ControlItem = styled.li`
  background-color: #f0f0f0;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const KeyIndicator = styled.span`
  background-color: #333;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
`;

// Kích thước bàn chơi
const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 20;

// Hướng di chuyển
enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT
}

// Kiểu dữ liệu cho một phần của rắn
type SnakePart = {
  x: number;
  y: number;
};

const Snake: React.FC = () => {
  // State cho trò chơi
  const [snake, setSnake] = useState<SnakePart[]>([]);
  const [food, setFood] = useState<SnakePart | null>(null);
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [nextDirection, setNextDirection] = useState<Direction>(Direction.RIGHT);
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gamePaused, setGamePaused] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(200);

  // Khởi tạo trò chơi
  const startGame = () => {
    // Khởi tạo rắn ở giữa bàn chơi
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    setSnake(initialSnake);
    
    // Tạo thức ăn đầu tiên
    generateFood(initialSnake);
    
    // Đặt lại các giá trị khác
    setDirection(Direction.RIGHT);
    setNextDirection(Direction.RIGHT);
    setScore(0);
    setLevel(1);
    setSpeed(200);
    setGameOver(false);
    setGamePaused(false);
    setGameStarted(true);
  };

  // Tạo thức ăn mới
  const generateFood = (currentSnake: SnakePart[]) => {
    let newFood: SnakePart;
    let foodOnSnake = true;
    
    // Tạo thức ăn không nằm trên thân rắn
    while (foodOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * BOARD_WIDTH),
        y: Math.floor(Math.random() * BOARD_HEIGHT)
      };
      
      foodOnSnake = currentSnake.some(part => part.x === newFood.x && part.y === newFood.y);
    }
    
    setFood(newFood);
  };

  // Di chuyển rắn
  const moveSnake = () => {
    if (!gameStarted || gameOver || gamePaused) return;
    
    // Cập nhật hướng di chuyển
    setDirection(nextDirection);
    
    // Tạo bản sao của rắn
    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    
    // Di chuyển đầu rắn theo hướng hiện tại
    switch (direction) {
      case Direction.UP:
        head.y -= 1;
        break;
      case Direction.RIGHT:
        head.x += 1;
        break;
      case Direction.DOWN:
        head.y += 1;
        break;
      case Direction.LEFT:
        head.x -= 1;
        break;
    }
    
    // Kiểm tra va chạm với tường
    if (head.x < 0 || head.x >= BOARD_WIDTH || head.y < 0 || head.y >= BOARD_HEIGHT) {
      setGameOver(true);
      return;
    }
    
    // Kiểm tra va chạm với thân rắn
    if (newSnake.some((part, index) => index !== 0 && part.x === head.x && part.y === head.y)) {
      setGameOver(true);
      return;
    }
    
    // Thêm đầu mới vào rắn
    newSnake.unshift(head);
    
    // Kiểm tra nếu rắn ăn thức ăn
    if (food && head.x === food.x && head.y === food.y) {
      // Tăng điểm
      const newScore = score + 10 * level;
      setScore(newScore);
      
      // Tăng cấp độ sau mỗi 5 thức ăn
      if (newScore / (50 * level) >= 1 && newScore % (50 * level) === 0) {
        const newLevel = level + 1;
        setLevel(newLevel);
        // Tăng tốc độ
        setSpeed(Math.max(50, 200 - (newLevel - 1) * 20));
      }
      
      // Tạo thức ăn mới
      generateFood(newSnake);
    } else {
      // Nếu không ăn thức ăn, xóa phần đuôi
      newSnake.pop();
    }
    
    // Cập nhật rắn
    setSnake(newSnake);
  };

  // Xử lý phím
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!gameStarted) return;
    
    // Ngăn không cho rắn quay đầu 180 độ
    switch (event.key) {
      case 'ArrowUp':
        if (direction !== Direction.DOWN) {
          setNextDirection(Direction.UP);
        }
        break;
      case 'ArrowRight':
        if (direction !== Direction.LEFT) {
          setNextDirection(Direction.RIGHT);
        }
        break;
      case 'ArrowDown':
        if (direction !== Direction.UP) {
          setNextDirection(Direction.DOWN);
        }
        break;
      case 'ArrowLeft':
        if (direction !== Direction.RIGHT) {
          setNextDirection(Direction.LEFT);
        }
        break;
      case 'p':
      case 'P':
        togglePause();
        break;
      default:
        break;
    }
  }, [gameStarted, direction]);

  // Tạm dừng/tiếp tục trò chơi
  const togglePause = () => {
    if (!gameStarted || gameOver) return;
    setGamePaused(!gamePaused);
  };

  // Thêm event listener cho phím
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Interval cho việc di chuyển rắn
  useEffect(() => {
    let gameInterval: NodeJS.Timeout | null = null;
    
    if (gameStarted && !gameOver && !gamePaused) {
      gameInterval = setInterval(() => {
        moveSnake();
      }, speed);
    }
    
    return () => {
      if (gameInterval) clearInterval(gameInterval);
    };
  }, [gameStarted, gameOver, gamePaused, snake, food, direction, nextDirection, score, level, speed]);

  // Render bàn chơi
  const renderBoard = () => {
    const board = Array.from({ length: BOARD_HEIGHT }, () =>
      Array.from({ length: BOARD_WIDTH }, () => 'empty')
    );
    
    // Đặt rắn vào bàn chơi
    snake.forEach((part, index) => {
      if (part.y >= 0 && part.y < BOARD_HEIGHT && part.x >= 0 && part.x < BOARD_WIDTH) {
        board[part.y][part.x] = index === 0 ? 'head' : 'snake';
      }
    });
    
    // Đặt thức ăn vào bàn chơi
    if (food) {
      board[food.y][food.x] = 'food';
    }
    
    return board.map((row, y) => 
      row.map((cell, x) => (
        <Cell key={`${y}-${x}`} type={cell as 'empty' | 'snake' | 'food' | 'head'} />
      ))
    );
  };

  return (
    <GameContainer>
      <GameTitle>Rắn Săn Mồi</GameTitle>
      
      <GameInfo>
        <GameDescription>
          Điều khiển con rắn ăn thức ăn và tránh va chạm với tường hoặc thân rắn. Mỗi khi ăn thức ăn, rắn sẽ dài thêm và bạn sẽ nhận được điểm.
        </GameDescription>
      </GameInfo>
      
      <GameArea>
        <BoardContainer>
          <Board>
            {gameStarted ? renderBoard() : Array.from({ length: BOARD_HEIGHT * BOARD_WIDTH }, (_, i) => (
              <Cell key={i} type="empty" />
            ))}
          </Board>
        </BoardContainer>
        
        <SidePanel>
          <ScorePanel>
            <ScoreTitle>Điểm số</ScoreTitle>
            <ScoreValue>{score}</ScoreValue>
          </ScorePanel>
          
          <LevelPanel>
            <LevelTitle>Cấp độ</LevelTitle>
            <LevelValue>{level}</LevelValue>
          </LevelPanel>
          
          <GameControls>
            {!gameStarted ? (
              <Button onClick={startGame}>Bắt đầu</Button>
            ) : (
              <>
                <Button onClick={togglePause}>{gamePaused ? 'Tiếp tục' : 'Tạm dừng'}</Button>
                <Button onClick={startGame}>Chơi lại</Button>
              </>
            )}
          </GameControls>
        </SidePanel>
      </GameArea>
      
      {gameOver && (
        <GameMessage>
          Game Over! Điểm số của bạn: {score}
        </GameMessage>
      )}
      
      <ControlsInfo>
        <ControlsTitle>Điều khiển</ControlsTitle>
        <ControlsList>
          <ControlItem>
            <KeyIndicator>←</KeyIndicator> Rẽ trái
          </ControlItem>
          <ControlItem>
            <KeyIndicator>→</KeyIndicator> Rẽ phải
          </ControlItem>
          <ControlItem>
            <KeyIndicator>↑</KeyIndicator> Rẽ lên
          </ControlItem>
          <ControlItem>
            <KeyIndicator>↓</KeyIndicator> Rẽ xuống
          </ControlItem>
          <ControlItem>
            <KeyIndicator>P</KeyIndicator> Tạm dừng
          </ControlItem>
        </ControlsList>
      </ControlsInfo>
    </GameContainer>
  );
};

export default Snake;