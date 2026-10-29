import React, { createContext, useContext, useState, useEffect } from 'react';

// Pre-defined test mock users matching the seed database
export const MOCK_USERS = [
  {
    name: 'Alex Rivera',
    collegeEmail: 'alex.rivera@campus.edu',
    semester: 'Sem 4',
    department: 'Computer Science & Engineering',
    avatarColor: 'from-indigo-500 to-purple-600',
  },
  {
    name: 'Priya Sharma',
    collegeEmail: 'priya.sharma@campus.edu',
    semester: 'Sem 6',
    department: 'Information Technology',
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Jordan Lee',
    collegeEmail: 'jordan.lee@campus.edu',
    semester: 'Sem 2',
    department: 'Data Science & AI',
    avatarColor: 'from-amber-500 to-rose-600',
  },
];

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Hardcoded logged-in user with a specific semester for initial MVP test
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('syncspace_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    return MOCK_USERS[0]; // Alex Rivera - Sem 4 by default
  });

  useEffect(() => {
    localStorage.setItem('syncspace_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const switchUser = (user) => {
    setCurrentUser(user);
  };

  const updateSemester = (newSemester) => {
    setCurrentUser((prev) => ({
      ...prev,
      semester: newSemester,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUser,
        updateSemester,
        availableUsers: MOCK_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
