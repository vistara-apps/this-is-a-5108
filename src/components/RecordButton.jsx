import React, { useState, useEffect, useRef } from 'react';
import { Video, Square, Pause, Play, Download, Upload, AlertCircle, Mic } from 'lucide-react';
import Button from './Button';
import { RecordingService } from '../services/recordingService';
import { useAuth } from '../contexts/AuthContext';

const RecordButton = ({ variant = 'start' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState({ microphone: 'unknown', camera: 'unknown' });
  const [recordingType, setRecordingType] = useState('video');

  const recordingServiceRef = useRef(new RecordingService());
  const recordingBlobRef = useRef(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const checkPermissions = async () => {
    const perms = await recordingServiceRef.current.checkPermissions();
    setPermissions(perms);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async (type = 'video') => {
    try {
      setError('');
      setRecordingType(type);
      const options = type === 'video' 
        ? { audio: true, video: true }
        : { audio: true, video: false };

      const result = await recordingServiceRef.current.startRecording(options);

      if (result.success) {
        setIsRecording(true);
        setRecordingTime(0);
        setHasRecording(false);
      } else {
        setError(result.error || 'Failed to start recording');
      }
    } catch (error) {
      setError('Camera/microphone access denied. Please enable permissions to record.');
    }
  };

  const handleStopRecording = async () => {
    try {
      const result = await recordingServiceRef.current.stopRecording();
      
      if (result.success && result.blob) {
        recordingBlobRef.current = result.blob;
        setIsRecording(false);
        setIsPaused(false);
        setHasRecording(true);
      } else {
        setError(result.error || 'Failed to stop recording');
      }
    } catch (error) {
      setError('Failed to stop recording');
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      recordingServiceRef.current.resumeRecording();
    } else {
      recordingServiceRef.current.pauseRecording();
    }
    setIsPaused(!isPaused);
  };

  const handleDownload = () => {
    if (recordingBlobRef.current) {
      const extension = recordingType === 'video' ? 'webm' : 'webm';
      const filename = `police-interaction-${recordingType}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${extension}`;
      recordingServiceRef.current.createDownloadLink(recordingBlobRef.current, filename);
    }
  };

  const handleUpload = async () => {
    if (!recordingBlobRef.current) {
      setError('No recording to upload');
      return;
    }

    if (!isAuthenticated) {
      setError('Please sign in to upload recordings');
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus('Uploading to IPFS...');

      // Upload to IPFS
      const uploadResult = await recordingServiceRef.current.uploadToIPFS(
        recordingBlobRef.current,
        {
          userId: user.id,
          timestamp: new Date().toISOString(),
          duration: recordingTime,
          type: recordingType
        }
      );

      if (uploadResult.success) {
        setUploadStatus('Saving metadata...');
        
        // Save metadata to database
        const metadataResult = await recordingServiceRef.current.saveRecordingMetadata(
          user.id,
          {
            ipfsHash: uploadResult.ipfsHash,
            duration: recordingTime,
            type: recordingType,
            fileSize: recordingBlobRef.current.size,
            mimeType: recordingBlobRef.current.type,
            timestamp: new Date().toISOString(),
            additionalMetadata: {
              pinSize: uploadResult.pinSize,
              pinTimestamp: uploadResult.timestamp
            }
          }
        );

        if (metadataResult.error) {
          console.error('Failed to save metadata:', metadataResult.error);
        }

        setUploadStatus('Upload complete! Recording secured on IPFS.');
        setTimeout(() => setUploadStatus(''), 3000);
      } else {
        setError(uploadResult.error || 'Failed to upload to IPFS');
      }
    } catch (error) {
      setError('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const resetRecording = () => {
    setHasRecording(false);
    setRecordingTime(0);
    setError('');
    setUploadStatus('');
    recordingBlobRef.current = null;
  };

  if (error) {
    return (
      <div className="text-center space-y-4">
        <div className="w-24 h-24 mx-auto bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-red-400" />
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-red-400">Recording Error</h3>
          <p className="text-sm text-white/70 mb-4">{error}</p>
        </div>
        <Button onClick={() => { setError(''); resetRecording(); }} variant="secondary">
          Try Again
        </Button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="text-center space-y-4">
        <div className="w-24 h-24 mx-auto bg-red-500 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-6 h-6 bg-white rounded-sm"></div>
        </div>
        
        <div>
          <div className="text-2xl font-mono font-bold text-red-400 mb-2">
            {formatTime(recordingTime)}
          </div>
          <p className="text-sm text-white/70 mb-4">
            {isPaused ? 'Recording paused...' : `${recordingType === 'video' ? 'Video' : 'Audio'} recording in progress...`}
          </p>
        </div>

        <div className="flex justify-center space-x-3">
          <Button
            onClick={handlePauseResume}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </Button>
          
          <Button
            onClick={handleStopRecording}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
          >
            <Square className="w-4 h-4" />
            <span>Stop</span>
          </Button>
        </div>
      </div>
    );
  }

  if (hasRecording) {
    return (
      <div className="text-center space-y-4">
        <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center">
          {recordingType === 'video' ? <Video className="w-12 h-12 text-white" /> : <Mic className="w-12 h-12 text-white" />}
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Recording Complete</h3>
          <div className="text-lg font-mono text-green-400 mb-2">
            {formatTime(recordingTime)}
          </div>
          <p className="text-sm text-white/70 mb-2">
            Your {recordingType} interaction has been recorded
          </p>
          {uploadStatus && (
            <p className="text-sm text-green-400 mb-2">{uploadStatus}</p>
          )}
        </div>

        <div className="flex justify-center space-x-3 flex-wrap gap-2">
          <Button
            onClick={handleDownload}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </Button>
          
          <Button
            onClick={handleUpload}
            disabled={isUploading || !isAuthenticated}
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Uploading...' : 'Upload to IPFS'}</span>
          </Button>
          
          <Button
            onClick={resetRecording}
            variant="secondary"
          >
            New Recording
          </Button>
        </div>

        {!isAuthenticated && (
          <p className="text-xs text-yellow-400 mt-2">
            Sign in to upload recordings to secure IPFS storage
          </p>
        )}
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
          onClick={() => handleStartRecording('video')}
          className="flex items-center justify-center space-x-2 min-w-[140px]"
        >
          <Video className="w-5 h-5" />
          <span>Video</span>
        </Button>
        
        <Button
          onClick={() => handleStartRecording('audio')}
          variant="secondary"
          className="flex items-center justify-center space-x-2 min-w-[140px]"
        >
          <Mic className="w-5 h-5" />
          <span>Audio Only</span>
        </Button>
      </div>
      
      <div className="text-xs text-white/50 space-y-1">
        <p>Recording will be saved to your device</p>
        {isAuthenticated && <p>Sign in to upload to secure IPFS storage</p>}
        {permissions.microphone === 'denied' || permissions.camera === 'denied' ? (
          <p className="text-yellow-400">⚠️ Camera/microphone permissions required</p>
        ) : null}
      </div>
    </div>
  );
};

export default RecordButton;
