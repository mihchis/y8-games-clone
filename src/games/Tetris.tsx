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
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(20, 1fr);
  gap: 1px;
  background-color: #111;
`;

const Cell = styled.div<{ color: string }>`
  width: 25px;
  height: 25px;
  background-color: ${props => props.color};
  border: ${props => props.color === '#111' ? '1px solid #222' : 'none'};
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const NextPiecePanel = styled.div`
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 4px;
  width: 150px;
`;

const NextPieceTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const NextPieceDisplay = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 1px;
  background-color: #ddd;
  padding: 2px;
  margin: 0 auto;
  width: 100px;
  height: 100px;
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
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Các khối Tetris
const TETROMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00FFFF' // Cyan
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#0000FF' // Blue
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#FF7F00' // Orange
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#FFFF00' // Yellow
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '#00FF00' // Green
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#800080' // Purple
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '#FF0000' // Red
  }
};

type TetrominoType = keyof typeof TETROMINOS;

const Tetris: React.FC = () => {
  // Khởi tạo bàn chơi trống
  const createEmptyBoard = () => {
    return Array.from({ length: BOARD_HEIGHT }, () => 
      Array.from({ length: BOARD_WIDTH }, () => '#111')
    );
  };

  // State cho trò chơi
  const [board, setBoard] = useState<string[][]>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<{
    pos: { x: number, y: number };
    tetromino: TetrominoType;
    shape: number[][];
  } | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrominoType | null>(null);
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [linesCleared, setLinesCleared] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gamePaused, setGamePaused] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [dropTime, setDropTime] = useState<number | null>(null);

  // Tạo một khối Tetris ngẫu nhiên
  const randomTetromino = (): TetrominoType => {
    const tetrominos: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    return tetrominos[Math.floor(Math.random() * tetrominos.length)];
  };

  // Khởi tạo trò chơi
  const startGame = () => {
    // Đặt lại bàn chơi
    setBoard(createEmptyBoard());
    
    // Tạo khối đầu tiên và khối tiếp theo
    const newTetromino = randomTetromino();
    setCurrentPiece({
      pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
      tetromino: newTetromino,
      shape: TETROMINOS[newTetromino].shape,
    });
    
    setNextPiece(randomTetromino());
    
    // Đặt lại điểm số và trạng thái trò chơi
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setGameOver(false);
    setGamePaused(false);
    setGameStarted(true);
    
    // Bắt đầu thời gian rơi
    setDropTime(1000);
  };

  // Kiểm tra va chạm
  const checkCollision = (piece: typeof currentPiece, board: string[][]) => {
    if (!piece) return false;
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        // Kiểm tra nếu ô hiện tại của khối có giá trị
        if (piece.shape[y][x] !== 0) {
          const newX = piece.pos.x + x;
          const newY = piece.pos.y + y;
          
          // Kiểm tra nếu vị trí nằm ngoài bàn chơi hoặc đã có khối khác
          if (
            newX < 0 || newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX] !== '#111')
          ) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  // Cập nhật bàn chơi với khối hiện tại
  const updateBoard = () => {
    if (!currentPiece) return board;
    
    // Tạo bản sao của bàn chơi
    const newBoard = board.map(row => [...row]);
    
    // Thêm khối hiện tại vào bàn chơi
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = currentPiece.pos.y + y;
          const boardX = currentPiece.pos.x + x;
          
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = TETROMINOS[currentPiece.tetromino].color;
          }
        }
      });
    });
    
    return newBoard;
  };

  // Di chuyển khối
  const movePiece = (dir: number) => {
    if (!currentPiece || gameOver || gamePaused) return;
    
    const newPos = { ...currentPiece.pos, x: currentPiece.pos.x + dir };
    const newPiece = { ...currentPiece, pos: newPos };
    
    if (!checkCollision(newPiece, board)) {
      setCurrentPiece(newPiece);
    }
  };

  // Xoay khối
  const rotatePiece = () => {
    if (!currentPiece || gameOver || gamePaused) return;
    
    // Tạo ma trận mới đã xoay
    const rotatedShape = currentPiece.shape.map((_, index) =>
      currentPiece.shape.map(col => col[index])
    ).map(row => row.reverse());
    
    const newPiece = {
      ...currentPiece,
      shape: rotatedShape,
    };
    
    // Kiểm tra va chạm sau khi xoay
    if (!checkCollision(newPiece, board)) {
      setCurrentPiece(newPiece);
    }
  };

  // Rơi khối xuống
  const dropPiece = () => {
    if (!currentPiece || gameOver || gamePaused) return;
    
    const newPos = { ...currentPiece.pos, y: currentPiece.pos.y + 1 };
    const newPiece = { ...currentPiece, pos: newPos };
    
    if (!checkCollision(newPiece, board)) {
      setCurrentPiece(newPiece);
    } else {
      // Khối đã chạm đáy hoặc khối khác
      if (currentPiece.pos.y < 1) {
        // Game over nếu khối chạm đáy ngay từ đầu
        setGameOver(true);
        setDropTime(null);
        return;
      }
      
      // Cố định khối vào bàn chơi
      const newBoard = updateBoard();
      setBoard(newBoard);
      
      // Kiểm tra và xóa các hàng đã hoàn thành
      const clearedRows = checkRows(newBoard);
      updateScore(clearedRows);
      
      // Tạo khối mới
      if (nextPiece) {
        setCurrentPiece({
          pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
          tetromino: nextPiece,
          shape: TETROMINOS[nextPiece].shape,
        });
        setNextPiece(randomTetromino());
      }
    }
  };

  // Thả nhanh khối xuống đáy
  const hardDrop = () => {
    if (!currentPiece || gameOver || gamePaused) return;
    
    let newY = currentPiece.pos.y;
    
    while (true) {
      newY++;
      const newPiece = {
        ...currentPiece,
        pos: { ...currentPiece.pos, y: newY }
      };
      
      if (checkCollision(newPiece, board)) {
        // Đã chạm đáy hoặc khối khác
        setCurrentPiece({
          ...currentPiece,
          pos: { ...currentPiece.pos, y: newY - 1 }
        });
        break;
      }
      
      if (newY > BOARD_HEIGHT) break;
    }
  };

  // Kiểm tra và xóa các hàng đã hoàn thành
  const checkRows = (board: string[][]) => {
    const newBoard = [...board];
    let clearedRows = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      // Kiểm tra nếu hàng đã đầy
      if (newBoard[y].every(cell => cell !== '#111')) {
        // Xóa hàng đã hoàn thành
        newBoard.splice(y, 1);
        // Thêm hàng mới vào đầu bàn chơi
        newBoard.unshift(Array(BOARD_WIDTH).fill('#111'));
        clearedRows++;
        y++; // Kiểm tra lại hàng hiện tại vì các hàng đã dịch xuống
      }
    }
    
    if (clearedRows > 0) {
      setBoard(newBoard);
    }
    
    return clearedRows;
  };

  // Cập nhật điểm số
  const updateScore = (clearedRows: number) => {
    if (clearedRows === 0) return;
    
    // Tính điểm dựa trên số hàng đã xóa
    const points = [0, 40, 100, 300, 1200];
    const newScore = score + points[clearedRows] * level;
    setScore(newScore);
    
    // Cập nhật số hàng đã xóa
    const newLinesCleared = linesCleared + clearedRows;
    setLinesCleared(newLinesCleared);
    
    // Tăng cấp độ sau mỗi 10 hàng
    if (Math.floor(newLinesCleared / 10) > Math.floor(linesCleared / 10)) {
      const newLevel = level + 1;
      setLevel(newLevel);
      // Tăng tốc độ rơi
      setDropTime(1000 / (1 + (newLevel - 1) * 0.2));
    }
  };

  // Tạm dừng/tiếp tục trò chơi
  const togglePause = () => {
    if (!gameStarted || gameOver) return;
    
    if (gamePaused) {
      setGamePaused(false);
      setDropTime(1000 / (1 + (level - 1) * 0.2));
    } else {
      setGamePaused(true);
      setDropTime(null);
    }
  };

  // Xử lý phím
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!gameStarted) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        movePiece(-1);
        break;
      case 'ArrowRight':
        movePiece(1);
        break;
      case 'ArrowDown':
        dropPiece();
        break;
      case 'ArrowUp':
        rotatePiece();
        break;
      case ' ':
        hardDrop();
        break;
      case 'p':
      case 'P':
        togglePause();
        break;
      default:
        break;
    }
  }, [gameStarted, currentPiece, board, gameOver, gamePaused, level]);

  // Thêm event listener cho phím
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Interval cho việc rơi khối
  useEffect(() => {
    let dropInterval: NodeJS.Timeout | null = null;
    
    if (dropTime && !gameOver && !gamePaused) {
      dropInterval = setInterval(() => {
        dropPiece();
      }, dropTime);
    }
    
    return () => {
      if (dropInterval) clearInterval(dropInterval);
    };
  }, [dropTime, gameOver, gamePaused, currentPiece, board]);

  // Render bàn chơi
  const renderBoard = () => {
    const displayBoard = updateBoard();
    
    return displayBoard.map((row, y) => 
      row.map((cell, x) => (
        <Cell key={`${y}-${x}`} color={cell} />
      ))
    );
  };

  // Render khối tiếp theo
  const renderNextPiece = () => {
    if (!nextPiece) return null;
    
    const shape = TETROMINOS[nextPiece].shape;
    const color = TETROMINOS[nextPiece].color;
    
    // Tạo grid 4x4 để hiển thị khối tiếp theo
    const grid = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => '#ddd'));
    
    // Đặt khối vào giữa grid
    shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const offsetY = nextPiece === 'I' ? 0 : 1;
          grid[y + offsetY][x] = color;
        }
      });
    });
    
    return grid.map((row, y) => 
      row.map((cell, x) => (
        <Cell key={`next-${y}-${x}`} color={cell} />
      ))
    );
  };

  return (
    <GameContainer>
      <GameTitle>Tetris</GameTitle>
      
      <GameInfo>
        <GameDescription>
          Xếp các khối để tạo thành các hàng hoàn chỉnh. Khi một hàng được hoàn thành, nó sẽ biến mất và bạn sẽ nhận được điểm.
        </GameDescription>
      </GameInfo>
      
      <GameArea>
        <BoardContainer>
          <Board>
            {gameStarted ? renderBoard() : createEmptyBoard().map((row, y) => 
              row.map((cell, x) => (
                <Cell key={`${y}-${x}`} color={cell} />
              ))
            )}
          </Board>
        </BoardContainer>
        
        <SidePanel>
          <NextPiecePanel>
            <NextPieceTitle>Khối tiếp theo</NextPieceTitle>
            <NextPieceDisplay>
              {gameStarted ? renderNextPiece() : null}
            </NextPieceDisplay>
          </NextPiecePanel>
          
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
            <KeyIndicator>←</KeyIndicator> Di chuyển sang trái
          </ControlItem>
          <ControlItem>
            <KeyIndicator>→</KeyIndicator> Di chuyển sang phải
          </ControlItem>
          <ControlItem>
            <KeyIndicator>↓</KeyIndicator> Di chuyển xuống
          </ControlItem>
          <ControlItem>
            <KeyIndicator>↑</KeyIndicator> Xoay khối
          </ControlItem>
          <ControlItem>
            <KeyIndicator>Space</KeyIndicator> Thả nhanh
          </ControlItem>
          <ControlItem>
            <KeyIndicator>P</KeyIndicator> Tạm dừng
          </ControlItem>
        </ControlsList>
      </ControlsInfo>
    </GameContainer>
  );
};

export default Tetris;