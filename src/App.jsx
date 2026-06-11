import { BrowserRouter } from 'react-router-dom';
import { Hero, Navbar } from './components';
import Particals from './components/extaras/Skynight';
import BrainSection from './components/brain/BrainSection';

function App() {
  return (
    <BrowserRouter>
      <div className="relative z-0 grey-gradient pb-20">
        <Particals />
        <div>
          <Navbar />
          <Hero />
        </div>
        <BrainSection />
      </div>
    </BrowserRouter>
  );
}

export default App;
