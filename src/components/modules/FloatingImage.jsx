/* eslint-disable no-constant-condition */
/* eslint-disable react/prop-types */
import { useState, useRef } from 'react';
import { useSpring, animated } from 'react-spring';

function FloatingImage({ src }) {
  const [velocity, setVelocity] = useState({
    dx: (Math.random() - 0.5) * 20,
    dy: (Math.random() - 0.5) * 20,
  });

  const [position, setPosition] = useState({
    x: Math.random() * 400,
    y: Math.random() * 400,
  });

  const imgRef = useRef(null);

  const { x, y } = useSpring({
    from: { x: position.x, y: position.y },
    to: async next => {
      while (1) {
        let newX = position.x + velocity.dx;
        let newY = position.y + velocity.dy;

        if (newX < 0 || newX + (imgRef.current?.offsetWidth || 0) > 500) {
          setVelocity(v => ({ dy: v.dy, dx: -v.dx }));
        } else if (
          newY < 0 ||
          newY + (imgRef.current?.offsetHeight || 0) > 500
        ) {
          setVelocity(v => ({ dx: v.dx, dy: -v.dy }));
        } else {
          setPosition({ x: newX, y: newY });
          await next({ x: newX, y: newY });
        }
      }
    },
    config: { tension: 280, friction: 10 },
  });

  return (
    <animated.img
      ref={imgRef}
      src={src}
      alt="Floating"
      style={{
        position: 'absolute',
        left: x.interpolate(x => `${x}px`),
        top: y.interpolate(y => `${y}px`),
      }}
    />
  );
}

export default FloatingImage;
