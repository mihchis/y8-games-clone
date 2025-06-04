import React, { useEffect, useRef } from 'react';
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

const CanvasArea = styled.div`
  width: 800px;
  height: 600px;
  border: 2px solid #333;
  margin-bottom: 2rem;
  position: relative;
`;

const DemoQuest: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Đảm bảo rằng canvasRef đã được gán
    if (!canvasRef.current) return;

    // Tạo script element để load các file JS cần thiết
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(script);
      });
    };

    // Tạo link element để load CSS
    const loadCSS = (href: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
        document.head.appendChild(link);
      });
    };

    // Đường dẫn tới các file JS và CSS
    const basePath = process.env.PUBLIC_URL + '/games/demoquest-main';
    const jsPath = `${basePath}/js`;
    const cssPath = `${basePath}/css`;

    // Load các file cần thiết
    const loadResources = async () => {
      try {
        // Thiết lập đường dẫn cơ sở cho media
        window.DEMOQUEST_MEDIA_BASE_PATH = basePath;
        
        // Load CSS
        await loadCSS(`${cssPath}/style.css`);

        // Load JS theo thứ tự
        await loadScript(`${jsPath}/contrib/pixi.min.js`);
        await loadScript(`${jsPath}/contrib/sound.js`);
        await loadScript(`${jsPath}/demoquest.js`);

        // Khởi tạo game
        if (window.demoquest && canvasRef.current) {
          window.demoquest.configure(canvasRef.current);
          window.demoquest.resize();

          // Xử lý sự kiện resize
          const handleResize = () => {
            if (window.demoquest) {
              window.demoquest.resize();
            }
          };

          window.addEventListener('resize', handleResize);

          // Cleanup khi component unmount
          return () => {
            window.removeEventListener('resize', handleResize);
          };
        }
      } catch (error) {
        console.error('Failed to load DemoQuest resources:', error);
      }
    };

    loadResources();
  }, []);

  return (
    <GameContainer>
      <GameTitle>DemoQuest</GameTitle>
      
      <GameInfo>
        <GameDescription>
          DemoQuest là một game phiêu lưu với hiệu ứng cuộn parallax. Khám phá thế giới và giải quyết các câu đố trong hành trình của bạn.
        </GameDescription>
      </GameInfo>
      
      <CanvasArea id="canvas_area" ref={canvasRef} />
    </GameContainer>
  );
};

// Thêm định nghĩa cho window.demoquest và DEMOQUEST_MEDIA_BASE_PATH
declare global {
  interface Window {
    demoquest?: {
      configure: (element: HTMLElement) => void;
      resize: () => void;
    };
    DEMOQUEST_MEDIA_BASE_PATH?: string;
  }
}

export default DemoQuest;