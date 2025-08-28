import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Trash2, Download } from 'lucide-react';
import VoiceInput from './VoiceInput';
import AdvancedTTS from './AdvancedTTS';
import { responseGenerator } from '../utils/responseGenerator';

interface ConversationMessage {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
  emotion?: string;
  voiceStyle?: string;
}

const VoiceConversation: React.FC = () => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentUserInput, setCurrentUserInput] = useState('');
  const [currentAIResponse, setCurrentAIResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoPlayResponses, setAutoPlayResponses] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
    const newMessage: ConversationMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleUserTranscript = async (transcript: string) => {
    if (!transcript.trim()) return;

    setCurrentUserInput(transcript);
    setIsProcessing(true);

    // Add user message
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

      // Add AI message
      addMessage({
        type: 'ai',
        text: response.text,
        emotion: response.emotion,
        voiceStyle: response.suggestedVoiceStyle
      });

      setCurrentAIResponse(response.text);
    } catch (error) {
      console.error('Error generating response:', error);
      addMessage({
        type: 'ai',
        text: "I'm sorry, I encountered an issue generating a response. Please try again.",
        emotion: 'gentle',
        voiceStyle: 'gentle'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setCurrentUserInput('');
    setCurrentAIResponse('');
  };

  const exportConversation = () => {
    const conversationText = messages.map(msg => {
      const timestamp = msg.timestamp.toLocaleTimeString();
      return `[${timestamp}] ${msg.type.toUpperCase()}: ${msg.text}`;
    }).join('\n');

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎤 Voice AI Conversation
          </h1>
          <p className="text-lg text-gray-600">
            Have a natural conversation with AI using your voice
          </p>
          
          {/* Controls */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoPlayResponses}
                onChange={(e) => setAutoPlayResponses(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Auto-play AI responses</span>
            </label>
            
            <button
              onClick={clearConversation}
              className="flex items-center gap-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
            
            <button
              onClick={exportConversation}
              disabled={messages.length === 0}
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Voice Input */}
          <div className="space-y-6">
            <VoiceInput onTranscriptChange={handleUserTranscript} />
            
            {/* Conversation History */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-800">Conversation History</h3>
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-8">
                    Start a conversation by speaking into the microphone above
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-100 border-l-4 border-blue-500 ml-4'
                          : 'bg-green-100 border-l-4 border-green-500 mr-4'
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
                      
                      {message.voiceStyle && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                          {message.voiceStyle} style
                        </span>
                      )}
                    </div>
                  ))
                )}
                
                {isProcessing && (
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 mr-4 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
                      <span className="text-yellow-700 text-sm font-medium">AI is thinking...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Right Column: AI Voice Response */}
          <div>
            <AdvancedTTS 
              text={currentAIResponse} 
              autoSpeak={autoPlayResponses && currentAIResponse !== ''}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 max-w-4xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-3">💡 Tips for Best Experience:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <ul className="space-y-2">
              <li>• Speak clearly and at a normal pace</li>
              <li>• Try different speaking styles (friendly, professional, excited)</li>
              <li>• Ask questions or make statements</li>
              <li>• Use greetings like "Hello" or "Hi"</li>
            </ul>
            <ul className="space-y-2">
              <li>• The AI will adapt its voice style to your mood</li>
              <li>• You can customize the AI's voice in the settings</li>
              <li>• Toggle auto-play to control when responses are spoken</li>
              <li>• Export your conversation for later review</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceConversation;
