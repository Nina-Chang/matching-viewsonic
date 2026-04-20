import React from 'react'
import styled from 'styled-components';

const CardFrame = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-origin: center;

  ${({ paircount }) => {
    if (paircount >= 13) {
      return `
        transform: scale(0.8);
        width: 135%;
        height: 135%;
        margin-top: -24px;
        margin-left: -20px;
        ${paircount === 13 ? '&:nth-child(22) { grid-column-start: 2; }' : ''}
        ${paircount === 15 ? '&:nth-child(25) { grid-column-start: 2; }' : ''}
        ${paircount === 17 ? '&:nth-child(28) { grid-column-start: 2; }' : ''}
        ${paircount === 19 ? '&:nth-child(31) { grid-column-start: 2; }' : ''}
      `;
    }
    
    if (paircount === 10) {
      return `
        width: 100%;
        height: 100%;
        &:nth-child(17) { grid-column-start: 3; }
      `;
    }
    
    if (paircount === 11) {
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

export const SingleCard = React.memo(({card,pairCount,cardDisabled,flipped,handleClick}) => {
  return (
    <CardFrame paircount={pairCount} style={{visibility:card?.disabled&&card?.disabled===true ? 'hidden' : 'visible',cursor:cardDisabled?'auto':'pointer'}} onClick={handleClick}>
        <div className={flipped ? "flipped":""}>
            {/* 卡片正面 */}
            <div className="front">
                <img src={`./images/object/doodle_memory_question.png`} alt="Card" />
                {
                    card?.content && card?.content.includes('/') ?
                    <img className="card-content" style={{width:'150px'}} src={card?.content} alt="Card Content" /> :
                    <span className="card-content" style={{width:'175px'}} >{card?.content}</span>
                } 
            </div>
            {/* 卡片背面 */}
            <img className="back" src={"./images/object/doodle_memory_card.png"} alt="" />
        </div>
    </CardFrame> 
  )
})


export default SingleCard;