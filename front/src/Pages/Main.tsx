export default function Main() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return (
        <div>

            <h1>Главная страница</h1>
            <p>Вы успешно авторизовались! вы {user.role}</p>
            <button onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }}>
                Выйти
            </button>

        </div>
    )
}