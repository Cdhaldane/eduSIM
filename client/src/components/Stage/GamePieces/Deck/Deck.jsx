import React, { useState, forwardRef, useRef, useEffect, useCallback } from 'react';
import './Deck.css';
import CustomWrapper from "../CustomWrapper";
import Club from "../../../../../public/icons/club.svg"
import Spade from "../../../../../public/icons/spade.svg"
import Diamond from "../../../../../public/icons/diamond.svg"
import Heart from "../../../../../public/icons/heart-sign.svg"
import Back from "../../../../../public/icons/card_backing.svg"
import { Image } from "cloudinary-react";
import Draggable from 'react-draggable';
import io from "socket.io-client";

const suits = {
  hearts: <Heart />,
  diamonds: <Diamond />,
  spades: <Spade />,
  clubs: <Club />,
};

const cardIcons = new Map();
cardIcons.set("Ahearts", "🂱");
cardIcons.set("2hearts", "🂲");
cardIcons.set("3hearts", "🂳");
cardIcons.set("4hearts", "🂴");
cardIcons.set("5hearts", "🂵");
cardIcons.set("6hearts", "🂶");
cardIcons.set("7hearts", "🂷");
cardIcons.set("8hearts", "🂸");
cardIcons.set("9hearts", "🂹");
cardIcons.set("10hearts", "🂺");
cardIcons.set("Jhearts", "🂻");
cardIcons.set("Qhearts", "🂽");
cardIcons.set("Khearts", "🂾");
cardIcons.set("Aspades", "🂡");
cardIcons.set("2spades", "🂢");
cardIcons.set("3spades", "🂣");
cardIcons.set("4spades", "🂤");
cardIcons.set("5spades", "🂥");
cardIcons.set("6spades", "🂦");
cardIcons.set("7spades", "🂧");
cardIcons.set("8spades", "🂨");
cardIcons.set("9spades", "🂩");
cardIcons.set("10spades", "🂪");
cardIcons.set("Jspades", "🂫");
cardIcons.set("Qspades", "🂭");
cardIcons.set("Kspades", "🂮");
cardIcons.set("Adiamonds", "🃁");
cardIcons.set("2diamonds", "🃂");
cardIcons.set("3diamonds", "🃃");
cardIcons.set("4diamonds", "🃄");
cardIcons.set("5diamonds", "🃅");
cardIcons.set("6diamonds", "🃆");
cardIcons.set("7diamonds", "🃇");
cardIcons.set("8diamonds", "🃈");
cardIcons.set("9diamonds", "🃉");
cardIcons.set("10diamonds", "🃊");
cardIcons.set("Jdiamonds", "🃋");
cardIcons.set("Qdiamonds", "🃍");
cardIcons.set("Kdiamonds", "🃎");
cardIcons.set("Aclubs", "🃑");
cardIcons.set("2clubs", "🃒");
cardIcons.set("3clubs", "🃓");
cardIcons.set("4clubs", "🃔");
cardIcons.set("5clubs", "🃕");
cardIcons.set("6clubs", "🃖");
cardIcons.set("7clubs", "🃗");
cardIcons.set("8clubs", "🃘");
cardIcons.set("9clubs", "🃙");
cardIcons.set("10clubs", "🃚");
cardIcons.set("Jclubs", "🃛");
cardIcons.set("Qclubs", "🃝");
cardIcons.set("Kclubs", "🃞");

const Card = forwardRef(({ image, text, value, suit, style, onMouseDown, onMouseMove, onMouseUp, flipped, onContextMenu, isFlipping }, ref) => {
  const icon = cardIcons.get(value + suit);

  const cardContent = (
    <div
      className={`${suit === "hearts" || suit === "diamonds" ? "deck-red" : "deck-black"
        } ${!isFlipping ? "flip-animation" : ""}`}
    >
      {image ? <div className='card-preview'>
        <Image
          id="deck-preview-game"
          cloudName="uottawaedusim"
          publicId={image}
        />
        <p>{text}</p>
      </div> : icon}
    </div>
  );

  const cardInnerStyle = flipped ? { transform: 'rotateY(180deg)' } : {};

  return (
    <div
      className={suit === "hearts" || suit === "diamonds" ? "card-container decks-red" : "card-container"}
      style={{ ...style, position: 'absolute' }}
    >
      <div
        className="card-inner"
        style={cardInnerStyle}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onContextMenu={onContextMenu}
      >
        <div className="card-front">
          {cardContent}
        </div>
        <Back className="card-back" />
      </div>
    </div>
  );
});

const ContextMenu = ({ onClose, onReset, onDeal }) => {
  const [dealAmount, setDealAmount] = useState(1);
  const handleClick = (e) => {
    e.stopPropagation();
    // onClose();
  };

  const handleDeal = () => {
    onDeal(dealAmount);
    onClose();
  };

  const handleDealAmountChange = (e) => {
    setDealAmount(e.target.value);
    onDeal(e.target.value);
    onClose();
  };

  return (
    <div
      className="context-menu"
      onClick={handleClick}
    >
      <button onClick={onReset}>Reset Deck</button>
      <div className='context-menu-dropdown'>
        <label for="dealAmount">Deal </label>
        <select id="dealAmount" value={dealAmount} onChange={handleDealAmountChange}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </select>
      </div>
      {/* <button onClick={handleDeal}>Deal</button> */}
    </div>
  );
};

