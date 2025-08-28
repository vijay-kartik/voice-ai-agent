import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Settings, Play, Pause } from 'lucide-react';

interface VoicePreset {
  name: string;
  description: string;
  rate: number;
  pitch: number;
  volume: number;
  voiceName?: string;
  emotion: string;
}

interface AdvancedTTSProps {
  text: string;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  autoSpeak?: boolean;
}

const AdvancedTTS: React.FC<AdvancedTTSProps> = ({ 
  text, 
  onSpeakingChange,
  autoSpeak = false 
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Speech parameters
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [selectedPreset, setSelectedPreset] = useState<string>('neutral');
  const [lastSpokenText, setLastSpokenText] = useState<string>('');

  // Voice presets with emotion/style parameters
  const voicePresets: Record<string, VoicePreset> = {
    neutral: {
      name: 'Neutral',
      description: 'Natural, calm speaking style',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      emotion: 'neutral'
    },
    friendly: {
      name: 'Friendly',
      description: 'Warm and welcoming tone',
      rate: 0.95,
      pitch: 1.1,
      volume: 0.9,
      emotion: 'friendly'
    },
    excited: {
      name: 'Excited',
      description: 'Energetic and enthusiastic',
      rate: 1.2,
      pitch: 1.15,
      volume: 1.0,
      emotion: 'excited'
    },
    professional: {
      name: 'Professional',
      description: 'Clear, authoritative tone',
      rate: 0.9,
      pitch: 0.95,
      volume: 0.95,
      emotion: 'professional'
    },
    gentle: {
      name: 'Gentle',
      description: 'Soft and soothing voice',
      rate: 0.85,
      pitch: 0.9,
      volume: 0.8,
      emotion: 'gentle'
    },
    confident: {
      name: 'Confident',
      description: 'Strong and assertive tone',
      rate: 0.95,
      pitch: 0.9,
      volume: 1.0,
      emotion: 'confident'
    }
  };

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Select a good default voice (prefer English voices)
      const englishVoices = availableVoices.filter(voice => 
        voice.lang.startsWith('en') && !voice.name.includes('Microsoft')
      );
      const femaleVoices = englishVoices.filter(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('samantha')
      );
      
      setSelectedVoice(femaleVoices[0] || englishVoices[0] || availableVoices[0]);
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const applyPreset = (presetKey: string) => {
    const preset = voicePresets[presetKey];
    if (preset) {
      setRate(preset.rate);
      setPitch(preset.pitch);
      setVolume(preset.volume);
      setSelectedPreset(presetKey);
    }
  };

  const handleSpeak = useCallback(() => {
    if (!text || text.trim() === '') {
      console.log('No text to speak');
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply voice settings
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      if (onSpeakingChange) onSpeakingChange(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      if (onSpeakingChange) onSpeakingChange(false);
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
      setIsPaused(false);
      if (onSpeakingChange) onSpeakingChange(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    speechSynthesis.speak(utterance);
  }, [text, selectedVoice, rate, pitch, volume, onSpeakingChange]);

  useEffect(() => {
    if (autoSpeak && text && text.trim() && text !== lastSpokenText && !isSpeaking) {
      // Small delay to prevent rapid firing and ensure speech synthesis is ready
      const timer = setTimeout(() => {
        console.log('Auto-speaking:', text); // Debug log
        setLastSpokenText(text);
        handleSpeak();
      }, 500); // Increased delay to ensure stability
      
      return () => clearTimeout(timer);
    }
  }, [text, autoSpeak, lastSpokenText, isSpeaking, handleSpeak]);

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    if (onSpeakingChange) onSpeakingChange(false);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      speechSynthesis.resume();
    } else {
      speechSynthesis.pause();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">AI Voice Response</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Voice Presets */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Speaking Style:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(voicePresets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`p-3 text-sm rounded-lg border transition-all duration-200 ${
                selectedPreset === key
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <div className="font-medium">{preset.name}</div>
              <div className="text-xs opacity-75 mt-1">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium text-gray-700 mb-3">Voice Settings</h4>
          
          {/* Voice Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Voice:
            </label>
            <select
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const voice = voices.find(v => v.name === e.target.value);
                setSelectedVoice(voice || null);
              }}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              {voices.map((voice, index) => (
                <option key={index} value={voice.name}>
                  {voice.name} ({voice.lang}) {voice.default ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Speech Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Speed: {rate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Pitch: {pitch.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Text Preview */}
      {text && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Response:
          </label>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <p className="text-gray-800 leading-relaxed">
              {text}
            </p>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handleSpeak}
          disabled={!text || isSpeaking}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          <Play className="w-5 h-5" />
          Speak
        </button>

        {isSpeaking && (
          <button
            onClick={handlePauseResume}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}

        <button
          onClick={handleStop}
          disabled={!isSpeaking}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          <VolumeX className="w-5 h-5" />
          Stop
        </button>
      </div>

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-200 rounded-full">
            <Volume2 className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">
              {isPaused ? 'Paused' : 'Speaking...'}
            </span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-3 bg-green-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedTTS;
