import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HomeContainer = styled.div`
  padding: 2rem 0;
`;

const Hero = styled.div`
  background-color: #ffcc00;
  padding: 3rem 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #555;
`;

const Button = styled(Link)`
  background-color: #333;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #555;
  }
`;

const GamesSection = styled.section`
  margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
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
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
  }
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

const Home: React.FC = () => {
  // Mảng trò chơi mẫu
  const games = [
    {
      id: 'reversi',
      title: 'Cờ Lật (Reversi/Othello)',
      description: 'Trò chơi chiến thuật cổ điển với luật chơi đơn giản nhưng sâu sắc.',
      image: 'reversi.jpg'
    },
    {
      id: 'tetris',
      title: 'Tetris',
      description: 'Trò chơi xếp hình kinh điển, thử thách kỹ năng và tốc độ của bạn.',
      image: 'tetris.jpg'
    },
    {
      id: 'snake',
      title: 'Rắn Săn Mồi',
      description: 'Điều khiển con rắn ăn thức ăn và phát triển dài hơn, nhưng đừng đâm vào chính mình!',
      image: 'snake.jpg'
    },
    {
      id: 'demoquest',
      title: 'DemoQuest',
      description: 'Game phiêu lưu với hiệu ứng cuộn parallax. Khám phá thế giới và giải quyết các câu đố.',
      image: 'demoquest-preview.svg'
    },
    {
      id: 'puzzle',
      title: 'Ghép Hình',
      description: 'Thử thách trí tuệ với các câu đố ghép hình đầy màu sắc và thú vị.',
      image: 'puzzle.jpg'
    }
  ];

  return (
    <HomeContainer>
      <Hero>
        <HeroTitle>Chào mừng đến với Y8 Games Clone</HeroTitle>
        <HeroSubtitle>Khám phá và chơi các trò chơi trực tuyến miễn phí</HeroSubtitle>
        <Button to="/games">Xem tất cả trò chơi</Button>
      </Hero>
      
      <GamesSection>
        <SectionTitle>Trò chơi nổi bật</SectionTitle>
        <GameGrid>
          {games.map(game => (
            <GameCard key={game.id} to={`/games/${game.id}`}>
              <GameImage>
                <img src={`/${game.image}`} alt={game.title} />
                {!game.image && game.title}
              </GameImage>
              <GameInfo>
                <GameTitle>{game.title}</GameTitle>
                <GameDescription>{game.description}</GameDescription>
              </GameInfo>
            </GameCard>
          ))}
        </GameGrid>
      </GamesSection>
    </HomeContainer>
  );
};

export default Home;