import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

export type TextScale = 'normal' | 'large' | 'xlarge';

interface AccessibilityContextType {
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  toggleHighContrast: () => void;
  textScale: TextScale;
  setTextScale: (scale: TextScale) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  toggleReducedMotion: () => void;
  isListening: boolean;
  startSpeechInput: (onTranscript: (text: string) => void) => void;
  stopSpeechInput: () => void;
  speakText: (text: string) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return localStorage.getItem('crimeverse_a11y_contrast') === 'true';
  });

  const [textScale, setTextScaleState] = useState<TextScale>(() => {
    return (localStorage.getItem('crimeverse_a11y_textscale') as TextScale) || 'normal';
  });

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    return localStorage.getItem('crimeverse_a11y_motion') === 'true';
  });

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  // Apply High Contrast class to <html>
  const setHighContrast = (val: boolean) => {
    setHighContrastState(val);
    localStorage.setItem('crimeverse_a11y_contrast', String(val));
    if (val) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const toggleHighContrast = () => setHighContrast(!highContrast);

  // Apply Text Scale class to <html>
  const setTextScale = (scale: TextScale) => {
    setTextScaleState(scale);
    localStorage.setItem('crimeverse_a11y_textscale', scale);
    document.documentElement.classList.remove('text-scale-normal', 'text-scale-large', 'text-scale-xlarge');
    document.documentElement.classList.add(`text-scale-${scale}`);
  };

  // Apply Reduced Motion class to <html>
  const setReducedMotion = (val: boolean) => {
    setReducedMotionState(val);
    localStorage.setItem('crimeverse_a11y_motion', String(val));
    if (val) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  };

  const toggleReducedMotion = () => setReducedMotion(!reducedMotion);

  useEffect(() => {
    if (highContrast) document.documentElement.classList.add('high-contrast');
    document.documentElement.classList.add(`text-scale-${textScale}`);
    if (reducedMotion) document.documentElement.classList.add('reduced-motion');
  }, []);

  // Web Speech API: Speech-to-Text
  const startSpeechInput = (onTranscript: (text: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice dictation is not supported in this browser. Please use Chrome/Edge or type manually.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast('Listening... Speak clearly into your microphone.', { icon: '🎙️' });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
          toast.success(`Heard: "${transcript}"`);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        toast.error(`Speech recognition error: ${event.error}`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      setRecognitionInstance(recognition);
    } catch (err) {
      setIsListening(false);
      toast.error('Failed to initiate microphone.');
    }
  };

  const stopSpeechInput = () => {
    if (recognitionInstance) {
      recognitionInstance.stop();
      setIsListening(false);
    }
  };

  // Web Speech API: Text-to-Speech
  const speakText = (text: string) => {
    if (!window.speechSynthesis) {
      toast.error('Text-to-speech is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel(); // stop any ongoing speech

    // Clean markdown/special characters for speech
    const cleanText = text
      .replace(/[*#_`>]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .slice(0, 1000);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    toast('Reading aloud...', { icon: '🔊' });
  };

  const speak = (text: string) => speakText(text);

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        setHighContrast,
        toggleHighContrast,
        textScale,
        setTextScale,
        reducedMotion,
        setReducedMotion,
        toggleReducedMotion,
        isListening,
        startSpeechInput,
        stopSpeechInput,
        speakText,
        speak,
        stopSpeaking,
        isSpeaking,
        isPanelOpen,
        setIsPanelOpen,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};


export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
};
