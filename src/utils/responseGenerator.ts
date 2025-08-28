// AI Response Generator
// This module generates intelligent responses to user input

export interface ResponseContext {
  userInput: string;
  emotion?: string;
  conversationHistory?: string[];
}

export interface GeneratedResponse {
  text: string;
  emotion: string;
  suggestedVoiceStyle: string;
}

class ResponseGenerator {
  private greetings = [
    "Hello! How can I help you today?",
    "Hi there! What would you like to talk about?",
    "Greetings! I'm here to assist you.",
    "Hey! What's on your mind?",
    "Good day! How may I assist you?"
  ];

  private confirmations = [
    "I understand what you're saying.",
    "That makes sense to me.",
    "I hear you loud and clear.",
    "Got it! Thanks for sharing that.",
    "I see what you mean."
  ];

  private encouragements = [
    "That sounds really interesting!",
    "Tell me more about that!",
    "How fascinating! Please continue.",
    "I'd love to hear more details.",
    "That's quite intriguing!"
  ];

  private goodbyes = [
    "It was great talking with you! Have a wonderful day!",
    "Thanks for the conversation! Take care!",
    "Goodbye! Feel free to chat anytime.",
    "See you later! Have a great time ahead!",
    "Farewell! It was a pleasure talking with you."
  ];

  private getRandomFromArray(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)];
  }

  private detectEmotion(input: string): string {
    const lowerInput = input.toLowerCase();
    
    // Positive emotions
    if (lowerInput.includes('happy') || lowerInput.includes('excited') || 
        lowerInput.includes('great') || lowerInput.includes('awesome') ||
        lowerInput.includes('wonderful') || lowerInput.includes('amazing')) {
      return 'excited';
    }
    
    // Sad emotions
    if (lowerInput.includes('sad') || lowerInput.includes('upset') || 
        lowerInput.includes('disappointed') || lowerInput.includes('down')) {
      return 'gentle';
    }
    
    // Professional/formal
    if (lowerInput.includes('business') || lowerInput.includes('work') || 
        lowerInput.includes('professional') || lowerInput.includes('meeting')) {
      return 'professional';
    }
    
    // Friendly/casual
    if (lowerInput.includes('friend') || lowerInput.includes('chat') || 
        lowerInput.includes('talk') || lowerInput.includes('hey') ||
        lowerInput.includes('hi ') || lowerInput.startsWith('hi')) {
      return 'friendly';
    }
    
    return 'neutral';
  }

  private detectIntent(input: string): string {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || 
        lowerInput.includes('hey') || lowerInput.includes('good morning') ||
        lowerInput.includes('good evening')) {
      return 'greeting';
    }
    
    if (lowerInput.includes('bye') || lowerInput.includes('goodbye') || 
        lowerInput.includes('see you') || lowerInput.includes('farewell') ||
        lowerInput.includes('talk to you later')) {
      return 'goodbye';
    }
    
    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      return 'thanks';
    }
    
    if (lowerInput.includes('?') || lowerInput.includes('what') || 
        lowerInput.includes('how') || lowerInput.includes('why') ||
        lowerInput.includes('when') || lowerInput.includes('where')) {
      return 'question';
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('assist') || 
        lowerInput.includes('support')) {
      return 'help';
    }
    
    return 'conversation';
  }

  private generateContextualResponse(intent: string, emotion: string, userInput: string): string {
    switch (intent) {
      case 'greeting':
        return this.getRandomFromArray(this.greetings);
      
      case 'goodbye':
        return this.getRandomFromArray(this.goodbyes);
      
      case 'thanks':
        return "You're very welcome! I'm glad I could help you.";
      
      case 'question':
        return "That's a great question! While I'm a voice interface demo, I can reflect on what you're asking. " + 
               this.getRandomFromArray(this.encouragements);
      
      case 'help':
        return "I'm here to help! I can listen to what you say and respond with different voice styles. " +
               "Try asking me something or just have a conversation!";
      
      case 'conversation':
        // Generate responses based on keywords and emotion
        const responses = [
          `${this.getRandomFromArray(this.confirmations)} You mentioned something really thoughtful.`,
          `I find that quite interesting! ${this.getRandomFromArray(this.encouragements)}`,
          `${this.getRandomFromArray(this.confirmations)} That sounds like something worth exploring further.`,
          `Thanks for sharing that with me! I appreciate your perspective on this.`,
          `That's a fascinating point! I can tell you've put thought into this.`
        ];
        
        // Add emotion-specific responses
        if (emotion === 'excited') {
          responses.push("Your enthusiasm is contagious! I love your energy!");
          responses.push("How exciting! That sounds absolutely wonderful!");
        } else if (emotion === 'gentle') {
          responses.push("I understand this might be difficult to talk about. I'm here to listen.");
          responses.push("Thank you for sharing something so personal with me.");
        } else if (emotion === 'professional') {
          responses.push("I appreciate you bringing this professional matter to my attention.");
          responses.push("That's a very professional approach to handling this situation.");
        }
        
        return this.getRandomFromArray(responses);
      
      default:
        return this.getRandomFromArray(this.confirmations);
    }
  }

  generateResponse(context: ResponseContext): GeneratedResponse {
    if (!context.userInput || context.userInput.trim() === '') {
      return {
        text: "I didn't catch that. Could you please say something?",
        emotion: 'neutral',
        suggestedVoiceStyle: 'friendly'
      };
    }

    const detectedEmotion = this.detectEmotion(context.userInput);
    const intent = this.detectIntent(context.userInput);
    const responseText = this.generateContextualResponse(intent, detectedEmotion, context.userInput);

    // Map emotions to voice styles
    const voiceStyleMap: Record<string, string> = {
      'excited': 'excited',
      'gentle': 'gentle',
      'professional': 'professional',
      'friendly': 'friendly',
      'neutral': 'neutral',
      'confident': 'confident'
    };

    return {
      text: responseText,
      emotion: detectedEmotion,
      suggestedVoiceStyle: voiceStyleMap[detectedEmotion] || 'friendly'
    };
  }
}

export const responseGenerator = new ResponseGenerator();
