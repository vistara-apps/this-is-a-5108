import React, { useState, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, Square } from 'lucide-react';
import Button from './Button';

const RecordButton = ({ variant = 'start' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState('video'); // 'video' or 'audio'
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const startRecording = async (type) => {
    try {
      const constraints = type === 'video' 
        ? { video: true, audio: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { 
          type: type === 'video' ? 'video/webm' : 'audio/webm' 
        });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recording-${Date.now()}.${type === 'video' ? 'webm' : 'webm'}`;
        a.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingType(type);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access camera/microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isRecording) {
    return (
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-lg font-mono">{formatTime(recordingTime)}</span>
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        
        <Button
          variant="secondary"
          onClick={stopRecording}
          className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 border-red-500/50"
        >
          <Square className="w-5 h-5" />
          <span>Stop Recording</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <p className="text-white/70 text-sm mb-4">
        Record your interaction for evidence and protection
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={() => startRecording('video')}
          className="flex items-center justify-center space-x-2 min-w-[140px]"
        >
          <Video className="w-5 h-5" />
          <span>Video</span>
        </Button>
        
        <Button
          onClick={() => startRecording('audio')}
          variant="secondary"
          className="flex items-center justify-center space-x-2 min-w-[140px]"
        >
          <Mic className="w-5 h-5" />
          <span>Audio Only</span>
        </Button>
      </div>
      
      <p className="text-xs text-white/50">
        Recording will be saved to your device
      </p>
    </div>
  );
};

export default RecordButton;