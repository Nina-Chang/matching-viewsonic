import React, { useEffect,useMemo} from 'react';
import useClickAnimation from "../hooks/useClickAnimation"
import useSendGameMessage from "../hooks/useSendGameMessage"
import usePageAssets from "../hooks/usePageAssets";
import useGameMode from "../hooks/useGameMode";

const cfg = (typeof window !== 'undefined' && window.gameConfig) ? window.gameConfig : {};


const ScoresPage = ({ players,setPlayers,bgmAudio, navigateTo, backgroundImage }) => {
  const gameMode=useGameMode()
  const { modeImages,modeStrings, modePlayers, modeSounds,modeAssets } = useMemo(() => ({
    modeImages: cfg.images?.[gameMode] || {},
    modeStrings : cfg.strings?.[gameMode] || {},
    modePlayers: cfg.players?.[gameMode] || [],
    modeSounds: cfg.sounds?.[gameMode] || {},
    modeAssets : cfg.assets?.[gameMode] || [],
  }), [gameMode]);
  const { buttonScale,setScale, handleClickAnimation }=useClickAnimation((key) => handleAfterClickingButton(key))
  const { sendMessage }=useSendGameMessage()
  const pageAssets = usePageAssets(modeAssets, 4);
  
  useEffect(() => {
    // 當這一頁載入時，立刻通知外層
    sendMessage({ sceneId: 4});
  }, [sendMessage]);

  const pageStyle = { 
    backgroundImage: `url(${backgroundImage})`,
    width:'1920px',
    height:'1080px',
    loading:'eager'
  };

  // 分數排序
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  useEffect(() => {
    if(bgmAudio && !bgmAudio.paused){
      bgmAudio.pause();
    }
    const audioPlayer =new Audio(modeSounds.congrats || './sounds/congrats.mp3');
    audioPlayer.volume=0.316;
    audioPlayer.play().catch((error)=>{console.log("Audio failed",error)});
  }, []);

  const handleAfterClickingButton=(key)=>{
    const destination=key==="home"?"start":"cards"
    navigateTo(destination)
    setPlayers(modePlayers || []);
  }

  return (
    <div className="page-container" style={pageStyle}>
      <img className="scores-frame" src={'images/object/doodle_matching_result_frame.png'} alt="Result Frame" />
      <div style={modeStrings.scoresTitle.style} className="scores-title">
        {modeStrings.scoresTitle.text}
      </div>
      <ol className="scores-list">
        {sortedPlayers.map((player) => (
          <li key={player.id}>
            <img src={(modeImages?.finchPlayers?.[player.id-1]) || `images/object/doodle_matching_finch_0${player.id}.png`} alt={player.name} />
            <img className="score-item-frame" src={"images/object/doodle_matching_point_frame.png"} alt={"point frame"} />
            <span>{player.score}</span>
            {sortedPlayers[0].score === player.score && player.score !== 0 && (
              <img className='trophy-img' src={modeImages?.trophy || 'images/stage_jeopardy_trophy.png'} alt='Champion' />
            )}
          </li>
        ))}
      </ol>
      <div className="scores-buttons-container">
        <button className="image-button" 
        onMouseEnter={() => setScale("home",1.1)}
        onMouseLeave={() => setScale("home",1)}
        style={{transform: `scale(${buttonScale.home})`}}
        onClick={()=>handleClickAnimation("home")}>
          <img src={modeImages?.btnHome || 'images/object/doodle_matching_home_button.png'} alt="Back to Home" />
        </button>
        <button className="image-button" 
        onMouseEnter={() => setScale("again",1.1)}
        onMouseLeave={() => setScale("again",1)}
        style={{transform: `scale(${buttonScale.again})`}}
        onClick={()=>handleClickAnimation("again")}>
          <img src={modeImages?.btnAgain || 'images/object/doodle_matching_again_button.png'} alt="Reset Scores" />
        </button>
      </div>
      {pageAssets.map((asset) => (
        <div key={asset.RawId || asset.id} style={asset.style}>
            {asset.Type === 'Text' ? 
            (
                asset.displayContent
            ) 
            : (
                <img 
                    src={asset.displayContent} 
                    alt="game-asset" 
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain',
                        display: 'block' 
                    }} 
                />
            )}
        </div>
      ))}
    </div>
  );
};

export default ScoresPage;
