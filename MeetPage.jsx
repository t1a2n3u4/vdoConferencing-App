import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import Control from "../components/Control";
import Participants from "../components/Participants";
import Chat from "../components/Chat";
import VideoPlayer from "../components/VideoPlayer";
import "../styles/Meetpage.css";

const MeetPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [roomName, setRoomName] = useState("");

  const {
    socket,
    setInCall,
    client,
    users,
    setUsers,
    ready,
    tracks,
    setStart,
    setParticipants,
    start,
    appId,
    loadingAppId,
    appIdError,
  } = useContext(SocketContext);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) navigate("/login");
  }, [userId, navigate]);

  useEffect(() => {
    if (!userId) return;

    socket.emit("join-room", { userId, roomId: id });

    socket.on("user-joined", () => setInCall(true));

    socket.emit("get-participants", { roomId: id });

    socket.on("participants-list", (data) => {
      if (data?.usernames) setParticipants(data.usernames);
      if (typeof data?.roomName === "string") setRoomName(data.roomName);
      else setRoomName("Untitled Room");
    });

    return () => {
      socket.off("user-joined");
      socket.off("participants-list");
    };
  }, [socket, id, setInCall, setParticipants, userId]);

  useEffect(() => {
    if (!userId || !ready || !tracks || loadingAppId || appIdError) return;

    const initRTC = async () => {
      try {
        const publishableTracks = tracks.filter(track => track);
        if (publishableTracks.length < 2) {
          alert("Please allow camera and mic permissions to join the meeting.");
          return;
        }

        await client.join(appId, id, null, userId);
        await client.publish(publishableTracks);

        client.on("user-unpublished", (user, mediaType) => {
          if (mediaType === "audio") user.audioTrack?.stop();
          if (mediaType === "video") {
            setUsers((prev) => prev.filter((u) => u.uid !== user.uid));
          }
        });

        client.on("user-left", (user) => {
          socket.emit("user-left-room", { userId: user.uid, roomId: id });
          setUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        });

        setStart(true);
      } catch (err) {
        console.error("Agora Init Error:", err);
      }
    };

    initRTC().catch(console.error);
  }, [id, client, ready, tracks, setStart, setUsers, socket, userId, appId, loadingAppId, appIdError]);

  return (
    <div className="meetPage">
      <header className="meetPage-header">
        <h3>Meet: <span>{roomName || "Loading..."}</span></h3>
        <p>Meet ID: <span>{String(id)}</span></p>
      </header>

      <aside className="sidebar participants">
        <h4>Participants</h4>
        <Participants />
      </aside>

      <main className="video-container">
        {loadingAppId ? (
          <div className="rtc-loader"><h4>Loading App ID...</h4></div>
        ) : appIdError ? (
          <div className="rtc-loader"><h4>Error loading App ID: {appIdError.message}</h4></div>
        ) : (start && tracks ? (
          <VideoPlayer tracks={tracks} users={users} />
        ) : (
          <div className="rtc-loader"><h4>Loading video...</h4></div>
        ))}
      </main>

      <aside className="sidebar chat">
        <h4>Chat</h4>
        <Chat roomId={id} userId={userId} />
      </aside>

      <footer className="controls-bar">
        <Control />
      </footer>
    </div>
  );
};

export default MeetPage;
