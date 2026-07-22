export type VoiceGender = 'Ayol' | 'Erkak';

export type VoiceCharacter = {
  id: string;
  name: string;
  gender: VoiceGender;
  description: string;
  mappedVoice: string;
  recommended?: boolean;
};

export type StyleType = 'natural' | 'cheerful' | 'calm' | 'serious' | 'dramatic';

export type StyleOption = {
  id: StyleType;
  label: string;
  description: string;
};

export type SynthesizedTrack = {
  id: string;
  text: string;
  voiceName: string;
  style: StyleType;
  speed: number;
  audioContentBase64: string; // raw base64 PCM 24000Hz mono
  timestamp: string;
  formattedDate: string;
};

export type PresetChip = {
  id: string;
  emoji: string;
  label: string;
  text: string;
};
