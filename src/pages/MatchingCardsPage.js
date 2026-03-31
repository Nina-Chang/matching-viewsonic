import React, { useCallback, useEffect, useState, useMemo } from 'react';
import useClickAnimation from '../hooks/useClickAnimation';
import useSendGameMessage from "../hooks/useSendGameMessage"
import usePageAssets from "../hooks/usePageAssets";
import styled from 'styled-components';

const cfg = (typeof window !== 'undefined' && window.gameConfig) ? window.gameConfig : {};

const gameMode = 'matching';

const modeSound = cfg.sounds?.[gameMode] || {};
const modeQuestions = cfg.questions?.[gameMode] || [];
const modeAssets = cfg.assets?.[gameMode] || [];

const CardsContainerGrid = styled.div`
  width: 1655px;
  height: 671px;
  margin-top: 20px;
  display: grid;
  justify-content: center;
  align-content: center;
  position: relative;
  left: 50%;
  transform: translateX(-50%);

  ${({ pairCount }) => {
    // 3-7 pairs: 2 rows, 211px width, 16px gap
    if (pairCount >= 3 && pairCount <= 7) {
      return `
        grid-template-columns: repeat(${pairCount}, 211px);
        grid-template-rows: repeat(2, 218px);
        gap: 16px;
      `;
    }

    // 8 pairs: 2 rows, 211px width, 0px gap
    if (pairCount === 8) {
      return `
        grid-template-columns: repeat(8, 211px);
        grid-template-rows: repeat(2, 218px);
        gap: 0px;
      `;
    }

    // 9 pairs: 6 cols × 198px, 3 rows, 16px gap
    if (pairCount === 9) {
      return `
        grid-template-columns: repeat(6, 198px);
        grid-template-rows: repeat(3, 205px);
        gap: 16px;
      `;
    }

    // 10-12 pairs: 8 cols × 198px, 3 rows, 10px gap
    if (pairCount >= 10 && pairCount <= 12) {
      return `
        grid-template-columns: repeat(8, 198px);
        grid-template-rows: repeat(3, 205px);
        gap: 10px;
      `;
    }

    // 13-14 pairs: 7 cols × 147px, 4 rows, 18px/20px gaps
    if (pairCount >= 13 && pairCount <= 14) {
      return `
        grid-template-columns: repeat(7, 147px);
        grid-template-rows: repeat(4, 152px);
        grid-row-gap: 18px;
        grid-column-gap: 20px;
      `;
    }

    // 15-16 pairs: 8 cols × 147px, 4 rows, 18px/20px gaps
    if (pairCount >= 15 && pairCount <= 16) {
      return `
        grid-template-columns: repeat(8, 147px);
        grid-template-rows: repeat(4, 152px);
        grid-row-gap: 18px;
        grid-column-gap: 20px;
      `;
    }

    // 17-18 pairs: 9 cols × 147px, 4 rows, 18px/20px gaps
    if (pairCount >= 17 && pairCount <= 18) {
      return `
        grid-template-columns: repeat(9, 147px);
        grid-template-rows: repeat(4, 152px);
        grid-row-gap: 18px;
        grid-column-gap: 20px;
      `;
    }

    // 19-20 pairs: 10 cols × 147px, 4 rows, 18px/20px gaps
    if (pairCount >= 19 && pairCount <= 20) {
      return `
        grid-template-columns: repeat(10, 147px);
        grid-template-rows: repeat(4, 152px);
        grid-row-gap: 18px;
        grid-column-gap: 20px;
      `;
    }

    // Default for 1-2 pairs
    return `
      grid-template-columns: repeat(12, 147px);
      grid-template-rows: repeat(4, 152px);
      grid-row-gap: 18px;
      grid-column-gap: 20px;
    `;
  }}
`;


const CardFrame = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-origin: center;

  ${({ pairCount }) => {
    if (pairCount >= 13) {
      return `
        transform: scale(0.8);
        width: 135%;
        height: 135%;
        margin-top: -24px;
        margin-left: -20px;
        ${pairCount === 13 ? '&:nth-child(22) { grid-column-start: 2; }' : ''}
        ${pairCount === 15 ? '&:nth-child(25) { grid-column-start: 2; }' : ''}
        ${pairCount === 17 ? '&:nth-child(28) { grid-column-start: 2; }' : ''}
        ${pairCount === 19 ? '&:nth-child(31) { grid-column-start: 2; }' : ''}
      `;
    }
    
    if (pairCount === 10) {
      return `
        width: 100%;
        height: 100%;
        &:nth-child(17) { grid-column-start: 3; }
      `;
    }
    
    if (pairCount === 11) {
      return `
        width: 100%;
        height: 100%;
        &:nth-child(17) { grid-column-start: 2; }
      `;
    }
    
    return `
      width: 100%;
      height: 100%;
    `;
  }}
