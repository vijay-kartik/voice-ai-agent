// Using direct API calls instead of SDK for browser compatibility

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  description: string;
  labels: {
    accent?: string;
    age?: string;
    gender?: string;
    use_case?: string;
    descriptive?: string;
  };
  preview_url: string;
}

export interface TTSOptions {
  voice_id?: string;
  model_id?: string;
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface ElevenLabsConfig {
  apiKey: string;
}

export class ElevenLabsService {
  private apiKey: string;
  private voices: ElevenLabsVoice[] = [];
  private isInitialized = false;
  private baseUrl = 'https://api.elevenlabs.io';

  constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Try to load voices, but don't fail if we can't (permissions issue)
      try {
        await this.loadVoices();
      } catch (voiceError) {
        console.warn('Cannot load voices (likely permission issue), using predefined voices:', voiceError);
        // Use predefined public voices
        this.voices = this.getPredefinedVoices();
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize ElevenLabs service:', error);
      // Don't throw the error, just use predefined voices
      this.voices = this.getPredefinedVoices();
      this.isInitialized = true;
    }
  }

  private async loadVoices(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load voices: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.voices = data.voices || [];
    } catch (error) {
      console.error('Failed to load voices:', error);
      throw error;
    }
  }

  getVoices(): ElevenLabsVoice[] {
    return this.voices;
  }

  getVoiceById(voiceId: string): ElevenLabsVoice | undefined {
    return this.voices.find(voice => voice.voice_id === voiceId);
  }

  getVoicesByCategory(gender?: string, accent?: string, useCase?: string): ElevenLabsVoice[] {
    return this.voices.filter(voice => {
      const labels = voice.labels || {};
      return (
        (!gender || labels.gender === gender) &&
        (!accent || labels.accent === accent) &&
        (!useCase || labels.use_case === useCase)
      );
    });
  }

  private getPredefinedVoices(): ElevenLabsVoice[] {
    return [
      {
        voice_id: '21m00Tcm4TlvDq8ikWAM',
        name: 'Rachel',
        description: 'Matter-of-fact, personable woman. Great for conversational use cases.',
        labels: { accent: 'american', age: 'young', gender: 'female', use_case: 'conversational', descriptive: 'casual' },
        preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/b4928a68-c03b-411f-8533-3d5c299fd451.mp3'
      },
      {
        voice_id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Sarah',
        description: 'Young adult woman with a confident and warm, mature quality.',
        labels: { accent: 'american', age: 'young', gender: 'female', use_case: 'entertainment_tv', descriptive: 'professional' },
        preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/01a3e33c-6e99-4ee7-8543-ff2216a32186.mp3'
      },
      {
        voice_id: 'nPczCjzI2devNBz1zQrb',
        name: 'Brian',
        description: 'Middle-aged man with a resonant and comforting tone.',
        labels: { accent: 'american', age: 'middle_aged', gender: 'male', use_case: 'social_media', descriptive: 'classy' },
        preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/nPczCjzI2devNBz1zQrb/2dd3e72c-4fd3-42f1-93ea-abc5d4e5aa1d.mp3'
      },
      {
        voice_id: 'Xb7hH8MSUJpSbSDYk0k2',
        name: 'Alice',
        description: 'Clear and engaging, friendly woman with a British accent.',
        labels: { accent: 'british', age: 'middle_aged', gender: 'female', use_case: 'advertisement', descriptive: 'professional' },
        preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/Xb7hH8MSUJpSbSDYk0k2/d10f7534-11f6-41fe-a012-2de1e482d336.mp3'
      },
      {
        voice_id: 'SAz9YHcvj6GT2YYXdXww',
        name: 'River',
        description: 'A relaxed, neutral voice ready for narrations or conversational projects.',
        labels: { accent: 'american', age: 'middle_aged', gender: 'neutral', use_case: 'conversational', descriptive: 'calm' },
        preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/SAz9YHcvj6GT2YYXdXww/e6c95f0b-2227-491a-b3d7-2249240decb7.mp3'
      },
      {
        voice_id: 'cjVigY5qzO86Huf0OWal',
        name: 'Eric',
        description: 'A smooth tenor pitch from a man in his 40s - perfect for agentic use cases.',
        labels: { accent: 'american', age: 'middle_aged', gender: 'male', use_case: 'conversational', descriptive: 'classy' },
        preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/cjVigY5qzO86Huf0OWal/d098fda0-6456-4030-b3d8-63aa048c9070.mp3'
      }
    ];
  }

  async generateSpeech(text: string, options: TTSOptions = {}): Promise<ArrayBuffer> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const {
      voice_id = '21m00Tcm4TlvDq8ikWAM', // Rachel as default
      model_id = 'eleven_turbo_v2_5', // Fast model for real-time use
      stability = 0.5,
      similarity_boost = 0.8,
      style = 0.0,
      use_speaker_boost = true,
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/v1/text-to-speech/${voice_id}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings: {
            stability,
            similarity_boost,
            style,
            use_speaker_boost,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status} ${response.statusText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Failed to generate speech:', error);
      throw error;
    }
  }

  async generateSpeechUrl(text: string, options: TTSOptions = {}): Promise<string> {
    const audioBuffer = await this.generateSpeech(text, options);
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  }
}

// Default voice presets optimized for ElevenLabs
export const ELEVENLABS_VOICE_PRESETS = {
  rachel_casual: {
    name: 'Rachel (Casual)',
    description: 'Matter-of-fact, personable woman',
    voice_id: '21m00Tcm4TlvDq8ikWAM',
    model_id: 'eleven_turbo_v2_5',
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.0,
  },
  sarah_professional: {
    name: 'Sarah (Professional)',
    description: 'Confident and warm, mature quality',
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    model_id: 'eleven_turbo_v2_5',
    stability: 0.6,
    similarity_boost: 0.9,
    style: 0.1,
  },
  brian_narrator: {
    name: 'Brian (Narrator)',
    description: 'Resonant and comforting tone',
    voice_id: 'nPczCjzI2devNBz1zQrb',
    model_id: 'eleven_turbo_v2_5',
    stability: 0.7,
    similarity_boost: 0.8,
    style: 0.2,
  },
  alice_british: {
    name: 'Alice (British)',
    description: 'Clear and engaging, British accent',
    voice_id: 'Xb7hH8MSUJpSbSDYk0k2',
    model_id: 'eleven_turbo_v2_5',
    stability: 0.6,
    similarity_boost: 0.8,
    style: 0.1,
  },
  river_neutral: {
    name: 'River (Neutral)',
    description: 'Relaxed, neutral voice',
    voice_id: 'SAz9YHcvj6GT2YYXdXww',
    model_id: 'eleven_turbo_v2_5',
    stability: 0.5,
    similarity_boost: 0.7,
    style: 0.0,
  },
  eric_confident: {
    name: 'Eric (Confident)',
    description: 'Smooth tenor, perfect for AI agents',
    voice_id: 'cjVigY5qzO86Huf0OWal',
    model_id: 'eleven_turbo_v2_5',
    stability: 0.6,
    similarity_boost: 0.8,
    style: 0.1,
  },
};

export type ElevenLabsPresetKey = keyof typeof ELEVENLABS_VOICE_PRESETS;
