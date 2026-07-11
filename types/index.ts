export interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  experience: string;
  registered_at: Date;
}

export interface Admin {
  id: number;
  username: string;
  password_hash: string;
  created_at: Date;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  experience?: string;
}

export interface AdminLoginData {
  username: string;
  password: string;
}