import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { isLowPower } from '../../utils/device';

const Particals = () => {
  const [init, setInit] = useState(false);
  // this starfield is always mounted behind the WebGL scenes, so keep it
  // cheap: fewer stars and a 60fps cap on phones / low-power GPUs
  const lowPower = isLowPower();

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
        fpsLimit: lowPower ? 60 : 120,
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
            value: lowPower ? 28 : 60,
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
