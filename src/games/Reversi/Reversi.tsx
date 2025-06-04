import React, { useState, useEffect } from 'react';
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

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  gap: 2px;
  background-color: #333;
  padding: 2px;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Cell = styled.div<{ isPlayable: boolean }>`
  width: 50px;
  height: 50px;
  background-color: #1a8c1a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.isPlayable ? 'pointer' : 'default'};
  position: relative;
  
  &:hover {
    background-color: ${props => props.isPlayable ? '#25a525' : '#1a8c1a'};
  }
  
  ${props => props.isPlayable && `
    &::after {
      content: '';
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
    }
  `}
`;

const Disc = styled.div<{ player: number }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.player === 1 ? 'black' : 'white'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const GameStatus = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 416px;
`;

const PlayerScore = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: ${props => props.active ? '#ffcc00' : '#f0f0f0'};
  border-radius: 4px;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
`;

const PlayerDisc = styled.div<{ player: number }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => props.player === 1 ? 'black' : 'white'};
  margin-right: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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

// Kích thước bàn cờ
const BOARD_SIZE = 8;

// Hướng để kiểm tra
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

const Reversi: React.FC = () => {
  // Khởi tạo bàn cờ
  const initializeBoard = () => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    // Đặt 4 quân cờ ban đầu ở giữa bàn cờ
    board[3][3] = 2; // Trắng
    board[3][4] = 1; // Đen
    board[4][3] = 1; // Đen
    board[4][4] = 2; // Trắng
    return board;
  };

  const [board, setBoard] = useState<number[][]>(initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState<number>(1); // 1: Đen, 2: Trắng
  const [playableMoves, setPlayableMoves] = useState<{row: number, col: number}[]>([]);
  const [scores, setScores] = useState<{player1: number, player2: number}>({player1: 2, player2: 2});
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<number | null>(null);

  // Tìm các nước đi hợp lệ cho người chơi hiện tại
  const findPlayableMoves = (boardState: number[][], player: number) => {
    const moves: {row: number, col: number}[] = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (boardState[row][col] !== 0) continue; // Ô đã có quân cờ
        
        if (isValidMove(boardState, row, col, player)) {
          moves.push({row, col});
        }
      }
    }
    
    return moves;
  };

  // Kiểm tra nước đi có hợp lệ không
  const isValidMove = (boardState: number[][], row: number, col: number, player: number) => {
    if (boardState[row][col] !== 0) return false;
    
    const opponent = player === 1 ? 2 : 1;
    
    for (const [dx, dy] of DIRECTIONS) {
      let x = row + dx;
      let y = col + dy;
      let flipped = false;
      
      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && boardState[x][y] === opponent) {
        x += dx;
        y += dy;
        flipped = true;
      }
      
      if (flipped && x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && boardState[x][y] === player) {
        return true;
      }
    }
    
    return false;
  };

  // Lật các quân cờ khi đặt một quân mới
  const flipDiscs = (boardState: number[][], row: number, col: number, player: number) => {
    const newBoard = [...boardState.map(r => [...r])];
    newBoard[row][col] = player;
    
    const opponent = player === 1 ? 2 : 1;
    
    for (const [dx, dy] of DIRECTIONS) {
      let x = row + dx;
      let y = col + dy;
      const discsToFlip: {row: number, col: number}[] = [];
      
      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && newBoard[x][y] === opponent) {
        discsToFlip.push({row: x, col: y});
        x += dx;
        y += dy;
      }
      
      if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && newBoard[x][y] === player) {
        for (const disc of discsToFlip) {
          newBoard[disc.row][disc.col] = player;
        }
      }
    }
    
    return newBoard;
  };

  // Tính điểm
  const calculateScores = (boardState: number[][]) => {
    let player1 = 0;
    let player2 = 0;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (boardState[row][col] === 1) player1++;
        else if (boardState[row][col] === 2) player2++;
      }
    }
    
    return {player1, player2};
  };

  // Xử lý khi người chơi đặt quân cờ
  const handleCellClick = (row: number, col: number) => {
    if (gameOver) return;
    
    // Kiểm tra nước đi có hợp lệ không
    const isPlayable = playableMoves.some(move => move.row === row && move.col === col);
    if (!isPlayable) return;
    
    // Lật các quân cờ
    const newBoard = flipDiscs(board, row, col, currentPlayer);
    setBoard(newBoard);
    
    // Chuyển lượt cho người chơi tiếp theo
    const nextPlayer = currentPlayer === 1 ? 2 : 1;
    setCurrentPlayer(nextPlayer);
    
    // Cập nhật điểm số
    const newScores = calculateScores(newBoard);
    setScores(newScores);
  };

  // Khởi tạo lại trò chơi
  const resetGame = () => {
    setBoard(initializeBoard());
    setCurrentPlayer(1);
    setGameOver(false);
    setWinner(null);
    setScores({player1: 2, player2: 2});
  };

  // Kiểm tra xem trò chơi đã kết thúc chưa
  const checkGameOver = (boardState: number[][], player: number) => {
    const moves = findPlayableMoves(boardState, player);
    if (moves.length > 0) return false;
    
    // Kiểm tra xem người chơi còn lại có thể đi không
    const otherPlayer = player === 1 ? 2 : 1;
    const otherMoves = findPlayableMoves(boardState, otherPlayer);
    if (otherMoves.length > 0) return false;
    
    // Nếu cả hai người chơi không thể đi, trò chơi kết thúc
    return true;
  };

  // Cập nhật các nước đi hợp lệ khi người chơi thay đổi
  useEffect(() => {
    const moves = findPlayableMoves(board, currentPlayer);
    setPlayableMoves(moves);
    
    // Kiểm tra xem người chơi hiện tại có thể đi không
    if (moves.length === 0) {
      // Nếu không thể đi, chuyển lượt cho người chơi còn lại
      const nextPlayer = currentPlayer === 1 ? 2 : 1;
      const nextMoves = findPlayableMoves(board, nextPlayer);
      
      if (nextMoves.length > 0) {
        // Người chơi còn lại có thể đi
        setCurrentPlayer(nextPlayer);
      } else {
        // Cả hai người chơi không thể đi, trò chơi kết thúc
        setGameOver(true);
        
        // Xác định người chiến thắng
        if (scores.player1 > scores.player2) {
          setWinner(1);
        } else if (scores.player2 > scores.player1) {
          setWinner(2);
        } else {
          setWinner(0); // Hòa
        }
      }
    }
  }, [board, currentPlayer]);

  return (
    <GameContainer>
      <GameTitle>Cờ Lật (Reversi/Othello)</GameTitle>
      
      <GameInfo>
        <GameDescription>
          Đặt quân cờ của bạn để bao vây và lật quân cờ của đối thủ. Người chơi có nhiều quân cờ nhất khi trò chơi kết thúc sẽ thắng.
        </GameDescription>
      </GameInfo>
      
      <Board>
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => {
            const isPlayable = playableMoves.some(move => 
              move.row === rowIndex && move.col === colIndex
            );
            
            return (
              <Cell 
                key={`${rowIndex}-${colIndex}`} 
                isPlayable={isPlayable && !gameOver}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell !== 0 && <Disc player={cell} />}
              </Cell>
            );
          })
        ))}
      </Board>
      
      <GameStatus>
        <PlayerScore active={currentPlayer === 1 && !gameOver}>
          <PlayerDisc player={1} />
          Đen: {scores.player1}
        </PlayerScore>
        
        <PlayerScore active={currentPlayer === 2 && !gameOver}>
          <PlayerDisc player={2} />
          Trắng: {scores.player2}
        </PlayerScore>
      </GameStatus>
      
      {gameOver && (
        <GameMessage>
          {winner === 0 ? 'Trò chơi kết thúc với tỷ số hòa!' : 
           `Người chơi ${winner === 1 ? 'Đen' : 'Trắng'} thắng!`}
        </GameMessage>
      )}
      
      <GameControls>
        <Button onClick={resetGame}>Chơi lại</Button>
      </GameControls>
    </GameContainer>
  );
};

export default Reversi;