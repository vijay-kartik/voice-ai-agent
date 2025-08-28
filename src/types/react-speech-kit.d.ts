declare module 'react-speech-kit' {
  interface SpeechSynthesisOptions {
    text: string;
    voice?: SpeechSynthesisVoice;
    rate?: number;
    pitch?: number;
    volume?: number;
  }

  interface SpeechRecognitionOptions {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
  }

  interface SpeechSynthesisHook {
    speak: (options: SpeechSynthesisOptions) => void;
    cancel: () => void;
    speaking: boolean;
    supported: boolean;
  }

  interface SpeechRecognitionHook {
    listen: (options?: SpeechRecognitionOptions) => void;
    listening: boolean;
    stop: () => void;
    supported: boolean;
  }

  interface SpeechRecognitionConfig {
    onResult?: (result: string) => void;
    onError?: (error: any) => void;
    onEnd?: () => void;
  }

  export function useSpeechSynthesis(): SpeechSynthesisHook;
  export function useSpeechRecognition(config?: SpeechRecognitionConfig): SpeechRecognitionHook;
}
