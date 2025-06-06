import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Reversi from '../../games/Reversi/Reversi';
import Tetris from '../../games/Tetris';
import Snake from '../../games/Snake';
import DemoQuest from '../../games/DemoQuest';
import Puzzle from '../../games/Puzzle';
import Sudoku from '../../games/Sudoku';
import Bomberman from '../../games/Bomberman';
import Pong from '../../games/Pong';
import Game2048 from '../../games/Game2048';
import DinoRun from '../../games/DinoRun';
import PacMan from '../../games/PacMan';

const GameDetailContainer = styled.div`
  padding: 2rem 0;
`;

const GameNotFound = styled.div`
  text-align: center;
  padding: 3rem;
`;

const GameNotFoundTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #333;
`;

const GameNotFoundMessage = styled.p`
  color: #666;
`;

// Sửa lỗi TypeScript bằng cách không sử dụng generic type cho useParams
const GameDetail: React.FC = () => {
  const params = useParams();
  const gameId = params.gameId;
  
  // Render trò chơi tương ứng dựa trên gameId
  const renderGame = () => {
    switch (gameId) {
      case 'reversi':
        return <Reversi />;
      case 'tetris':
        return <Tetris />;
      case 'snake':
        return <Snake />;
      case 'demoquest':
        return <DemoQuest />;
      case 'puzzle':
        return <Puzzle />;
      case 'sudoku':
        return <Sudoku />;
      case 'bomberman':
        return <Bomberman />;
      case 'pong':
        return <Pong />;
      case 'game2048':
        return <Game2048 />;
      case 'dinorun':
        return <DinoRun />;
      case 'pacman':
        return <PacMan />;
      default:
        return (
          <GameNotFound>
            <GameNotFoundTitle>Trò chơi không tồn tại</GameNotFoundTitle>
            <GameNotFoundMessage>
              Trò chơi bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </GameNotFoundMessage>
          </GameNotFound>
        );
    }
  };

  return (
    <GameDetailContainer>
      {renderGame()}
    </GameDetailContainer>
  );
};

export default GameDetail;