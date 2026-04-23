import { create } from 'zustand';
import { axiosClient } from '../api/axiosClient';
import { loginUser, getMe } from '../api/authApi';

export const useStore = create((set, get) => ({
  // Auth State
  user: null,
  tokens: null,
  isLoading: true,

  // UI State
  isSidebarOpen: true,
  theme: 'light',

  // Dashboard State
  stats: null,
  trends: [],
  history: [],
  adminStats: null,
  adminAnalytics: null,
  adminLogs: [],
  lastFetched: {},

  // Actions
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  setAuth: (tokens, user) => {
    localStorage.setItem('authTokens', JSON.stringify(tokens));
    if (tokens?.access_token) {
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${tokens.access_token}`;
    }
    set({ tokens, user, isLoading: false });
  },

  clearAuth: () => {
    localStorage.removeItem('authTokens');
    delete axiosClient.defaults.headers.common['Authorization'];
    set({ 
      tokens: null, user: null, isLoading: false, 
      stats: null, trends: [], history: [], 
      adminStats: null, adminAnalytics: null, adminLogs: [] 
    });
  },

  logout: () => {
    get().clearAuth();
  },

  fetchProfile: async () => {
    try {
      const res = await axiosClient.get('/auth/me');
      set({ user: res.data, isLoading: false });
      return res.data;
    } catch (err) {
      get().clearAuth();
    }
  },

  initAuth: async () => {
    const stored = localStorage.getItem('authTokens');
    if (stored) {
      try {
        const tokens = JSON.parse(stored);
        set({ tokens });
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${tokens.access_token}`;
        const user = await get().fetchProfile();
        if (user) get().prefetchDashboard();
      } catch {
        get().clearAuth();
      }
    } else {
      set({ isLoading: false });
    }
  },

  prefetchDashboard: async () => {
    const { user } = get();
    if (!user) return;
    
    // Start fetching critical data in background
    if (user.role === 'admin') {
      import('../api/adminApi').then(api => {
        api.getAdminStats().then(s => set({ adminStats: s }));
        api.getAdminAnalytics(30).then(a => set({ adminAnalytics: a }));
      });
    }

    import('../api/spamApi').then(api => {
      api.getUserStats().then(s => set({ stats: s }));
      api.getSpamTrends(30).then(t => set({ trends: t.points }));
      api.getHistory(1, 20).then(h => set({ history: h.items }));
    });
  },

  login: async (email, password) => {
    try {
      const data = await loginUser({ email, password });
      get().setAuth(data, null);
      const profile = await get().fetchProfile();
      if (profile) get().prefetchDashboard();
      return data;
    } catch (error) {
      throw error;
    }
  },
}));
