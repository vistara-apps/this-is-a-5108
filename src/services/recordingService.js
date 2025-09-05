import { supabase } from '../config/supabase';
import axios from 'axios';

export class RecordingService {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.stream = null;
    this.isRecording = false;
  }

  // Start recording audio/video
  async startRecording(options = { audio: true, video: true }) {
    try {
      // Request media permissions
      this.stream = await navigator.mediaDevices.getUserMedia(options);
      
      // Create MediaRecorder instance
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      this.recordedChunks = [];

      // Handle data available event
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;

      return { success: true, error: null };
    } catch (error) {
      console.error('Start recording error:', error);
      return { success: false, error: error.message };
    }
  }

  // Stop recording
  async stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve({ success: false, error: 'No active recording' });
        return;
      }

      this.mediaRecorder.onstop = async () => {
        // Create blob from recorded chunks
        const blob = new Blob(this.recordedChunks, {
          type: 'video/webm'
        });

        // Stop all tracks
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }

        this.isRecording = false;
        resolve({ success: true, blob, error: null });
      };

      this.mediaRecorder.stop();
    });
  }

  // Pause recording
  pauseRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.pause();
      return { success: true, error: null };
    }
    return { success: false, error: 'No active recording to pause' };
  }

  // Resume recording
  resumeRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.resume();
      return { success: true, error: null };
    }
    return { success: false, error: 'No paused recording to resume' };
  }

  // Upload recording to IPFS via Pinata
  async uploadToIPFS(blob, metadata = {}) {
    try {
      // Check if Pinata API keys are available
      if (!import.meta.env.VITE_PINATA_API_KEY || !import.meta.env.VITE_PINATA_SECRET_KEY) {
        console.warn('Pinata API keys not configured, skipping IPFS upload');
        return {
          success: false,
          ipfsHash: null,
          error: 'IPFS upload not configured - Pinata API keys missing'
        };
      }

      const formData = new FormData();
      const fileName = `recording-${Date.now()}.webm`;
      formData.append('file', blob, fileName);

      // Add metadata
      const pinataMetadata = {
        name: fileName,
        keyvalues: {
          timestamp: new Date().toISOString(),
          type: 'police-interaction-recording',
          ...metadata
        }
      };
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

      // Upload to Pinata
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'pinata_api_key': import.meta.env.VITE_PINATA_API_KEY,
            'pinata_secret_api_key': import.meta.env.VITE_PINATA_SECRET_KEY
          }
        }
      );

      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
        error: null
      };
    } catch (error) {
      console.error('IPFS upload error:', error);
      return {
        success: false,
        ipfsHash: null,
        error: error.message
      };
    }
  }

  // Save recording metadata to database
  async saveRecordingMetadata(userId, recordingData) {
    try {
      const { data, error } = await supabase
        .from('recordings')
        .insert([
          {
            user_id: userId,
            file_path: recordingData.filePath || null,
            ipfs_hash: recordingData.ipfsHash || null,
            duration: recordingData.duration || 0,
            type: recordingData.type || 'video',
            metadata: {
              location: recordingData.location || null,
              timestamp: recordingData.timestamp || new Date().toISOString(),
              fileSize: recordingData.fileSize || 0,
              mimeType: recordingData.mimeType || 'video/webm',
              ...recordingData.additionalMetadata
            }
          }
        ])
        .select();

      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Save recording metadata error:', error);
      return { data: null, error: error.message };
    }
  }

  // Get user recordings
  async getUserRecordings(userId, limit = 10, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get user recordings error:', error);
      return { data: null, error: error.message };
    }
  }

  // Delete recording
  async deleteRecording(userId, recordingId) {
    try {
      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('recording_id', recordingId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Delete recording error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get IPFS file URL
  static getIPFSUrl(ipfsHash) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  }

  // Download recording from IPFS
  async downloadFromIPFS(ipfsHash) {
    try {
      const url = RecordingService.getIPFSUrl(ipfsHash);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      return { blob, error: null };
    } catch (error) {
      console.error('Download from IPFS error:', error);
      return { blob: null, error: error.message };
    }
  }

  // Create download link for recording
  createDownloadLink(blob, filename = 'recording.webm') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Check recording permissions
  async checkPermissions() {
    try {
      const permissions = await Promise.all([
        navigator.permissions.query({ name: 'microphone' }),
        navigator.permissions.query({ name: 'camera' })
      ]);

      return {
        microphone: permissions[0].state,
        camera: permissions[1].state,
        error: null
      };
    } catch (error) {
      console.error('Check permissions error:', error);
      return {
        microphone: 'unknown',
        camera: 'unknown',
        error: error.message
      };
    }
  }

  // Get available media devices
  async getMediaDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      return {
        audioInputs: devices.filter(device => device.kind === 'audioinput'),
        videoInputs: devices.filter(device => device.kind === 'videoinput'),
        audioOutputs: devices.filter(device => device.kind === 'audiooutput'),
        error: null
      };
    } catch (error) {
      console.error('Get media devices error:', error);
      return {
        audioInputs: [],
        videoInputs: [],
        audioOutputs: [],
        error: error.message
      };
    }
  }

  // Process and compress recording (optional)
  async compressRecording(blob, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const video = document.createElement('video');
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth * quality;
        canvas.height = video.videoHeight * quality;
        
        video.ontimeupdate = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        };
        
        // This is a simplified compression - in production, use a proper video compression library
        canvas.toBlob((compressedBlob) => {
          resolve({ blob: compressedBlob, error: null });
        }, 'video/webm', quality);
      };
      
      video.src = URL.createObjectURL(blob);
      video.load();
    });
  }
}

export default RecordingService;
