
import { useEffect } from 'react';
import useClickAnimation from '../hooks/useClickAnimation';
import useSendGameMessage from "../hooks/useSendGameMessage"
import usePageAssets from "../hooks/usePageAssets";

const cfg = (typeof window !== 'undefined' && window.gameConfig) ? window.gameConfig : {};

// 取得目前的遊戲模式，若沒設定則預設為 matching
const gameMode = cfg.settings?.gameMode || 'matching';
const modeImages = cfg.images?.[gameMode] || {};
const modeAssets = cfg.assets?.[gameMode] || [];

const InstructionsPage = ({ navigateTo, backgroundImage }) => {
  const { buttonScale,setScale, handleClickAnimation }=useClickAnimation(()=>navigateTo('cards'))
  const { sendMessage }=useSendGameMessage()
  const pageAssets = usePageAssets(modeAssets, 2);
  
  useEffect(() => {
    // 當這一頁載入時，立刻通知外層
    sendMessage({ sceneId: 2});
  }, [sendMessage]);

  const pageStyle = { 
    backgroundImage: `url(${backgroundImage})`,
    width:'1920px',
    height:'1080px',
    loading:'eager'
  };

  return (
    <div className="page-container" style={pageStyle}>
      <span className="sticker-text">How to play</span>
      <div className="instructions-text">
        <p>1. Players take turns matching two cards.</p>
        <p>2. Earn 1 point for each matching pair.</p>
        <p>3. Player with the most points wins.</p>
      </div>
      <div className="continue-button loop-animation">
        <button 
        onMouseEnter={() => setScale("continue",1.1)}
        onMouseLeave={() => setScale("continue",1)}
        style={{transform: `scale(${buttonScale.continue})`}}
        className="image-button" 
        onClick={() => handleClickAnimation("continue")}>
          <img src={modeImages?.btnNext || 'images/object/doodle_matching_next_button.png'} alt="Continue" />
        </button>
      </div>
      {pageAssets.map((asset, index) => (
        <div key={asset.id || index} style={asset.style}>
          {asset.text}
        </div>
      ))}
    </div>
  );
};

export default InstructionsPage;
