import React, { useEffect, useRef } from 'react';

const StarryBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Star properties
    const starCount = 500;
    interface Star {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      speed: number;
    }

    const stars: Star[] = [];

    // Initialize stars
    const initStars = () => {
      stars.length = 0;
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5,
          opacity: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
          speed: Math.random() * 0.5 + 0.2 // 0.2 to 0.7
        });
      }
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initStars();
    };

    window.addEventListener('resize', handleResize);
    
    // Initial setup
    handleResize();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Radial Gradient Background
      // Center: rgba(0,10,30,0.3) -> Edge: rgba(0,0,10,0.9)
      const radius = Math.max(width, height);
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, radius);
      gradient.addColorStop(0, 'rgba(0, 10, 30, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 10, 0.9)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw and Move Stars
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        // Update position
        star.y += star.speed;

        // Reset if out of bottom
        if (star.y > height) {
          star.y = -5; // Start just above
          star.x = Math.random() * width; // New random X
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none', // Ensure it doesn't block interactions
      }}
    />
  );
};

export default StarryBackground;
