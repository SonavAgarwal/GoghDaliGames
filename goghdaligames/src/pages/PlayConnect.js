import React, { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConnectionContext from "../api/ConnectionContext";
import ReactLoading from "react-loading";

function PlayConnect(props) {
    const { roomID } = useParams();
    const navigate = useNavigate();
    const connection = useContext(ConnectionContext);

    useEffect(
        function () {
            if (connection.connectionStatus) {
                setTimeout(() => {
                    navigate(`/lobby/${connection.roomID}`);
                }, 500);
            }
        },
        [connection.connectionStatus]
    );

    useEffect(
        function () {
            if (roomID) {
                connection.joinRoom(roomID);
                // navigate(`/fb/${roomID}`);
            } else {
                navigate("/");
            }
        },
        [roomID]
    );
    return (
        <div
            className="column-page"
            style={{
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
            }}
        >
            <ReactLoading
                type={"bars"}
                color={"var(--primary)"}
                width={"30%"}
                height={"auto"}
            />
        </div>
    );
}

export default PlayConnect;
