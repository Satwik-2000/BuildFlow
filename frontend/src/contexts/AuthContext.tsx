import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user { id email name role }
    }
  }
`;

const ME = gql`
  query Me {
    me { id email name role phone }
  }
`;

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("pcc_token"));
  const [user, setUser] = useState<User | null>(null);
  const [fetchMe, { loading }] = useLazyQuery(ME, {
    onCompleted: (d) => { if (d?.me) setUser(d.me); },
    onError: () => { setToken(null); setUser(null); },
  });
  const [loginMut] = useMutation(LOGIN);

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      setUser(null);
    }
  }, [token, fetchMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await loginMut({ variables: { input: { email, password } } });
      const t = data?.login?.token;
      if (t) {
        localStorage.setItem("pcc_token", t);
        setToken(t);
      } else {
        throw new Error("Login failed");
      }
    },
    [loginMut]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("pcc_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
