import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import streamSaver from "streamsaver";
import BreadCrumb from "../BreadCrumb";
import { Button, Modal, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { TweenMax, TimelineMax, Power3, Power4 } from "gsap";
import Notification from "../Notification";
import "./Room.css";

const Container = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  jsutify-content: center;
  height: 100vh;
  width: 90%;
  margin: auto;
  flex-wrap: wrap;
`;

const worker = new Worker("../worker.js");

const Room = (props) => {
  const [connectionEstablished, setConnection] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState();
  const [partnerId, setPartnerID] = useState("");
  const [gotFile, setGotFile] = useState(false);
  const name = localStorage.getItem("name");
  const [fileUploadName, setFileName] = useState("");
  const [usernames, setUsernames] = useState([]);
  const [notification, setNotification] = useState(false);
  //const [play, { stop }] = useSound(searchingTone);
  //   const [playing, setPlaying ] = useState(true);
  const [loader, setLoader] = useState(false);
  const socketRef = useRef();
  const peersRef = useRef();
  const fileUpload = useRef();
  const peerRef = useRef();
  let screen = useRef(null);
  let roomBody = useRef(null);
  const fileNameRef = useRef("");
  let userData = {};
  const roomID = props.match.params.roomID;

  useEffect(() => {
    var socket_connect = function (room) {
      return io("/", {
        query: "r_var=" + room,
      });
    };
    socketRef.current = socket_connect(roomID);
    socketRef.current.on("server full", () => {
      alert("Server Full");
      return;
    });

    socketRef.current.emit("chat message", "hello room #" + roomID);
    socketRef.current.emit("join room", roomID);

    socketRef.current.on("all users", (id) => {
      setPartnerID(id);

      userData["name"] = name;
      userData["id"] = socketRef.current.id;
      socketRef.current.emit("username", userData);

      peerRef.current = createPeer(id, socketRef.current.id);
    });
    socketRef.current.on("getusername", (payload) => {
      setUsernames(payload);
    });

    socketRef.current.on("user joined", (payload) => {
      peerRef.current = addPeer(payload.signal, payload.callerID);
    });

    socketRef.current.on("receiving returned signal", (payload) => {
      peerRef.current.signal(payload.signal);
      setConnection(true);
    });
    socketRef.current.on("file recieved", () => {
      setLoader(false);
    });

    socketRef.current.on("user left", (room) => {
      console.log("user left");
      if (room == roomID) {
        peersRef.current.destroy();
        setConnection(false);
      }
    });

    socketRef.current.on("room full", () => {
      alert("room is full");
    });

    //timeline

    var tl = new TimelineMax();
    tl.to(screen, {
      duration: 0.8,
      width: "100%",
      left: "0%",
      ease: Power3.easeInOut,
    });
    tl.to(screen, {
      duration: 1,
      left: "100%",
      ease: Power3.easeInOut,
      delay: 0.2,
    });
    tl.set(screen, { left: "-100%" });
    TweenMax.to(roomBody, 0.2, {
      css: {
        opacity: "1",
        pointerEvents: "auto",
        ease: Power4.easeInOut,
      },
    }).delay(1.6);
    return () => {
      TweenMax.to(roomBody, 1, {
        css: {
          opacity: "0",
          pointerEvents: "none",
        },
      });
    };
  }, []);

  //searching tone

  const { confirm } = Modal;

  const error = () => {
    message.error("Please Select a file");
  };
  function createPeer(userToSignal, callerID) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: [
          {
            urls: "stun:stun.stunprotocol.org",
          },
          {
            urls: "turn:numb.viagenie.ca",
            credential: "muazkh",
            username: "webrtc@live.com",
          },
        ],
      },
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    peer.on("data", handleReceivingData);
    peersRef.current = peer;

    return peer;
  }
  const success = () => {
    message.success("Room Created Succesfully");
  };
  const handleOk = (e) => {
    download();
    console.log(e);
    setShowModal(true);
  };

  const handleCancel = (e) => {
    console.log(e);
    setShowModal(false);
  };

  function addPeer(incomingSignal, callerID) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      config: {
        iceServers: [
          {
            urls: "stun:stun.stunprotocol.org",
          },
          {
            urls: "turn:numb.viagenie.ca",
            credential: "muazkh",
            username: "webrtc@live.com",
          },
        ],
      },
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.on("data", handleReceivingData);

    peer.signal(incomingSignal);
    setConnection(true);
    peersRef.current = peer;
    return peer;
  }

  function handleReceivingData(data) {
    if (data.toString().includes("done")) {
      setGotFile(true);
      const parsed = JSON.parse(data);
      fileNameRef.current = parsed.fileName;
    } else {
      worker.postMessage(data);
    }
  }

  function download() {
    worker.postMessage("download");
    worker.addEventListener("message", (event) => {
      const stream = event.data.stream();
      const fileStream = streamSaver.createWriteStream(fileNameRef.current);
      stream.pipeTo(fileStream);
    });
    socketRef.current.emit("file downloaded");
    setGotFile(false);

    return;
  }
  function resetFile() {
    fileUpload.current.value = "";
    setFileName("");
  }

  function selectFile(e) {
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
    console.log(e.target.files[0]);
  }
  function triggerFileUpload() {
    fileUpload.current.click();
  }

  function sendFile() {
    if (!file) {
      error();
      return;
    }
    const peer = peerRef.current;
    const stream = file.stream();
    const reader = stream.getReader();
    setLoader(true);

    reader.read().then((obj) => {
      handlereading(obj.done, obj.value);
    });

    function handlereading(done, value) {
      if (done) {
        peer.write(JSON.stringify({ done: true, fileName: file.name }));
        return;
      }

      peer.write(value);
      reader.read().then((obj) => {
        handlereading(obj.done, obj.value);
      });
    }
  }
  localStorage.setItem("check", 1);

  function showConfirm() {
    confirm({
      title: "Someone Just sent you a file",
      icon: <ExclamationCircleOutlined />,
      content: "Would you like to download?",
      onOk() {
        download();
        console.log("OK");
        return;
      },
      onCancel() {
        console.log("Cancel");
        return;
      },
    });
  }

  let body;
  if (connectionEstablished) {
    body = (
      <div className="waiting__wrapper connected">
        <h4 className="container__description__heading">
          Yay! ROOM <span className="subtitle">{name}</span> is connected.. Send
          Your file now!{" "}
        </h4>
        <div className="container__description__body">
          <div className="file__wrapper">
            <input
              onChange={selectFile}
              type="file"
              ref={fileUpload}
              className="choose__file"
            />
            <Button
              className="body__button upload__button"
              onClick={triggerFileUpload}
              type="primary"
            >
              Choose File
            </Button>
            <h4 className="file__name">{fileUploadName}</h4>
          </div>
        </div>
        <div className="controls">
          <button
            onClick={sendFile}
            className="control__icon"
            disabled={loader ? true : false}
            style={{ cursor: loader ? "not-allowed" : "pointer" }}
          >
            {loader ? "Sent.." : "✅ Send"}
          </button>
          <button onClick={resetFile} className="control__icon">
            ❌ Cancel
          </button>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="waiting__wrapper">
        <div id="ripple" className="centered">
          <div className="circle"></div>
          <div className="circle main">
            <img src="/avatar.png" alt="avatar" className="avatar fluid" />
          </div>
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
        </div>
        <h1 className="room__title">{name}</h1>
      </div>
    );
  }

  let downloadPrompt;
  if (gotFile) {
    downloadPrompt = showConfirm();
  }

  return (
    <>
      <div className="load-container">
        <div className="load-screen" ref={(el) => (screen = el)}></div>
      </div>
      <div data-barba="container">
        <Container ref={(el) => (roomBody = el)} className="Headd">
          <BreadCrumb name={name} />
          {body}
          {!connectionEstablished ? (
            <div className="room__copy__link">
              <Notification />
              <h4 className="waititng loading">Waiting for other user </h4>
            </div>
          ) : null}
          {downloadPrompt}
        </Container>
      </div>
    </>
  );
};

export default Room;
