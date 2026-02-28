"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react"

export type UserRole = "tourist" | "admin" | "guide"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>
  register: (name: string, email: string, password: string, role?: "tourist" | "guide") => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  isTourist: boolean
  isAdmin: boolean
  isGuide: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restauration de la session après hydratation (côté client uniquement)
  // pour éviter un mismatch serveur/client : le serveur n'a pas sessionStorage.
  useEffect(() => {
    try {
      const s = sessionStorage.getItem("culturechain_user")
      if (s) setUser(JSON.parse(s) as User)
    } catch {
      // ignore
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
      if (!email || !password) {
        return { success: false, error: "Veuillez remplir tous les champs." }
      }

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })

        const data = await res.json()

        if (!res.ok) {
          return { success: false, error: data.error || "Identifiants incorrects." }
        }

        const loggedUser: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        }
        setUser(loggedUser)
        sessionStorage.setItem("culturechain_user", JSON.stringify(loggedUser))
        return { success: true, role: data.role }
      } catch {
        return { success: false, error: "Erreur de connexion au serveur." }
      }
    },
    []
  )

  const register = useCallback(
    async (name: string, email: string, password: string, role?: "tourist" | "guide"): Promise<{ success: boolean; error?: string }> => {
      if (!name || name.length < 2) {
        return { success: false, error: "Le nom doit contenir au moins 2 caracteres." }
      }
      if (!email || !email.includes("@")) {
        return { success: false, error: "Veuillez entrer un email valide." }
      }
      if (!password || password.length < 6) {
        return { success: false, error: "Le mot de passe doit contenir au moins 6 caracteres." }
      }

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role: role || "tourist" }),
        })

        const data = await res.json()

        if (!res.ok) {
          return { success: false, error: data.error || "Erreur lors de l'inscription." }
        }

        const newUser: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        }
        setUser(newUser)
        sessionStorage.setItem("culturechain_user", JSON.stringify(newUser))
        return { success: true }
      } catch {
        return { success: false, error: "Erreur de connexion au serveur." }
      }
    },
    []
  )

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem("culturechain_user")
  }, [])

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isTourist: user?.role === "tourist",
      isAdmin: user?.role === "admin",
      isGuide: user?.role === "guide",
      isLoading,
    }),
    [user, login, register, logout, isLoading]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
