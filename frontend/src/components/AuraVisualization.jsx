import React, { useRef } from "react";
import Sketch from "react-p5";

const AuraVisualization = ({ sentiment = 0, keywords = [] }) => {
  const particles = useRef([]);
  const connections = useRef([]);
  const time = useRef(0);
  const offset = useRef(Math.random() * 1000);
  
  const particleCount = 1200;
  const maxDist = 80;

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.colorMode(p5.HSB, 360, 100, 100, 100);
    p5.smooth();
    
    particles.current = [];
    for (let i = 0; i < particleCount; i++) {
      particles.current.push({
        x: p5.random(p5.width),
        y: p5.random(p5.height),
        vx: 0,
        vy: 0,
        speed: p5.random(0.4, 1.5),
        size: p5.random(1.5, 4),
        hueOffset: p5.random(360),
        layer: Math.floor(p5.random(3)), 
        angle: p5.random(p5.TWO_PI)
      });
    }
  };

  const draw = (p5) => {
    
    p5.fill(0, 0, 0, 30);
    p5.noStroke();
    p5.rect(0, 0, p5.width, p5.height);
    
    time.current += 0.008;
    const t = time.current;
    const noiseOff = offset.current;
    
    let hue, accent, sat, bright, scale, speed, turb;
    speed = p5.map(sentiment, -1, 1, 0.3, 2.0);
    
    if (sentiment < -0.3) {
      hue = 240; accent = 280; sat = 75; bright = 65;
      scale = 0.004; turb = 3.5;
    } else if (sentiment > 0.3) {
      hue = 35; accent = 15; sat = 90; bright = 80;
      scale = 0.0015; turb = 1.2;
    } else {
      hue = 180; accent = 200; sat = 70; bright = 72;
      scale = 0.003; turb = 2.0;
    }
    
    
    p5.noFill();
    for (let layer = 0; layer < 8; layer++) {
      p5.beginShape();
      const waveY = p5.height * (0.15 + layer * 0.12);
      const layerHue = (hue + layer * 12) % 360;
      const layerAlpha = 6 - layer * 0.5;
      
      for (let x = 0; x <= p5.width; x += 8) {
        const n1 = p5.noise(x * 0.003, waveY * 0.002, t * 0.4 + layer * 0.5 + noiseOff);
        const n2 = p5.noise(x * 0.008, waveY * 0.005, t * 0.2 + layer + noiseOff);
        const y = waveY + p5.sin(x * 0.008 + t * 1.5 + layer) * 40 * n1 + p5.cos(x * 0.015 + t) * 20 * n2;
        
        p5.stroke(layerHue, sat - 15, bright - 5, layerAlpha);
        p5.strokeWeight(1.5);
        p5.vertex(x, y);
      }
      p5.endShape();
    }
    
    
    connections.current = [];
    
    for (let i = 0; i < particles.current.length; i++) {
      const particle = particles.current[i];
      
      
      const n1 = p5.noise(
        particle.x * scale,
        particle.y * scale,
        t * 0.5 + noiseOff
      );
      const n2 = p5.noise(
        particle.x * scale * 2.5,
        particle.y * scale * 2.5,
        t * 0.3 + noiseOff + 100
      ) * 0.5;
      
      const noiseValue = n1 + n2;
      const angle = noiseValue * p5.TWO_PI * turb;
      
      const force = 0.08 * speed;
      particle.vx += p5.cos(angle) * force;
      particle.vy += p5.sin(angle) * force;
      
      particle.vx *= 0.92;
      particle.vy *= 0.92;
      
      particle.x += particle.vx * particle.speed;
      particle.y += particle.vy * particle.speed;
      particle.angle = p5.atan2(particle.vy, particle.vx);
      
      if (particle.x < -20) particle.x = p5.width + 20;
      if (particle.x > p5.width + 20) particle.x = -20;
      if (particle.y < -20) particle.y = p5.height + 20;
      if (particle.y > p5.height + 20) particle.y = -20;
      
      for (let j = i + 1; j < particles.current.length; j++) {
        const other = particles.current[j];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < maxDist && connections.current.length < 150) {
          connections.current.push({ p1: particle, p2: other, dist });
        }
      }
    }
    
    
    for (const conn of connections.current) {
      const alpha = p5.map(conn.dist, 0, maxDist, 12, 0);
      const connHue = (hue + 20) % 360;
      
      p5.stroke(connHue, sat + 10, bright + 10, alpha);
      p5.strokeWeight(0.8);
      p5.line(conn.p1.x, conn.p1.y, conn.p2.x, conn.p2.y);
    }
    
    
    for (const particle of particles.current) {
      const velocity = p5.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      const particleHue = (hue + particle.hueOffset * 0.08 + velocity * 25) % 360;
      const velBright = p5.map(velocity, 0, 2, -8, 15);
      const layerBright = bright + velBright + particle.layer * 3;
      
      p5.noStroke();
      p5.fill(particleHue, sat - 20, layerBright - 10, 8);
      p5.circle(particle.x, particle.y, particle.size * 3);
      
      p5.fill(particleHue, sat, layerBright, 15);
      p5.circle(particle.x, particle.y, particle.size * 1.8);
      
      p5.fill(accent, sat + 15, Math.min(95, layerBright + 20), 35);
      p5.circle(particle.x, particle.y, particle.size);
    }
    
    
    if (keywords && keywords.length > 0) {
      for (let k = 0; k < Math.min(keywords.length, 3); k++) {
        const centerX = p5.width * (0.2 + k * 0.3);
        const centerY = p5.height * 0.5 + p5.sin(t * 2 + k * 2) * 60;
        const pulse = (p5.sin(t * 3 + k * 1.5) * 0.5 + 0.5);
        
        
        for (let ring = 0; ring < 4; ring++) {
          const ringSize = (30 + ring * 25) * (1 + pulse * 0.4);
          const ringAlpha = (15 - ring * 3) * pulse;
          const ringHue = (accent + k * 40 + ring * 8) % 360;
          
          p5.noFill();
          p5.stroke(ringHue, sat + 20, bright + 15, ringAlpha);
          p5.strokeWeight(2 - ring * 0.3);
          p5.circle(centerX, centerY, ringSize);
        }
        
        
        p5.noStroke();
        p5.fill(accent + k * 40, sat + 25, 95, 25 * pulse);
        p5.circle(centerX, centerY, 12 + pulse * 6);
      }
    }
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    particles.current = [];
    for (let i = 0; i < particleCount; i++) {
      particles.current.push({
        x: p5.random(p5.width),
        y: p5.random(p5.height),
        vx: 0,
        vy: 0,
        speed: p5.random(0.4, 1.5),
        size: p5.random(1.5, 4),
        hueOffset: p5.random(360),
        layer: Math.floor(p5.random(3)),
        angle: p5.random(p5.TWO_PI)
      });
    }
  };

  return (
    <div style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      width: "100%", 
      height: "100%", 
      zIndex: 0,
      background: "#000000"
    }}>
      <Sketch setup={setup} draw={draw} windowResized={windowResized} />
    </div>
  );
};

export default AuraVisualization;
