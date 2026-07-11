// app/api/types.ts
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  address: string;
  course: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Comment {
  id: number;
  user_id: number;
  comment: string;
  created_at: Date;
  user_name?: string;
  email?: string;
}

export interface CommentWithUser extends Comment {
  user_name: string;
  email: string;
}

export interface ApiResponse {
  success?: boolean;
  message?: string;
  comments?: Comment[];
  comment?: Comment | CommentWithUser;
  user?: Partial<User>;
  error?: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string | null;
}

export interface FindOrCreateUserResponse {
  success: boolean;
  user: UserResponse;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  message: string;
  error?: string;
}