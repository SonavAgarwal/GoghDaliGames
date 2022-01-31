import React, { useContext, useEffect, useState } from "react";
import Countdown from "react-countdown";
import { useNavigate, useParams } from "react-router-dom";
import ConnectionContext from "../../api/ConnectionContext";
import Logo from "../../images/fireball/Shoot.svg";
import ReactLoading from "react-loading";

function Lobby(props) {
    const connection = useContext(ConnectionContext);
    const { roomID } = useParams();

    const [starting, setStarting] = useState(false);

    const navigate = useNavigate();

    useEffect(
        function () {
            if (connection.thisPeer) {
                connection.thisPeer.on("data", function (data) {
                    let dataString = "" + data;
                    let dataObject = JSON.parse(dataString);
                    if (dataObject.command == "START") {
                        startGame();
                    }
                });
            }
        },
        [connection.thisPeer]
    );

    function startGame() {
        setStarting(true);
        setTimeout(() => {
            navigate(`/fb/${roomID}`);
        }, 5000);
    }

    const countdownRenderer = ({ hours, minutes, seconds, completed }) => {
        if (completed) {
            // Render a completed state
            return (
                <ReactLoading
                    type={"bars"}
                    color={"var(--primary)"}
                    width={"10%"}
                />
            );
        } else {
            // Render a countdown
            return <h1 style={{ fontSize: "8rem" }}>{seconds}</h1>;
        }
    };

    return (
        <div className="column-page">
            <img src={Logo} />
            {!starting && (
                <button
                    className="margin-bottom"
                    onClick={function () {
                        connection?.thisPeer.send(
                            JSON.stringify({ command: "START" })
                        );
                        startGame();
                    }}
                >
                    Start game!
                </button>
            )}

            {starting && (
                <Countdown
                    date={Date.now() + 4000}
                    precision={3}
                    renderer={countdownRenderer}
                />
            )}
        </div>
    );
}

export default Lobby;
