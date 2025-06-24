export type AuthService = {
  getCurrentUser: () => Promise<User | null>;
  getUserById: (id: string) => Promise<User | null>;
  updateUser: (id: string, data: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
}

export type User = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Implementation will be added when extracting from routers