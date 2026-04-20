import React, { useCallback, useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { SingleCard } from "../components/SingleCard"
import useClickAnimation from '../hooks/useClickAnimation';
import useSendGameMessage from "../hooks/useSendGameMessage"
import usePageAssets from "../hooks/usePageAssets";

const cfg = (typeof window !== 'undefined' && window.gameConfig) ? window.gameConfig : {};

const modeSound = cfg?.sounds || {};
const modeAssets = cfg?.assets || [];
const modeQuestions = cfg?.questions || [];

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

  ${({ paircount }) => {
    // 3-7 pairs: 2 rows, 211px width, 16px gap
    if (paircount >= 3 && paircount <= 7) {
      return `
        grid-template-columns: repeat(${paircount}, 211px);
        grid-template-rows: repeat(2, 218px);
        gap: 16px;
      `;
    }

    // 8 pairs: 2 rows, 211px width, 0px gap
    if (paircount === 8) {
      return `
        grid-template-columns: repeat(8, 211px);
        grid-template-rows: repeat(2, 218px);
        gap: 0px;
      `;
    }

    // 9 pairs: 6 cols × 198px, 3 rows, 16px gap
    if (paircount === 9) {
      return `
        grid-template-columns: repeat(6, 198px);
        grid-template-rows: repeat(3, 205px);
        gap: 16px;
      `;
    }

    // 10-12 pairs: 8 cols × 198px, 3 rows, 10px gap
    if (paircount >= 10 && paircount <= 12) {
      return `
        grid-template-columns: repeat(8, 198px);
        grid-template-rows: repeat(3, 205px);
        gap: 10px;
      `;
    }

    // 13-14 pairs: 7 cols × 147px, 4 rows, 18px/20px gaps
    if (paircount >= 13 && paircount <= 14) {
      return `
        grid-template-columns: repeat(7, 147px);
        grid-template-rows: repeat(4, 152px);
        grid-row-gap: 18px;
        grid-column-gap: 20px;
      `;
    }

    // 15-16 pairs: 8 cols × 147px, 4 rows, 18px/20px gaps
    if (paircount >= 15 && paircount <= 16) {
      return `
        grid-template-columns: repeat(8, 147px);
        grid-template-rows: repeat(4, 152px);
        grid-row-gap: 18px;
        grid-column-gap: 20px;
      `;
    }

    // 17-18 pairs: 9 cols × 147px, 4 rows, 18px/20px gaps
    if (paircount >= 17 && paircount <= 18) {
      return `
        grid-template-columns: repeat(9, 147px);
        grid-template-rows: repeat(4, 152px);
        grid-row-gap: 18px;
        grid-column-gap: 20px;
      `;
    }

    // 19-20 pairs: 10 cols × 147px, 4 rows, 18px/20px gaps
    if (paircount >= 19 && paircount <= 20) {
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


const MemoryCardsPage = ({bgmAudio, navigateTo, players, setPlayers, backgroundImage }) => {
  const [cards, setCards] = useState([])
  const [choiceOne, setChoiceOne] = useState(null)
  const [choiceTwo, setChoiceTwo] = useState(null)
  const [cardDisabled, setCardDisabled] = useState(false)
  const [matchFrameVisible, setMatchFrameVisible] = useState(false)
  const { sendMessage }=useSendGameMessage()
  const pageAssetsInStage3 = usePageAssets(modeAssets, 3);
  const pageAssetsInStage4 = usePageAssets(modeAssets, 4);
  
  
  const gamePairs = useMemo(() => {
    const rawQuestions = modeQuestions?.[0]?.questions || [];
    return rawQuestions.map(q => ({
      text: q.question,
      image: q.answer[0] // 取得 answer 陣列的第一個圖片路徑
    }));
  }, [modeQuestions]);

  const gamePairCount = gamePairs.length;
  const handleAfterClickingNextButton=()=>{
    setChoiceOne(null)
    setChoiceTwo(null)
    sendMessage({ sceneId: 3});
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
    if(totalScores===gamePairCount){
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
      // 1. 如果包含路徑，先取最後的檔名 (例如: a/b/apple.png -> apple.png)
      let filename = imagePath.split('/').pop()

      // 2. 去除副檔名 (例如: apple.png -> apple)
      // 這裡使用正規表達式取代掉最後一個點之後的文字
      filename = filename.replace(/\.[^/.]+$/, "");

      // 3. (選用) 底線轉空格：如果你原本的檔名是 doodle_memory_apple
      // 這裡會回傳 "doodle memory apple" 方便比對
      return filename.replace(/_/g, ' ');
    }
    else{
      return imagePath; // 不是圖片路徑，直接返回內容
    }
  }

  const resetTurn = (state) => {
    // 務必 return，這樣外層才拿得到 ID 來清除
    return setTimeout(() => {
      // 1. 先處理卡片狀態 (MemoryCardsPage 的內部狀態)
      setCards(prevCards => prevCards.map(c => { 
        if (c.matched === true) return { ...c, matched: null, disabled: true };
        if (c.matched === false) return { ...c, matched: null, active: false };
        return c;
      }));

      // 2. 處理玩家與選擇狀態 (會觸發父組件或後續渲染)
      if (state === "not match") {
        setChoiceOne(null);
        setChoiceTwo(null);
        setCardDisabled(false);
      }

      setPlayers((pre) => {
        const currentIndex = pre.findIndex(player => player.status);
        const nextIndex = pre.length === 1 ? 0 : (currentIndex + 1) % pre.length;
        
        if (state === "match") {
          return pre.map((player, index) => {
            if (currentIndex === nextIndex || index === currentIndex) {
              return { ...player, score: (player.score || 0) + 1 };
            }
            return player;
          });
        } else { // not match
          return pre.map((player, index) => {
            if (currentIndex === nextIndex) return { ...player, status: true };
            if (index === currentIndex) return { ...player, status: false };
            if (index === nextIndex) return { ...player, status: true };
            return player;
          });
        }
      });
    }, 500);
  };

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
      bgmAudio.volume=0.1
      bgmAudio.currentTime = 0; // 從頭開始播放
      bgmAudio.play().catch((error)=>{console.log("Audio failed",error)});
    }
    shuffleCards()
  }, []);

  useEffect(() => {
    let timer1, timer2, timer3, timerReset;

    if (choiceOne && choiceTwo && choiceOne.id !== choiceTwo.id) {
      // 如果內容不同 (避免同張卡片點兩次，雖然 handleCardClick 應該有擋，但這裡加保險)
      if (choiceOne.content !== choiceTwo.content) {
        setCardDisabled(true);
        const name1 = getImageName(choiceOne.content);
        const name2 = getImageName(choiceTwo.content);
        const isMatch = name1.includes(name2) || name2.includes(name1);

        if (isMatch) {
          // --- 匹配成功 ---
          setCards(prevCards => prevCards.map(c => 
            (c.id === choiceOne.id || c.id === choiceTwo.id) ? { ...c, matched: true } : c
          ));

          timer1 = setTimeout(() => {
            playSound(modeSound?.correct || './sounds/correct.mp3');
          }, 200);

          timer2 = setTimeout(() => {
            sendMessage({ sceneId: 4 });
            setMatchFrameVisible(true);
          }, 500);

          timerReset = resetTurn("match");
        } else {
          // --- 匹配失敗 ---
          timer3 = setTimeout(() => {
            playSound(modeSound?.wrong || './sounds/wrong.mp3');
          }, 200);

          timerReset = resetTurn("not match");
        }
      }
    }

    // 清理函數：這是防止錯誤訊息的關鍵！
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timerReset);
    };
  }, [choiceOne, choiceTwo]);

  return (
    <div className="page-container" style={pageStyle}>
      {/* 玩家區域 */}
      <div className="player-container">
        {
          players?.map((player, index) => (
            <div key={player.id || index} className="player-content">
              <img className="player-arrow" style={{visibility: player.status ? 'visible' : 'hidden'}} width={33} height={23} src={"./images/object/doodle_memory_arrow.png"} alt="Arrow" />
              <img className="player-frame" src={player.frame || `./images/object/doodle_memory_score_finch_0${index+1}.png`} alt="Game Frame" />
              <span className="player-score-text">{player.score || 0}</span>
            </div>
          ))
        }
      </div>

      {/* 卡片區域 */}
      <CardsContainerGrid paircount={gamePairCount}>
        {cards.map((card) => (
        <SingleCard key={card.id} card={card} pairCount={gamePairCount} cardDisabled={cardDisabled} flipped={card?.id ===choiceOne?.id || card?.id ===choiceTwo?.id || card?.matched===true} handleClick={()=>{handleCardClick(card)}}/>
        ))}

        {/* 答對框 */}
        {
          matchFrameVisible && (
          <div className="matching-answer-frame">
            <img src={"./images/object/doodle_memory_answer_frame.png"} alt="Answer Frame" />
            <div className="matching-answer-content">
              <div className="matching-answer-cards">
                <div className="card-frame">
                  <img src={"./images/object/doodle_memory_question.png"} alt="question" />
                  {
                    choiceOne && choiceOne?.content && choiceOne?.content.includes('/') ?
                    <img className="card-content" style={{width:'150px'}} src={choiceOne?.content} alt="Card Content" /> :
                    <span className="card-content" style={{width:'175px'}} >{choiceOne?.content}</span>
                  }
                </div>
                <div className="card-frame">
                  <img src={"./images/object/doodle_memory_question.png"} alt="question" />
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
                src={"./images/object/doodle_memory_next_button02.png"}
                alt="question" />
                <span className="next-button-text">Next</span>
              </button>
            </div>
          </div>
          )
        }
      </CardsContainerGrid>
      {!matchFrameVisible && pageAssetsInStage3.map((asset) => (
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
      {matchFrameVisible && pageAssetsInStage4.map((asset) => (
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

export default MemoryCardsPage;
