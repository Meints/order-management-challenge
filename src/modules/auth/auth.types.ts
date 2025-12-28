export type UserEntity = {
  id: string;
  email: string;
  password: string;
};

export type JwtPayload = {
  id: string;
  email: string;
};

export type AuthResult = {
  token: string;
};

export type UserResponse = {
  id: string;
  email: string;
};
