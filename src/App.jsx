import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './components';
import Particals from './components/extaras/Skynight';
import ScrollExperience from './components/ScrollExperience';

function App() {
  return (
    <BrowserRouter>
      <div className="relative z-0 grey-gradient">
        <Particals />
        <Navbar />
        <ScrollExperience />
      </div>
    </BrowserRouter>
  );
}

export default App;
