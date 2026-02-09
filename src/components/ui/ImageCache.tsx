import React, { useEffect } from 'react';

// Import New Player Images
import player0 from '@/assets/vip-final/players/vip0.webp';
import player1 from '@/assets/vip-final/players/vip1_new.webp';
import player2 from '@/assets/vip-final/players/vip2.webp';
import player3 from '@/assets/vip-final/players/vip3.webp';
import player4 from '@/assets/vip-final/players/vip4.webp';
import player5 from '@/assets/vip-final/players/vip5.webp';
import stadiumBg from '@/assets/vip-final/stadium-bg.jpg';

const imagesToCache = [
  player0, player1, player2, player3, player4, player5, stadiumBg
];

/**
 * This component preloads and keeps images in the DOM but hidden,
 * ensuring they are cached by the browser and never unmounted
 * during the entire session.
 */
export const ImageCache = () => {
  useEffect(() => {
    // Standard browser preloading
    imagesToCache.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <div 
      id="image-cache-container" 
      style={{ 
        position: 'fixed', 
        width: 0, 
        height: 0, 
        overflow: 'hidden', 
        opacity: 0, 
        pointerEvents: 'none',
        zIndex: -9999 
      }}
      aria-hidden="true"
    >
      {imagesToCache.map((src, index) => (
        <img key={index} src={src} alt="" />
      ))}
    </div>
  );
};
