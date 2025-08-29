import React, { useEffect, useCallback, useState } from 'react';
import { Volume2 } from 'lucide-react';

interface SimpleTTSProps {
  text: string;
  autoSpeak?: boolean;
  hideText?: boolean;
  isMobile?: boolean;
}

const SimpleTTS: React.FC<SimpleTTSProps> = ({ 
  text, 
  autoSpeak = false,
  hideText = false,
  isMobile = false
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState<string>('');
  const [needsUserInteraction, setNeedsUserInteraction] = useState(isMobile);
  const handleSpeak = useCallback(() => {
    if (!text || text.trim() === '') {
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Use default voice settings
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setNeedsUserInteraction(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
      if (isMobile && error.error === 'not-allowed') {
        setNeedsUserInteraction(true);
      }
    };

    try {
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Failed to start speech:', error);
      if (isMobile) {
        setNeedsUserInteraction(true);
      }
    }
  }, [text, isMobile]);

  useEffect(() => {
    // On desktop, auto-speak normally. On mobile, only auto-speak after user interaction
    if (autoSpeak && text && text.trim() && text !== lastSpokenText && !isSpeaking) {
      if (!isMobile || !needsUserInteraction) {
        // Small delay to prevent rapid firing and ensure speech synthesis is ready
        const timer = setTimeout(() => {
          setLastSpokenText(text);
          handleSpeak();
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [text, autoSpeak, lastSpokenText, isSpeaking, handleSpeak, isMobile, needsUserInteraction]);

  if (!text) {
    return null;
  }

  if (hideText && !isSpeaking) {
    return null;
  }

  return (
    <div className={hideText ? "" : "bg-white rounded-xl shadow-lg border border-gray-200 p-6"}>
      {/* AI Response Text - Hidden when hideText is true */}
      {!hideText && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Response:</h3>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <p className="text-gray-800 leading-relaxed">
              {text}
            </p>
          </div>
        </div>
      )}

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-200 rounded-full">
            <Volume2 className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">
              Speaking...
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

export default SimpleTTS;
