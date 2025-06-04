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
  gap: 2rem;
  align-items: flex-start;
`;

const BoardContainer = styled.div`
  border: 2px solid #333;
  background-color: #f0f0f0;
  padding: 2px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Board = styled.div<{ gridSize: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.gridSize}, 1fr);
  grid-template-rows: repeat(${props => props.gridSize}, 1fr);
  gap: 2px;
  background-color: #333;
`;

const PuzzlePiece = styled.div<{ bgImage: string; x: number; y: number; size: number; isMoving: boolean }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background-image: url(${props => props.bgImage});
  background-position: ${props => `-${props.x * props.size}px -${props.y * props.size}px`};
  background-size: ${props => `${props.size * Math.sqrt(props.x * props.y + 1)}px ${props.size * Math.sqrt(props.x * props.y + 1)}px`};
  cursor: pointer;
  transition: transform 0.2s;
  transform: ${props => props.isMoving ? 'scale(0.95)' : 'scale(1)'};
  box-shadow: ${props => props.isMoving ? '0 0 10px rgba(0, 0, 0, 0.5)' : 'none'};
`;

const EmptyPiece = styled.div<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background-color: #333;
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ControlPanel = styled.div`
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 4px;
  width: 200px;
`;

const ControlTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const ControlButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
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

const MovesPanel = styled.div`
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 4px;
  width: 200px;
`;

const MovesTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const MovesValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  color: #333;
`;

const TimePanel = styled.div`
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 4px;
  width: 200px;
`;

const TimeTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const TimeValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
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

const ImageSelector = styled.div`
  margin-top: 1rem;
`;

const ImageLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
`;

const ImageSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

interface PuzzlePiece {
  id: number;
  x: number;
  y: number;
  correctX: number;
  correctY: number;
}

