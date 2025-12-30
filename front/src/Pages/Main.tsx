import { API_BASE_URL } from "@/components/api";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Main(){
    const navigate = useNavigate();

     useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        // Проверяем токен
        axios.get(`${API_BASE_URL}/verifyToken`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .catch(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        });
    }, [navigate]);

    return(
        <>
        <div>
            <h1>Главная страница</h1>
            <p>Вы успешно авторизовались!</p>
            <button onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
            }}>
                Выйти
            </button>
        </div>
        </>
    )
}