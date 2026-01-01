import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DarkModeButtonToggle from '@/components/DarkModeButtonToggle';
import { API_BASE_URL } from '@/components/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFirst, setIsFirst] = useState<boolean | null>(null);
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        checkFirstRun();
    }, []);

    const checkFirstRun = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/countUsers`);
            setIsFirst(!response.data.hasUsers);
        } catch (error) {
            setError('Не удалось подключиться к серверу');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Проверка для первого запуска (создание админа)
        if (isFirst) {
            if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
                setError('Заполните все поля');
                setLoading(false);
                return;
            }

            if (password !== confirmPassword) {
                setError('Пароли не совпадают');
                setLoading(false);
                return;
            }

            if (password.length < 6) {
                setError('Пароль должен быть не менее 6 символов');
                setLoading(false);
                return;
            }
        } else {
            // Проверка для обычного входа
            if (!username.trim() || !password.trim()) {
                setError('Заполните все поля');
                setLoading(false);
                return;
            }
        }

        try {
            let response;
            if (isFirst) {
                response = await axios.post(`${API_BASE_URL}/registerFirst`, {
                    username: username.trim(),
                    password: password.trim()
                });
            } else {
                response = await axios.post(`${API_BASE_URL}/login`, {
                    username: username.trim(),
                    password: password.trim()
                });
            }

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/main');

        } catch (error: any) {
            setError(error.response?.data?.error || 'Ошибка');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex justify-center items-center min-h-screen">
            <form onSubmit={handleSubmit} className="text-center">
                <h1 className="mb-4"> {isFirst ? 'Создание админа' : 'Авторизация в систему'} </h1>
                <div className="grid gap-5">
                    <input
                        type="text"
                        placeholder="Введите ваш логин"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="px-4 py-2 border rounded focus:outline-none focus:ring-1"
                        disabled={loading}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Введите ваш пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="px-4 py-2 border rounded focus:outline-none focus:ring-1"
                        disabled={loading}
                        required
                    />
                    {isFirst && (
                        <input
                            type="password"
                            placeholder="Подтвердите пароль"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="px-4 py-2 border rounded focus:outline-none focus:ring-1"
                            disabled={loading}
                            required
                        />
                    )}

                    <div className="flex gap-5 items-center">
                        <button
                            type='submit'
                            disabled={loading}
                            className="w-full px-6 py-2 border rounded cursor-pointer hover:transition-colors disabled:opacity-50"
                        >
                            {loading ? '...' : (isFirst ? 'Создать' : 'Войти')}
                        </button>
                        <DarkModeButtonToggle />
                    </div>
                    {error && <p className="">{error}</p>}
                </div>
            </form>
        </section>
    );
}
