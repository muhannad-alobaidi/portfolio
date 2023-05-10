import { Html, useProgress } from '@react-three/drei';

const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html>
      <p
        style={{
          fontSize: 14,
          color: '#f1f1f1',
          fontWeight: 800,
        }}
      >
        {progress.toFixed(2)}%
      </p>
      <div
        className="canavas-load"
        style={{
          height: '5px',
          width: '100%',
        }}
      >
        <div
          style={{
            height: '100%',
            background: '#f2f2f2',
            width: `${progress}%`,
          }}
        />
      </div>
    </Html>
  );
};

export default Loader;
