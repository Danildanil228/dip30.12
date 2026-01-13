--
-- PostgreSQL database dump
--

\restrict 7gCk3ocljF0tHmmUsAcLK3A87BAg1Ffk3pjm25hXctkKEcBoGsIR24GnNvoaoKW

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: backups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.backups (
    id integer NOT NULL,
    filename character varying(255) NOT NULL,
    filepath character varying(500) NOT NULL,
    file_size bigint,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    description text
);


ALTER TABLE public.backups OWNER TO postgres;

--
-- Name: backups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.backups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.backups_id_seq OWNER TO postgres;

--
-- Name: backups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.backups_id_seq OWNED BY public.backups.id;


--
-- Name: materialcategories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materialcategories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_by integer,
    updated_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.materialcategories OWNER TO postgres;

--
-- Name: materialcategories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.materialcategories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.materialcategories_id_seq OWNER TO postgres;

--
-- Name: materialcategories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.materialcategories_id_seq OWNED BY public.materialcategories.id;


--
-- Name: materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materials (
    id integer NOT NULL,
    category_id integer,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    unit character varying(30) NOT NULL,
    quantity integer DEFAULT 0,
    created_by integer,
    updated_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT materials_quantity_check CHECK ((quantity >= 0))
);


ALTER TABLE public.materials OWNER TO postgres;

--
-- Name: materials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.materials_id_seq OWNER TO postgres;

--
-- Name: materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.materials_id_seq OWNED BY public.materials.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    type character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    password text NOT NULL,
    role character varying(20) NOT NULL,
    name character varying(100),
    secondname character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    email character varying(100),
    phone character varying(20),
    birthday date,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'storekeeper'::character varying, 'accountant'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: backups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backups ALTER COLUMN id SET DEFAULT nextval('public.backups_id_seq'::regclass);


--
-- Name: materialcategories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materialcategories ALTER COLUMN id SET DEFAULT nextval('public.materialcategories_id_seq'::regclass);


