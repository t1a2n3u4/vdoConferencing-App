// src/components/Control.jsx
import { useContext, useRef, useState } from "react";
import '../styles/Meetpage.css';
import { Button, Tooltip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import LogoutIcon from '@mui/icons-material/Logout';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ForumIcon from '@mui/icons-material/Forum';
import PersonIcon from '@mui/icons-material/Person';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

import AgoraRTC from 'agora-rtc-sdk-ng';
import RecordRTC from 'recordrtc';
import download from 'downloadjs';
import { SocketContext } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";

export default function Control() {
  const {
    tracks, client, setStart, setInCall,
    screenTrack, setScreenTrack,
    participantsListOpen, setParticipantsListOpen,
    chatsContainerOpen, setChatsContainerOpen,
    trackState, setTrackState
  } = useContext(SocketContext);

  const [screenSharing, setScreenSharing] = useState(false);
  const [screenRecording, setScreenRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const recorderRef = useRef(null);
  const navigate = useNavigate();

  const mute = async (type) => {
    if (!Array.isArray(tracks) || tracks.length < 2) return;

    if (type === "audio" && tracks[0]) {
      await tracks[0].setEnabled(!trackState?.audio);
      setTrackState((prev) => ({ ...prev, audio: !prev.audio }));
    } else if (type === "video" && tracks[1]) {
      await tracks[1].setEnabled(!trackState?.video);
      setTrackState((prev) => ({ ...prev, video: !prev.video }));
    }
  };

  const leaveChannel = async () => {
    try {
      await client.leave();
      client.removeAllListeners();
      tracks?.[0]?.close();
      tracks?.[1]?.close();
      setStart(false);
      setInCall(false);
      navigate('/');
    } catch (err) {
      console.error("Error leaving channel:", err);
    }
  };

  const startScreenSharing = async () => {
    try {
      const screenTrackLocal = await AgoraRTC.createScreenVideoTrack({ encoderConfig: '1080p_1' });
      setScreenTrack(screenTrackLocal);
      await client.unpublish(tracks?.[1]);
      await client.publish(screenTrackLocal);
      setScreenSharing(true);
    } catch (error) {
      console.error('Screen share error:', error);
    }
  };

  const stopScreenSharing = async () => {
    if (screenTrack) {
      await client.unpublish(screenTrack);
      screenTrack.stop();
      await client.publish(tracks?.[1]);
      setScreenTrack(null);
      setScreenSharing(false);
    }
  };

  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const videoStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const stream = new MediaStream([...audioStream.getTracks(), ...videoStream.getTracks()]);
      const recorder = RecordRTC(stream, { type: 'video' });
      recorderRef.current = recorder;
      recorder.startRecording();
      setScreenRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    recorderRef.current.stopRecording(() => {
      const blob = recorderRef.current.getBlob();
      setRecordedBlob(blob);
      setScreenRecording(false);
    });
  };

  const downloadVideo = async () => {
    if (recordedBlob) {
      await download(recordedBlob, 'recorded-video.webm');
      setRecordedBlob(null);
    }
  };

  return (
    <div className="controls-page">
      <div className="controllers-video-part">
        <Button onClick={() => mute("audio")} variant="contained" color={trackState?.audio ? "primary" : "secondary"}>
          <Tooltip title={trackState?.audio ? "Mic on" : "Mic off"}>
            {trackState?.audio ? <MicIcon /> : <MicOffIcon />}
          </Tooltip>
        </Button>

        <Button onClick={() => mute("video")} variant="contained" color={trackState?.video ? "primary" : "secondary"}>
          <Tooltip title={trackState?.video ? "Camera on" : "Camera off"}>
            {trackState?.video ? <VideocamIcon /> : <VideocamOffIcon />}
          </Tooltip>
        </Button>

        {screenSharing ? (
          <Button onClick={stopScreenSharing} variant="contained">
            <Tooltip title="Stop Screen Share"><StopScreenShareIcon /></Tooltip>
          </Button>
        ) : (
          <Button onClick={startScreenSharing} variant="contained">
            <Tooltip title="Share Screen"><PresentToAllIcon /></Tooltip>
          </Button>
        )}

        {screenRecording ? (
          <Button onClick={stopRecording} variant="contained">
            <Tooltip title="Stop Recording"><StopCircleIcon /></Tooltip>
          </Button>
        ) : (
          <Button onClick={startRecording} variant="contained">
            <Tooltip title="Start Recording"><RadioButtonCheckedIcon /></Tooltip>
          </Button>
        )}

        {recordedBlob && (
          <Button onClick={downloadVideo} variant="contained">
            <Tooltip title="Download Recording"><CloudDownloadIcon /></Tooltip>
          </Button>
        )}

        <Button onClick={leaveChannel} variant="contained" color="error">
          <Tooltip title="Leave Meet"><LogoutIcon /></Tooltip>
        </Button>
      </div>

      <div className="controllers-chat-participants">
        <button onClick={() => {
          setParticipantsListOpen(false);
          setChatsContainerOpen(prev => !prev);
        }}>
          <Tooltip title="Chats"><ForumIcon /></Tooltip>
        </button>

        <button onClick={() => {
          setChatsContainerOpen(false);
          setParticipantsListOpen(prev => !prev);
        }}>
          <Tooltip title="Participants"><PersonIcon /></Tooltip>
        </button>
      </div>
    </div>
  );
}
