import React, { useState, forwardRef, useEffect } from "react";
import './Dice.css';
import CustomWrapper from "../CustomWrapper";

const Dice = forwardRef((props, ref) => {
    const [diceOne, setDiceOne] = useState(1);
    const [diceTwo, setDiceTwo] = useState(1);

    useEffect(() => {
        rollDice();
    }, []);

    const rollDice = () => {
        setTimeout(() => {
            setDiceOne(Math.floor(Math.random() * 6) + 1);
            setDiceTwo(Math.floor(Math.random() * 6) + 1);
        }, 100);
    };

    return (
        <CustomWrapper {...props} ref={ref}>
            <div className="dice-container">
                <div className={`dice dice-one show-${diceOne}`} onClick={rollDice}>
                    <div className="side one">
                        <div className="dot one-1"></div>
                    </div>
                    <div className="side two">
                        <div className="dot two-1"></div>
                        <div className="dot two-2"></div>
                    </div>
                    <div className="side three">
                        <div className="dot three-1"></div>
                        <div className="dot three-2"></div>
                        <div className="dot three-3"></div>
                    </div>
                    <div className="side four">
                        <div className="dot four-1"></div>
                        <div className="dot four-2"></div>
                        <div className="dot four-3"></div>
                        <div className="dot four-4"></div>
                    </div>
                    <div className="side five">
                        <div className="dot five-1"></div>
                        <div className="dot five-2"></div>
                        <div className="dot five-3"></div>
                        <div className="dot five-4"></div>
                        <div className="dot five-5"></div>
                    </div>
                    <div className="side six">
                        <div className="dot six-1"></div>
                        <div className="dot six-2"></div>
                        <div className="dot six-3"></div>
                        <div className="dot six-4"></div>
                        <div className="dot six-5"></div>
                        <div className="dot six-6"></div>
                    </div>
                </div>
            </div>
        </CustomWrapper>
    );
});

export default Dice;