import React, { useEffect, useCallback, useState } from 'react';
import { Volume2, AlertCircle, Settings } from 'lucide-react';
import { ElevenLabsService, ELEVENLABS_VOICE_PRESETS, ElevenLabsPresetKey, TTSOptions } from '../services/elevenLabsService';

interface ElevenLabsTTSProps {
  text: string;
  autoSpeak?: boolean;
  hideText?: boolean;
  apiKey?: string;
  onError?: (error: string) => void;
  isMobile?: boolean;
}

const ElevenLabsTTS: React.FC<ElevenLabsTTSProps> = ({ 
  text, 
  autoSpeak = false,
  hideText = false,
  apiKey,
  onError,
  isMobile = false
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ElevenLabsPresetKey>('rachel_casual');
  const [elevenLabsService, setElevenLabsService] = useState<ElevenLabsService | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Initialize ElevenLabs service
  useEffect(() => {
    if (apiKey) {
      const service = new ElevenLabsService({ apiKey });
      setElevenLabsService(service);
      setError('');
    } else {
      setError('ElevenLabs API key not provided. Please add your API key to use high-quality TTS.');
    }

    // Initialize AudioContext for mobile browsers
    if (isMobile && !audioContext) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
        if (ctx.state === 'suspended') {
          setNeedsUserInteraction(true);
        }
      } catch (error) {
        console.warn('AudioContext not supported:', error);
      }
    }
  }, [apiKey, isMobile, audioContext]);

  const handleSpeak = useCallback(async () => {
    if (!text || text.trim() === '') {
      return;
    }

    if (!elevenLabsService) {
      setError('ElevenLabs service not initialized. Please provide an API key.');
      if (onError) onError('ElevenLabs service not initialized');
      return;
    }

    // Resume AudioContext for mobile browsers
    if (isMobile && audioContext && audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
        setNeedsUserInteraction(false);
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
        setNeedsUserInteraction(true);
        return;
      }
    }

    // Stop any current audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const preset = ELEVENLABS_VOICE_PRESETS[selectedPreset];
      const options: TTSOptions = {
        voice_id: preset.voice_id,
        model_id: preset.model_id,
        stability: preset.stability,
        similarity_boost: preset.similarity_boost,
        style: preset.style,
        use_speaker_boost: true,
      };

      const audioUrl = await elevenLabsService.generateSpeechUrl(text, options);
      
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);

      audio.onloadstart = () => {
        setIsLoading(true);
      };

      audio.oncanplay = () => {
        setIsLoading(false);
        setIsSpeaking(true);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        setIsLoading(false);
        // Clean up the object URL
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setError('Failed to play generated audio');
        setIsSpeaking(false);
        setIsLoading(false);
        if (onError) onError('Audio playback failed');
        // Clean up the object URL
        URL.revokeObjectURL(audioUrl);
      };

      // For mobile browsers, we need to handle autoplay restrictions
      try {
        await audio.play();
      } catch (playError: any) {
        console.error('Audio play error:', playError);
        if (playError.name === 'NotAllowedError') {
          setNeedsUserInteraction(true);
          setError('Tap to enable audio playback');
          setIsLoading(false);
        } else {
          throw playError;
        }
      }
    } catch (error: any) {
      console.error('ElevenLabs TTS error:', error);
      const errorMessage = error.message || 'Failed to generate speech with ElevenLabs';
      setError(errorMessage);
      setIsSpeaking(false);
      setIsLoading(false);
      if (onError) onError(errorMessage);
    }
  }, [text, elevenLabsService, selectedPreset, currentAudio, onError, isMobile, audioContext]);

  const handleStop = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, [currentAudio]);

  // Auto-speak functionality (disabled on mobile to prevent autoplay issues)
  useEffect(() => {
    if (!isMobile && autoSpeak && text && text.trim() && text !== lastSpokenText && !isSpeaking && !isLoading && elevenLabsService && !error) {
      const timer = setTimeout(() => {
        setLastSpokenText(text);
        handleSpeak();
      }, 500);
      
      return () => clearTimeout(timer);
    } else if (isMobile && autoSpeak && text && text.trim() && text !== lastSpokenText && !needsUserInteraction) {
      // On mobile, only auto-speak if user has already interacted
      const timer = setTimeout(() => {
        setLastSpokenText(text);
        handleSpeak();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [text, autoSpeak, lastSpokenText, isSpeaking, isLoading, elevenLabsService, error, handleSpeak, isMobile, needsUserInteraction]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        if (currentAudio.src.startsWith('blob:')) {
          URL.revokeObjectURL(currentAudio.src);
        }
      }
    };
  }, [currentAudio]);

  if (!text) {
    return null;
  }

  if (hideText && !isSpeaking && !isLoading) {
    return null;
  }

  return (
    <div className={hideText ? "" : "bg-white rounded-xl shadow-lg border border-gray-200 p-6"}>
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 text-sm font-medium">ElevenLabs TTS Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            {!apiKey && (
              <p className="text-red-600 text-xs mt-2">
                To enable high-quality TTS, add your ElevenLabs API key to your environment variables or component props.
              </p>
            )}
          </div>
        </div>
      )}

      {/* AI Response Text - Hidden when hideText is true */}
      {!hideText && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800">AI Response:</h3>
            {elevenLabsService && !error && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title="Voice settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Voice Settings */}
          {showSettings && elevenLabsService && !error && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium text-gray-700 mb-3">Voice Selection</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(Object.keys(ELEVENLABS_VOICE_PRESETS) as ElevenLabsPresetKey[]).map((presetKey) => {
                  const preset = ELEVENLABS_VOICE_PRESETS[presetKey];
                  return (
                    <button
                      key={presetKey}
                      onClick={() => setSelectedPreset(presetKey)}
                      className={`p-3 text-sm rounded-lg border transition-all duration-200 text-left ${
                        selectedPreset === presetKey
                          ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs opacity-75 mt-1">{preset.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <p className="text-gray-800 leading-relaxed">
              {text}
            </p>
          </div>
          
          {/* Manual Play Button (when not auto-speaking or on mobile) */}
          {elevenLabsService && !error && (!autoSpeak || isMobile || needsUserInteraction) && (
            <div className="flex justify-center mt-4">
              <button
                onClick={isLoading || isSpeaking ? handleStop : handleSpeak}
                disabled={isLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  isLoading || isSpeaking
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : needsUserInteraction
                    ? 'bg-blue-500 hover:bg-blue-600 text-white animate-pulse'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } disabled:opacity-50`}
              >
                <Volume2 className="w-5 h-5" />
                {isLoading ? 'Generating...' : isSpeaking ? 'Stop' : needsUserInteraction ? 'Tap to Enable Audio' : 'Play with ElevenLabs'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Status Indicators */}
      {(isLoading || isSpeaking) && (
        <div className="flex justify-center">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            isLoading 
              ? 'bg-blue-100 border-blue-200' 
              : 'bg-green-100 border-green-200'
          }`}>
            <Volume2 className={`w-4 h-4 ${
              isLoading ? 'text-blue-600' : 'text-green-600'
            }`} />
            <span className={`text-sm font-medium ${
              isLoading ? 'text-blue-700' : 'text-green-700'
            }`}>
              {isLoading ? 'Generating speech...' : 'Speaking...'}
            </span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-3 rounded-full animate-pulse ${
                    isLoading ? 'bg-blue-500' : 'bg-green-500'
                  }`}
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

export default ElevenLabsTTS;
