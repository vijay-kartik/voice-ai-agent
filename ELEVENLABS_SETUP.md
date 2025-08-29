# ElevenLabs TTS Integration Setup

This voice AI agent now supports high-quality text-to-speech using ElevenLabs AI voices! 🎤✨

## Features

- **High-quality AI voices** with natural intonation and emotion
- **Multiple voice presets** optimized for different use cases
- **Automatic fallback** to browser TTS if ElevenLabs is unavailable
- **Real-time audio generation** with streaming support
- **Voice customization** with stability, similarity, and style controls

## Setup Instructions

### 1. Get an ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io/) and create an account
2. Navigate to your [API Keys settings](https://elevenlabs.io/app/settings/api-keys)
3. Click "Create New API Key" and copy the key

### 2. Configure Your Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your API key:
   ```env
   REACT_APP_ELEVENLABS_API_KEY=your_actual_api_key_here
   REACT_APP_USE_ELEVENLABS=true
   ```

### 3. Restart the Application

```bash
npm start
```

## Available Voice Presets

The integration includes 6 carefully selected voice presets:

- **Rachel (Casual)** - Matter-of-fact, personable woman (default)
- **Sarah (Professional)** - Confident and warm, mature quality
- **Brian (Narrator)** - Resonant and comforting tone for storytelling
- **Alice (British)** - Clear and engaging with British accent
- **River (Neutral)** - Relaxed, neutral voice perfect for AI agents
- **Eric (Confident)** - Smooth tenor, ideal for agentic use cases

## Voice Settings

Each preset is optimized with:
- **Model**: `eleven_turbo_v2_5` for fast, real-time generation
- **Stability**: Controls voice consistency (0.5-0.7)
- **Similarity Boost**: Enhances voice character (0.7-0.9)
- **Style**: Adds emotional expression (0.0-0.2)
- **Speaker Boost**: Improves audio quality

## Usage Cost

ElevenLabs pricing (as of 2024):
- **Free Tier**: 10,000 characters per month
- **Starter**: $5/month for 30,000 characters
- **Creator**: $22/month for 100,000 characters

Each AI response typically uses 50-200 characters depending on length.

## Troubleshooting

### Common Issues

1. **API Key Error**: Make sure your `.env` file is in the root directory and the API key is valid
2. **CORS Issues**: ElevenLabs API supports browser requests with proper API keys
3. **Audio Playback**: Ensure your browser allows audio autoplay for the best experience
4. **Slow Generation**: The first request may be slower due to voice model loading

### Fallback Behavior

If ElevenLabs is unavailable or misconfigured:
- The app automatically falls back to browser TTS
- A warning message explains the situation
- All functionality remains available with standard voices

## Technical Details

### Architecture

- **Service Layer**: `elevenLabsService.ts` handles all API interactions
- **Component Layer**: `ElevenLabsTTS.tsx` provides the React interface
- **Streaming**: Audio is generated and played in real-time
- **Memory Management**: Blob URLs are properly cleaned up to prevent memory leaks

### API Models Used

- **Primary**: `eleven_turbo_v2_5` - Optimized for speed and quality
- **Fallback**: Other models available if needed
- **Quality**: High-quality base models for premium voices

## Development

To extend voice options or modify settings:

1. Edit `elevenLabsService.ts` to add new presets
2. Update `ElevenLabsTTS.tsx` for UI changes
3. Test with different voice IDs from the [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)

## Support

For issues with:
- **ElevenLabs API**: Check their [documentation](https://elevenlabs.io/docs)
- **Integration**: Open an issue in this repository
- **Billing**: Contact ElevenLabs support directly

---

**Note**: This integration requires an internet connection and ElevenLabs API access. The browser TTS remains as a reliable offline fallback.
