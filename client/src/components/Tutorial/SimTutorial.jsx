import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

// import Question from "../../../public/icons/question-circle.svg"
import Question from "../../../public/icons/FAQ.svg"

const TutorialButton = styled.button`
    font-family: "Montserrat", sans-serif;
    font-size: 1.5rem;
    margin: 10px;
    margin-top: 10px;
    padding: 5px;
    border-radius: 5px;
    display: inline-block;
    border: 2px outset rgb(136, 136, 136);
    --color: rgb(161, 255, 148);
    background-color: var(--color);
    border-color: var(--color);
`;

const ProgressBar = styled.div`
  height: 10px;
  background-color: var(--primary);
  width: ${props => props.width}%;
  border-radius: 5px;
  margin-bottom: 10px;
`;


const tutorialSteps = [

    {
        title: "Welcome to eduSIM!",
        description: "Educational Simulated Interaction Models (eduSIMs) are simulations that can be used to improve engagement and learning. This is a quick tutorial to familiarize you with how to interact with an eduSIM simulation.",
    },
    {
        title: "The Page",
        description: "Most of the simulation takes place on the center of your screen, which displays the current page. All other participants will be seeing the same screen as you. There can be many interactive objects on this page, from buttons, to objects you can drag around. After this tutorial try to press on different objects and see if you can make something happen!",
    },
    {
        title: "The Timeline",
        description: "Along the top of the screen, the Timeline is what symbolizes the progress made throughout the simulation. Each dot on the timeline represents a different page in the simulation. Depending on the simulation, you can progress through the timeline by clicking on the dots, or will sometimes be moved automatically. You may need to complete tasks on the current page in order to unlock the next one.",
    },
    {
        title: "The Sidebar",
        description: (
            <div>
                Along the left side of the screen, there are various tools which will help you during your simulation.
                <ul>
                    <li><strong>Chat: </strong>Communicate with other participants.</li>
                    <li><strong>Alerts: </strong>Details which tasks must be completed in the simulation.</li>
                    <li><strong>Users: </strong>View who else is in the simulation room with you.</li>
                    <li><strong>Insights: </strong>Temporary text.</li>
                    <li><strong>Settings: </strong>Adjust visual settings to improve your user experience.</li>
                    <li><strong>Notes: </strong>Take notes for yourself or as a group.</li>
                </ul>

            </div>
        ),
    },
    {
        title: "Overlays",
        description: "You will sometimes see icon(s) in the top right of the current page. Clicking on these icons will open an overlay page, which will appear over your current page.",
    },
    {
        title: "The Role Page",
        description: "Pressing the arrow in the bottom right corner will open your role page. The bottom left corner indicates your role. This page is unique to each role, and unique to each person in the simulation.",
    },
    {
        title: "Wrapping Up",
        description: "This is the end of the tutorial. We hope you have become familiarized with how eduSIM works and you can now enjoy the simulation! Every simulation will have its own quirks and mechanics, so be ready for surprises!",
    },
]

const SimTutorial = ({ startTutorial, endTutorial }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        endTutorial(true);
    };

    const handleStart = () => {
        setCurrentStep(0);
        endTutorial(false);
    };

    // if progress is 0% make its 5 % so the bar is visible
    let progress = (currentStep / (tutorialSteps.length - 1)) * 100;
    if(progress === 0) progress = 3;

    return (
        <>
            {startTutorial && (
                <div className="tutorial">
                    <div className="tutorial-background">
                        {
                            currentStep != 1 ?
                                <div className="section-bg page-background" style={{ height: "calc(100vh - 50px - 90px)", width: "calc(100vw - 70px - 90px)", left: "70px", top: "50px" }} />
                                : null
                        }
                        {
                            currentStep != 2 ?
                                <div className="section-bg timeline-background" style={{ height: '50px', width: 'calc(100vw - 70px)', left: '70px' }} />
                                : null
                        }
                        {
                            currentStep != 3 ?
                                <div className="section-bg sidebar-background" style={{ height: '100vh', width: "70px" }} />
                                : null
                        }
                        {
                            currentStep != 4 ?
                                <div className="section-bg overlay-background" style={{ height: 'calc(100vh - 50px - 90px)', width: '90px', left: 'calc(100vw - 90px)', top: '50px' }} />
                                : null
                        }
                        {
                            currentStep != 5 ?
                                <div className="section-bg role-background" style={{ height: '90px', width: 'calc(100vw - 70px)', left: '70px', top: 'calc(100vh - 90px)' }} />
                                : null
                        }
                    </div>
                    <div className="areacsv">
                        <div className="areacsvform modal-tutorial">
                            <div className="modal-tutorial-header">
                                
                                <h2>{tutorialSteps[currentStep].title}</h2>
                                <p>{tutorialSteps[currentStep].description}</p>
                            </div>
                            <div className="modal-tutorial-buttons">
                                {currentStep >= 1 ? <TutorialButton onClick={handleBack}>Back</TutorialButton> : null}
                                {currentStep < tutorialSteps.length - 1 ? <TutorialButton onClick={handleNext}>Next</TutorialButton> : null}
                                {currentStep < tutorialSteps.length - 1 ? <TutorialButton onClick={handleSkip}>Skip Tutorial</TutorialButton> : null}
                                {currentStep === tutorialSteps.length - 1 ? <TutorialButton onClick={handleSkip}>End Tutorial</TutorialButton> : null}
                            </div>
                            <ProgressBar className="tutorial-progress" width={progress} />
                        </div>
                    </div>
                </div>
            )}
            {!startTutorial && (
                <Question className="tutorial-button" onClick={handleStart} />
            )}
        </>
    );
}

export default SimTutorial;