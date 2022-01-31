import React, { useContext, useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard/lib/Component";
import { useNavigate, useParams } from "react-router-dom";
import ConnectionContext from "../../api/ConnectionContext";
import Shoot from "../../images/fireball/Shoot.svg";
import Block from "../../images/fireball/Block.svg";
import Reload from "../../images/fireball/Reload.svg";
import { motion, useMotionValue } from "framer-motion";
import Particles from "react-tsparticles";
import Modal from "react-modal/lib/components/Modal";

var Peer = require("simple-peer");
Modal.setAppElement("#root");

const initialGameState = {
    selectedAction1: 2,
    ammo1: 0,
    shieldRemaining1: 15,
    selectedAction2: 2,
    ammo2: 0,
    shieldRemaining2: 15,
};

var gameState = {};

function Fireball(props) {
    const connection = useContext(ConnectionContext);
    const { roomID } = useParams();
    const navigate = useNavigate();

    const x = useMotionValue(200);
    const y = useMotionValue(200);
    function handleMouse(event) {
        x.set(event.pageX);
        y.set(event.pageY);
    }

    useEffect(function () {
        Object.assign(gameState, initialGameState);
        setGameStateForRender(gameState);
    }, []);

    const [showResultModal, setShowResultModal] = useState(false);
    const [showPulse, setShowPulse] = useState(false);
    const [gameStateForRender, setGameStateForRender] = useState({});

    const [mouseSelectedAction, setMouseSelectedAction] = useState(0);

    function getSelectedAction() {
        let newSelectedAction = mouseSelectedAction;
        if (mouseSelectedAction == 1) {
            let myAmmo = connection.isInitiator
                ? gameState.ammo1
                : gameState.ammo2;
            if (myAmmo > 0) newSelectedAction = 1;
            else newSelectedAction = 2;
        } else if (mouseSelectedAction == 0) {
            let myShieldRemaining = connection.isInitiator
                ? gameState.shieldRemaining1
                : gameState.shieldRemaining2;

            if (myShieldRemaining > 0) newSelectedAction = 0;
            else newSelectedAction = 2;
        } else {
            newSelectedAction = mouseSelectedAction;
        }
        setSelectedAction(newSelectedAction);
        return newSelectedAction;
    }

    const [selectedAction, setSelectedAction] = useState(0);
    useEffect(
        function () {
            gameState.selectedAction1 = selectedAction;
        },
        [selectedAction]
    );

    function sendCommand(command, data) {
        let string = JSON.stringify({ ...data, command: command });
        connection.thisPeer.send(string);
    }

    function evaluateGame() {
        let result = {};
        if (gameState.selectedAction1 == 2) {
            gameState.ammo1 = gameState.ammo1 + 1;
        }
        if (gameState.selectedAction2 == 2) {
            gameState.ammo2 = gameState.ammo2 + 1;
        }

        if (gameState.selectedAction1 == 1) {
            gameState.ammo1 = gameState.ammo1 - 1;
        }
        if (gameState.selectedAction2 == 1) {
            gameState.ammo2 = gameState.ammo2 - 1;
        }

        if (gameState.selectedAction1 == 0) {
            gameState.shieldRemaining1 = gameState.shieldRemaining1 - 1;
        }
        if (gameState.selectedAction2 == 0) {
            gameState.shieldRemaining2 = gameState.shieldRemaining2 - 1;
        }

        if (gameState.selectedAction1 == gameState.selectedAction2) {
            result.end = false;
        } else if (
            gameState.selectedAction1 == 0 ||
            gameState.selectedAction2 == 0
        ) {
            result.end = false;
        } else if (gameState.selectedAction1 + gameState.selectedAction2 == 3) {
            result.end = true;
            result.winner = gameState.selectedAction1 == 1 ? 1 : 0;
            result.loser = gameState.selectedAction2 == 1 ? 1 : 0;
        }
        return result;
    }

    useEffect(
        function () {
            if (connection.isInitiator) {
                let turnTick = 0;
                setGameStateForRender(gameState);
                let interval = setInterval(() => {
                    switch (turnTick) {
                        case 0:
                            pulseCursor();
                            sendCommand("PULSE");
                            break;
                        case 1:
                            pulseCursor();
                            sendCommand("PULSE");
                            sendCommand("SENDDATA");
                            break;
                        case 2:
                            pulseCursor();
                            sendCommand("PULSE");
                            gameState.selectedAction1 = getSelectedAction();
                            let turnResult = evaluateGame();
                            if (turnResult.end) {
                                clearInterval(interval);
                            }
                            let allResults = { ...gameState, ...turnResult };
                            sendCommand("RENDER", allResults);
                            setGameStateForRender(allResults);
                            renderTurnResult(allResults);
                            break;
                        case 3:
                            break;
                        default:
                            break;
                    }
                    turnTick = turnTick + 1;
                    turnTick = turnTick % 4;
                }, 500);
                return () => clearInterval(interval);
            }
        },
        [connection, selectedAction, mouseSelectedAction]
    );

    useEffect(
        function () {
            if (connection.thisPeer) {
                connection.thisPeer.on("data", function (data) {
                    let dataString = "" + data;
                    let dataObject = JSON.parse(dataString);

                    switch (dataObject.command) {
                        case "PULSE":
                            pulseCursor();
                            break;
                        case "SENDDATA":
                            setTimeout(() => {
                                let sA = getSelectedAction();
                                sendCommand("SELECTEDACTION", {
                                    selectedAction: sA,
                                });
                            }, 250);
                            break;
                        case "SELECTEDACTION":
                            gameState.selectedAction2 =
                                dataObject.selectedAction;
                            // Object.assign(gameState, dataObject);
                            break;
                        case "RENDER":
                            // Object.assign(gameState, dataObject);
                            gameState = dataObject;
                            setGameStateForRender(dataObject);
                            renderTurnResult(dataObject);
                            break;
                        default:
                            break;
                    }
                });
                return () => {
                    connection.thisPeer.removeAllListeners("data");
                };
            }
        },
        [connection.thisPeer, selectedAction, mouseSelectedAction]
    );

    function renderTurnResult(allResults) {
        if (allResults.end) {
            setTimeout(() => {}, 5200);
            setTimeout(() => {
                navigate(`/lobby/${roomID}`);
                setShowResultModal(false);
            }, 5000);
        } else {
            setTimeout(() => {
                setShowResultModal(false);
            }, 500);
        }
        setShowResultModal(true);
    }

    function pulseCursor() {
        setTimeout(() => {
            setShowPulse(true);
        }, 0);
        setTimeout(() => {
            setShowPulse(false);
        }, 100);
    }

    return (
        <>
            <div
                tabIndex={0}
                className="trifold-page"
                onMouseMove={handleMouse}
                onKeyDown={function (event) {
                    if (event.key == " ") {
                        setShowResultModal(true);
                        // pulseCursor();
                    }
                }}
            >
                <div className="trifold-section-wrapper">
                    <div
                        className="trifold-section block-section"
                        onMouseEnter={function () {
                            setMouseSelectedAction(0);
                        }}
                        style={{
                            filter:
                                (connection.isInitiator &&
                                    gameStateForRender.shieldRemaining1 < 1) ||
                                (!connection.isInitiator &&
                                    gameStateForRender.shieldRemaining2 < 1)
                                    ? "grayscale(1)"
                                    : "none",
                        }}
                    >
                        <img src={Block} style={{ height: "10rem" }} />
                        <h1>
                            {connection.isInitiator
                                ? gameStateForRender.shieldRemaining1
                                : gameStateForRender.shieldRemaining2}
                        </h1>
                        <Particles
                            className="fb-particles"
                            id="tsparticles1"
                            options={{
                                fullScreen: { enable: false, zIndex: 0 },
                                fpsLimit: 60,
                                particles: {
                                    color: {
                                        value: ["#ffffff", "#000000"],
                                    },
                                    move: {
                                        direction: "none",
                                        enable: true,
                                        outMode: "bounce",
                                        random: false,
                                        speed: 6,
                                        straight: false,
                                    },
                                    number: {
                                        density: {
                                            enable: true,
                                            area: 800,
                                        },
                                        value: 80,
                                    },
                                    opacity: {
                                        value: 0.75,
                                    },
                                    shape: {
                                        type: "circle",
                                    },
                                    size: {
                                        random: true,
                                        value: 5,
                                    },
                                },
                                detectRetina: true,
                            }}
                            width="100%"
                            height="100%"
                            style={{
                                position: "absolute",
                            }}
                        />
                    </div>
                </div>
                <div className="trifold-section-wrapper">
                    <div
                        className="trifold-section shoot-section"
                        onMouseEnter={function () {
                            setMouseSelectedAction(1);
                        }}
                        style={{
                            filter:
                                (connection.isInitiator &&
                                    gameStateForRender.ammo1 < 1) ||
                                (!connection.isInitiator &&
                                    gameStateForRender.ammo2 < 1)
                                    ? "grayscale(1)"
                                    : "none",
                        }}
                    >
                        <img src={Shoot} style={{ height: "10rem" }} />
                        <h1 style={{ opacity: 0 }}>invis</h1>
                        {/* <div style={{ height: "5rem" }}></div> */}
                        <Particles
                            className="fb-particles"
                            id="tsparticles2"
                            options={{
                                fullScreen: { enable: false, zIndex: 0 },
                                fpsLimit: 60,
                                particles: {
                                    color: {
                                        value: [
                                            "#fd5925",
                                            "#f6c519",
                                            "#f06623",
                                            "#f18812",
                                            "#f06623",
                                            "#ffffff",
                                        ],
                                    },
                                    move: {
                                        direction: "none",
                                        enable: true,
                                        outMode: "bounce",
                                        random: false,
                                        speed: 6,
                                        straight: false,
                                    },
                                    number: {
                                        density: {
                                            enable: true,
                                        },
                                        // value: 500,
                                    },
                                    opacity: {
                                        value: 0.75,
                                    },
                                    shape: {
                                        type: "circle",
                                    },
                                    size: {
                                        random: true,
                                        value: 5,
                                    },
                                },
                                detectRetina: true,
                            }}
                            width="100%"
                            height="100%"
                            style={{
                                position: "absolute",
                            }}
                        />
                    </div>
                </div>
                <div className="trifold-section-wrapper">
                    <div
                        className="trifold-section reload-section"
                        onMouseEnter={function () {
                            setMouseSelectedAction(2);
                        }}
                    >
                        <img
                            className="margin-bottom"
                            src={Reload}
                            style={{ height: "10rem" }}
                        />
                        <h1>
                            {connection.isInitiator
                                ? gameStateForRender.ammo1
                                : gameStateForRender.ammo2}
                        </h1>
                        <Particles
                            className="fb-particles"
                            id="tsparticles3"
                            options={{
                                fullScreen: { enable: false, zIndex: 0 },
                                fpsLimit: 60,
                                particles: {
                                    color: {
                                        value: ["#ffffff", "#000000"],
                                    },
                                    move: {
                                        direction: "none",
                                        enable: true,
                                        outMode: "bounce",
                                        random: false,
                                        speed: 6,
                                        straight: false,
                                    },
                                    number: {
                                        density: {
                                            enable: true,
                                            area: 800,
                                        },
                                        value: 80,
                                    },
                                    opacity: {
                                        value: 0.75,
                                    },
                                    shape: {
                                        type: "circle",
                                    },
                                    size: {
                                        random: true,
                                        value: 5,
                                    },
                                },
                                detectRetina: true,
                            }}
                            width="100%"
                            height="100%"
                            style={{
                                position: "absolute",
                            }}
                        />
                    </div>
                </div>

                <motion.div
                    style={{
                        x: x,
                        y: y,
                        width: "2rem",
                        height: "2rem",
                        translateX: "-1rem",
                        translateY: "-1rem",
                        // boxShadow: showPulse
                        //     ? "0px 0px 0rem 1rem var(--primary) inset"
                        //     : "none",
                        scale: showPulse ? 2 : 1,
                    }}
                    className="custom-cursor"
                ></motion.div>
            </div>
            <motion.div
                className="trifold-page-outline"
                style={{
                    boxShadow: showPulse
                        ? "0px 0px 0rem 2rem var(--primary) inset"
                        : "none",
                }}
            ></motion.div>
            <motion.div
                className="trifold-page-outline"
                style={{
                    boxShadow: showPulse
                        ? "0px 0px 0rem 2rem var(--primary) inset"
                        : "none",
                }}
            ></motion.div>
            <Modal
                isOpen={showResultModal}
                onRequestClose={function () {
                    setShowResultModal(false);
                }}
                closeTimeoutMS={200}
            >
                <div className="modal-content-outer">
                    {gameStateForRender.end && (
                        <h1>
                            {(gameStateForRender.winner == 0 &&
                                connection.isInitiator) ||
                            (gameStateForRender.winner == 1 &&
                                !connection.isInitiator)
                                ? "You lost."
                                : "You won!"}
                        </h1>
                    )}
                    <div
                        className="modal-content"
                        style={{
                            flexDirection: connection.isInitiator
                                ? "row"
                                : "row-reverse",
                        }}
                    >
                        <div className="turn-result-image">
                            {gameStateForRender.selectedAction1 == 0 && (
                                <img src={Block} style={{ height: "10rem" }} />
                            )}
                            {gameStateForRender.selectedAction1 == 1 && (
                                <img src={Shoot} style={{ height: "10rem" }} />
                            )}
                            {gameStateForRender.selectedAction1 == 2 && (
                                <img src={Reload} style={{ height: "10rem" }} />
                            )}
                        </div>
                        <div className="turn-result-image">
                            <h1>VS</h1>
                        </div>
                        <div className="turn-result-image">
                            {gameStateForRender.selectedAction2 == 0 && (
                                <img src={Block} style={{ height: "10rem" }} />
                            )}
                            {gameStateForRender.selectedAction2 == 1 && (
                                <img src={Shoot} style={{ height: "10rem" }} />
                            )}
                            {gameStateForRender.selectedAction2 == 2 && (
                                <img src={Reload} style={{ height: "10rem" }} />
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default Fireball;
