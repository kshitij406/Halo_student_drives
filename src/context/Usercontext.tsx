'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Role = 'user' | 'dev';

interface User {
  username: string;
  email: string;
  role: 'user' | 'dev';
}


interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