--
-- Name: materials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials ALTER COLUMN id SET DEFAULT nextval('public.materials_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: backups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backups (id, filename, filepath, file_size, created_by, created_at, description) FROM stdin;
2	backup_2026-01-13T17-48-15-517Z.sql	C:\\Users\\Danil\\Desktop\\dip30.12\\back\\backups\\backup_2026-01-13T17-48-15-517Z.sql	22633	2	2026-01-13 20:48:15.63922	Бэкап много пользователей
\.


--
-- Data for Name: materialcategories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materialcategories (id, name, description, created_by, updated_by, created_at, updated_at) FROM stdin;
1	Строительные смеси и добавки	324	2	2	2026-01-09 21:15:12.475456	2026-01-09 21:51:31.681477
\.


--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materials (id, category_id, name, code, description, unit, quantity, created_by, updated_by, created_at, updated_at) FROM stdin;
1	1	Гипсовая штукатурка 25 кг КНАУФ-Ротбанд	ГШ-802	Штукатурная смесь на основе гипса КНАУФ Ротбанд предназначена для выравнивания вручную стабильных минеральных оснований. Благодаря высокой пластичности раствора смесь более удобна в выравнивании и подрезке, что положительно влияет на качество итоговой поверхности. Допускает заглаживание, что позволяет получить высококачественное основание, не требующее промежуточного шпаклевания и пригодное под оклеивание плотными обоями или окрашивание фактурной краской. Применяется на стенах и потолках внутри сухих помещений.\n\nОсобенности и преимущества:\n- смесь для ручного выравнивания стен и потолков;\n- удобна в применении благодаря высокой пластичности;\n- пригодна к финишному заглаживанию;\n- экологически чистый состав на основе природного гипса.\n\nОбратите внимание:\nПри выполнении работ рекомендуем использовать средства индивидуальной защиты.\n\nСпособ применения:\nРаствор распределяют по подготовленному основанию при помощи гладилки, после чего подрезают h-образным правилом по предварительно установленным маячковым профилям. Для получения поверхности, пригодной под нанесение декоративных покрытий, после подрезки следует выполнить заглаживание, используя жесткую губку и широкий шпатель из нержавеющей стали. Дальнейшая отделка возможна после полного высыхания поверхности, но не ранее чем через 7 суток.	кг	0	2	2	2026-01-09 21:14:37.861271	2026-01-10 00:12:26.438764
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, message, read, created_at) FROM stdin;
1	2	login	Вход в систему	[user:2:admin] вошел в систему	t	2026-01-09 21:12:33.256116
2	2	material_created	Создание материала	[user:2:admin] создал материал: Гипсовая штукатурка 25 кг КНАУФ-Ротбанд	t	2026-01-09 21:14:37.885126
3	2	category_created	Создание категории	Администратор admin создал категорию: Строительные смеси и добавки	t	2026-01-09 21:15:12.499782
4	2	login	Вход в систему	[user:2:admin] вошел в систему	t	2026-01-09 21:16:11.590303
5	2	material_updated	Изменение материала	[user:2:admin] изменил материал "Гипсовая штукатурка 25 кг КНАУФ-Ротбанд": категория изменена	t	2026-01-09 21:49:05.84777
6	2	category_updated	Изменение категории	Администратор admin изменил категорию "Строительные смеси и добавки": описание изменено	t	2026-01-09 21:49:25.65999
7	2	material_updated	Изменение материала	[user:2:admin] изменил материал "Гипсовая штукатурка 25 кг КНАУФ-Ротбанд": категория изменена	t	2026-01-09 21:50:18.643131
8	2	material_updated	Изменение материала	[user:2:admin] изменил материал "Гипсовая штукатурка 25 кг КНАУФ-Ротбанд": категория изменена	t	2026-01-09 21:50:23.037043
9	2	profile_updated	Изменение профиля	[user:2:admin] изменил данные: "name": "admin" → "Данила", "secondname": "admin" → "*", "email": "" → "d_silchenkov@mail.ru", "phone": "" → "+79118573584", "birthday": "" → "2005-08-06"	t	2026-01-09 21:52:44.360802
10	2	login	Вход в систему	[user:2:admin] вошел в систему	t	2026-01-10 00:08:14.530873
11	2	user_created	Создание пользователя	[user:2:admin] создал пользователя [user:3:ggdf28]	t	2026-01-10 00:11:43.171262
12	2	material_updated	Изменение материала	[user:2:admin] изменил материал "Гипсовая штукатурка 25 кг КНАУФ-Ротбанд": единица: "шт" → "кг"	t	2026-01-10 00:12:26.463692
13	2	login	Вход в систему	[user:2:admin] вошел в систему	t	2026-01-10 17:27:36.706317
14	2	backup_created	Создание бэкапа	Администратор admin создал бэкап: backup-2026-01-10T14-32-51-443Z.sql (7.72 KB)	t	2026-01-10 17:32:51.930259
15	2	backup_downloaded	Скачивание бэкапа	Пользователь admin скачал бэкап: backup-2026-01-10T14-32-51-443Z.sql	t	2026-01-10 17:33:18.011555
16	2	backup_created	Создание бэкапа	Администратор admin создал бэкап: backup-2026-01-10T14-36-14-037Z.sql (16.75 KB)	t	2026-01-10 17:36:14.292561
17	2	login	Вход в систему	[user:2:admin] вошел в систему	t	2026-01-10 17:37:33.660695
18	2	login	Вход в систему	[user:2:admin] вошел в систему	t	2026-01-13 20:23:58.894058
19	2	login	Вход в систему	[user:2:admin] вошел в систему	t	2026-01-13 20:28:10.625307
20	2	backup_created	Создание бэкапа	[user:2:admin] создал бэкап: backup_2026-01-13T17-42-24-742Z.sql	t	2026-01-13 20:42:25.091701
21	2	backup_deleted	Удаление бэкапа	[user:2:admin] удалил бэкап: backup_2026-01-13T17-42-24-742Z.sql	t	2026-01-13 20:48:06.513232
22	2	backup_created	Создание бэкапа	[user:2:admin] создал бэкап: backup_2026-01-13T17-48-15-517Z.sql	t	2026-01-13 20:48:15.64096
23	2	user_created	Создание пользователя	[user:2:admin] создал пользователя [user:29:1]	t	2026-01-13 20:49:39.688767
24	29	login	Вход в систему	[user:29:1] вошел в систему	t	2026-01-13 20:49:46.424915
25	29	login	Вход в систему	[user:29:1] вошел в систему	t	2026-01-13 20:50:45.028097
26	2	login	Вход в систему	[user:2:admin] вошел в систему	t	2026-01-13 20:52:28.103122
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) FROM stdin;
2	admin	$2b$10$k4sEznB1SOVKFBZJR6S9QezlVXToE8H3we8to2fzqKkkVTQdEstwa	admin	Данила	*	2026-01-09 21:12:19.719772	d_silchenkov@mail.ru	+79118573584	2005-08-06	2026-01-09 21:52:44.323
3	ggdf28	$2b$10$.X0O1xWiuBsVZf2aCWblZekQZBUFBBZ0/fZeJunMX5zXF0A7aPz6u	storekeeper	gfd	gdf	2026-01-10 00:11:43.147625			\N	2026-01-10 00:11:43.147625
4	admin1	hashed_password_1	admin	Иван	Петров	2026-01-10 17:35:47.966411	admin1@example.com	+79161234567	1985-03-15	2026-01-10 17:35:47.966411
5	admin2	hashed_password_2	admin	Анна	Сидорова	2026-01-10 17:35:47.966411	admin2@example.com	+79161234568	1990-07-22	2026-01-10 17:35:47.966411
6	admin3	hashed_password_3	admin	Сергей	Козлов	2026-01-10 17:35:47.966411	admin3@example.com	+79161234569	1988-11-30	2026-01-10 17:35:47.966411
7	storekeeper1	hashed_password_4	storekeeper	Мария	Иванова	2026-01-10 17:35:47.966411	store1@example.com	+79161234570	1992-05-10	2026-01-10 17:35:47.966411
8	storekeeper2	hashed_password_5	storekeeper	Дмитрий	Смирнов	2026-01-10 17:35:47.966411	store2@example.com	+79161234571	1993-09-18	2026-01-10 17:35:47.966411
9	storekeeper3	hashed_password_6	storekeeper	Ольга	Кузнецова	2026-01-10 17:35:47.966411	store3@example.com	+79161234572	1991-02-25	2026-01-10 17:35:47.966411
10	storekeeper4	hashed_password_7	storekeeper	Алексей	Попов	2026-01-10 17:35:47.966411	store4@example.com	+79161234573	1994-08-14	2026-01-10 17:35:47.966411
11	storekeeper5	hashed_password_8	storekeeper	Елена	Васильева	2026-01-10 17:35:47.966411	store5@example.com	+79161234574	1995-12-05	2026-01-10 17:35:47.966411
12	storekeeper6	hashed_password_9	storekeeper	Павел	Петров	2026-01-10 17:35:47.966411	store6@example.com	+79161234575	1990-04-20	2026-01-10 17:35:47.966411
13	storekeeper7	hashed_password_10	storekeeper	Татьяна	Соколова	2026-01-10 17:35:47.966411	store7@example.com	+79161234576	1993-06-30	2026-01-10 17:35:47.966411
14	storekeeper8	hashed_password_11	storekeeper	Николай	Михайлов	2026-01-10 17:35:47.966411	store8@example.com	+79161234577	1989-10-15	2026-01-10 17:35:47.966411
15	storekeeper9	hashed_password_12	storekeeper	Юлия	Новикова	2026-01-10 17:35:47.966411	store9@example.com	+79161234578	1992-03-22	2026-01-10 17:35:47.966411
16	storekeeper10	hashed_password_13	storekeeper	Артем	Федоров	2026-01-10 17:35:47.966411	store10@example.com	+79161234579	1994-07-08	2026-01-10 17:35:47.966411
17	accountant1	hashed_password_14	accountant	Алиса	Морозова	2026-01-10 17:35:47.966411	acc1@example.com	+79161234580	1987-01-12	2026-01-10 17:35:47.966411
18	accountant2	hashed_password_15	accountant	Константин	Волков	2026-01-10 17:35:47.966411	acc2@example.com	+79161234581	1991-08-28	2026-01-10 17:35:47.966411
19	accountant3	hashed_password_16	accountant	Виктория	Алексеева	2026-01-10 17:35:47.966411	acc3@example.com	+79161234582	1993-04-17	2026-01-10 17:35:47.966411
20	accountant4	hashed_password_17	accountant	Григорий	Лебедев	2026-01-10 17:35:47.966411	acc4@example.com	+79161234583	1986-11-03	2026-01-10 17:35:47.966411
21	accountant5	hashed_password_18	accountant	Лариса	Семенова	2026-01-10 17:35:47.966411	acc5@example.com	+79161234584	1990-05-25	2026-01-10 17:35:47.966411
22	accountant6	hashed_password_19	accountant	Роман	Егоров	2026-01-10 17:35:47.966411	acc6@example.com	+79161234585	1992-09-14	2026-01-10 17:35:47.966411
23	accountant7	hashed_password_20	accountant	Надежда	Павлова	2026-01-10 17:35:47.966411	acc7@example.com	+79161234586	1994-02-19	2026-01-10 17:35:47.966411
24	accountant8	hashed_password_21	accountant	Владислав	Ковалев	2026-01-10 17:35:47.966411	acc8@example.com	+79161234587	1988-06-07	2026-01-10 17:35:47.966411
25	accountant9	hashed_password_22	accountant	Светлана	Орлова	2026-01-10 17:35:47.966411	acc9@example.com	+79161234588	1993-12-11	2026-01-10 17:35:47.966411
26	accountant10	hashed_password_23	accountant	Борис	Андреев	2026-01-10 17:35:47.966411	acc10@example.com	+79161234589	1989-03-29	2026-01-10 17:35:47.966411
27	accountant11	hashed_password_24	accountant	Ксения	Макарова	2026-01-10 17:35:47.966411	acc11@example.com	+79161234590	1995-10-08	2026-01-10 17:35:47.966411
28	accountant12	hashed_password_25	accountant	Игорь	Николаев	2026-01-10 17:35:47.966411	acc12@example.com	+79161234591	1991-07-16	2026-01-10 17:35:47.966411
29	1	$2b$10$J8MmdHXxxjCxor13n3emrO7TomC/0ULp6nNqicCFcrfeGt2c3h0Ze	storekeeper	ads	das	2026-01-13 20:49:39.664184			\N	2026-01-13 20:49:39.664184
\.


--
-- Name: backups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.backups_id_seq', 2, true);


--
-- Name: materialcategories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materialcategories_id_seq', 1, true);


--
-- Name: materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materials_id_seq', 1, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 26, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 29, true);


--
-- Name: backups backups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backups
    ADD CONSTRAINT backups_pkey PRIMARY KEY (id);


--
-- Name: materialcategories materialcategories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materialcategories
    ADD CONSTRAINT materialcategories_pkey PRIMARY KEY (id);


--
-- Name: materials materials_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_code_key UNIQUE (code);


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: backups backups_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backups
    ADD CONSTRAINT backups_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: materialcategories materialcategories_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materialcategories
    ADD CONSTRAINT materialcategories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: materialcategories materialcategories_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materialcategories
    ADD CONSTRAINT materialcategories_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: materials materials_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.materialcategories(id) ON DELETE SET NULL;


--
-- Name: materials materials_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: materials materials_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 7gCk3ocljF0tHmmUsAcLK3A87BAg1Ffk3pjm25hXctkKEcBoGsIR24GnNvoaoKW

