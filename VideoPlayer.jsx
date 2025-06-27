// src/components/VideoPlayer.jsx
import React, { useEffect, useRef, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

const VideoPlayer = () => {
  const { tracks, users, ready } = useContext(SocketContext);
  const localVideoRef = useRef();

  useEffect(() => {
    if (tracks && tracks[1] && localVideoRef.current && ready) {
      try {
        tracks[1].play(localVideoRef.current);
      } catch (err) {
        console.error("Error playing video track:", err);
        alert("Camera permission blocked or failed to load.");
      }
    }
  }, [tracks, ready]);

  if (!ready) {
    return (
      <div className="video-grid loading-video">
        <p style={{ color: 'white' }}>🎥 Loading camera & mic...</p>
      </div>
    );
  }

  return (
    <div className="video-grid">
      {/* Local video */}
      {tracks && tracks[1] && (
        <div key="local-video-container" className="video-item local-video">
          <p>You</p>
          <div ref={localVideoRef} className="agora-video-player"></div>
        </div>
      )}

      {/* Remote users */}
      {users.map(user => (
        <div key={user.uid} className="video-item remote-video">
          <p>{user.uid}</p>
          {user.videoTrack && (
            <div
              id={`player-${user.uid}`}
              className="agora-video-player"
              ref={(element) => {
                if (element && user.videoTrack) {
                  try {
                    user.videoTrack.play(element);
                  } catch (err) {
                    console.error("Error playing remote track:", err);
                  }
                }
              }}
            ></div>
          )}
          {user.audioTrack && (
            <div
              id={`audio-${user.uid}`}
              ref={(element) => {
                if (element && user.audioTrack) {
                  try {
                    user.audioTrack.play(element);
                  } catch (err) {
                    console.error("Error playing audio:", err);
                  }
                }
              }}
              style={{ display: 'none' }}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VideoPlayer;