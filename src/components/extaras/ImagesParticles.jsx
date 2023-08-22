import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import { useCallback } from 'react';

const Particals = () => {
  const particlesInit = useCallback(async engine => {
    console.log(engine);
    // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    //await loadFull(engine);
    await loadSlim(engine);
  }, []);
  const particlesLoaded = useCallback(async container => {
    console.log(container);
  }, []);

  return (
    <>
      <Particles
        className=" relative w-[100%]"
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          fullScreen: {
            enable: false,
            zIndex: 0,
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onclick: {
                enable: true,
                mode: 'push',
              },
            },
            modes: {
              push: {
                particles_nb: 1,
              },
            },
          },
          particles: {
            number: {
              value: 8,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            line_linked: {
              enable: false,
            },
            move: {
              speed: 1,
              out_mode: 'out',
            },
            shape: {
              type: ['image', 'circle'],
              image: [
                {
                  src: '/react.cd2ab268.svg',
                  height: 20,
                  width: 23,
                },
                {
                  src: '/k8s.2d579d24.svg',
                  height: 20,
                  width: 20,
                },
                {
                  src: '/code.b3b4c4f4.png',
                  height: 20,
                  width: 20,
                },
              ],
            },
            color: {
              value: '#CCC',
            },
            size: {
              value: 30,
              random: false,
              anim: {
                enable: true,
                speed: 4,
                size_min: 10,
                sync: false,
              },
            },
          },

          detectRetina: true,
        }}
      />
    </>
  );
};

export default Particals;
