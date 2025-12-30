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
    const navigate = useNavigate();

    useEffect(() => {

        checkFirstRun();

    }, []); // Убрал navigate из зависимостей, так как он стабильный

    const checkFirstRun = async () => {
        console.log('checkFirstRun вызван');
        try {
            const response = await axios.get(`${API_BASE_URL}/countUsers`);
            console.log('Ответ от countUsers:', response.data);
            setIsFirst(!response.data.hasUsers);
        } catch (error) {
            console.error('Ошибка при проверке системы:', error);
            setError('Не удалось подключиться к серверу');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!username.trim() || !password.trim()) {
            setError('Заполните все поля');
            setLoading(false);
            return;
        }

        try {
            let response;
            if (isFirst) {
                console.log('Создаем первого админа...');
                response = await axios.post(`${API_BASE_URL}/registerFirst`, {
                    username: username.trim(),
                    password: password.trim()
                });
            } else {
                console.log('Обычный вход...');
                response = await axios.post(`${API_BASE_URL}/login`, {
                    username: username.trim(),
                    password: password.trim()
                });
            }

            console.log('Успешный ответ:', response.data);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            console.log('Токен сохранен, переход на /main');
            navigate('/main');

        } catch (error: any) {
            console.error('Ошибка при авторизации:', error);
            setError(error.response?.data?.error || 'Ошибка');
        } finally {
            setLoading(false);
        }
    }



    return (
        <section className="flex justify-center items-center min-h-screen container">
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
                    />
                    <input
                        type="password"
                        placeholder="Введите ваш пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="px-4 py-2 border rounded focus:outline-none focus:ring-1"
                        disabled={loading}
                    />

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
                    {error && <p className="text-red-500">{error}</p>}
                </div>
            </form>
        </section>
    );
}
