import { create } from 'zustand'

interface UserData {
  id: string
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  phone?: string
}

interface AuthState {
  user: UserData | null | undefined
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: UserData | null | undefined) => void
  setIsAuthenticated: (isAuthenticated: boolean) => void
  setIsLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: undefined,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsLoading: (isLoading) => set({ isLoading }),
}))
