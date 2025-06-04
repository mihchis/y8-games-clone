import React from 'react';
import styled from 'styled-components';

const AboutContainer = styled.div`
  padding: 2rem 0;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
  border-bottom: 2px solid #ffcc00;
  padding-bottom: 0.5rem;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #444;
`;

const Paragraph = styled.p`
  line-height: 1.6;
  margin-bottom: 1rem;
  color: #555;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const TeamMember = styled.div`
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
`;

const MemberAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #ddd;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #555;
`;

const MemberName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
`;

const MemberRole = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
`;

const About: React.FC = () => {
  // Mảng thành viên mẫu
  const team = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      role: 'Nhà phát triển',
      avatar: 'avatar1.jpg'
    },
    {
      id: 2,
      name: 'Trần Thị B',
      role: 'Nhà thiết kế',
      avatar: 'avatar2.jpg'
    },
    {
      id: 3,
      name: 'Lê Văn C',
      role: 'Quản lý dự án',
      avatar: 'avatar3.jpg'
    }
  ];

  return (
    <AboutContainer>
      <PageTitle>Về chúng tôi</PageTitle>
      
      <Section>
        <SectionTitle>Sứ mệnh của chúng tôi</SectionTitle>
        <Paragraph>
          Y8 Games Clone là một nền tảng trò chơi trực tuyến miễn phí, cung cấp các trò chơi đa dạng và thú vị cho người chơi ở mọi lứa tuổi. Chúng tôi tin rằng trò chơi không chỉ là giải trí mà còn là cách để kết nối mọi người, phát triển kỹ năng và tạo ra những khoảnh khắc vui vẻ.
        </Paragraph>
        <Paragraph>
          Mục tiêu của chúng tôi là tạo ra một cộng đồng trò chơi lành mạnh, nơi mọi người có thể thư giãn, học hỏi và tận hưởng thời gian của họ một cách có ý nghĩa.
        </Paragraph>
      </Section>
      
      <Section>
        <SectionTitle>Lịch sử</SectionTitle>
        <Paragraph>
          Y8 Games Clone được thành lập vào năm 2023 bởi một nhóm những người đam mê trò chơi. Chúng tôi bắt đầu với một vài trò chơi đơn giản và dần phát triển thành một nền tảng đa dạng với nhiều thể loại trò chơi khác nhau.
        </Paragraph>
        <Paragraph>
          Chúng tôi liên tục cải tiến và mở rộng danh mục trò chơi của mình để đáp ứng nhu cầu và sở thích của người chơi.
        </Paragraph>
      </Section>
      
      <Section>
        <SectionTitle>Đội ngũ của chúng tôi</SectionTitle>
        <Paragraph>
          Chúng tôi là một nhóm những người đam mê công nghệ và trò chơi, cam kết mang đến trải nghiệm chơi game tốt nhất cho người dùng.
        </Paragraph>
        
        <TeamGrid>
          {team.map(member => (
            <TeamMember key={member.id}>
              <MemberAvatar>{member.name.charAt(0)}</MemberAvatar>
              <MemberName>{member.name}</MemberName>
              <MemberRole>{member.role}</MemberRole>
            </TeamMember>
          ))}
        </TeamGrid>
      </Section>
    </AboutContainer>
  );
};

export default About;