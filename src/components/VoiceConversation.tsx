import React, { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import VoiceInput from './VoiceInput';
import SimpleTTS from './SimpleTTS';
import ElevenLabsTTS from './ElevenLabsTTS';
import { responseGenerator } from '../utils/responseGenerator';

interface ConversationMessage {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const VoiceConversation: React.FC = () => {
  const [currentAIResponse, setCurrentAIResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessedInput, setLastProcessedInput] = useState('');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [showConversationDialog, setShowConversationDialog] = useState(false);
  const [currentUserInput, setCurrentUserInput] = useState('');
  const [ttsError, setTtsError] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);

  // Get configuration from environment variables
  const elevenLabsApiKey = process.env.REACT_APP_ELEVENLABS_API_KEY;
  const useElevenLabs = process.env.REACT_APP_USE_ELEVENLABS !== 'false' && !!elevenLabsApiKey;

  // Hook to detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // 768px is md breakpoint in Tailwind
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleUserTranscript = async (transcript: string) => {
    if (!transcript.trim()) return;
    setCurrentUserInput(transcript);
  };

  const addMessage = (message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
    const newMessage: ConversationMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleAnswerRequest = async (transcript: string) => {
    console.log('handleAnswerRequest called with:', transcript); // Debug log
    if (!transcript.trim() || isProcessing || transcript === lastProcessedInput) {
      console.log('Request blocked:', { isEmpty: !transcript.trim(), isProcessing, isDuplicate: transcript === lastProcessedInput });
      return;
    }

    console.log('Processing answer request'); // Debug log
    setLastProcessedInput(transcript);
    setIsProcessing(true);

    // Add user message to conversation
    addMessage({
      type: 'user',
      text: transcript
    });

    // Generate AI response
    try {
      const response = responseGenerator.generateResponse({
        userInput: transcript,
        conversationHistory: messages.map(m => m.text)
      });

      // Add AI response to conversation
      addMessage({
        type: 'ai',
        text: response.text
      });

      setCurrentAIResponse(response.text);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage = "I'm sorry, I encountered an issue generating a response. Please try again.";
      
      addMessage({
        type: 'ai',
        text: errorMessage
      });
      
      setCurrentAIResponse(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header - Hidden on mobile */}
        <div className="hidden md:block text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎤 Voice AI Agent
          </h1>
          <p className="text-lg text-gray-600">
            Speak your question and get an AI response
          </p>
        </div>

        {/* Mobile: Show conversation button at top */}
        <div className="md:hidden pt-4 pb-2 flex justify-center">
          <button
            onClick={() => setShowConversationDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-full shadow-md border border-gray-200 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">View Conversation ({messages.length})</span>
          </button>
        </div>

        {/* Desktop: Show conversation button */}
        <div className="hidden md:block mb-6 flex justify-center">
          <button
            onClick={() => setShowConversationDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm border border-gray-200 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">View Conversation History ({messages.length})</span>
          </button>
        </div>

        {/* Voice Input Section */}
        <div className="py-4 md:py-8">
          <VoiceInput 
            onTranscriptChange={handleUserTranscript} 
            onAnswerRequest={handleAnswerRequest}
          />
        </div>

        {/* AI Voice Response Section - Only render ONE TTS component */}
        <div className="pb-4 md:pb-8">
          {currentAIResponse && (
            <>
              {isMobile ? (
                // Mobile: Only show speaking indicator - TTS with hidden text
                <div className="block md:hidden">
                  {useElevenLabs ? (
                    <ElevenLabsTTS
                      text={currentAIResponse}
                      autoSpeak={true}
                      hideText={true}
                      apiKey={elevenLabsApiKey}
                      onError={setTtsError}
                    />
                  ) : (
                    <SimpleTTS
                      text={currentAIResponse}
                      autoSpeak={true}
                      hideText={true}
                    />
                  )}
                </div>
              ) : (
                // Desktop: Show full response - TTS with visible text
                <div className="hidden md:block">
                  {useElevenLabs ? (
                    <ElevenLabsTTS
                      text={currentAIResponse}
                      autoSpeak={true}
                      hideText={false}
                      apiKey={elevenLabsApiKey}
                      onError={setTtsError}
                    />
                  ) : (
                    <SimpleTTS
                      text={currentAIResponse}
                      autoSpeak={true}
                      hideText={false}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* TTS Error Display */}
        {ttsError && (
          <div className="mx-4 md:mx-0 mb-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 text-orange-600 mt-0.5">⚠️</div>
              <div className="flex-1">
                <p className="text-orange-800 text-sm font-medium">TTS Notice</p>
                <p className="text-orange-700 text-sm mt-1">{ttsError}</p>
                <p className="text-orange-600 text-xs mt-2">
                  The app will fall back to browser TTS if ElevenLabs is unavailable.
                </p>
              </div>
              <button
                onClick={() => setTtsError('')}
                className="text-orange-500 hover:text-orange-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mx-4 md:mx-0 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
              <span className="text-yellow-700 font-medium text-sm md:text-base">AI is processing your request...</span>
            </div>
          </div>
        )}
      </div>

      {/* Conversation Dialog */}
      {showConversationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Dialog Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Conversation History</h2>
              <button
                onClick={() => setShowConversationDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <p className="text-gray-500 italic text-center py-8">
                  No conversation yet. Start by speaking into the microphone.
                </p>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-50 border-l-4 border-blue-500 ml-4'
                          : 'bg-green-50 border-l-4 border-green-500 mr-4'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-medium text-sm ${
                          message.type === 'user' ? 'text-blue-700' : 'text-green-700'
                        }`}>
                          {message.type === 'user' ? 'You' : 'AI'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {message.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowConversationDialog(false)}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceConversation;
