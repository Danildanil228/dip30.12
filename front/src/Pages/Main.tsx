export default function Main() {
    return (
        <div>
            <h1>Главная страница</h1>
            <p>Вы успешно авторизовались!</p>
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