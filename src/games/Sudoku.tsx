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
  width: 450px;
  height: 450px;
  background-color: #f0f0f0;
  border: 2px solid #333;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(9, 1fr);
  width: 100%;
  height: 100%;
`;

const Cell = styled.div<{ isSelected: boolean; isInitial: boolean; isError: boolean; isSameValue: boolean; isInSameGroup: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: ${props => props.isInitial ? 'bold' : 'normal'};
  color: ${props => props.isInitial ? '#333' : '#0066cc'};
  background-color: ${props => {
    if (props.isSelected) return '#bbdefb';
    if (props.isError) return '#ffcdd2';
    if (props.isSameValue) return '#e3f2fd';
    if (props.isInSameGroup) return '#f5f5f5';
    return 'white';
  }};
  border: 1px solid #ccc;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
  
  &:nth-child(3n) {
    border-right: 2px solid #333;
  }
  
  &:nth-child(9n) {
    border-right: none;
  }
  
  &:nth-child(n+19):nth-child(-n+27),
  &:nth-child(n+46):nth-child(-n+54) {
    border-bottom: 2px solid #333;
  }
  
  &:hover {
    background-color: ${props => props.isSelected ? '#bbdefb' : '#e3f2fd'};
  }
`;

const Notes = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  font-size: 8px;
  color: #666;
`;

const NoteItem = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
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

const NumberPad = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
`;

const NumberButton = styled.button<{ isActive: boolean }>`
  padding: 0.8rem;
  font-size: 1.2rem;
  background-color: ${props => props.isActive ? '#bbdefb' : '#f0f0f0'};
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #e3f2fd;
  }
`;

const TimerPanel = styled.div`
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`;

const TimerTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const TimerValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
`;

const ModeToggle = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
`;

const ModeButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 0.5rem;
  background-color: ${props => props.isActive ? '#4CAF50' : '#f0f0f0'};
  color: ${props => props.isActive ? 'white' : '#333'};
  border: 1px solid #ccc;
  cursor: pointer;
  
  &:first-child {
    border-radius: 4px 0 0 4px;
  }
  
  &:last-child {
    border-radius: 0 4px 4px 0;
  }
  
  &:hover {
    background-color: ${props => props.isActive ? '#388E3C' : '#e0e0e0'};
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

interface SudokuCell {
  value: number | null;
  isInitial: boolean;
  notes: boolean[];
}

const Sudoku: React.FC = () => {
  // Trạng thái trò chơi
  const [board, setBoard] = useState<SudokuCell[][]>(Array(9).fill(null).map(() => 
    Array(9).fill(null).map(() => ({ value: null, isInitial: false, notes: Array(9).fill(false) }))
  ));
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [isNoteMode, setIsNoteMode] = useState<boolean>(false);
  const [errors, setErrors] = useState<{[key: string]: boolean}>({});
  
  // Bộ đếm thời gian
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (gameStarted && !gameOver) {
      timer = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, gameOver]);
  
  // Định dạng thời gian
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Tạo bảng Sudoku mới
  const generateSudoku = useCallback((difficultyLevel: string) => {
    // Tạo bảng Sudoku đã giải
    const solvedBoard = createSolvedBoard();
    
    // Xác định số ô cần xóa dựa trên độ khó
    let cellsToRemove;
    switch (difficultyLevel) {
      case 'easy':
        cellsToRemove = 35; // Dễ: 46 ô được điền sẵn
        break;
      case 'hard':
        cellsToRemove = 55; // Khó: 26 ô được điền sẵn
        break;
      default: // medium
        cellsToRemove = 45; // Trung bình: 36 ô được điền sẵn
    }
    
    // Tạo bảng chơi bằng cách xóa một số ô
    const gameBoard = solvedBoard.map(row => [...row]);
    let removedCells = 0;
    
    while (removedCells < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      
      if (gameBoard[row][col] !== null) {
        gameBoard[row][col] = null;
        removedCells++;
      }
    }
    
    // Chuyển đổi thành định dạng SudokuCell
    const newBoard: SudokuCell[][] = gameBoard.map((row, rowIndex) =>
      row.map((value, colIndex) => ({
        value,
        isInitial: value !== null,
        notes: Array(9).fill(false)
      }))
    );
    
    setBoard(newBoard);
    setSelectedCell(null);
    setErrors({});
    setTime(0);
    setGameStarted(true);
    setGameOver(false);
  }, []);
  
  // Tạo bảng Sudoku đã giải
  const createSolvedBoard = (): (number | null)[][] => {
    // Khởi tạo bảng trống
    const board: (number | null)[][] = Array(9).fill(null).map(() => Array(9).fill(null));
    
    // Giải bảng Sudoku
    solveSudoku(board);
    
    return board;
  };
  
  // Giải bảng Sudoku bằng thuật toán backtracking
  const solveSudoku = (board: (number | null)[][]): boolean => {
    // Tìm ô trống
    let emptyCell = findEmptyCell(board);
    
    // Nếu không còn ô trống, bảng đã được giải
    if (!emptyCell) return true;
    
    const [row, col] = emptyCell;
    
    // Tạo mảng các số từ 1-9 và xáo trộn
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffleArray(numbers);
    
    // Thử các số từ 1-9
    for (const num of numbers) {
      // Kiểm tra xem số có hợp lệ không
      if (isValidPlacement(board, row, col, num)) {
        // Đặt số vào ô
        board[row][col] = num;
        
        // Tiếp tục giải các ô còn lại
        if (solveSudoku(board)) {
          return true;
        }
        
        // Nếu không thể giải, quay lui và thử số khác
        board[row][col] = null;
      }
    }
    
    // Không có số nào hợp lệ
    return false;
  };
  
  // Tìm ô trống đầu tiên
  const findEmptyCell = (board: (number | null)[][]): [number, number] | null => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === null) {
          return [row, col];
        }
      }
    }
    return null;
  };
  
  // Kiểm tra xem số có thể đặt vào ô không
  const isValidPlacement = (board: (number | null)[][], row: number, col: number, num: number): boolean => {
    // Kiểm tra hàng
    for (let c = 0; c < 9; c++) {
      if (board[row][c] === num) return false;
    }
    
    // Kiểm tra cột
    for (let r = 0; r < 9; r++) {
      if (board[r][col] === num) return false;
    }
    
    // Kiểm tra khối 3x3
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[boxRow + r][boxCol + c] === num) return false;
      }
    }
    
    return true;
  };
  
  // Xáo trộn mảng
  const shuffleArray = (array: number[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };
  
  // Khởi tạo trò chơi
  const startGame = () => {
    generateSudoku(difficulty);
  };
  
  // Xử lý khi chọn ô
  const handleCellClick = (row: number, col: number) => {
    if (!gameStarted || gameOver) return;
    
    // Không cho phép thay đổi các ô ban đầu
    if (!board[row][col].isInitial) {
      setSelectedCell({ row, col });
    }
  };
  
  // Xử lý khi nhập số
  const handleNumberInput = (num: number) => {
    if (!selectedCell || !gameStarted || gameOver) return;
    
    const { row, col } = selectedCell;
    
    // Nếu ô đã được điền sẵn, không cho phép thay đổi
    if (board[row][col].isInitial) return;
    
    // Tạo bản sao của bảng
    const newBoard = [...board.map(row => [...row])];
    
    if (isNoteMode) {
      // Chế độ ghi chú
      const newNotes = [...newBoard[row][col].notes];
      newNotes[num - 1] = !newNotes[num - 1];
      newBoard[row][col] = { ...newBoard[row][col], notes: newNotes };
    } else {
      // Chế độ điền số
      const currentValue = newBoard[row][col].value;
      
      // Nếu nhấn cùng một số, xóa số đó
      if (currentValue === num) {
        newBoard[row][col] = { ...newBoard[row][col], value: null };
      } else {
        newBoard[row][col] = { ...newBoard[row][col], value: num };
        
        // Kiểm tra xem số có hợp lệ không
        const isValid = checkValidPlacement(newBoard, row, col, num);
        
        // Cập nhật danh sách lỗi
        const errorKey = `${row},${col}`;
        if (!isValid) {
          setErrors(prev => ({ ...prev, [errorKey]: true }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[errorKey];
            return newErrors;
          });
        }
      }
    }
    
    setBoard(newBoard);
    
    // Kiểm tra xem trò chơi đã hoàn thành chưa
    if (isBoardComplete(newBoard) && Object.keys(errors).length === 0) {
      setGameOver(true);
      setGameStarted(false);
    }
  };
  
  // Kiểm tra xem số có thể đặt vào ô không (cho giao diện người dùng)
  const checkValidPlacement = (board: SudokuCell[][], row: number, col: number, num: number): boolean => {
    // Kiểm tra hàng
    for (let c = 0; c < 9; c++) {
      if (c !== col && board[row][c].value === num) return false;
    }
    
    // Kiểm tra cột
    for (let r = 0; r < 9; r++) {
      if (r !== row && board[r][col].value === num) return false;
    }
    
    // Kiểm tra khối 3x3
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const currentRow = boxRow + r;
        const currentCol = boxCol + c;
        if (currentRow !== row || currentCol !== col) {
          if (board[currentRow][currentCol].value === num) return false;
        }
      }
    }
    
    return true;
  };
  
  // Kiểm tra xem bảng đã hoàn thành chưa
  const isBoardComplete = (board: SudokuCell[][]): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col].value === null) return false;
      }
    }
    return true;
  };
  
  // Xử lý thay đổi độ khó
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(e.target.value);
  };
  
  // Kiểm tra xem ô có cùng giá trị với ô đang chọn không
  const isSameValue = (row: number, col: number): boolean => {
    if (!selectedCell || board[row][col].value === null) return false;
    
    const selectedValue = board[selectedCell.row][selectedCell.col].value;
    return selectedValue !== null && board[row][col].value === selectedValue;
  };
  
  // Kiểm tra xem ô có cùng nhóm (hàng, cột, khối 3x3) với ô đang chọn không
  const isInSameGroup = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    
    const { row: selectedRow, col: selectedCol } = selectedCell;
    
    // Cùng hàng
    if (row === selectedRow) return true;
    
    // Cùng cột
    if (col === selectedCol) return true;
    
    // Cùng khối 3x3
    const selectedBoxRow = Math.floor(selectedRow / 3);
    const selectedBoxCol = Math.floor(selectedCol / 3);
    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);
    
    return selectedBoxRow === boxRow && selectedBoxCol === boxCol;
  };
  
  // Xóa số trong ô đang chọn
  const clearSelectedCell = () => {
    if (!selectedCell || !gameStarted || gameOver) return;
    
    const { row, col } = selectedCell;
    
    // Nếu ô đã được điền sẵn, không cho phép xóa
    if (board[row][col].isInitial) return;
    
    // Tạo bản sao của bảng
    const newBoard = [...board.map(row => [...row])];
    
    // Xóa số và ghi chú
    newBoard[row][col] = { ...newBoard[row][col], value: null, notes: Array(9).fill(false) };
    
    setBoard(newBoard);
    
    // Xóa lỗi nếu có
    const errorKey = `${row},${col}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };
  
  // Kiểm tra gợi ý cho ô đang chọn
  const getHint = () => {
    if (!selectedCell || !gameStarted || gameOver) return;
    
    const { row, col } = selectedCell;
    
    // Nếu ô đã được điền sẵn hoặc đã có giá trị đúng, không cần gợi ý
    if (board[row][col].isInitial || 
        (board[row][col].value !== null && !errors[`${row},${col}`])) return;
    
    // Tạo bảng tạm thời để giải
    const tempBoard: (number | null)[][] = board.map(row => 
      row.map(cell => cell.value)
    );
    
    // Giải bảng Sudoku
    solveSudoku(tempBoard);
    
    // Lấy giá trị đúng cho ô đang chọn
    const correctValue = tempBoard[row][col];
    
    if (correctValue !== null) {
      // Tạo bản sao của bảng
      const newBoard = [...board.map(row => [...row])];
      
      // Điền giá trị đúng
      newBoard[row][col] = { ...newBoard[row][col], value: correctValue };
      
      setBoard(newBoard);
      
      // Xóa lỗi nếu có
      const errorKey = `${row},${col}`;
      if (errors[errorKey]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        });
      }
      
      // Kiểm tra xem trò chơi đã hoàn thành chưa
      if (isBoardComplete(newBoard) && Object.keys(errors).length === 0) {
        setGameOver(true);
        setGameStarted(false);
      }
    }
  };

  return (
    <GameContainer>
      <GameTitle>Sudoku</GameTitle>
      
      <GameInfo>
        <GameDescription>
          Điền các số từ 1 đến 9 vào lưới sao cho mỗi hàng, cột và khối 3x3 không chứa số trùng lặp.
          Sử dụng chế độ ghi chú để đánh dấu các số có thể.
        </GameDescription>
      </GameInfo>
      
      <GameArea>
        <BoardContainer>
          <Board>
            {board.map((row, rowIndex) => 
              row.map((cell, colIndex) => {
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                const isError = errors[`${rowIndex},${colIndex}`] === true;
                const isSameValueCell = isSameValue(rowIndex, colIndex);
                const isInSameGroupCell = isInSameGroup(rowIndex, colIndex);
                
                return (
                  <Cell 
                    key={`${rowIndex}-${colIndex}`}
                    isSelected={isSelected}
                    isInitial={cell.isInitial}
                    isError={isError}
                    isSameValue={isSameValueCell}
                    isInSameGroup={isInSameGroupCell}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell.value ? cell.value : ''}
                    {!cell.value && cell.notes.some(note => note) && (
                      <Notes>
                        {cell.notes.map((isNote, index) => (
                          <NoteItem key={index}>
                            {isNote ? index + 1 : ''}
                          </NoteItem>
                        ))}
                      </Notes>
                    )}
                  </Cell>
                );
              })
            )}
          </Board>
        </BoardContainer>
        
        <SidePanel>
          <TimerPanel>
            <TimerTitle>Thời gian</TimerTitle>
            <TimerValue>{formatTime(time)}</TimerValue>
          </TimerPanel>
          
          <ControlPanel>
            <ControlTitle>Điều khiển</ControlTitle>
            <ControlButton onClick={startGame}>
              {gameStarted ? 'Trò chơi mới' : 'Bắt đầu trò chơi'}
            </ControlButton>
            
            <ControlButton onClick={clearSelectedCell} disabled={!selectedCell || (selectedCell && board[selectedCell.row][selectedCell.col].isInitial)}>
              Xóa ô
            </ControlButton>
            
            <ControlButton onClick={getHint} disabled={!selectedCell}>
              Gợi ý
            </ControlButton>
            
            <DifficultySelector>
              <DifficultyLabel>Độ khó:</DifficultyLabel>
              <DifficultySelect 
                value={difficulty} 
                onChange={handleDifficultyChange}
              >
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </DifficultySelect>
            </DifficultySelector>
            
            <ModeToggle>
              <ModeButton 
                isActive={!isNoteMode}
                onClick={() => setIsNoteMode(false)}
              >
                Điền số
              </ModeButton>
              <ModeButton 
                isActive={isNoteMode}
                onClick={() => setIsNoteMode(true)}
              >
                Ghi chú
              </ModeButton>
            </ModeToggle>
          </ControlPanel>
          
          <NumberPad>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
              const isActive = selectedCell ? board[selectedCell.row][selectedCell.col].value === num : false;
              
              return (
                <NumberButton 
                  key={num}
                  isActive={isActive}
                  onClick={() => handleNumberInput(num)}
                >
                  {num}
                </NumberButton>
              );
            })}
          </NumberPad>
        </SidePanel>
      </GameArea>
      
      <GameOverModal isVisible={gameOver}>
        <ModalContent>
          <ModalTitle>Chúc mừng!</ModalTitle>
          <ModalText>
            Bạn đã hoàn thành trò chơi Sudoku trong {formatTime(time)}!
          </ModalText>
          <ModalButton onClick={startGame}>
            Chơi lại
          </ModalButton>
        </ModalContent>
      </GameOverModal>
    </GameContainer>
  );
};

export default Sudoku;