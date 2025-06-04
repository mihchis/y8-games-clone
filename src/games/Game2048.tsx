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
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: wrap;
`;

const BoardContainer = styled.div`
  position: relative;
  width: 400px;
  height: 400px;
  background-color: #bbada0;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 15px;
  width: 100%;
  height: 100%;
`;

const Cell = styled.div`
  background-color: #cdc1b4;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #776e65;
  position: relative;
`;

const Tile = styled.div<{ value: number; isNew: boolean; isMerged: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${props => (props.value < 100 ? '36px' : props.value < 1000 ? '32px' : '24px')};
  font-weight: bold;
  border-radius: 4px;
  background-color: ${props => getTileColor(props.value)};
  color: ${props => (props.value <= 4 ? '#776e65' : '#f9f6f2')};
  animation: ${props => {
    if (props.isNew) return 'appear 0.2s';
    if (props.isMerged) return 'pop 0.2s';
    return 'none';
  }};
  transition: transform 0.1s;
  
  @keyframes appear {
    0% { opacity: 0; transform: scale(0); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  @keyframes pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 250px;
`;

const ScorePanel = styled.div`
  background-color: #bbada0;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  color: #f9f6f2;
`;

const ScoreTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const ScoreValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
`;

const BestScorePanel = styled(ScorePanel)`
  background-color: #8f7a66;
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
  background-color: #8f7a66;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #7f6a56;
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
  background-color: #8f7a66;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #7f6a56;
  }