const Deck = forwardRef((props, ref) => {
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const [cards, setCards] = useState([]);
  const [topCardIndex, setTopCardIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [flipped, setFlipped] = useState(true);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const socketRef = useRef(null);
  const [isFlipping, setIsFlipping] = useState(false);


  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_API_ORIGIN);
    socketRef.current.on("deck-state:" + props.id, (newState) => {
      setCards(newState.cards)
      setTopCardIndex(newState.index)
    });
    return () => {
      // socketRef.current.disconnect();
    };
  }, [props.id]);


  useEffect(() => {
    const newCards = shuffleDeck(createDeck());
    socketRef.current.emit("card-dragged", { index: 0, cards: newCards, id: props.id });
  }, [])

  const handleDeal = (amount) => {
    console.log(amount)
    socketRef.emit("deal-cards", { amount, id: props.id });
  }

  const createDeck = () => {
    const newDeck = [];
    let position = { x: 0, y: 0 }
    if (props.deck?.length > 0) {
      props.deck.forEach((card) => {
        newDeck.push({ ...card, flipped, position });
      });
    } else {
      for (const suit in suits) {
        for (const value of values) {
          newDeck.push({ value, suit, flipped, position });
        }
      }
    }
    return newDeck;
  }

  const shuffleDeck = (deck) => {
    const shuffledDeck = [...deck];
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    return shuffledDeck;
  }




  const resetDeck = () => {
    const newCards = shuffleDeck(createDeck());
  
    const cardsContainer = document.querySelector('.deck-container');
    const cardElems = cardsContainer.querySelectorAll('.card-container');
  
    cardElems.forEach((cardElem, index) => {  
      // Animate the card to the new position
      cardElem.style.transform = `translate(0px, 0px)`;
      cardElem.style.transition = 'transform 1s ease-in-out';
  
      // Reset the card position after the animation finishes
      setTimeout(() => {
        cardElem.style.transform = '';
        cardElem.style.transition = '';
  
        // If this is the last card, update the top card index and deck state
        if (index === cardElems.length - 1) {
          setCards(newCards);
          setTopCardIndex(0);
          props.updateVariable('Deck', []);
          socketRef.current.emit('card-dragged', {
            index: 0,
            cards: newCards,
            id: props.id,
          });
        }
      }, 1000);
    });
    setContextMenuVisible(false);
  };

  const handleDragStop = (index, position) => {
    const newCard = [...cards];
    newCard[index].position = position;
    let nextIndex = topCardIndex
    if (index === topCardIndex) {
      nextIndex = (topCardIndex + 1) % cards.length;
      setTopCardIndex(nextIndex);
      let current = props.variables['Deck'] || []
      current.push(newCard[index])
      props.updateVariable('Deck', current)
    }

    if (!isDragging) {
      setIsFlipping(true);
      newCard[index].flipped = !newCard[index].flipped;
    }
    setCards(newCard)
    setIsDragging(false)
    socketRef.current.emit("card-dragged", { index: nextIndex, cards: newCard, id: props.id });
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuVisible(!contextMenuVisible);
  };


  // Add this function to close the context menu
  const closeContextMenu = () => {
    setContextMenuVisible(false);
  };

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (contextMenuVisible) {
        closeContextMenu();
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [contextMenuVisible]);

  // Map through the top two cards and return a Card component for each one
  const remainingCards = cards.map((card, index) => {
    const position = cards[index].position;
    const isTopCard = index === 0;
    const zIndex = isTopCard ? cards.length : cards.length - index - 1;
    const style = { position: 'relative', zIndex, ...position };
    if (index < topCardIndex + 2) {
      return (
        <Draggable
          key={index}
          position={cards[index].position}
 
          onDrag={(e, data) => {
            setIsDragging(true)
            position.x = data.lastX + (data.deltaX * 0.5);
            position.y = data.lastY + (data.deltaY * 0.5);
          }}
          onStop={(e, data) =>
            handleDragStop(index, { x: data.x, y: data.y })
          }
        >
          <Card
            {...card}
            style={style}
            flipped={cards[index].flipped}
            isFlipping={isFlipping}
            
          />
        </Draggable>
      );
    }
  });


  // Update the return statement to include the context menu
  return (
    <CustomWrapper {...props} ref={ref} >
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100px', height: '140px' }}
        className='deck-container'
        onClick={closeContextMenu}
        onContextMenu={handleRightClick}
      >
        {props.editMode ? <Back className="card-back-edit" /> : (
          <>
            {remainingCards}
            {contextMenuVisible && (
              <ContextMenu
                onClose={closeContextMenu}
                onReset={resetDeck}
                onDeal={handleDeal}
              />
            )}
          </>
        )}
      </div>
    </CustomWrapper>
  );
});

export default Deck;