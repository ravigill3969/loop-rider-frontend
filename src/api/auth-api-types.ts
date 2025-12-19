
export interface UserResponse {
  success: boolean;
  message: string;
  status: number;
  user: User;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  birth_month: string;
  birth_year: number;
  updated_at: number; // Unix timestamp
  created_at: number; // Unix timestamp
}
