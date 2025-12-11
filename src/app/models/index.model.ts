// src/app/models/index.ts
// Export all models from one file for easy importing

export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt?: Date;
  isActive?: boolean;
}

export enum UserRole {
  GUEST = 'GUEST',
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface Event {
  id?: number;
  title: string;
  description: string;
  location: string;
  eventDate: Date;
  category: EventCategory;
  maxParticipants?: number;
  createdAt?: Date;
  isActive?: boolean;
  organizer?: User;
}

export enum EventCategory {
  SPORTS = 'SPORTS',
  STUDY = 'STUDY',
  MUSIC = 'MUSIC',
  TECH = 'TECH',
  WORKSHOP = 'WORKSHOP',
  SOCIAL = 'SOCIAL',
  GARAGE_SALE = 'GARAGE_SALE',
  OTHER = 'OTHER'
}

export interface Rsvp {
  id?: number;
  user: User;
  event: Event;
  status: RsvpStatus;
  rsvpDate?: Date;
}

export enum RsvpStatus {
  GOING = 'GOING',
  INTERESTED = 'INTERESTED',
  NOT_GOING = 'NOT_GOING'
}

export interface Comment {
  id?: number;
  user: User;
  event: Event;
  content: string;
  createdAt?: Date;
}