import React, { useEffect, useState } from 'react';
import './ContextMenu.css';
import { Image } from "cloudinary-react";


const CustomDeckModal = ({ onSave, getObj }) => {
    const [newCard, setNewCard] = useState({ image: null, text: '' });
    const [cards, setCards] = useState([]);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        setCards(getObj.cards ? getObj.cards : []);
    }, [])

    const openWidget = (event) => {
        var myWidget = window.cloudinary.createUploadWidget(
            {
                cloudName: "uottawaedusim",
                uploadPreset: "bb8lewrh"
            },
            (error, result) => {
                if (!error && result && result.event === "success") {
                    setNewCard((prevCard) => ({ ...prevCard, image: result.info.public_id }));
                    myWidget.close();
                }
            }
        );
        myWidget.open();
    }

    const handleTextChange = (event) => {
        event.stopPropagation();
        setNewCard((prevCard) => ({ ...prevCard, text: event.target.value }));
    };

    const handleSave = () => {
        if (!newCard.image || !newCard.text) {
            setShowWarning(true);
        } else {
            setCards([...cards, newCard]);
            setNewCard({ image: null, text: '' });
            setShowWarning(false);
        }
    };

    return (
        <div className="custom-deck-modal-overlay">
            <div className="custom-deck-modal">
                <div className="custom-deck-modal-header">
                    <h2>Create Custom Deck</h2>
                </div>
                <div className="custom-deck-modal-body">
                    <div className="custom-deck-modal-card-preview">
                        {cards.map((card, index) => (
                            <div key={index} className="custom-deck-modal-cards">
                                {card.image && <Image
                                    id="deck-preview"
                                    cloudName="uottawaedusim"
                                    publicId={card.image}
                                    alt={"card"}
                                />}
                                {card.text && <div className="custom-deck-modal-cards-text">{card.text}</div>}
                            </div>
                        ))}
                    </div>
                    <div className="custom-deck-modal-card-form">
                        <div className="custom-deck-modal-card-image">
                            <button onClick={openWidget}>Select Image</button>
                        </div>
                        <div className="custom-deck-modal-card-text">
                            <input
                                type="text"
                                placeholder="Enter text here"
                                value={newCard.text}
                                onChange={handleTextChange}
                            />
                        </div>
                    </div>
                    {showWarning && (
                        <div className="custom-deck-modal-warning">
                            Please add an image or text to the new card.
                        </div>
                    )}
                </div>
                <div className="custom-deck-modal-footer">
                    <button className="custom-deck-modal-add-card" onClick={handleSave}>
                        Add Card
                    </button>
                    <button className="custom-deck-modal-save" onClick={() => onSave(cards)}>
                        Save Deck
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomDeckModal;