export enum PredictionCategory {
  Daily = 'Daily',
  Love = 'Love',
  Career = 'Career',
  Health = 'Health',
  Finance = 'Finance',
}

export interface User {
  id: string;
  name: string;
  dob: string;
  timeOfBirth: string;
  astroName: string; // Raasi
  nakshatra: string;
  createdAt: Date;
}

export interface Prediction {
  id: string;
  userId: string;
  category: PredictionCategory;
  content: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface PartnerDetails {
  name: string;
  dob: string;
  timeOfBirth: string;
  astroName: string; // Raasi
  nakshatra: string;
}