const Puzzle: React.FC = () => {
  // Các cấu hình và trạng thái
  const [gridSize, setGridSize] = useState<number>(3);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [emptyPos, setEmptyPos] = useState<{x: number, y: number}>({x: gridSize - 1, y: gridSize - 1});
  const [moves, setMoves] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>('/puzzle-images/nature.jpg');
  const [movingPiece, setMovingPiece] = useState<number | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pieceSize = 80; // Kích thước mỗi mảnh ghép
  
  // Danh sách hình ảnh có sẵn
  const availableImages = [
    { id: 'nature', name: 'Thiên nhiên', url: '/puzzle-images/nature.jpg' },
    { id: 'city', name: 'Thành phố', url: '/puzzle-images/city.jpg' },
    { id: 'abstract', name: 'Trừu tượng', url: '/puzzle-images/abstract.jpg' },
  ];

  // Khởi tạo trò chơi
  const initializeGame = useCallback(() => {
    // Tạo mảng các mảnh ghép
    const newPieces: PuzzlePiece[] = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        // Bỏ qua vị trí cuối cùng (sẽ là ô trống)
        if (!(x === gridSize - 1 && y === gridSize - 1)) {
          newPieces.push({
            id: y * gridSize + x,
            x: x,
            y: y,
            correctX: x,
            correctY: y
          });
        }
      }
    }
    
    // Đặt vị trí ô trống
    setEmptyPos({x: gridSize - 1, y: gridSize - 1});
    
    // Trộn các mảnh ghép
    const shuffledPieces = [...newPieces];
    for (let i = shuffledPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPieces[i], shuffledPieces[j]] = [shuffledPieces[j], shuffledPieces[i]];
      
      // Cập nhật vị trí x, y sau khi trộn
      const xPos = i % gridSize;
      const yPos = Math.floor(i / gridSize);
      shuffledPieces[i].x = xPos;
      shuffledPieces[i].y = yPos;
    }
    
    // Đảm bảo trò chơi có thể giải được
    // (Đối với puzzle sliding, số lần đảo ngược phải là chẵn để có thể giải được)
    let inversions = 0;
    for (let i = 0; i < shuffledPieces.length; i++) {
      for (let j = i + 1; j < shuffledPieces.length; j++) {
        if (shuffledPieces[i].id > shuffledPieces[j].id) {
          inversions++;
        }
      }
    }
    
    // Nếu số lần đảo ngược là lẻ, đổi vị trí hai mảnh ghép để đảm bảo có thể giải được
    if (inversions % 2 !== 0) {
      [shuffledPieces[0], shuffledPieces[1]] = [shuffledPieces[1], shuffledPieces[0]];
      const tempX = shuffledPieces[0].x;
      const tempY = shuffledPieces[0].y;
      shuffledPieces[0].x = shuffledPieces[1].x;
      shuffledPieces[0].y = shuffledPieces[1].y;
      shuffledPieces[1].x = tempX;
      shuffledPieces[1].y = tempY;
    }
    
    setPieces(shuffledPieces);
    setMoves(0);
    setTime(0);
    setIsPlaying(true);
    setIsGameOver(false);
    
    // Bắt đầu đếm thời gian
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
  }, [gridSize]);

  // Xử lý di chuyển mảnh ghép
  const movePiece = useCallback((id: number) => {
    const piece = pieces.find(p => p.id === id);
    if (!piece) return;
    
    // Kiểm tra xem mảnh ghép có nằm kề ô trống không
    const isAdjacent = (
      (piece.x === emptyPos.x && Math.abs(piece.y - emptyPos.y) === 1) ||
      (piece.y === emptyPos.y && Math.abs(piece.x - emptyPos.x) === 1)
    );
    
    if (isAdjacent) {
      // Hiệu ứng di chuyển
      setMovingPiece(id);
      setTimeout(() => setMovingPiece(null), 200);
      
      // Cập nhật vị trí
      setPieces(prevPieces => {
        return prevPieces.map(p => {
          if (p.id === id) {
            return { ...p, x: emptyPos.x, y: emptyPos.y };
          }
          return p;
        });
      });
      
      // Cập nhật vị trí ô trống
      setEmptyPos({x: piece.x, y: piece.y});
      
      // Tăng số lượt di chuyển
      setMoves(prevMoves => prevMoves + 1);
      
      // Kiểm tra xem trò chơi đã hoàn thành chưa
      checkGameCompletion();
    }
  }, [pieces, emptyPos]);

  // Kiểm tra xem trò chơi đã hoàn thành chưa
  const checkGameCompletion = useCallback(() => {
    const isComplete = pieces.every(piece => {
      return piece.x === piece.correctX && piece.y === piece.correctY;
    });
    
    if (isComplete) {
      setIsPlaying(false);
      setIsGameOver(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [pieces]);

  // Xử lý thay đổi độ khó
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setGridSize(newSize);
  };

  // Xử lý thay đổi hình ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedImg = availableImages.find(img => img.id === e.target.value);
    if (selectedImg) {
      setSelectedImage(selectedImg.url);
    }
  };

  // Định dạng thời gian
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Khởi tạo trò chơi khi thay đổi kích thước lưới hoặc hình ảnh
  useEffect(() => {
    if (isPlaying) {
      initializeGame();
    }
  }, [gridSize, selectedImage, initializeGame, isPlaying]);

  // Dọn dẹp khi component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <GameContainer>
      <GameTitle>Ghép Hình</GameTitle>
      
      <GameInfo>
        <GameDescription>
          Trò chơi ghép hình cổ điển. Di chuyển các mảnh ghép để tạo thành hình ảnh hoàn chỉnh.
          Bạn chỉ có thể di chuyển các mảnh ghép nằm kề với ô trống.
        </GameDescription>
      </GameInfo>
      
      <GameArea>
        <BoardContainer>
          <Board gridSize={gridSize}>
            {pieces.map(piece => (
              <PuzzlePiece
                key={piece.id}
                bgImage={selectedImage}
                x={piece.correctX}
                y={piece.correctY}
                size={pieceSize}
                isMoving={movingPiece === piece.id}
                onClick={() => isPlaying && movePiece(piece.id)}
                style={{
                  gridColumn: piece.x + 1,
                  gridRow: piece.y + 1
                }}
              />
            ))}
            <EmptyPiece
              size={pieceSize}
              style={{
                gridColumn: emptyPos.x + 1,
                gridRow: emptyPos.y + 1
              }}
            />
          </Board>
        </BoardContainer>
        
        <SidePanel>
          <ControlPanel>
            <ControlTitle>Điều khiển</ControlTitle>
            <ControlButton onClick={initializeGame} disabled={isPlaying}>
              {isPlaying ? 'Đang chơi...' : 'Bắt đầu trò chơi'}
            </ControlButton>
            <ControlButton onClick={() => {
              setIsPlaying(false);
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
            }} disabled={!isPlaying}>
              Dừng trò chơi
            </ControlButton>
            
            <DifficultySelector>
              <DifficultyLabel>Độ khó:</DifficultyLabel>
              <DifficultySelect 
                value={gridSize} 
                onChange={handleDifficultyChange}
                disabled={isPlaying}
              >
                <option value="3">Dễ (3x3)</option>
                <option value="4">Trung bình (4x4)</option>
                <option value="5">Khó (5x5)</option>
              </DifficultySelect>
            </DifficultySelector>
            
            <ImageSelector>
              <ImageLabel>Hình ảnh:</ImageLabel>
              <ImageSelect 
                onChange={handleImageChange}
                disabled={isPlaying}
              >
                {availableImages.map(img => (
                  <option key={img.id} value={img.id}>{img.name}</option>
                ))}
              </ImageSelect>
            </ImageSelector>
          </ControlPanel>
          
          <MovesPanel>
            <MovesTitle>Số lượt di chuyển</MovesTitle>
            <MovesValue>{moves}</MovesValue>
          </MovesPanel>
          
          <TimePanel>
            <TimeTitle>Thời gian</TimeTitle>
            <TimeValue>{formatTime(time)}</TimeValue>
          </TimePanel>
        </SidePanel>
      </GameArea>
      
      <GameOverModal isVisible={isGameOver}>
        <ModalContent>
          <ModalTitle>Chúc mừng!</ModalTitle>
          <ModalText>
            Bạn đã hoàn thành trò chơi với {moves} lượt di chuyển trong {formatTime(time)}!
          </ModalText>
          <ModalButton onClick={() => {
            setIsGameOver(false);
            initializeGame();
          }}>
            Chơi lại
          </ModalButton>
        </ModalContent>
      </GameOverModal>
    </GameContainer>
  );
};

export default Puzzle;