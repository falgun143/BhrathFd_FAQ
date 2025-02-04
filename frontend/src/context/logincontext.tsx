import { createContext, useContext, useState, ReactNode } from "react";

interface LoginContextType {
  login: boolean;
  setLogin: (login: boolean) => void;
  role: string;
  setRole: (role: string) => void;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export const LoginProvider = ({
  initialLogin,
  initialRole,
  children,
}: {
  initialLogin: boolean;
  initialRole: string;
  children: ReactNode;
}) => {
  const [login, setLogin] = useState(initialLogin);
  const [role, setRole] = useState(initialRole);

  return (
    <LoginContext.Provider value={{ login, setLogin, role, setRole }}>
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error("useLogin must be used within a LoginProvider");
  }
  return context;
};
