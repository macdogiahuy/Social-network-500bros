export type AuthUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  passwordHash: string;
  salt: string;
};

export interface IAuthUserRepository {
  create(input: {
    username: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    salt: string;
  }): Promise<AuthUser>;
  findByUsername(username: string): Promise<AuthUser | null>;
}
