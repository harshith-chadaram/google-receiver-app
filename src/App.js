import logo from './logo.svg';
import './App.css';
import { useEffect } from 'react';
import axios from 'axios';
import Loader from './components/Loader/loader';
import { CastProvider } from './context/cast-context';
import SpectrumPlayer from './components/SpectrumPlayer/spectrum-player';
function App() {

  return (
    <div className="App">
      <CastProvider>
        <SpectrumPlayer />
      </CastProvider>
    </div>
  );
}

export default App;
