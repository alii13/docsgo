import React, { useState } from "react";
import { Button, notification } from "antd";
import copy from "copy-text-to-clipboard";
import "./Notification.css";

export default function Notification() {
  const [text, setText] = useState("Copy Room Link");

  const openNotification = () => {
    copy(window.location.href);
    setText("Copied");
    const timeOut = setTimeout(() => {
      setText("Copy Room Link");
      console.log("timeout");
    }, 2000);

    notification.open({
      message: "Copied To Clipboard✔️",
      duration: 7,
      onClick: () => {
        console.log("Link Copied ✔️");
      },
    });

    clearTimeout(timeOut);
  };

  return (
    <>
      <Button
        type="primary"
        onClick={openNotification}
        className="copy__button"
      >
        {text}
      </Button>
    </>
  );
}
