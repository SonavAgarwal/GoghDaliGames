import React, { useContext, useEffect } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard/lib/Component";
import { useNavigate, useParams } from "react-router-dom";
import ConnectionContext from "../api/ConnectionContext";
import Logo from "../images/fireball/Shoot.svg";

var Peer = require("simple-peer");

function PlayInvite(props) {
    const connection = useContext(ConnectionContext);
    const { roomID } = useParams();

    const navigate = useNavigate();

    const joinURL = window.location.origin + `/play/${roomID}`;

    useEffect(
        function () {
            if (connection.connectionStatus) {
                navigate(`/lobby/${connection.roomID}`);
            }
        },
        [connection.connectionStatus]
    );

    return (
        <div className="column-page">
            {" "}
            <img src={Logo} />
            <h1 className="margin-bottom margin-top">
                Send this link to a friend!
            </h1>
            <CopyToClipboard text={joinURL}>
                <button
                    className="margin-bottom"
                    style={{ width: "auto", color: "dodgerblue" }}
                >
                    {joinURL}
                </button>
            </CopyToClipboard>
            {/* <CopyToClipboard text={joinURL}>
                <button className="margin-bottom">Copy join link!</button>
            </CopyToClipboard>
            <button
                className="margin-bottom"
                onClick={function () {
                    connection.sendBingBong();
                }}
            >
                send bing bong
            </button> */}
        </div>
    );
}

export default PlayInvite;
