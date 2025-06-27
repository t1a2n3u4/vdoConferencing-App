import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import AgoraRTC from 'agora-rtc-sdk-ng';
import {
  useRTCClient,
  useLocalCameraTrack,
  useLocalMicrophoneTrack
} from 'agora-rtc-react';

export const appId = process.env.REACT_APP_AGORA_APP_ID;
export const config = { mode: 'rtc', codec: 'vp8' };

const client = AgoraRTC.createClient(config);
export const useClient = () => useRTCClient(client);

export const useMicrophoneAndCameraTracks = () => {
  const { track: micTrack, isLoading: micLoading } = useLocalMicrophoneTrack();
  const { track: camTrack, isLoading: camLoading } = useLocalCameraTrack();

  const isLoading = micLoading || camLoading;

  const tracks = [];
  if (micTrack) tracks.push(micTrack);
  if (camTrack) tracks.push(camTrack);

  const ready = !isLoading && tracks.length === 2;

  console.log("🎤 Mic track:", micTrack);
  console.log("🎥 Cam track:", camTrack);
  console.log("✅ Ready:", ready);

  return { tracks, ready };
};

export { client };
