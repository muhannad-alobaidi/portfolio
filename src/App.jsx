import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
// imported directly, NOT via components/index.js: that barrel pulled in
// ComputersCanvas -> Muha2 (the whole workstation scene) on a Navbar import,
// which landed the heavy scene in the entry chunk and made ScrollExperience's
// lazy() split a no-op
import Navbar from './components/Navbar';
import Particals from './components/extaras/Skynight';
import ScrollExperience from './components/ScrollExperience';
import SectionNav from './components/SectionNav';
import SplashScreen from './components/SplashScreen';
import { preloadScenes } from './utils/preloadScenes';

function App() {
  // start warming the workstation chunk + models straight away; the fetches
  // themselves wait for the first renderer (see preloadScenes)
  useEffect(() => {
    preloadScenes();
  }, []);

  return (
    <BrowserRouter>
      <div className="relative z-0 grey-gradient">
        <Particals />
        <Navbar />
        <SectionNav />
        <ScrollExperience />
        <SplashScreen />
      </div>
    </BrowserRouter>
  );
}

export default App;
