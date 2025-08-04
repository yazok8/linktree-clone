// src/types/index.ts - Updated types

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;  // Added
  last_name: string;   // Added
  bio: string;
  profile_picture: string;
  background_color: string;
  text_color: string;
  created_at: string;
}

export interface UserProfile extends User {
  links_count: number;
}

export interface Link {
  id: number;
  title: string;
  url: string;
  description: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLinkData {
  title: string;
  url: string;
  description?: string;
  is_active?: boolean;
  order?: number;
}

export interface UpdateLinkData extends Partial<CreateLinkData> {}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password1: string;   // dj-rest-auth expects password1
  password2: string;   // dj-rest-auth expects password2
  first_name: string;
  last_name: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
}