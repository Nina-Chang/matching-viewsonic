
import { useEffect } from "react";
import useClickAnimation from "../hooks/useClickAnimation"
import useSendGameMessage from "../hooks/useSendGameMessage"
import usePageAssets from "../hooks/usePageAssets";

const cfg = (typeof window !== 'undefined' && window.gameConfig) ? window.gameConfig : {};

// 取得目前的遊戲模式，若沒設定則預設為 matching
const gameMode = cfg.settings?.gameMode || 'matching';

const modeImages = cfg.images?.[gameMode] || {};
const modeStrings = cfg.strings?.[gameMode] || {};
const modeAssets = cfg.assets?.[gameMode] || [];

const StartPage = ({ onStartGame, backgroundImage }) => {
  const { buttonScale,setScale, handleClickAnimation }=useClickAnimation(onStartGame)
  const { sendMessage }=useSendGameMessage()
  const pageAssets = usePageAssets(modeAssets, 1);

  useEffect(() => {
    // 當這一頁載入時，立刻通知外層：我現在是第 1 號場景
    sendMessage({ sceneId: 1});
  }, [sendMessage]);

  const pageStyle = { 
    backgroundImage: `url(${backgroundImage})`,
    width:'1920px',
    height:'1080px',
    loading:'eager'
  };

  return (
    <div className="page-container start-page" style={pageStyle}>
      <div style={modeStrings.startTitle.style}>
        {modeStrings.startTitle.text}
      </div>
      {/* <h1 className='start-page-title'>{modeStrings.startTitle || 'Matching'}</h1> */}
      <button 
      className="image-button start-button-center" 
      onMouseEnter={() => setScale("start",1.1)}
      onMouseLeave={() => setScale("start",1)}
      style={{transform: `translate(-50%, -50%) scale(${buttonScale.start})`}}
      onClick={()=>{handleClickAnimation("start")}}>
        <img src={modeImages?.btnStart || 'images/start.png'} alt="Start Game" />
        <span className="start-button-text">Start</span>
      </button>
      {pageAssets.map((asset, index) => (
        <div key={asset.id || index} style={asset.style}>
          {asset.text}
        </div>
      ))}
    </div>
  );
};

export default StartPage;
