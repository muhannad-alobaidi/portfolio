import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './components';
import Particals from './components/extaras/Skynight';
import ScrollExperience from './components/ScrollExperience';
import SplashScreen from './components/SplashScreen';

function App() {
  return (
    <BrowserRouter>
      <div className="relative z-0 grey-gradient">
        <Particals />
        <Navbar />
        <ScrollExperience />
        <SplashScreen />
      </div>
    </BrowserRouter>
  );
}

export default App;
