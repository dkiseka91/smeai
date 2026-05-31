import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
export function useAuth() {
    const { user, accessToken, setAuth, logout } = useAuthStore();
    const navigate = useNavigate();
    const login = useCallback(async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setAuth(data.user, data.accessToken, data.refreshToken);
        navigate('/dashboard');
    }, [setAuth, navigate]);
    const register = useCallback(async (name, email, password) => {
        await api.post('/auth/register', { name, email, password });
    }, []);
    const signOut = useCallback(async () => {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
            try {
                await api.post('/auth/logout', { refreshToken });
            }
            catch { /* ignore */ }
        }
        logout();
        navigate('/login');
    }, [logout, navigate]);
    return { user, isAuthenticated: !!user && !!accessToken, login, register, signOut };
}
