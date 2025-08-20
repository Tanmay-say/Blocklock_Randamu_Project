import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminContextType {
  isAdminAuthenticated: boolean;
  loginAsAdmin: () => void;
  logoutAsAdmin: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const loginAsAdmin = () => {
    setIsAdminAuthenticated(true);
  };

  const logoutAsAdmin = () => {
    setIsAdminAuthenticated(false);
  };

  const value: AdminContextType = {
    isAdminAuthenticated,
    loginAsAdmin,
    logoutAsAdmin,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
