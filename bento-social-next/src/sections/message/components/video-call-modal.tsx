import { Button } from '@/components/button';
import { Typography } from '@/components/typography';
import { useUserProfile } from '@/context/user-context';
import { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import { Socket } from 'socket.io-client';

interface IVideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  socket: Socket | null;
  receiverId: string;
  isInitiator: boolean;
  incomingSignal?: any; // Signal data from the caller if answering
  callerName?: string;
}

export default function VideoCallModal({
  isOpen,
  onClose,
  socket,
  receiverId,
  isInitiator,
  incomingSignal,
  callerName,
}: IVideoCallModalProps) {
  const { userProfile } = useUserProfile();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<SimplePeer.Instance>();

  useEffect(() => {
    if (!isOpen) return;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        if (isInitiator) {
          // Call user immediately if initiator
          const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: currentStream,
          });

          peer.on('signal', (data) => {
            socket?.emit('call_user', {
              userToCall: receiverId,
              signalData: data,
              from: userProfile?.id,
              name: `${userProfile?.firstName} ${userProfile?.lastName}`,
            });
          });

          peer.on('stream', (remoteStream) => {
            if (userVideo.current) {
              userVideo.current.srcObject = remoteStream;
            }
          });

          socket?.on('call_accepted', (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
          });

          connectionRef.current = peer;
        } else {
          // Incoming call logic - Wait for user to accept
        }
      });

    socket?.on('call_ended', () => {
      leaveCall();
    });

    return () => {
      // Cleanup
      socket?.off('call_accepted');
      socket?.off('call_ended');
    };
  }, [isOpen]);

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: stream!,
    });

    peer.on('signal', (data) => {
      socket?.emit('answer_call', { signal: data, to: incomingSignal.from });
    });

    peer.on('stream', (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.signal(incomingSignal.signal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current?.destroy();
    stream?.getTracks().forEach((track) => track.stop());

    // Notify other user
    if (isInitiator) {
      socket?.emit('end_call', { to: receiverId });
    } else if (incomingSignal?.from) {
      socket?.emit('end_call', { to: incomingSignal.from });
    }

    onClose();
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
      setIsVideoOff(!isVideoOff);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl w-full max-w-4xl p-4 flex flex-col gap-4 relative">
        <div className="flex justify-between items-center mb-2">
          <Typography level="base2m">
            {isInitiator
              ? callAccepted
                ? 'In Call'
                : 'Calling...'
              : callAccepted
                ? `In Call with ${callerName}`
                : `${callerName} is calling...`}
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
          {/* My Video */}
          <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              className="w-full h-full object-cover mirror"
              style={{ transform: 'scaleX(-1)' }} // Mirror effect
            />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs">
              You
            </div>
          </div>

          {/* Remote Video */}
          {callAccepted && !callEnded ? (
            <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
              <video
                playsInline
                ref={userVideo}
                autoPlay
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs">
                {callerName || 'Remote User'}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center bg-neutral-900 rounded-xl">
              <Typography level="body2r" className="text-white">
                {isInitiator ? 'Waiting for answer...' : 'Incoming Call...'}
              </Typography>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-4 mt-4">
          <Button
            onClick={toggleMute}
            className={`p-3 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-neutral-200'}`}
            child={isMuted ? 'Unmute' : 'Mute'}
          />
          <Button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-neutral-200'}`}
            child={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
          />

          {!callAccepted && !isInitiator && !callEnded && (
            <Button
              onClick={answerCall}
              className="p-3 rounded-full bg-green-500 text-white"
              child="Answer"
            />
          )}

          <Button
            onClick={leaveCall}
            className="p-3 rounded-full bg-red-600 text-white"
            child="End Call"
          />
        </div>
      </div>
    </div>
  );
}
