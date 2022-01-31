import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    onSnapshot,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import React, { createContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase";
var Peer = require("simple-peer");

const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
];

const ConnectionContext = createContext();

function ContextProvider(props) {
    const [thisPeer, setThisPeer] = useState();
    const [roomID, setRoomID] = useState();
    const [usedCandidates, setUsedCandidates] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState(false);
    const [listeningForData, setListeningForData] = useState(false);
    const [isInitiator, setIsInitator] = useState(false);

    const params = useParams();

    useEffect(
        function () {
            if (roomID && thisPeer) {
                const unsub = onSnapshot(doc(db, "fbsignal", roomID), (doc) => {
                    let data = doc.data();

                    if (thisPeer.initiator) {
                        if (data.accepted) {
                            let answer = JSON.parse(data.answer);
                            thisPeer.signal(answer);
                        }
                    } else {
                        if (!data.accepted) {
                            let offer = JSON.parse(data.offer);
                            thisPeer.signal(offer);
                        }
                    }
                });
                return unsub;
            }
        },
        [roomID, thisPeer]
    );

    useEffect(
        function () {
            if (roomID && thisPeer) {
                const unsub = onSnapshot(
                    doc(db, "fbsignal", roomID + "candidates"),
                    (doc) => {
                        let data = doc.data();

                        if (thisPeer.initiator) {
                            if (data.answerCandidates) {
                                data.answerCandidates.forEach(function (c) {
                                    let candidate = JSON.parse(c);
                                    thisPeer.signal(candidate);
                                });
                            }
                        } else {
                            if (data.offerCandidates) {
                                data.offerCandidates.forEach(function (c) {
                                    let candidate = JSON.parse(c);
                                    thisPeer.signal(candidate);
                                });
                            }
                        }
                    }
                );
                return unsub;
            }
        },
        [roomID, usedCandidates, thisPeer]
    );

    useEffect(
        function () {
            if (roomID && thisPeer && connectionStatus) {
                // thisPeer.on("data", function (data) {
                //     // console.log("From other peer: " + data);
                // });
            }
        },
        [roomID, thisPeer, connectionStatus]
    );

    function sendBingBong() {
        thisPeer.send("bing bong");
    }

    async function startOnData() {}

    async function joinRoom(roomIDT) {
        var thisPeerT = new Peer({
            initiator: false,
            config: {
                iceServers: iceServers,
            },
        });

        thisPeerT.on("signal", function (data) {
            async function handleData(data) {
                if (data.type === "answer") {
                    let answer = JSON.stringify(data);
                    updateDoc(doc(db, "fbsignal", roomIDT), {
                        accepted: true,
                        answer: answer,
                    });
                } else if (data.type === "candidate") {
                    setDoc(
                        doc(db, "fbsignal", roomIDT + "candidates"),
                        {
                            answerCandidates: arrayUnion(JSON.stringify(data)),
                            date: new Date(),
                        },
                        { merge: true }
                    );
                }
            }

            handleData(data);
        });

        thisPeerT.on("connect", function (data) {
            console.log("Connected");
            setConnectionStatus(true);
        });

        setRoomID(roomIDT);
        setThisPeer(thisPeerT);
    }

    async function createRoom() {
        let offerDate = new Date();
        const docRef = await addDoc(collection(db, "fbsignal"), {
            date: offerDate,
        });
        let roomIDT = docRef.id;
        setRoomID(roomIDT);

        var thisPeerT = new Peer({
            initiator: true,
            config: {
                iceServers: iceServers,
            },
        });

        thisPeerT.on("signal", function (data) {
            async function handleData(data) {
                if (data.type === "offer") {
                    let offerData = JSON.stringify(data);
                    await updateDoc(docRef, {
                        offer: offerData,
                        accepted: false,
                    });
                } else if (data.type === "candidate") {
                    setDoc(
                        doc(db, "fbsignal", roomIDT + "candidates"),
                        {
                            offerCandidates: arrayUnion(JSON.stringify(data)),
                            date: new Date(),
                        },
                        { merge: true }
                    );
                }
            }

            handleData(data);
        });

        thisPeerT.on("connect", function (data) {
            console.log("Connected");
            setConnectionStatus(true);
        });

        setThisPeer(thisPeerT);
        setIsInitator(true);
    }

    return (
        <ConnectionContext.Provider
            value={{
                createRoom,
                roomID,
                joinRoom,
                connectionStatus,
                sendBingBong,
                listeningForData,
                isInitiator,
                thisPeer,
            }}
        >
            {props.children}
        </ConnectionContext.Provider>
    );
}

export default ConnectionContext;

export { ContextProvider };
