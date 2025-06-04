import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Reversi from '../../games/Reversi/Reversi';

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
        return (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#333' }}>Trò chơi Tetris đang được phát triển</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Chúng tôi đang nỗ lực phát triển trò chơi Tetris. Vui lòng quay lại sau!</p>
            <img src="/tetris-preview.svg" alt="Tetris Preview" style={{ maxWidth: '400px', width: '100%', border: '1px solid #ddd', borderRadius: '8px' }} />
          </div>
        );
      case 'snake':
        return (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#333' }}>Trò chơi Rắn Săn Mồi đang được phát triển</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Chúng tôi đang nỗ lực phát triển trò chơi Rắn Săn Mồi. Vui lòng quay lại sau!</p>
            <img src="/snake-preview.svg" alt="Snake Preview" style={{ maxWidth: '400px', width: '100%', border: '1px solid #ddd', borderRadius: '8px' }} />
          </div>
        );
      case 'puzzle':
        return (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#333' }}>Trò chơi Ghép Hình đang được phát triển</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Chúng tôi đang nỗ lực phát triển trò chơi Ghép Hình. Vui lòng quay lại sau!</p>
            <img src="/puzzle-preview.svg" alt="Puzzle Preview" style={{ maxWidth: '400px', width: '100%', border: '1px solid #ddd', borderRadius: '8px' }} />
          </div>
        );
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