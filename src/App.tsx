import React, { useState } from 'react';
import VoiceInput from './components/VoiceInput';

function App() {
  const [currentTranscript, setCurrentTranscript] = useState('');

  const handleTranscriptChange = (transcript: string) => {
    setCurrentTranscript(transcript);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎤 Voice AI Agent
          </h1>
          <p className="text-lg text-gray-600">
            Transform your voice into text with advanced speech recognition
          </p>
        </div>

        {/* Voice Input Component */}
        <VoiceInput onTranscriptChange={handleTranscriptChange} />

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">How to use:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Click the microphone button to start recording</li>
              <li>• Speak clearly into your microphone</li>
              <li>• Click the stop button or wait for auto-stop</li>
              <li>• Your speech will be converted to text automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
