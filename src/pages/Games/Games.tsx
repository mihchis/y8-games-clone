import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const GamesContainer = styled.div`
  padding: 2rem 0;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
  border-bottom: 2px solid #ffcc00;
  padding-bottom: 0.5rem;
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const GameCard = styled(Link)`
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  color: #333;
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const GameImage = styled.div`
  height: 150px;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #555;
`;

const GameInfo = styled.div`
  padding: 1rem;
`;

const GameTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
`;

const GameDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
`;

const CategoryFilter = styled.div`
  margin-bottom: 2rem;
`;

const FilterTitle = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const FilterOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  background-color: ${props => props.active ? '#ffcc00' : '#f0f0f0'};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: ${props => props.active ? '#ffcc00' : '#e0e0e0'};
  }
`;

const Games: React.FC = () => {
  // Mảng trò chơi mẫu
  const games = [
    {
      id: 'reversi',
      title: 'Cờ Lật (Reversi/Othello)',
      description: 'Trò chơi chiến thuật cổ điển với luật chơi đơn giản nhưng sâu sắc.',
      image: 'reversi.jpg',
      category: 'board'
    },
    {
      id: 'tetris',
      title: 'Tetris',
      description: 'Trò chơi xếp hình kinh điển, thử thách kỹ năng và tốc độ của bạn.',
      image: 'tetris.jpg',
      category: 'puzzle'
    },
    {
      id: 'snake',
      title: 'Rắn Săn Mồi',
      description: 'Điều khiển con rắn ăn thức ăn và phát triển dài hơn, nhưng đừng đâm vào chính mình!',
      image: 'snake.jpg',
      category: 'action'
    },
    {
      id: 'puzzle',
      title: 'Ghép Hình',
      description: 'Thử thách trí tuệ với các câu đố ghép hình đầy màu sắc và thú vị.',
      image: 'puzzle.jpg',
      category: 'puzzle'
    },
    {
      id: 'sudoku',
      title: 'Sudoku',
      description: 'Điền các số từ 1 đến 9 vào lưới sao cho mỗi hàng, cột và khối 3x3 không chứa số trùng lặp.',
      image: 'sudoku.jpg',
      category: 'puzzle'
    },
    {
      id: 'bomberman',
      title: 'Bomberman',
      description: 'Đặt bom để phá vỡ các khối gạch và tiêu diệt đối thủ. Thu thập các vật phẩm để tăng sức mạnh.',
      image: 'bomberman.jpg',
      category: 'action'
    },
    {
      id: 'pong',
      title: 'Pong',
      description: 'Trò chơi bóng bàn cổ điển, điều khiển thanh trượt để đánh bóng qua lại.',
      image: 'pong.jpg',
      category: 'action'
    },
    {
      id: 'game2048',
      title: '2048',
      description: 'Kết hợp các ô số giống nhau để tạo ra ô có giá trị 2048 trong trò chơi giải đố này.',
      image: '2048.jpg',
      category: 'puzzle'
    },
    {
      id: 'dinorun',
      title: 'Khủng Long Chạy',
      description: 'Điều khiển khủng long nhảy qua chướng ngại vật trong trò chơi chạy vô tận này.',
      image: 'dinorun.jpg',
      category: 'action'
    },
    {
      id: 'pacman',
      title: 'Pac-Man',
      description: 'Điều khiển Pac-Man ăn tất cả các điểm trên bản đồ trong khi tránh các con ma.',
      image: 'pacman.jpg',
      category: 'action'
    }
  ];

  // Danh sách các danh mục
  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'board', name: 'Trò chơi bàn cờ' },
    { id: 'puzzle', name: 'Câu đố' },
    { id: 'action', name: 'Hành động' },
    { id: 'strategy', name: 'Chiến thuật' },
    { id: 'multiplayer', name: 'Nhiều người chơi' },
    { id: 'classic', name: 'Trò chơi cổ điển' }
  ];

  const [activeCategory, setActiveCategory] = React.useState('all');

  const filteredGames = activeCategory === 'all' 
    ? games 
    : games.filter(game => game.category === activeCategory);

  return (
    <GamesContainer>
      <PageTitle>Tất cả trò chơi</PageTitle>
      
      <CategoryFilter>
        <FilterTitle>Lọc theo danh mục:</FilterTitle>
        <FilterOptions>
          {categories.map(category => (
            <FilterButton 
              key={category.id}
              active={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </FilterButton>
          ))}
        </FilterOptions>
      </CategoryFilter>
      
      <GameGrid>
        {filteredGames.map(game => (
          <GameCard key={game.id} to={`/games/${game.id}`}>
            <GameImage>{game.title}</GameImage>
            <GameInfo>
              <GameTitle>{game.title}</GameTitle>
              <GameDescription>{game.description}</GameDescription>
            </GameInfo>
          </GameCard>
        ))}
      </GameGrid>
    </GamesContainer>
  );
};

export default Games;