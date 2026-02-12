import React, { createContext, useEffect, useState } from 'react'
import { apiPost } from '@/lib/api'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'coach' | 'parent'
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<void>
  token: string | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface ApiUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'coach' | 'parent'
  facilityId?: string
}

interface LoginResponse {
  success: boolean
  data: {
    user: ApiUser
    tokens: {
      accessToken: string
      refreshToken: string
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('authUser')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiPost<LoginResponse>('/auth/login', { email, password })
      const { user: userData, tokens } = response.data
      const newUser: User = {
        id: userData.id,
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        role: userData.role,
      }
      localStorage.setItem('authToken', tokens.accessToken)
      localStorage.setItem('authUser', JSON.stringify(newUser))
      setToken(tokens.accessToken)
      setUser(newUser)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    setToken(null)
    setUser(null)
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      // Registration requires more fields - this is a simplified placeholder
      // In production, this would need facilityId, firstName, lastName
      const [firstName, ...lastParts] = name.split(' ')
      const lastName = lastParts.join(' ') || firstName
      const response = await apiPost<LoginResponse>('/auth/register', {
        email,
        password,
        firstName,
        lastName
      })
      const { user: userData, tokens } = response.data
      const newUser: User = {
        id: userData.id,
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        role: userData.role,
      }
      localStorage.setItem('authToken', tokens.accessToken)
      localStorage.setItem('authUser', JSON.stringify(newUser))
      setToken(tokens.accessToken)
      setUser(newUser)
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, token }}>
      {children}
    </AuthContext.Provider>
  )
}
