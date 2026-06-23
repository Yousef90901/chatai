export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  sender: Sender;
  text?: string;
  images?: string[]; // base64 data URL for displaying image previews
}

export interface User {
  email: string;
  name: string;
  role: 'Engineer' | 'Farmer' | 'admin';
  profilePicture?: string; // base64 data URL
  isBanned?: boolean;
  isVerified?: boolean;
  followers?: string[]; // Array of user emails
  chatAccessExpiresAt?: number; // Timestamp in ms
}

// Fix: Add the missing 'Story' type definition to resolve import errors.
export interface Story {
  id: string;
  mediaUrl: string;
  likedBy: string[];
  viewedBy: string[];
  timestamp: number;
}

export interface DirectMessage {
  id: string;
  senderEmail: string;
  receiverEmail: string;
  text?: string;
  images?: string[];
  timestamp: number;
  isRead?: boolean;
}