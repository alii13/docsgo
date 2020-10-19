import React, { useState, useContext, useRef, useEffect } from "react";
//import { v1 as uuid } from "uuid";
import { StoreContext } from "../contexts/StoreContextProvider";
import { Row, Col, Button, message } from "antd";
import { TweenMax, TimelineMax, Power3, Power4 } from "gsap";
import "./CreateRoom.css";

const CreateRoom = (props) => {
  const [userName, setUserName] = useState("");
  const [buttonText, setButtonText] = useState("Create room");
  const { setName } = useContext(StoreContext);
  const submitInput = useRef();
  let screen = useRef(null);
  let body = useRef(null);

  //function for notify error
  const error = () => {
    message.error("Please Enter A Room Name");
  };

  //function for notify success
  const success = () => {
    message.success("Room Created Succesfully");
  };

  const handleKeyUp = (e) => {
    if (e.keyCode === 13) {
      if (userName === "") {
        error();
        return;
      }
      document.getElementById("createButton").click();
    }
  };

  const create = () => {
    if (userName === "") {
      error();
      return;
    }
    //const id = uuid();
    setName(userName.toUpperCase());
    localStorage.setItem("name", userName.toUpperCase());
    success();
    //props.history.push(`${userName.toLowerCase()}${id.slice(0,3)}`);
    props.history.push(`/room/${userName.toLowerCase()}`);
  };

  const handleChange = (e) => {
    setUserName(e.target.value);
  };

  useEffect(() => {
    var tl = new TimelineMax();
    tl.to(screen, {
      duration: 0.8,
      height: "100%",
      ease: Power3.easeInOut,
    });
    tl.to(screen, {
      duration: 1,
      top: "100%",
      ease: Power3.easeInOut,
      delay: 0.2,
    });
    tl.set(screen, { left: "-100%" });
    TweenMax.to(body, 0.2, {
      css: {
        opacity: "1",
        pointerEvents: "auto",
        ease: Power4.easeInOut,
      },
    }).delay(1.6);
    return () => {
      TweenMax.to(body, 1, {
        css: {
          opacity: "0",
          pointerEvents: "none",
        },
      });
    };
  });

  return (
    <>
      <div className="load-container">
        <div className="load-screen1" ref={(el) => (screen = el)}>
        </div>
      </div>
      <div data-barba="container">
      <Row className="container Headd" ref={(el) => (body = el)} >
        <Col xs={24} sm={24} md ={12} xl={12}  className="center astronaut">
          <img src="/astronaut.gif" alt="astronaut" className="gif" />
        </Col>
        <Col xs={24} sm={24} md ={12} xl={12} className="container__description center">
          <h1 className="title">Docs<span className="subtitle">Go</span>!</h1>
          <h1 className="container__description__heading">
            Transfer Files like never <br /> before ⚡
          </h1>
          <div className="container__description__body">
            <input
              value={userName}
              onChange={handleChange}
              onKeyUp={handleKeyUp}
              ref={submitInput}
              className="container__description__body__input"
              placeholder="Enter Room Name Here..."
              required
            />
            <Button
              onClick={create}
              id="createButton"
              className="body__button"
              type="primary"
            >
              {buttonText}
            </Button>
          </div>
        </Col>
      </Row>
      </div>
    </>
  );
};

export default CreateRoom;
