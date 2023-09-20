/* eslint-disable no-unused-vars */
import { BrowserRouter } from 'react-router-dom';
import {
  About,
  Contact,
  Experience,
  Feedbacks,
  Hero,
  Navbar,
  Tech,
  Works,
  StarsCanvas,
} from './components';
import Particals from './components/extaras/Skynight';

function App() {
  return (
    <BrowserRouter>
      <div className="relative z-0 grey-gradient">
        <Particals />
        <div className="bg-hero-pattren bg-cover bg-no-repeat bg-center">
          <Navbar />
          <Hero />
        </div>
        <About />
        <Tech />
        <Experience />
        <Works />
        {/*  <Feedbacks /> */}
        <div className="relative z-0">
          {/*  <StarsCanvas /> */}
          <Contact />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
