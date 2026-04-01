import './App.css';
import { useState, useLayoutEffect,useEffect, useRef,useMemo} from 'react';
import StartPage from './pages/StartPage';
import InstructionsPage from './pages/InstructionsPage';
import MatchingCardsPage from './pages/MatchingCardsPage';
import MemoryCardsPage from './pages/MemoryCardsPage';
import ScoresPage from './pages/ScoresPage';
import useGameMode from "./hooks/useGameMode"

const cfg = (typeof window !== 'undefined' && window.gameConfig) ? window.gameConfig : {};

function App() {
  const gameMode=useGameMode()
  const { modeImages, modePlayers, modeSounds } = useMemo(() => ({
    modeImages: cfg.images?.[gameMode] || {},
    modePlayers: cfg.players?.[gameMode] || [],
    modeSounds: cfg.sounds?.[gameMode] || {},
  }), [gameMode]);
  const backgroundImages = {
    start: modeImages?.bgStart || './images/background/doodle_matching_01_FHD.png',
    instructions: modeImages?.bgInstructions || './images/background/doodle_matching_02_FHD.png',
    cards: modeImages?.bgCards || './images/background/doodle_matching_03_FHD.png', 
    scores: modeImages?.bgScores || './images/background/doodle_matching_06_FHD.png',
  };
  const [page, setPage] = useState('start');
  const [players, setPlayers] = useState(modePlayers || []);
  const [scale, setScale] = useState(1);
  const audioRef=useRef(null)

  const navigateTo = (pageName) => setPage(pageName);

  const gameStyle = { 
    transform: `scale(${scale})`,
  };

  const handleStartGame=()=>{
    if(audioRef.current && audioRef.current.paused){
      audioRef.current.volume=0.1
      audioRef.current.loop = true;
      audioRef.current.currentTime = 0; // 從頭開始播放
      audioRef.current.play().catch((error)=>{
        console.log("Audio failed",error)
      })
    }
    navigateTo('instructions')
  }

  useEffect(() => {
    const startAudioContext = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.volume = 0.1;
        audioRef.current.loop = true;
        audioRef.current.play()
          .then(() => {
            window.removeEventListener('click', startAudioContext);
            window.removeEventListener('touchstart', startAudioContext);
          })
          .catch((error) => {
            console.log("Audio play failed:", error);
          });
      }
    };

    window.addEventListener('click', startAudioContext);
    window.addEventListener('touchstart', startAudioContext);

    return () => {
      window.removeEventListener('click', startAudioContext);
      window.removeEventListener('touchstart', startAudioContext);
    };
  }, []);

  useLayoutEffect(() => {
    // 視窗縮放
    const handleResize = () => {
      if (window.innerWidth === 0) return;
      const scaleX = window.innerWidth / 1920;
      const scaleY = window.innerHeight / 1080;
      setScale(Math.min(scaleX, scaleY));
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    
    return () => {
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="game-viewport">
      <div style={gameStyle}>
        {/* 場景1 */}
        {page === 'start' && (<StartPage navigateTo={navigateTo} onStartGame={handleStartGame} backgroundImage={backgroundImages.start}/>)}
        {/* 場景2 */}
        {page === 'instructions' && (<InstructionsPage navigateTo={navigateTo} backgroundImage={backgroundImages.instructions}/>)}
        {/* 場景3 */}
        {(page === 'cards'&&gameMode==="matching") && (<MatchingCardsPage bgmAudio={audioRef.current} navigateTo={navigateTo} players={players} setPlayers={setPlayers} backgroundImage={backgroundImages.cards}/>)}
        {(page === 'cards'&&gameMode==="memory") && (<MemoryCardsPage bgmAudio={audioRef.current} navigateTo={navigateTo} players={players} setPlayers={setPlayers} backgroundImage={backgroundImages.cards}/>)}
        {/* 場景4 */}
        {page === 'scores' && (<ScoresPage players={players} setPlayers={setPlayers} bgmAudio={audioRef.current} navigateTo={navigateTo} backgroundImage={backgroundImages.scores}/>)}
      </div>

      <audio ref={audioRef} src={modeSounds?.bgm || './sounds/funny-cartoon-no-copyright-music.mp3'} loop preload='auto'/>
    </div>
  );
}

export default App;
