# 🎤 Voice AI Agent

A sophisticated voice conversation application built with React, TypeScript, and TailwindCSS. This application provides a complete voice-to-text and text-to-speech experience with advanced emotional intelligence and speaking styles.

## ✨ Features

### 🎯 Core Functionality
- **Real-time Speech Recognition**: Convert speech to text using Web Speech API
- **Advanced Text-to-Speech**: High-quality voice synthesis with emotion parameters
- **Intelligent Conversation**: AI-powered responses that adapt to user input and emotions
- **Visual Feedback**: Animated waveform visualization and recording indicators

### 🎭 Voice Styles & Emotions
- **Neutral**: Natural, calm speaking style
- **Friendly**: Warm and welcoming tone
- **Excited**: Energetic and enthusiastic
- **Professional**: Clear, authoritative tone
- **Gentle**: Soft and soothing voice
- **Confident**: Strong and assertive tone

### 🔧 Customization Options
- **Voice Selection**: Choose from available system voices
- **Speech Parameters**: Adjust rate, pitch, and volume
- **Auto-play**: Automatic AI response playback
- **Conversation Export**: Save conversations to text files

### 🎨 User Interface
- **Modern Design**: Beautiful gradient backgrounds and shadows
- **Responsive Layout**: Works on desktop and mobile devices
- **Intuitive Controls**: Easy-to-use microphone and playback buttons
- **Real-time Feedback**: Visual indicators for recording and speaking states

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn
- Modern web browser with Web Speech API support (Chrome, Edge, Safari)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## 🎯 How to Use

1. **Allow microphone permissions** when prompted by your browser
2. **Click the microphone button** to start voice recording
3. **Speak clearly** into your microphone
4. **Watch the AI respond** with intelligent replies
5. **Customize voice settings** using the speaking style presets
6. **Export conversations** for later review

## 🧠 AI Response System

The application includes an intelligent response generation system that:

- **Detects emotions** in user speech (happy, sad, professional, casual)
- **Identifies intent** (greetings, questions, help requests, conversations)
- **Generates contextual responses** based on detected emotion and intent
- **Suggests appropriate voice styles** for different response types
- **Maintains conversation flow** with natural, engaging replies

## 🏗️ Project Structure

```
src/
├── components/
│   ├── VoiceInput.tsx          # Speech recognition component
│   ├── AdvancedTTS.tsx         # Text-to-speech component
│   ├── VoiceConversation.tsx   # Main conversation interface
│   └── WaveformVisualization.tsx # Audio visualization
├── utils/
│   └── responseGenerator.ts    # AI response logic
├── types/
│   └── react-speech-kit.d.ts  # TypeScript declarations
└── App.tsx                     # Main application component
```

## 🛠️ Technologies Used

- **React 19**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **Web Speech API**: Browser-native speech recognition and synthesis
- **Lucide React**: Beautiful icon components
- **React Speech Kit**: Speech recognition hooks

## 🔊 Browser Compatibility

- **Chrome**: Full support for all features
- **Edge**: Full support for all features
- **Safari**: Full support for all features
- **Firefox**: Limited speech recognition support

---

**Enjoy having natural voice conversations with AI! 🎤✨**
