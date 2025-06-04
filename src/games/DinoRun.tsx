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

const GameCanvas = styled.canvas`
  border: 2px solid #333;
  border-radius: 8px;
  background-color: #f0f0f0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 250px;
`;

const ScorePanel = styled.div`
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`;

const ScoreTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const ScoreValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
`;

const HighScorePanel = styled(ScorePanel)`
  background-color: #e0e0e0;
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

const InstructionsPanel = styled.div`
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
`;

const InstructionsTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const InstructionsList = styled.ul`
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-top: 0.5rem;
`;

const InstructionItem = styled.li`
  margin-bottom: 0.5rem;
  color: #555;
`;

// Định nghĩa các đối tượng trong trò chơi
interface Dino {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  isDucking: boolean;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cactus' | 'bird';
  variant: number;
}

interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

const DinoRun: React.FC = () => {
  // Kích thước canvas
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 300;
  const GROUND_HEIGHT = 20;
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  
  // Trạng thái trò chơi
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  
  // Refs cho trạng thái trò chơi để sử dụng trong game loop
  const gameStateRef = useRef({
    dino: {
      x: 50,
      y: CANVAS_HEIGHT - GROUND_HEIGHT - 60,
      width: 50,
      height: 60,
      velocityY: 0,
      isJumping: false,
      isDucking: false
    } as Dino,
    obstacles: [] as Obstacle[],
    clouds: [] as Cloud[],
    gameSpeed: 5,
    spawnTimer: 0,
    cloudTimer: 0,
    score: 0,
    frameCount: 0,
    nightMode: false,
    gameStarted: false,
    gameOver: false
  });
  
  // Tải hình ảnh
  const dinoImageRef = useRef<HTMLImageElement | null>(null);
  const cactusImageRef = useRef<HTMLImageElement | null>(null);
  const birdImageRef = useRef<HTMLImageElement | null>(null);
  const cloudImageRef = useRef<HTMLImageElement | null>(null);
  
  // Khởi tạo trò chơi
  const initializeGame = useCallback(() => {
    // Đặt lại trạng thái trò chơi
    gameStateRef.current = {
      dino: {
        x: 50,
        y: CANVAS_HEIGHT - GROUND_HEIGHT - 60,
        width: 50,
        height: 60,
        velocityY: 0,
        isJumping: false,
        isDucking: false
      },
      obstacles: [],
      clouds: [],
      gameSpeed: 5,
      spawnTimer: 0,
      cloudTimer: 0,
      score: 0,
      frameCount: 0,
      nightMode: false,
      gameStarted: true,
      gameOver: false
    };
    
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    
    // Bắt đầu game loop
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, []);
  
  // Tải hình ảnh khi component được mount
  useEffect(() => {
    // Tải điểm cao từ localStorage
    const savedHighScore = localStorage.getItem('dino-high-score');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    
    // Tải hình ảnh
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        return img;
      });
    };
    
    // Tạo hình ảnh đơn giản bằng canvas
    const createDinoImage = (): HTMLImageElement => {
      const canvas = document.createElement('canvas');
      canvas.width = 50;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Vẽ khủng long đơn giản
        ctx.fillStyle = '#535353';
        ctx.fillRect(10, 0, 30, 40);
        ctx.fillRect(15, 40, 20, 20);
        ctx.fillRect(5, 30, 10, 10);
        ctx.fillRect(35, 30, 10, 10);
        ctx.fillRect(20, 10, 5, 5); // Mắt
      }
      const img = new Image();
      img.src = canvas.toDataURL();
      return img;
    };
    
    const createCactusImage = (): HTMLImageElement => {
      const canvas = document.createElement('canvas');
      canvas.width = 30;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Vẽ xương rồng đơn giản
        ctx.fillStyle = '#535353';
        ctx.fillRect(10, 0, 10, 60);
        ctx.fillRect(0, 20, 30, 5);
        ctx.fillRect(0, 40, 30, 5);
      }
      const img = new Image();
      img.src = canvas.toDataURL();
      return img;
    };
    
    const createBirdImage = (): HTMLImageElement => {
      const canvas = document.createElement('canvas');
      canvas.width = 50;
      canvas.height = 30;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Vẽ chim đơn giản
        ctx.fillStyle = '#535353';
        ctx.beginPath();
        ctx.ellipse(25, 15, 20, 10, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(40, 10, 10, 5, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillRect(35, 5, 10, 2); // Mỏ
        ctx.fillRect(15, 0, 20, 2); // Cánh
      }
      const img = new Image();
      img.src = canvas.toDataURL();
      return img;
    };
    
    const createCloudImage = (): HTMLImageElement => {
      const canvas = document.createElement('canvas');
      canvas.width = 70;
      canvas.height = 30;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Vẽ mây đơn giản
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(20, 15, 20, 10, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(40, 15, 15, 12, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(55, 15, 15, 8, 0, 0, 2 * Math.PI);
        ctx.fill();
      }
      const img = new Image();
      img.src = canvas.toDataURL();
      return img;
    };
    
    // Tải các hình ảnh
    dinoImageRef.current = createDinoImage();
    cactusImageRef.current = createCactusImage();
    birdImageRef.current = createBirdImage();
    cloudImageRef.current = createCloudImage();
    
    // Vẽ màn hình bắt đầu
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Vẽ mặt đất
        ctx.fillStyle = '#535353';
        ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
        
        // Vẽ khủng long
        if (dinoImageRef.current) {
          ctx.drawImage(
            dinoImageRef.current,
            50,
            CANVAS_HEIGHT - GROUND_HEIGHT - 60,
            50,
            60
          );
        }
        
        // Vẽ hướng dẫn
        ctx.fillStyle = '#535353';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Nhấn SPACE để bắt đầu', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      }
    }
    
    // Xử lý sự kiện bàn phím
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!gameStateRef.current.gameStarted) {
          initializeGame();
        } else if (!gameStateRef.current.gameOver) {
          // Nhảy
          if (!gameStateRef.current.dino.isJumping) {
            gameStateRef.current.dino.isJumping = true;
            gameStateRef.current.dino.velocityY = -15;
          }
        } else {
          // Khởi động lại trò chơi
          initializeGame();
        }
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        if (gameStateRef.current.gameStarted && !gameStateRef.current.gameOver) {
          // Cúi xuống
          gameStateRef.current.dino.isDucking = true;
          gameStateRef.current.dino.height = 30;
          gameStateRef.current.dino.y = CANVAS_HEIGHT - GROUND_HEIGHT - 30;
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        // Ngừng cúi xuống
        gameStateRef.current.dino.isDucking = false;
        gameStateRef.current.dino.height = 60;
        gameStateRef.current.dino.y = CANVAS_HEIGHT - GROUND_HEIGHT - 60;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [initializeGame]);
  
  // Game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const state = gameStateRef.current;
    
    // Xóa canvas
    ctx.fillStyle = state.nightMode ? '#333' : '#f0f0f0';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Vẽ mặt đất
    ctx.fillStyle = '#535353';
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    
    // Vẽ mây
    state.clouds.forEach(cloud => {
      if (cloudImageRef.current) {
        ctx.drawImage(cloudImageRef.current, cloud.x, cloud.y, cloud.width, cloud.height);
      }
    });
    
    // Vẽ khủng long
    if (dinoImageRef.current) {
      ctx.drawImage(
        dinoImageRef.current,
        state.dino.x,
        state.dino.y,
        state.dino.width,
        state.dino.height
      );
    }
    
    // Vẽ chướng ngại vật
    state.obstacles.forEach(obstacle => {
      if (obstacle.type === 'cactus' && cactusImageRef.current) {
        ctx.drawImage(
          cactusImageRef.current,
          obstacle.x,
          obstacle.y,
          obstacle.width,
          obstacle.height
        );
      } else if (obstacle.type === 'bird' && birdImageRef.current) {
        // Hiệu ứng đập cánh
        const birdFrame = Math.floor(state.frameCount / 10) % 2;
        const birdY = obstacle.y + (birdFrame * 5);
        
        ctx.drawImage(
          birdImageRef.current,
          obstacle.x,
          birdY,
          obstacle.width,
          obstacle.height
        );
      }
    });
    
    // Vẽ điểm số
    ctx.fillStyle = state.nightMode ? '#FFF' : '#535353';
    ctx.font = '20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Điểm: ${Math.floor(state.score)}`, CANVAS_WIDTH - 20, 30);
    
    if (!state.gameOver) {
      // Cập nhật vị trí khủng long
      if (state.dino.isJumping) {
        state.dino.y += state.dino.velocityY;
        state.dino.velocityY += 0.8; // Trọng lực
        
        // Kiểm tra khi chạm đất
        if (state.dino.y >= CANVAS_HEIGHT - GROUND_HEIGHT - state.dino.height) {
          state.dino.y = CANVAS_HEIGHT - GROUND_HEIGHT - state.dino.height;
          state.dino.isJumping = false;
          state.dino.velocityY = 0;
        }
      }
      
      // Cập nhật vị trí chướng ngại vật
      state.obstacles.forEach(obstacle => {
        obstacle.x -= state.gameSpeed;
      });
      
      // Loại bỏ chướng ngại vật đã đi qua
      state.obstacles = state.obstacles.filter(obstacle => obstacle.x > -obstacle.width);
      
      // Cập nhật vị trí mây
      state.clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
      });
      
      // Loại bỏ mây đã đi qua
      state.clouds = state.clouds.filter(cloud => cloud.x > -cloud.width);
      
      // Tạo chướng ngại vật mới
      state.spawnTimer++;
      if (state.spawnTimer >= 100) {
        const minSpawnTime = 100 - state.gameSpeed * 5;
        const randomSpawnTime = Math.max(50, minSpawnTime) + Math.random() * 50;
        state.spawnTimer = 0;
        
        // Xác định loại chướng ngại vật
        const obstacleType = Math.random() > 0.7 ? 'bird' : 'cactus';
        
        if (obstacleType === 'cactus') {
          // Tạo xương rồng với chiều cao ngẫu nhiên
          const height = 40 + Math.random() * 40;
          state.obstacles.push({
            x: CANVAS_WIDTH,
            y: CANVAS_HEIGHT - GROUND_HEIGHT - height,
            width: 30,
            height,
            type: 'cactus',
            variant: Math.floor(Math.random() * 3)
          });
        } else {
          // Tạo chim ở độ cao ngẫu nhiên
          const birdHeight = 30;
          const minY = CANVAS_HEIGHT - GROUND_HEIGHT - 120; // Cao nhất
          const maxY = CANVAS_HEIGHT - GROUND_HEIGHT - birdHeight - 10; // Thấp nhất
          const y = minY + Math.random() * (maxY - minY);
          
          state.obstacles.push({
            x: CANVAS_WIDTH,
            y,
            width: 50,
            height: birdHeight,
            type: 'bird',
            variant: 0
          });
        }
      }
      
      // Tạo mây mới
      state.cloudTimer++;
      if (state.cloudTimer >= 200) {
        state.cloudTimer = 0;
        
        const cloudY = 20 + Math.random() * 100;
        const cloudWidth = 70 + Math.random() * 30;
        const cloudHeight = 30 + Math.random() * 20;
        const cloudSpeed = 1 + Math.random() * 2;
        
        state.clouds.push({
          x: CANVAS_WIDTH,
          y: cloudY,
          width: cloudWidth,
          height: cloudHeight,
          speed: cloudSpeed
        });
      }
      
      // Kiểm tra va chạm
      state.obstacles.forEach(obstacle => {
        if (checkCollision(state.dino, obstacle)) {
          state.gameOver = true;
          setGameOver(true);
          setGameStarted(false);
          
          // Cập nhật điểm cao
          if (state.score > highScore) {
            setHighScore(Math.floor(state.score));
            localStorage.setItem('dino-high-score', Math.floor(state.score).toString());
          }
        }
      });
      
      // Tăng điểm và tốc độ
      state.score += 0.1;
      if (Math.floor(state.score) % 100 === 0 && Math.floor(state.score) > 0) {
        state.gameSpeed += 0.5;
      }
      
      // Chuyển đổi chế độ ngày/đêm
      if (Math.floor(state.score) % 500 === 0 && Math.floor(state.score) > 0) {
        state.nightMode = !state.nightMode;
      }
      
      // Cập nhật điểm hiển thị
      setScore(Math.floor(state.score));
      
      // Tăng số frame
      state.frameCount++;
      
      // Tiếp tục game loop
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      // Hiển thị thông báo kết thúc
      ctx.fillStyle = state.nightMode ? '#FFF' : '#535353';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
      ctx.font = '20px Arial';
      ctx.fillText('Nhấn SPACE để chơi lại', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    }
  }, [highScore]);
  
  // Kiểm tra va chạm
  const checkCollision = (dino: Dino, obstacle: Obstacle): boolean => {
    // Giảm kích thước hitbox để trò chơi dễ chơi hơn
    const dinoHitbox = {
      x: dino.x + 5,
      y: dino.y + 5,
      width: dino.width - 10,
      height: dino.height - 10
    };
    
    const obstacleHitbox = {
      x: obstacle.x + 5,
      y: obstacle.y + 5,
      width: obstacle.width - 10,
      height: obstacle.height - 10
    };
    
    return (
      dinoHitbox.x < obstacleHitbox.x + obstacleHitbox.width &&
      dinoHitbox.x + dinoHitbox.width > obstacleHitbox.x &&
      dinoHitbox.y < obstacleHitbox.y + obstacleHitbox.height &&
      dinoHitbox.y + dinoHitbox.height > obstacleHitbox.y
    );
  };

  return (
    <GameContainer>
      <GameTitle>Khủng Long Chạy</GameTitle>
      
      <GameInfo>
        <GameDescription>
          Điều khiển chú khủng long nhảy qua các chướng ngại vật và đạt điểm cao nhất.
          Trò chơi sẽ tăng tốc độ khi bạn đạt được nhiều điểm hơn.
        </GameDescription>
      </GameInfo>
      
      <GameArea>
        <GameCanvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT} 
        />
        
        <SidePanel>
          <ScorePanel>
            <ScoreTitle>Điểm số</ScoreTitle>
            <ScoreValue>{score}</ScoreValue>
          </ScorePanel>
          
          <HighScorePanel>
            <ScoreTitle>Điểm cao nhất</ScoreTitle>
            <ScoreValue>{highScore}</ScoreValue>
          </HighScorePanel>
          
          <ControlPanel>
            <ControlTitle>Điều khiển</ControlTitle>
            <ControlButton onClick={initializeGame} disabled={gameStarted && !gameOver}>
              {gameStarted && !gameOver ? 'Đang chơi...' : 'Bắt đầu trò chơi'}
            </ControlButton>
          </ControlPanel>
          
          <InstructionsPanel>
            <InstructionsTitle>Hướng dẫn</InstructionsTitle>
            <InstructionsList>
              <InstructionItem>Nhấn SPACE hoặc ↑ để nhảy</InstructionItem>
              <InstructionItem>Nhấn ↓ để cúi xuống</InstructionItem>
              <InstructionItem>Tránh các chướng ngại vật</InstructionItem>
            </InstructionsList>
          </InstructionsPanel>
        </SidePanel>
      </GameArea>
      
      <GameOverModal isVisible={gameOver}>
        <ModalContent>
          <ModalTitle>Trò chơi kết thúc!</ModalTitle>
          <ModalText>
            Điểm của bạn: {score}<br />
            Điểm cao nhất: {highScore}
          </ModalText>
          <ModalButton onClick={initializeGame}>
            Chơi lại
          </ModalButton>
        </ModalContent>
      </GameOverModal>
    </GameContainer>
  );
};

export default DinoRun;