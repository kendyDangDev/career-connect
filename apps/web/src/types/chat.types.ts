export interface ChatTokenUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userType: string;
}

export interface ChatTokenResponse {
  success: boolean;
  token: string;
  expiresIn: string;
  user: ChatTokenUser;
}
