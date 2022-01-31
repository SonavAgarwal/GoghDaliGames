import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConnectionContext from "../api/ConnectionContext";
import Logo from "../images/fireball/Shoot.svg";

var Peer = require("simple-peer");

function Play(props) {
    const connection = useContext(ConnectionContext);
    let navigate = useNavigate();

    useEffect(
        function () {
            if (connection.roomID) {
                navigate(`/pi/${connection.roomID}`);
            }
        },
        [connection.roomID]
    );

    return (
        <div className="column-page" style={{ height: "95vh" }}>
            <img src={Logo} />
            <h1 className="margin-bottom">Fireball</h1>
            {/* <input className="margin-bottom" placeholder="Room Code"></input> */}
            <button
                className="margin-bottom"
                onClick={function () {
                    connection.createRoom();
                }}
            >
                Play Someone!
            </button>
            <div style={{ flex: 1 }}></div>
            <h1
                // className="margin-top"
                style={{ fontSize: "1rem", color: "gray" }}
            >
                V 1.1
            </h1>
        </div>
    );
}

export default Play;
