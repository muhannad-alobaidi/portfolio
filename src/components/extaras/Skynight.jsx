import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const Particals = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async engine => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      options={{
        fpsLimit: 120,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: 'push',
            },
          },
          modes: {
            push: {
              quantity: 1,
            },
          },
        },
        particles: {
          number: {
            value: 60,
            density: {
              enable: true,
              area: 1500,
            },
          },
          links: {
            enable: true,
            opacity: 0.02,
          },
          move: {
            direction: 'right',
            enable: true,
            speed: 0.05,
          },
          size: {
            value: 1,
          },
          opacity: {
            value: { min: 0.05, max: 1 },
            animation: {
              enable: true,
              speed: 1,
              sync: false,
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default Particals;
