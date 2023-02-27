import React, { useState, forwardRef, useRef } from 'react';
import './Deck.css';
import CustomWrapper from "../CustomWrapper";

import Club from "../../../../../public/icons/club.svg"
import Spade from "../../../../../public/icons/spade.svg"
import Diamond from "../../../../../public/icons/Diamond.svg"
import Heart from "../../../../../public/icons/heart-sign.svg"

const suits = {
  hearts: <Heart />,
  diamonds: <Diamond />,
  spades: <Spade />,
  clubs: <Club />,
};

const Card = ({ value, suit, onClick }) => {
  const suitIcon = suits[suit];
  const midIcons = [];
  
  let trueValue = value
  if(value === 'A')
    midIcons.push(suitIcon);
  if(value === 'J')
    midIcons.push('J');
  if(value === 'Q')
    midIcons.push('Q');
  if(value === 'K')
    midIcons.push('K');
    
  for (let i = 0; i < parseInt(trueValue); i++) {
    midIcons.push(suitIcon);
  }
  return (
    <div onClick={onClick} className={suit === "hearts" || suit === "diamonds" ? "card-container-red" : "card-container"}>
      <div className={"card-top"}>
        {value}{suitIcon}
      </div>
      <div className={"card-mid"}>
        {midIcons}
      </div>
      <div className={"card-bot"}>
        {value}{suitIcon}
      </div>
    </div>
  );
};

const Deck = forwardRef((props, ref) => {

  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleCardClick = () => {
    setCurrentIndex((currentIndex + 1) % cards.length);
  };

  if (cards.length === 0) {
    for (const suit in suits) {
      for (const value of values) {
        cards.push({ value, suit });
      }
    }
    setCards(cards);
  }

  return (
    <CustomWrapper {...props} ref={ref}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Card key={currentIndex} {...cards[currentIndex]} onClick={handleCardClick} />
        </div>
    </CustomWrapper>
  );
});

export default Deck;