`;

// Hàm lấy màu cho từng giá trị ô
const getTileColor = (value: number): string => {
  const colors: { [key: number]: string } = {
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e',
  };
  
  return colors[value] || '#3c3a32'; // Màu mặc định cho các giá trị lớn hơn 2048
};

interface TileType {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew: boolean;
  isMerged: boolean;
}

const Game2048: React.FC = () => {
  const [tiles, setTiles] = useState<TileType[]>([]);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [keepPlaying, setKeepPlaying] = useState<boolean>(false);
  const [tileIdCounter, setTileIdCounter] = useState<number>(0);
  
  // Khởi tạo trò chơi
  const initializeGame = useCallback(() => {
    const newTiles: TileType[] = [];
    setTiles(newTiles);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setKeepPlaying(false);
    setTileIdCounter(0);
    
    // Thêm 2 ô ban đầu
    addRandomTile(newTiles);
    addRandomTile(newTiles);
  }, []);
  
  // Thêm một ô ngẫu nhiên vào bảng
  const addRandomTile = (currentTiles: TileType[] = tiles): TileType[] => {
    // Tìm tất cả các ô trống
    const emptyCells: {row: number, col: number}[] = [];
    
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (!currentTiles.some(tile => tile.row === row && tile.col === col)) {
          emptyCells.push({row, col});
        }
      }
    }
    
    // Nếu không còn ô trống, không thêm ô mới
    if (emptyCells.length === 0) return currentTiles;
    
    // Chọn một ô trống ngẫu nhiên
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    // Tạo ô mới với giá trị 2 hoặc 4 (90% là 2, 10% là 4)
    const value = Math.random() < 0.9 ? 2 : 4;
    
    const newTile: TileType = {
      id: tileIdCounter,
      value,
      row: randomCell.row,
      col: randomCell.col,
      isNew: true,
      isMerged: false
    };
    
    setTileIdCounter(prev => prev + 1);
    
    // Thêm ô mới vào mảng ô hiện tại
    const updatedTiles = [...currentTiles, newTile];
    setTiles(updatedTiles);
    
    return updatedTiles;
  };
  
  // Di chuyển các ô theo hướng
  const moveTiles = (direction: 'up' | 'right' | 'down' | 'left') => {
    if (gameOver && !keepPlaying) return;
    
    // Xác định thứ tự duyệt các ô dựa trên hướng di chuyển
    const traversals = getTraversals(direction);
    
    // Đánh dấu đã có sự thay đổi hay chưa
    let moved = false;
    
    // Tạo bản sao của các ô hiện tại và đặt lại trạng thái isNew và isMerged
    const newTiles = tiles.map(tile => ({
      ...tile,
      isNew: false,
      isMerged: false
    }));
    
    // Mảng để theo dõi các ô đã được hợp nhất trong lượt này
    const mergedTiles: {[key: string]: boolean} = {};
    
    // Duyệt qua các ô theo thứ tự đã xác định
    traversals.row.forEach(row => {
      traversals.col.forEach(col => {
        // Tìm ô tại vị trí hiện tại
        const tileIndex = newTiles.findIndex(t => t.row === row && t.col === col);
        
        if (tileIndex !== -1) {
          const tile = newTiles[tileIndex];
          
          // Tìm vị trí xa nhất có thể di chuyển đến
          const positions = findFarthestPosition(newTiles, tile, direction);
          
          // Nếu có ô để hợp nhất
          if (positions.next && 
              positions.next.value === tile.value && 
              !mergedTiles[`${positions.next.row},${positions.next.col}`]) {
            
            // Hợp nhất hai ô
            const mergedValue = tile.value * 2;
            
            // Cập nhật ô được hợp nhất
            const mergedTileIndex = newTiles.findIndex(
              t => t.row === positions.next!.row && t.col === positions.next!.col
            );
            
            newTiles[mergedTileIndex] = {
              ...newTiles[mergedTileIndex],
              value: mergedValue,
              isMerged: true
            };
            
            // Đánh dấu ô này đã được hợp nhất
            mergedTiles[`${positions.next.row},${positions.next.col}`] = true;
            
            // Xóa ô hiện tại
            newTiles.splice(tileIndex, 1);
            
            // Cập nhật điểm số
            setScore(prev => {
              const newScore = prev + mergedValue;
              if (newScore > bestScore) {
                setBestScore(newScore);
                localStorage.setItem('2048-best-score', newScore.toString());
              }
              return newScore;
            });
            
            // Kiểm tra chiến thắng
            if (mergedValue === 2048 && !won && !keepPlaying) {
              setWon(true);
            }
            
            moved = true;
          } 
          // Nếu chỉ di chuyển mà không hợp nhất
          else if (positions.farthest.row !== tile.row || positions.farthest.col !== tile.col) {
            // Di chuyển ô đến vị trí xa nhất
            newTiles[tileIndex] = {
              ...tile,
              row: positions.farthest.row,
              col: positions.farthest.col
            };
            
            moved = true;
          }
        }
      });
    });
    
    // Nếu có sự thay đổi, thêm một ô mới
    if (moved) {
      const updatedTiles = addRandomTile(newTiles);
      
      // Kiểm tra xem trò chơi đã kết thúc chưa
      if (!canMove(updatedTiles)) {
        setGameOver(true);
      }
    } else {
      setTiles(newTiles);
    }
  };
  
  // Xác định thứ tự duyệt các ô dựa trên hướng di chuyển
  const getTraversals = (direction: 'up' | 'right' | 'down' | 'left') => {
    const traversals = {
      row: [0, 1, 2, 3],
      col: [0, 1, 2, 3]
    };
    
    // Đảo ngược thứ tự nếu di chuyển xuống hoặc sang phải
    if (direction === 'down') traversals.row = traversals.row.slice().reverse();
    if (direction === 'right') traversals.col = traversals.col.slice().reverse();
    
    return traversals;
  };
  
  // Tìm vị trí xa nhất có thể di chuyển đến và ô kế tiếp (nếu có)
  const findFarthestPosition = (
    currentTiles: TileType[], 
    tile: TileType, 
    direction: 'up' | 'right' | 'down' | 'left'
  ) => {
    let { row, col } = tile;
    let next = null;
    
    // Xác định vector di chuyển
    const vector = getVector(direction);
    
    // Di chuyển cho đến khi gặp biên hoặc ô khác
    do {
      row += vector.row;
      col += vector.col;
    } while (isWithinBounds(row, col) && !getTileAt(currentTiles, row, col));
    
    // Nếu đã đi quá biên hoặc gặp ô khác, quay lại một bước
    if (!isWithinBounds(row, col)) {
      row -= vector.row;
      col -= vector.col;
    } else {
      // Nếu gặp ô khác, đó là ô kế tiếp
      next = getTileAt(currentTiles, row, col);
      row -= vector.row;
      col -= vector.col;
    }
    
    return {
      farthest: { row, col },
      next
    };
  };
  
  // Lấy vector di chuyển dựa trên hướng
  const getVector = (direction: 'up' | 'right' | 'down' | 'left') => {
    const vectors: { [key: string]: { row: number, col: number } } = {
      up: { row: -1, col: 0 },
      right: { row: 0, col: 1 },
      down: { row: 1, col: 0 },
      left: { row: 0, col: -1 }
    };
    
    return vectors[direction];
  };
  
  // Kiểm tra xem vị trí có nằm trong bảng không
  const isWithinBounds = (row: number, col: number) => {
    return row >= 0 && row < 4 && col >= 0 && col < 4;
  };
  
  // Lấy ô tại vị trí cụ thể
  const getTileAt = (currentTiles: TileType[], row: number, col: number) => {
    return currentTiles.find(tile => tile.row === row && tile.col === col) || null;
  };
  
  // Kiểm tra xem còn nước đi nào không
  const canMove = (currentTiles: TileType[]) => {
    // Nếu còn ô trống, có thể di chuyển
    if (currentTiles.length < 16) return true;
    
    // Kiểm tra xem có thể hợp nhất các ô kề nhau không
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const tile = getTileAt(currentTiles, row, col);
        if (!tile) continue;
        
        // Kiểm tra ô bên phải
        if (col < 3) {
          const right = getTileAt(currentTiles, row, col + 1);
          if (right && right.value === tile.value) return true;
        }
        
        // Kiểm tra ô bên dưới
        if (row < 3) {
          const below = getTileAt(currentTiles, row + 1, col);
          if (below && below.value === tile.value) return true;
        }
      }
    }
    
    // Không còn nước đi nào
    return false;
  };
  
  // Xử lý phím mũi tên
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver && !keepPlaying) return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          moveTiles('up');
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveTiles('right');
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveTiles('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          moveTiles('left');
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tiles, gameOver, keepPlaying]);
  
  // Tải điểm cao nhất từ localStorage khi component được mount
  useEffect(() => {
    const savedBestScore = localStorage.getItem('2048-best-score');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore));
    }
    
    initializeGame();
  }, [initializeGame]);
  
  // Tiếp tục chơi sau khi đạt 2048
  const continueGame = () => {
    setKeepPlaying(true);
    setWon(false);
  };

  return (
    <GameContainer>
      <GameTitle>2048</GameTitle>
      
      <GameInfo>
        <GameDescription>
          Kết hợp các ô số giống nhau để tạo ra số lớn hơn. Đạt được ô 2048 để chiến thắng!
          Sử dụng các phím mũi tên để di chuyển các ô.
        </GameDescription>
      </GameInfo>
      
      <GameArea>
        <BoardContainer>
          <Grid>
            {/* Tạo các ô nền */}
            {Array.from({ length: 16 }).map((_, index) => (
              <Cell key={index} />
            ))}
            
            {/* Render các ô có giá trị */}
            {tiles.map(tile => {
              const style = {
                transform: `translate(${tile.col * 100}%, ${tile.row * 100}%)`
              };
              
              return (
                <Tile 
                  key={tile.id}
                  value={tile.value}
                  isNew={tile.isNew}
                  isMerged={tile.isMerged}
                  style={style}
                >
                  {tile.value}
                </Tile>
              );
            })}
          </Grid>
        </BoardContainer>
        
        <SidePanel>
          <ScorePanel>
            <ScoreTitle>Điểm số</ScoreTitle>
            <ScoreValue>{score}</ScoreValue>
          </ScorePanel>
          
          <BestScorePanel>
            <ScoreTitle>Điểm cao nhất</ScoreTitle>
            <ScoreValue>{bestScore}</ScoreValue>
          </BestScorePanel>
          
          <ControlPanel>
            <ControlTitle>Điều khiển</ControlTitle>
            <ControlButton onClick={initializeGame}>
              Trò chơi mới
            </ControlButton>
          </ControlPanel>
        </SidePanel>
      </GameArea>
      
      {/* Modal chiến thắng */}
      <GameOverModal isVisible={won && !keepPlaying}>
        <ModalContent>
          <ModalTitle>Chúc mừng!</ModalTitle>
          <ModalText>
            Bạn đã đạt được ô 2048 và chiến thắng trò chơi!
          </ModalText>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <ModalButton onClick={continueGame}>
              Tiếp tục chơi
            </ModalButton>
            <ModalButton onClick={initializeGame}>
              Trò chơi mới
            </ModalButton>
          </div>
        </ModalContent>
      </GameOverModal>
      
      {/* Modal kết thúc */}
      <GameOverModal isVisible={gameOver && !won}>
        <ModalContent>
          <ModalTitle>Trò chơi kết thúc!</ModalTitle>
          <ModalText>
            Không còn nước đi nào. Điểm của bạn: {score}
          </ModalText>
          <ModalButton onClick={initializeGame}>
            Thử lại
          </ModalButton>
        </ModalContent>
      </GameOverModal>
    </GameContainer>
  );
};

export default Game2048;