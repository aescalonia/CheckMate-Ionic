import React, { createContext, useContext, useState, ReactNode } from 'react';

// Interface for the UserContext component props
interface UserContextProps {
  user: User | null;
  loginUser: (userData: User) => void;
  addCompletedTask: (task: { text: string; completed: boolean; date: string }) => void;
}

// Interface for the User object
interface User {
  userId: string;
  email: string;
  name: string;
  completedTasks: { text: string; completed: boolean; date: string }[];
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // user login data
  const loginUser = (userData: User) => {
    setUser(userData);
  };

  // add completed task
  const addCompletedTask = (task: { text: string; completed: boolean; date: string }) => {
    setUser((prevUser) => ({
      ...prevUser!,
      completedTasks: [...prevUser!.completedTasks, task],
    }));
  };

  return <UserContext.Provider value={{ user, loginUser, addCompletedTask }}>{children}</UserContext.Provider>;
};

// custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
