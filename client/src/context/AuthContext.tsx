import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI } from '../api'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role?: string) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('crimeverse_token')
    const storedUser = localStorage.getItem('crimeverse_user')
    if (stored && storedUser) {
      setToken(stored)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password })
    const { token: t, user: u } = res.data
    localStorage.setItem('crimeverse_token', t)
    localStorage.setItem('crimeverse_user', JSON.stringify(u))
    setToken(t)
    setUser(u)
  }

  const register = async (name: string, email: string, password: string, role?: string) => {
    const res = await authAPI.register({ name, email, password, role })
    const { token: t, user: u } = res.data
    localStorage.setItem('crimeverse_token', t)
    localStorage.setItem('crimeverse_user', JSON.stringify(u))
    setToken(t)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('crimeverse_token')
    localStorage.removeItem('crimeverse_user')
    setToken(null)
    setUser(null)
  }

  const updateUser = (u: User) => {
    setUser(u)
    localStorage.setItem('crimeverse_user', JSON.stringify(u))
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
