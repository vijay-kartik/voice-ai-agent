import React, { useState, useEffect } from 'react';
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';
import { Mic, Volume2, Square } from 'lucide-react';
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
  const { speak } = useSpeechSynthesis();
  
  const {
    listen,
    listening,
    stop,
    supported
  } = useSpeechRecognition({
    onResult: (result: string) => {
      setTranscript(result);
      
      // Clear any existing silence timer
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
      
      // Start new silence timer - will auto-stop after 3 seconds of silence
      const newTimer = setTimeout(() => {
        handleAutoStop();
      }, 3000); // 3 seconds of silence
      
      setSilenceTimer(newTimer);
    },
    onError: (error: any) => {
      console.error('Speech recognition error:', error);
      cleanup();
    },
    onEnd: () => {
      cleanup();
    }
  });

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
  const handleAutoStop = () => {
    if (transcript.trim()) {
      // Only trigger response if we have meaningful content
      if (onTranscriptChange) {
        onTranscriptChange(transcript);
      }
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
    if (supported) {
      setTranscript('');
      setInterimTranscript('');
      listen({ 
        continuous: true, 
        interimResults: true,
        lang: 'en-US' 
      });
      setIsListening(true);
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  const handleStopListening = () => {
    stop();
    setIsListening(false);
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
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Voice Input</h2>
        <p className="text-gray-600">Click the microphone to start speaking</p>
      </div>

      {/* Voice Input Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={isListening ? handleStopListening : handleStartListening}
          className={`
            relative w-20 h-20 rounded-full flex items-center justify-center
            transition-all duration-300 transform hover:scale-105
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200' 
              : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200'
            }
            ${isListening ? 'animate-pulse' : ''}
          `}
          disabled={!supported}
        >
          {isListening ? (
            <Square className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
          
          {/* Pulsing ring animation when listening */}
          {isListening && (
            <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping opacity-75"></div>
          )}
        </button>
      </div>

      {/* Status */}
      <div className="text-center mb-4">
        <p className={`font-medium ${isListening ? 'text-red-600' : 'text-gray-500'}`}>
          {isListening ? 'Listening... Speak now! (Auto-stops after 3s of silence)' : 'Ready to listen'}
        </p>
        {isListening && (
          <p className="text-xs text-gray-500 mt-1">
            Microphone will automatically stop after 3 seconds of silence
          </p>
        )}
      </div>

      {/* Waveform Visualization */}
      <div className="mb-6">
        <WaveformVisualization isActive={isListening} />
      </div>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="mb-4">
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

      {/* Action Buttons */}
      <div className="flex justify-center gap-3">
        <button
          onClick={clearTranscript}
          disabled={!transcript}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200"
        >
          Clear
        </button>
        
        <button
          onClick={handleSpeak}
          disabled={!transcript}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200"
        >
          <Volume2 className="w-4 h-4" />
          Speak
        </button>
        
        <button
          onClick={handleAnswerRequest}
          disabled={!transcript}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200"
        >
          🤖 Answer
        </button>
      </div>

      {/* Recording Indicator */}
      {isListening && (
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 border border-red-200 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-red-700 font-medium">Recording</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
