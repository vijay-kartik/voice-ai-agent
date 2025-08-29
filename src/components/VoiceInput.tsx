import React, { useState, useEffect, useRef } from 'react';
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';
import { Mic, Volume2, Square, AlertCircle } from 'lucide-react';
import WaveformVisualization from './WaveformVisualization';

interface VoiceInputProps {
  onTranscriptChange?: (transcript: string) => void;
  onAnswerRequest?: (transcript: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscriptChange, onAnswerRequest }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [permissionError, setPermissionError] = useState('');
  const { speak } = useSpeechSynthesis();
  const permissionChecked = useRef(false);
  const isProcessing = useRef(false); // Prevent multiple triggers
  const latestTranscript = useRef(''); // Keep track of latest transcript

  const {
    listen,
    listening,
    stop,
    supported
  } = useSpeechRecognition({
    onResult: (result: string) => {
      console.log('Speech result:', result); // Debug log
      setTranscript(result);
      latestTranscript.current = result; // Store in ref for immediate access

      // Clear any existing silence timer
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }

      // Start new silence timer - will auto-stop after 1 seconds of silence (reduced from 3)
      const newTimer = setTimeout(() => {
        console.log('Auto-stopping due to silence with transcript:', latestTranscript.current); // Debug log
        handleAutoStop(latestTranscript.current);
      }, 1000); // 1 seconds of silence

      setSilenceTimer(newTimer);
    },
    onError: (error: any) => {
      console.error('Speech recognition error:', error);
      if (error.error === 'not-allowed') {
        setPermissionStatus('denied');
        setPermissionError('Microphone access denied. Please allow microphone access and try again.');
      }
      cleanup();
    },
    onEnd: () => {
      console.log('Speech recognition ended'); // Debug log
      // Just cleanup - don't trigger response here to avoid loops
      cleanup();
    }
  });

  // Check microphone permission on component mount
  useEffect(() => {
    if (!permissionChecked.current && navigator.permissions) {
      permissionChecked.current = true;
      
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((result) => {
          setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
          
          // Listen for permission changes
          result.addEventListener('change', () => {
            setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
            if (result.state === 'denied') {
              setPermissionError('Microphone access denied. Please allow microphone access in your browser settings.');
            } else if (result.state === 'granted') {
              setPermissionError('');
            }
          });
        })
        .catch((error) => {
          console.warn('Permission API not fully supported:', error);
          // Fallback: try to request permission directly
          requestMicrophonePermission();
        });
    } else if (!permissionChecked.current) {
      // Fallback for browsers without Permission API
      permissionChecked.current = true;
      requestMicrophonePermission();
    }
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionStatus('granted');
      setPermissionError('');
      // Stop the stream immediately as we just needed to check permission
      stream.getTracks().forEach(track => track.stop());
    } catch (error: any) {
      console.error('Error requesting microphone permission:', error);
      setPermissionStatus('denied');
      if (error.name === 'NotAllowedError') {
        setPermissionError('Microphone access denied. Please allow microphone access and refresh the page.');
      } else {
        setPermissionError('Unable to access microphone. Please check your browser settings.');
      }
    }
  };

  useEffect(() => {
    setIsListening(listening);
  }, [listening]);

  // Cleanup function to clear timers and reset states
  const cleanup = () => {
    setIsListening(false);
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
  };

  // Auto-stop function when silence is detected
  const handleAutoStop = (finalTranscript?: string) => {
    const transcriptToUse = finalTranscript || transcript;
    console.log('handleAutoStop called with transcript:', transcriptToUse); // Debug log
    
    // Prevent multiple simultaneous calls
    if (isProcessing.current) {
      console.log('Already processing, skipping');
      return;
    }
    
    isProcessing.current = true;
    
    if (transcriptToUse.trim()) {
      console.log('Triggering answer request'); // Debug log
      // Only trigger response if we have meaningful content
      if (onTranscriptChange) {
        onTranscriptChange(transcriptToUse);
      }
      // Automatically trigger the answer request when recording stops
      if (onAnswerRequest) {
        // Use setTimeout to ensure this happens after cleanup
        setTimeout(() => {
          onAnswerRequest(transcriptToUse);
          isProcessing.current = false; // Reset after processing
        }, 100);
      }
    } else {
      isProcessing.current = false;
    }
    
    stop();
    cleanup();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, [silenceTimer]);

  const handleStartListening = () => {
    if (!supported) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    
    if (permissionStatus === 'denied') {
      alert('Microphone access is denied. Please allow microphone access in your browser settings and refresh the page.');
      return;
    }

    setTranscript('');
    setInterimTranscript('');
    setPermissionError('');
    isProcessing.current = false; // Reset processing flag
    latestTranscript.current = ''; // Reset transcript ref
    
    try {
      listen({
        continuous: true,
        interimResults: true,
        lang: 'en-US'
      });
      setIsListening(true);
      setPermissionStatus('granted');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setPermissionError('Failed to start voice recognition. Please try again.');
    }
  };

  const handleStopListening = () => {
    // When manually stopping, also trigger auto-stop behavior
    const currentTranscript = latestTranscript.current || transcript;
    if (!isProcessing.current && currentTranscript.trim()) {
      isProcessing.current = true;
      if (onTranscriptChange) {
        onTranscriptChange(currentTranscript);
      }
      // Automatically trigger the answer request when manually stopping
      if (onAnswerRequest) {
        setTimeout(() => {
          onAnswerRequest(currentTranscript);
          isProcessing.current = false;
        }, 100);
      }
    }
    stop();
    cleanup();
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    if (onTranscriptChange) {
      onTranscriptChange('');
    }
  };

  const handleSpeak = () => {
    if (transcript) {
      speak({ text: transcript });
    }
  };

  const handleAnswerRequest = () => {
    if (transcript.trim() && onAnswerRequest) {
      onAnswerRequest(transcript);
    }
  };

  if (!supported) {
    return (
      <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">
          Speech recognition is not supported in this browser.
          Please try using Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-lg">
      {/* Title - Hidden on mobile */}
      <div className="hidden md:block text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Voice Input</h2>
        <p className="text-gray-600">Click the microphone to start speaking</p>
      </div>

      {/* Permission Error */}
      {permissionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{permissionError}</p>
          </div>
        </div>
      )}

      {/* Voice Input Button */}
      <div className="flex justify-center mb-4 md:mb-6">
        <button
          onClick={isListening ? handleStopListening : handleStartListening}
          className={`
            relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center
            transition-all duration-300 transform hover:scale-105
            ${isListening
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200'
              : permissionStatus === 'denied'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200'
            }
            ${isListening ? 'animate-pulse' : ''}
          `}
          disabled={!supported || permissionStatus === 'denied'}
        >
          {isListening ? (
            <Square className="w-6 h-6 md:w-8 md:h-8 text-white" />
          ) : (
            <Mic className="w-6 h-6 md:w-8 md:h-8 text-white" />
          )}

          {/* Pulsing ring animation when listening */}
          {isListening && (
            <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping opacity-75"></div>
          )}
        </button>
      </div>

      {/* Status */}
      <div className="text-center mb-4">
        <p className={`font-medium text-sm md:text-base ${
          isListening 
            ? 'text-red-600' 
            : permissionStatus === 'denied'
            ? 'text-red-600'
            : permissionStatus === 'granted'
            ? 'text-green-600'
            : 'text-gray-500'
        }`}>
          {isListening 
            ? 'Listening... Speak now!' 
            : permissionStatus === 'denied'
            ? 'Microphone access denied'
            : permissionStatus === 'granted'
            ? 'Ready to listen'
            : 'Click microphone to start'
          }
        </p>
      </div>

      {/* Waveform Visualization */}
      <div className="mb-4 md:mb-6">
        <WaveformVisualization isActive={isListening} />
      </div>

      {/* Transcript Display - Hidden on mobile */}
      {(transcript || interimTranscript) && (
        <div className="hidden md:block mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transcript:
          </label>
          <div className="min-h-[100px] p-4 border border-gray-300 rounded-lg bg-gray-50">
            <p className="text-gray-800 leading-relaxed">
              {transcript}
              {interimTranscript && (
                <span className="text-gray-500 italic">{interimTranscript}</span>
              )}
            </p>
          </div>
        </div>
      )}

        {/* Mobile: Show simple transcript indicator */}
        {transcript && (
          <div className="block md:hidden mb-4 text-center">
            <p className="text-sm text-gray-600 font-medium">
              ✓ Voice captured - Processing response...
            </p>
          </div>
        )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-2 md:gap-3 flex-wrap">
        <button
          onClick={clearTranscript}
          disabled={!transcript}
          className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200 text-sm md:text-base"
        >
          Clear
        </button>

        {/* Hide Speak button on mobile */}
        <button
          onClick={handleSpeak}
          disabled={!transcript}
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200"
        >
          <Volume2 className="w-4 h-4" />
          Speak
        </button>

        <button
          onClick={handleAnswerRequest}
          disabled={!transcript}
          className="flex items-center gap-1 md:gap-2 px-4 md:px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200 font-medium text-sm md:text-base"
        >
          🤖 Answer
        </button>
      </div>

      {/* Recording Indicator */}
      {isListening && (
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 border border-red-200 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs md:text-sm text-red-700 font-medium">Recording</span>
          </div>
        </div>
      )}

      {/* Permission Request Button */}
      {permissionStatus === 'denied' && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={requestMicrophonePermission}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Request Microphone Access
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