`;



const MatchingCardsPage = ({bgmAudio, navigateTo, players, setPlayers, backgroundImage }) => {
  const [cards, setCards] = useState([])
  const [choiceOne, setChoiceOne] = useState(null)
  const [choiceTwo, setChoiceTwo] = useState(null)
  const [cardDisabled, setCardDisabled] = useState(false)
  const [matchFrameVisible, setMatchFrameVisible] = useState(false)
  const { sendMessage }=useSendGameMessage()
  const pageAssets = usePageAssets(modeAssets, 1);

  const rawQuestions = useMemo(() => 
    modeQuestions?.[0]?.questions || [], 
    [modeQuestions]
  );
  const gamePairs = useMemo(() => 
    rawQuestions.map(q => ({
      text: q.question,
      image: q.answer[0] // 取得 answer 陣列的第一個元素
    })), 
    [rawQuestions]
  );

  const pairCount=gamePairs.length
  const handleAfterClickingNextButton=()=>{
    setChoiceOne(null)
    setChoiceTwo(null)
    setMatchFrameVisible(false);
    setCardDisabled(false);

    setPlayers((pre)=>{
      const currentIndex=pre.findIndex(player=>player.status)
      const nextIndex=pre.length===1 ? 0 : (currentIndex+1)%pre.length
      return pre.map((player,index)=>{
        if(currentIndex===nextIndex){// 只有一位玩家
          return {...player,status:true}
        }
        if(index===currentIndex){
          return {...player,status:false}
        }else if(index===nextIndex){
          return {...player,status:true}
        }else{
          return player
        }
      })
    })

    const totalScores=players.reduce((sum,player)=>sum+(player.score||0),0)
    if(totalScores===pairCount){
      navigateTo('scores')
      return;
    }
  }
  const  { buttonScale,setScale, handleClickAnimation }=useClickAnimation(handleAfterClickingNextButton)

  useEffect(() => {
    // 當這一頁載入時，立刻通知外層
    sendMessage({ sceneId: 3});
  }, [sendMessage]);

  const pageStyle = { 
    backgroundImage: `url(${backgroundImage})`,
    loading:'eager'
  };

  const shuffleCards = () => { // 洗牌
    const text=gamePairs?.map(pair => pair.text) || []
    const img=gamePairs?.map(pair => pair.image) || []
    const shuffleCards=[...text,...img]
      .sort(() => Math.random() - 0.5)
      .map((content) => ({
        id: Math.random(),
        content,
        active:false,
        matched:null,
      }));
    setCards(shuffleCards);
  }

  const playSound=useCallback((soundPath)=>{
    const audio=new Audio(soundPath)
    audio.volume=0.316;
    audio.play().catch((error)=>{
      console.log("Audio failed",error)
    })
  },[])

  const getImageName = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') {
      return ''; 
    }
    if(imagePath.includes('/')){
      const filename = imagePath.split('/').pop(); // 取檔名
      const match = filename.match(/doodle_matching_(.+)\.png$/); // 提取名稱部分
      return match ? match[1].replace(/_/g, ' ') : ''; // 底線轉空格
    }
    else{
      return imagePath; // 不是圖片路徑，直接返回內容
    }
  }

  const resetTurn = (state) => {
    setTimeout(()=>{
      setPlayers((pre)=>{
        const currentIndex=pre.findIndex(player=>player.status)
        const nextIndex=pre.length===1 ? 0 : (currentIndex+1)%pre.length
        if(state==="match"){
          return pre.map((player,index)=>{
            if(currentIndex===nextIndex){// 只有一位玩家
              return {...player,score:(player.score||0)+1}
            }
            if(index===currentIndex){
              return {...player,score:(player.score||0)+1}
            }
            else{
              return player
            }
          })
        }
        else if(state==="not match"){
          return pre.map((player,index)=>{
            if(currentIndex===nextIndex){// 只有一位玩家
              return {...player,status:true}
            }
            if(index===currentIndex){
              return {...player,status:false}
            }else if(index===nextIndex){
              return {...player,status:true}
            }else{
              return player
            }
          })
        }
      })
      setCards(prevCards => prevCards.map(c => { 
        if (c.matched === true) {// 已配對成功的卡片隱藏
          return { ...c, matched: null, disabled: true };
        } else if (c.matched === false) {// 配對失敗的卡片翻回去
          return { ...c, matched: null,active:false};
        }
        else{
          return c;
        }
      }))
    }, 500)
  }

  const handleCardClick = (card) => {
    if(!cardDisabled){
      choiceOne ? setChoiceTwo(card) : setChoiceOne(card)
      setCards(prevCards => prevCards.map(c => 
        c.id === card.id ? { ...c, active: true } : c
      ));
    }
  }

  useEffect(() => {
    if(bgmAudio && bgmAudio.paused){
      bgmAudio.currentTime = 0; // 從頭開始播放
      bgmAudio.play().catch((error)=>{console.log("Audio failed",error)});
    }
    shuffleCards()
    setPlayers((pre)=>{
      return pre.map((player)=>player.id===1?{...player,status:true}:player)
    })
  }, []);

  useEffect(() => {
    if (choiceOne && choiceTwo && choiceOne.id !== choiceTwo.id && choiceOne.content !== choiceTwo.content) {
      setCardDisabled(true);
      if (getImageName(choiceOne.content) === getImageName(choiceTwo.content)) {
        // 配對成功 卡片處理
        setCards(prevCards => prevCards.map(c => { 
          if (c.id === choiceOne.id || c.id === choiceTwo.id) {
            return { ...c, matched: true };
          }else {
            return c;
          }  
        }))
        // 顯示答對框
        setTimeout(()=>{
          setMatchFrameVisible(true);
        }, 100)
        playSound(modeSound?.correct || './sounds/correct.mp3')
        resetTurn("match")
      }
      else{
        // 配對失敗 卡片處理
        setCards(prevCards => prevCards.map(c => { 
          if (c.id === choiceOne.id || c.id === choiceTwo.id) {
            return { ...c, matched: false };
          } else {
            return c;
          }
        }))
        playSound(modeSound?.wrong || './sounds/wrong.mp3')
        resetTurn("not match")
        setChoiceOne(null)
        setChoiceTwo(null)
        setCardDisabled(false);
      }
    }
  }, [choiceOne, choiceTwo]);


  return (
    <div className="page-container" style={pageStyle}>
      {/* 玩家區域 */}
      <div className="player-container">
        {
          players?.map((player, index) => (
            <div key={player.id || index} className="player-content">
              <img className="player-arrow" style={{visibility: player.status ? 'visible' : 'hidden'}} width={33} height={23} src={"./images/object/doodle_matching_arrow.png"} alt="Arrow" />
              <img className="player-frame" src={player.frame || `./images/object/doodle_matching_score_finch_0${index+1}.png`} alt="Game Frame" />
              <span className="player-score-text">{player.score || 0}</span>
            </div>
          ))
        }
      </div>

      {/* 卡片區域 */}
      <CardsContainerGrid pairCount={pairCount}>
        {cards.map((card) => (
          <CardFrame key={card?.id} pairCount={pairCount} style={{visibility:card?.disabled&&card?.disabled===true ? 'hidden' : 'visible',cursor:cardDisabled?'auto':'pointer'}} onClick={()=>{handleCardClick(card)}}>
            <img src={`./images/object/doodle_matching_${card?.matched && card?.matched===true?"right":card?.matched===false?"wrong":"question"}.png`} alt="Card" />
            {card?.matched===null && card?.active && <img className="card-choosed" src={`./images/object/doodle_matching_choose.png`} alt="Card" />}
            {
              card?.content && card?.content.includes('/') ?
              <img className="card-content" style={{width:'150px'}} src={card?.content} alt="Card Content" /> :
              <span className="card-content" style={{width:'175px'}} >{card?.content}</span>
            }
          </CardFrame>
        ))}

        {/* 答對框 */}
        {
          matchFrameVisible && (
          <div className="matching-answer-frame">
            <img src={"./images/object/doodle_matching_answer_frame.png"} alt="Answer Frame" />
            <div className="matching-answer-content">
              <div className="matching-answer-cards">
                <div className="card-frame">
                  <img src={"./images/object/doodle_matching_question.png"} alt="question" />
                  {
                    choiceOne && choiceOne?.content && choiceOne?.content.includes('/') ?
                    <img className="card-content" style={{width:'150px'}} src={choiceOne?.content} alt="Card Content" /> :
                    <span className="card-content" style={{width:'175px'}} >{choiceOne?.content}</span>
                  }
                </div>
                <div className="card-frame">
                  <img src={"./images/object/doodle_matching_question.png"} alt="question" />
                  {
                    choiceTwo && choiceTwo?.content && choiceTwo?.content.includes('/') ?
                    <img className="card-content" style={{width:'150px'}} src={choiceTwo?.content} alt="Card Content" /> :
                    <span className="card-content" style={{width:'175px'}} >{choiceTwo?.content}</span>
                  }
                </div>
              </div>
              <div className="matching-answer-text">Great!</div> 
              <button className="image-button next-button" 
              onMouseEnter={() => setScale("next",1.1)}
              onMouseLeave={() => setScale("next",1)}
              style={{transform: `scale(${buttonScale.next})`}}
              onClick={()=>{handleClickAnimation("next")}}>
                <img 
                src={"./images/object/doodle_matching_next_button02.png"}
                alt="question" />
                <span className="next-button-text">Next</span>
              </button>
            </div>
          </div>
          )
        }
      </CardsContainerGrid>
      {pageAssets.map((asset, index) => (
        <div key={asset.id || index} style={asset.style}>
          {asset.text}
        </div>
      ))}
    </div>
  );
};

export default MatchingCardsPage;
