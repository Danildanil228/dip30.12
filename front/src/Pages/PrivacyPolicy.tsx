import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div className="container max-w-4xl mx-auto py-8 space-y-6">
            <ScrollToTop />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-xl border bg-card p-6 md:p-8 shadow-sm my-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">Политика конфиденциальности</h1>
                        <p className="text-muted-foreground text-sm mb-6">Дата вступления в силу: 11 мая 2026 г.</p>
                    </div>
                    <Button variant="ghost" onClick={() => navigate("/terms")} className="mb-4">
                        Условия использования <ArrowRight className="mr-2 h-4 w-4" />
                    </Button>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
                    <p>Настоящая Политика конфиденциальности регулирует сбор, обработку, хранение и защиту персональных данных пользователей системы «Material House».</p>

                    <h2 className="text-lg font-semibold mt-6">1. Основные понятия</h2>
                    <p>
                        <strong>Персональные данные</strong> – любая информация, относящаяся к прямо или косвенно определённому физическому лицу.
                        <br />
                        <strong>Обработка персональных данных</strong> – любое действие (сбор, запись, систематизация, накопление, хранение, уточнение, извлечение, использование, передача, обезличивание, блокирование,
                        удаление, уничтожение).
                        <br />
                        <strong>Пользователь</strong> – лицо, имеющее учётную запись в Системе.
                    </p>

                    <h2 className="text-lg font-semibold mt-6">2. Какие персональные данные мы собираем</h2>
                    <p>
                        <strong>Обязательные данные:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4">
                        <li>Логин (username);</li>
                        <li>Имя и фамилия;</li>
                        <li>Пароль (в зашифрованном виде);</li>
                        <li>Роль (администратор, бухгалтер, кладовщик);</li>
                        <li>Дата и время создания учётной записи.</li>
                    </ul>
                    <p className="mt-2">
                        <strong>Дополнительные данные (предоставляются добровольно):</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4">
                        <li>Email;</li>
                        <li>Номер телефона;</li>
                        <li>Дата рождения;</li>
                        <li>Аватар (изображение профиля).</li>
                    </ul>
                    <p className="mt-2">
                        <strong>Технические данные (автоматически):</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4">
                        <li>IP-адрес;</li>
                        <li>Тип браузера и устройства;</li>
                        <li>Действия в Системе (логи, заявки, инвентаризации).</li>
                    </ul>

                    <h2 className="text-lg font-semibold mt-6">3. Цели обработки персональных данных</h2>
                    <ul className="list-disc list-inside ml-4">
                        <li>Идентификация пользователя при входе в Систему;</li>
                        <li>Управление правами доступа в соответствии с ролью;</li>
                        <li>Учёт складских операций (заявки, инвентаризации);</li>
                        <li>Формирование отчётов и статистики (в обезличенном виде);</li>
                        <li>Обеспечение безопасности и предотвращение несанкционированного доступа;</li>
                        <li>Связи с пользователем (например, для уведомлений о статусе заявок, если указан email);</li>
                        <li>Выполнения требований законодательства (бухгалтерский и складской учёт).</li>
                    </ul>

                    <h2 className="text-lg font-semibold mt-6">4. Правовые основания обработки</h2>
                    <p>Обработка осуществляется на основании:</p>
                    <ul className="list-disc list-inside ml-4">
                        <li>Согласия пользователя, выраженного при регистрации в Системе;</li>
                        <li>Исполнения договора (предоставления функционала Системы);</li>
                        <li>Обязанностей, предусмотренных законодательством.</li>
                    </ul>

                    <h2 className="text-lg font-semibold mt-6">5. Как мы защищаем ваши данные</h2>
                    <ul className="list-disc list-inside ml-4">
                        <li>Все пароли хранятся в зашифрованном виде (bcrypt);</li>
                        <li>Доступ к базе данных защищён паролем и, при необходимости, SSL-соединением;</li>
                        <li>Логирование действий ведётся для аудита безопасности;</li>
                        <li>Оператор принимает организационные и технические меры для предотвращения утечек.</li>
                    </ul>

                    <h2 className="text-lg font-semibold mt-6">6. Передача данных третьим лицам</h2>
                    <p>
                        Оператор не передаёт персональные данные пользователей третьим лицам, за исключением случаев прямого требования уполномоченных государственных органов или обеспечения работы инфраструктуры
                        (хостинг, облачные сервисы), при условии, что такие провайдеры обеспечивают надлежащий уровень защиты данных.
                    </p>

                    <h2 className="text-lg font-semibold mt-6">7. Хранение и удаление данных</h2>
                    <ul className="list-disc list-inside ml-4">
                        <li>Персональные данные хранятся столько, сколько существует учётная запись пользователя;</li>
                        <li>При удалении пользователя данные блокируются на 30 дней для возможности восстановления;</li>
                        <li>Логи действий могут храниться в течение 1 года для аудита.</li>
                    </ul>

                    <h2 className="text-lg font-semibold mt-6">8. Права пользователя</h2>
                    <p>Вы имеете право:</p>
                    <ul className="list-disc list-inside ml-4">
                        <li>Получить информацию о своих персональных данных;</li>
                        <li>Требовать исправления неверных или устаревших данных;</li>
                        <li>Отозвать согласие на обработку;</li>
                        <li>Подать жалобу в уполномоченный орган (Роскомнадзор).</li>
                    </ul>

                    <h2 className="text-lg font-semibold mt-6">9. Контактная информация</h2>
                    <p>
                        Email:{" "}
                        <a href="mailto:d_silchenkov@mail.ru" className="text-primary hover:underline">
                            d_silchenkov@mail.ru
                        </a>
                        <br />
                        Телефон:{" "}
                        <a href="tel:+79118573584" className="text-primary hover:underline">
                            +7 (911) 857-35-84
                        </a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
