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
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: wrap;
`;

const BoardContainer = styled.div`
  position: relative;
  width: 600px;
  height: 400px;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Paddle = styled.div<{ position: 'left' | 'right'; y: number }>`
  position: absolute;
  width: 15px;
  height: 80px;
  background-color: #fff;
  left: ${props => props.position === 'left' ? '15px' : 'auto'};
  right: ${props => props.position === 'right' ? '15px' : 'auto'};
  top: ${props => props.y}px;
  border-radius: 4px;
  transition: top 0.1s;
`;

const Ball = styled.div<{ x: number; y: number }>`
  position: absolute;
  width: 15px;
  height: 15px;
  background-color: #fff;
  border-radius: 50%;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
`;

const ScoreDisplay = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 100px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 48px;
  font-weight: bold;
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

const DifficultySelector = styled.div`
  margin-top: 1rem;
`;

const DifficultyLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
`;

const DifficultySelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
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

const Pong: React.FC = () => {
  // Kích thước bảng
  const BOARD_WIDTH = 600;
  const BOARD_HEIGHT = 400;
  const PADDLE_HEIGHT = 80;
  const PADDLE_WIDTH = 15;
  const BALL_SIZE = 15;
  
  // Trạng thái trò chơi
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gamePaused, setGamePaused] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<string>('');
  
  // Vị trí và điểm số
  const [leftPaddleY, setLeftPaddleY] = useState<number>(BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [rightPaddleY, setRightPaddleY] = useState<number>(BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [ballPos, setBallPos] = useState<{x: number, y: number}>({x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2});
  const [ballVelocity, setBallVelocity] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [computerScore, setComputerScore] = useState<number>(0);
  
  // Độ khó
  const [difficulty, setDifficulty] = useState<string>('medium');
  
  // Refs để lưu trạng thái trong các hàm callback
  const gameStateRef = useRef<{
    gameStarted: boolean;
    gamePaused: boolean;
    leftPaddleY: number;
    rightPaddleY: number;
    ballPos: {x: number, y: number};
    ballVelocity: {x: number, y: number};
    difficulty: string;
  }>({
    gameStarted,
    gamePaused,
    leftPaddleY,
    rightPaddleY,
    ballPos,
    ballVelocity,
    difficulty
  });
  
  // Cập nhật refs khi state thay đổi
  useEffect(() => {
    gameStateRef.current = {
      gameStarted,
      gamePaused,
      leftPaddleY,
      rightPaddleY,
      ballPos,
      ballVelocity,
      difficulty
    };
  }, [gameStarted, gamePaused, leftPaddleY, rightPaddleY, ballPos, ballVelocity, difficulty]);
  
  // Khởi tạo trò chơi
  const startGame = () => {
    setGameStarted(true);
    setGamePaused(false);
    setGameOver(false);
    setWinner('');
    setPlayerScore(0);
    setComputerScore(0);
    
    // Đặt vị trí ban đầu
    setLeftPaddleY(BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setRightPaddleY(BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setBallPos({x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2});
    
    // Đặt vận tốc ban đầu cho bóng (ngẫu nhiên hướng trái hoặc phải)
    const direction = Math.random() > 0.5 ? 1 : -1;
    setBallVelocity({x: direction * 4, y: (Math.random() * 4) - 2});
  };
  
  // Tạm dừng trò chơi
  const togglePause = () => {
    if (!gameStarted || gameOver) return;
    setGamePaused(!gamePaused);
  };
  
  // Xử lý di chuyển paddle của người chơi
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameStateRef.current.gameStarted || gameStateRef.current.gamePaused) return;
    
    const boardRect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - boardRect.top;
    
    // Giới hạn paddle trong phạm vi bảng
    let newY = relativeY - PADDLE_HEIGHT / 2;
    newY = Math.max(0, Math.min(newY, BOARD_HEIGHT - PADDLE_HEIGHT));
    
    setLeftPaddleY(newY);
  }, []);
  
  // Xử lý di chuyển paddle của máy tính
  const updateComputerPaddle = useCallback(() => {
    const { ballPos, rightPaddleY, difficulty } = gameStateRef.current;
    
    // Độ khó ảnh hưởng đến tốc độ phản ứng của máy tính
    let speed: number;
    let reactionDelay: number;
    
    switch (difficulty) {
      case 'easy':
        speed = 3;
        reactionDelay = 0.3; // Phản ứng chậm hơn
        break;
      case 'hard':
        speed = 7;
        reactionDelay = 0.9; // Phản ứng nhanh hơn
        break;
      default: // medium
        speed = 5;
        reactionDelay = 0.6;
    }
    
    // Máy tính chỉ di chuyển khi bóng đang đi về phía nó
    if (ballPos.x > BOARD_WIDTH * reactionDelay) {
      const paddleCenter = rightPaddleY + PADDLE_HEIGHT / 2;
      const targetY = ballPos.y - PADDLE_HEIGHT / 2;
      
      if (paddleCenter < targetY - 10) {
        setRightPaddleY(prev => Math.min(prev + speed, BOARD_HEIGHT - PADDLE_HEIGHT));
      } else if (paddleCenter > targetY + 10) {
        setRightPaddleY(prev => Math.max(prev - speed, 0));
      }
    }
  }, []);
  
  // Cập nhật vị trí bóng và kiểm tra va chạm
  const updateBallPosition = useCallback(() => {
    const { ballPos, ballVelocity, leftPaddleY, rightPaddleY } = gameStateRef.current;
    
    // Tính toán vị trí mới của bóng
    const newX = ballPos.x + ballVelocity.x;
    const newY = ballPos.y + ballVelocity.y;
    
    // Kiểm tra va chạm với tường trên và dưới
    if (newY <= 0 || newY >= BOARD_HEIGHT - BALL_SIZE) {
      setBallVelocity(prev => ({ ...prev, y: -prev.y }));
    }
    
    // Kiểm tra va chạm với paddle trái
    if (
      newX <= PADDLE_WIDTH + 15 && 
      newY + BALL_SIZE >= leftPaddleY && 
      newY <= leftPaddleY + PADDLE_HEIGHT
    ) {
      // Tính góc nảy dựa trên vị trí va chạm trên paddle
      const hitPosition = (newY - leftPaddleY) / PADDLE_HEIGHT;
      const angle = (hitPosition - 0.5) * Math.PI / 2; // -45 đến 45 độ
      
      const speed = Math.sqrt(ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y);
      const newSpeed = speed * 1.05; // Tăng tốc độ sau mỗi lần va chạm
      
      setBallVelocity({
        x: Math.cos(angle) * newSpeed,
        y: Math.sin(angle) * newSpeed
      });
    }
    
    // Kiểm tra va chạm với paddle phải
    if (
      newX >= BOARD_WIDTH - PADDLE_WIDTH - 15 - BALL_SIZE && 
      newY + BALL_SIZE >= rightPaddleY && 
      newY <= rightPaddleY + PADDLE_HEIGHT
    ) {
      // Tính góc nảy dựa trên vị trí va chạm trên paddle
      const hitPosition = (newY - rightPaddleY) / PADDLE_HEIGHT;
      const angle = (hitPosition - 0.5) * Math.PI / 2; // -45 đến 45 độ
      
      const speed = Math.sqrt(ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y);
      const newSpeed = speed * 1.05; // Tăng tốc độ sau mỗi lần va chạm
      
      setBallVelocity({
        x: -Math.cos(angle) * newSpeed,
        y: Math.sin(angle) * newSpeed
      });
    }
    
    // Kiểm tra nếu bóng ra ngoài biên trái hoặc phải (ghi điểm)
    if (newX < 0) {
      // Máy tính ghi điểm
      setComputerScore(prev => {
        const newScore = prev + 1;
        if (newScore >= 5) {
          setGameOver(true);
          setWinner('Máy tính');
          return newScore;
        }
        // Đặt lại vị trí bóng
        setBallPos({x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2});
        setBallVelocity({x: 4, y: (Math.random() * 4) - 2});
        return newScore;
      });
    } else if (newX > BOARD_WIDTH) {
      // Người chơi ghi điểm
      setPlayerScore(prev => {
        const newScore = prev + 1;
        if (newScore >= 5) {
          setGameOver(true);
          setWinner('Người chơi');
          return newScore;
        }
        // Đặt lại vị trí bóng
        setBallPos({x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2});
        setBallVelocity({x: -4, y: (Math.random() * 4) - 2});
        return newScore;
      });
    } else {
      // Cập nhật vị trí bóng nếu không có ghi điểm
      setBallPos({x: newX, y: newY});
    }
  }, []);
  
  // Game loop
  useEffect(() => {
    if (!gameStarted || gamePaused || gameOver) return;
    
    const gameLoop = setInterval(() => {
      updateBallPosition();
      updateComputerPaddle();
    }, 16); // ~60fps
    
    return () => clearInterval(gameLoop);
  }, [gameStarted, gamePaused, gameOver, updateBallPosition, updateComputerPaddle]);
  
  // Xử lý thay đổi độ khó
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(e.target.value);
  };

  return (
    <GameContainer>
      <GameTitle>Pong</GameTitle>
      
      <GameInfo>
        <GameDescription>
          Trò chơi bóng bàn cổ điển. Di chuyển thanh trượt của bạn để đánh bóng và ngăn không cho bóng đi qua.
          Người chơi đầu tiên đạt 5 điểm sẽ thắng.
        </GameDescription>
      </GameInfo>
      
      <GameArea>
        <BoardContainer onMouseMove={handleMouseMove}>
          <ScoreDisplay>
            <div>{playerScore}</div>
            <div>{computerScore}</div>
          </ScoreDisplay>
          
          <Paddle position="left" y={leftPaddleY} />
          <Paddle position="right" y={rightPaddleY} />
          <Ball x={ballPos.x} y={ballPos.y} />
        </BoardContainer>
        
        <SidePanel>
          <ControlPanel>
            <ControlTitle>Điều khiển</ControlTitle>
            <ControlButton onClick={startGame} disabled={gameStarted && !gameOver}>
              {gameStarted && !gameOver ? 'Đang chơi...' : 'Bắt đầu trò chơi'}
            </ControlButton>
            <ControlButton onClick={togglePause} disabled={!gameStarted || gameOver}>
              {gamePaused ? 'Tiếp tục' : 'Tạm dừng'}
            </ControlButton>
            
            <DifficultySelector>
              <DifficultyLabel>Độ khó:</DifficultyLabel>
              <DifficultySelect 
                value={difficulty} 
                onChange={handleDifficultyChange}
                disabled={gameStarted && !gameOver}
              >
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </DifficultySelect>
            </DifficultySelector>
          </ControlPanel>
        </SidePanel>
      </GameArea>
      
      <GameOverModal isVisible={gameOver}>
        <ModalContent>
          <ModalTitle>Trò chơi kết thúc!</ModalTitle>
          <ModalText>
            {winner} đã thắng với tỉ số {winner === 'Người chơi' ? `${playerScore}-${computerScore}` : `${computerScore}-${playerScore}`}!
          </ModalText>
          <ModalButton onClick={startGame}>
            Chơi lại
          </ModalButton>
        </ModalContent>
      </GameOverModal>
    </GameContainer>
  );
};

export default Pong;