--
-- PostgreSQL database dump
--

\restrict lVQV6xRg10iWhklRThHKZqcHPXaVXqiaamNEqMRHOXpnbWfjnvKlTsxVVZjtlq5

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
-- Name: chats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chats (
    id integer NOT NULL,
    user1_id integer,
    user2_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_by_user1 boolean DEFAULT false,
    deleted_by_user2 boolean DEFAULT false
);


ALTER TABLE public.chats OWNER TO postgres;

--
-- Name: chats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chats_id_seq OWNER TO postgres;

--
-- Name: chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chats_id_seq OWNED BY public.chats.id;


--
-- Name: inventories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventories (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying,
    created_by integer,
    responsible_person integer,
    start_date date NOT NULL,
    end_date date NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone,
    approved_at timestamp without time zone,
    approved_by integer,
    cancelled_at timestamp without time zone,
    cancelled_by integer,
    CONSTRAINT inventories_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'approved'::character varying, 'cancelled'::character varying, 'expired'::character varying])::text[])))
);


ALTER TABLE public.inventories OWNER TO postgres;

--
-- Name: inventories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventories_id_seq OWNER TO postgres;

--
-- Name: inventories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventories_id_seq OWNED BY public.inventories.id;


--
-- Name: inventory_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_categories (
    id integer NOT NULL,
    inventory_id integer,
    category_id integer
);


ALTER TABLE public.inventory_categories OWNER TO postgres;

--
-- Name: inventory_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_categories_id_seq OWNER TO postgres;

--
-- Name: inventory_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_categories_id_seq OWNED BY public.inventory_categories.id;


--
-- Name: inventory_materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_materials (
    id integer NOT NULL,
    inventory_id integer,
    material_id integer
);


ALTER TABLE public.inventory_materials OWNER TO postgres;

--
-- Name: inventory_materials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_materials_id_seq OWNER TO postgres;

--
-- Name: inventory_materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_materials_id_seq OWNED BY public.inventory_materials.id;


--
-- Name: inventory_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_results (
    id integer NOT NULL,
    inventory_id integer,
    material_id integer,
    system_quantity integer NOT NULL,
    actual_quantity integer,
    difference integer GENERATED ALWAYS AS ((actual_quantity - system_quantity)) STORED,
    reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.inventory_results OWNER TO postgres;

--
-- Name: inventory_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_results_id_seq OWNER TO postgres;

--
-- Name: inventory_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_results_id_seq OWNED BY public.inventory_results.id;


--
-- Name: material_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_requests (
    id integer NOT NULL,
    request_type character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_by integer,
    reviewed_by integer,
    notes text,
    rejection_reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reviewed_at timestamp without time zone,
    is_public boolean DEFAULT true,
    title character varying(255),
    CONSTRAINT material_requests_request_type_check CHECK (((request_type)::text = ANY ((ARRAY['incoming'::character varying, 'outgoing'::character varying])::text[]))),
    CONSTRAINT material_requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.material_requests OWNER TO postgres;

--
-- Name: material_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.material_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.material_requests_id_seq OWNER TO postgres;

--
-- Name: material_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.material_requests_id_seq OWNED BY public.material_requests.id;


--
-- Name: material_requests_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_requests_items (
    id integer NOT NULL,
    request_id integer NOT NULL,
    material_id integer NOT NULL,
    quantity integer NOT NULL,
    current_quantity_at_request integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT material_requests_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.material_requests_items OWNER TO postgres;

--
-- Name: material_requests_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.material_requests_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.material_requests_items_id_seq OWNER TO postgres;

--
-- Name: material_requests_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.material_requests_items_id_seq OWNED BY public.material_requests_items.id;


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
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    chat_id integer,
    sender_id integer,
    message text,
    image_url text,
    file_url text,
    file_name text,
    file_size bigint,
    is_read boolean DEFAULT false,
    read_at timestamp without time zone,
    is_deleted_for_sender boolean DEFAULT false,
    is_deleted_for_receiver boolean DEFAULT false,
    edited_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


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
    password text NOT NULL,
    role character varying(20) NOT NULL,
    name character varying(100),
    secondname character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    email character varying(100),
    phone character varying(20),
    birthday date,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    username text,
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
-- Name: chats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats ALTER COLUMN id SET DEFAULT nextval('public.chats_id_seq'::regclass);


--
-- Name: inventories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventories ALTER COLUMN id SET DEFAULT nextval('public.inventories_id_seq'::regclass);


--
-- Name: inventory_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_categories ALTER COLUMN id SET DEFAULT nextval('public.inventory_categories_id_seq'::regclass);


--
-- Name: inventory_materials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_materials ALTER COLUMN id SET DEFAULT nextval('public.inventory_materials_id_seq'::regclass);


--
-- Name: inventory_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_results ALTER COLUMN id SET DEFAULT nextval('public.inventory_results_id_seq'::regclass);


--
-- Name: material_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests ALTER COLUMN id SET DEFAULT nextval('public.material_requests_id_seq'::regclass);


--
-- Name: material_requests_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests_items ALTER COLUMN id SET DEFAULT nextval('public.material_requests_items_id_seq'::regclass);


--
-- Name: materialcategories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materialcategories ALTER COLUMN id SET DEFAULT nextval('public.materialcategories_id_seq'::regclass);


--
-- Name: materials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials ALTER COLUMN id SET DEFAULT nextval('public.materials_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


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
1	backup_2026-01-14T13-36-13-957Z.sql	C:\\Users\\danil\\Desktop\\ДИПЛОМ\\dip30.12\\back\\backups\\backup_2026-01-14T13-36-13-957Z.sql	13663	24	2026-01-14 15:36:14.785126	123456789
2	backup_2026-01-14T15-02-21-088Z.sql	C:\\Users\\danil\\Desktop\\ДИПЛОМ\\dip30.12\\back\\backups\\backup_2026-01-14T15-02-21-088Z.sql	129291	24	2026-01-14 17:02:21.751776	данные
3	backup_2026-04-10T23-51-34-900Z.sql	C:\\Users\\danil\\Desktop\\dip30.12\\back\\backups\\backup_2026-04-10T23-51-34-900Z.sql	275892	24	2026-04-11 01:51:35.308229	system
\.


--
-- Data for Name: chats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chats (id, user1_id, user2_id, created_at, updated_at, deleted_by_user1, deleted_by_user2) FROM stdin;
13	24	32	2026-04-13 02:43:49.281727	2026-04-13 16:13:21.202733	f	f
21	135	24	2026-04-13 11:41:10.462149	2026-04-13 16:36:45.01133	f	f
15	24	41	2026-04-13 02:51:12.146249	2026-04-13 02:51:12.146249	f	f
16	24	59	2026-04-13 02:51:21.006954	2026-04-13 02:51:21.006954	f	f
17	24	83	2026-04-13 02:51:26.422156	2026-04-13 02:51:26.422156	f	f
18	24	89	2026-04-13 02:51:31.046097	2026-04-13 02:51:31.046097	f	f
19	24	86	2026-04-13 02:51:35.566949	2026-04-13 02:51:35.566949	f	f
20	24	50	2026-04-13 02:51:44.139499	2026-04-13 02:54:06.233998	f	f
14	24	35	2026-04-13 02:49:40.923301	2026-04-13 02:55:33.851845	f	f
\.


--
-- Data for Name: inventories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventories (id, title, status, created_by, responsible_person, start_date, end_date, description, created_at, updated_at, completed_at, approved_at, approved_by, cancelled_at, cancelled_by) FROM stdin;
1	Плановая инвентаризация склада	approved	24	25	2026-03-01	2026-03-05	Ежемесячная плановая проверка	2026-02-25 10:00:00	2026-04-11 14:08:46.073433	2026-03-05 16:30:00	2026-03-06 11:00:00	30	\N	\N
3	Проверка электроинструмента	draft	24	27	2026-04-15	2026-04-20	\N	2026-04-05 09:00:00	2026-04-11 14:08:46.073433	\N	\N	\N	\N	\N
4	Внеплановая проверка ЛКМ	approved	30	25	2026-03-10	2026-03-12	После поступления новой партии краски	2026-03-08 11:00:00	2026-04-11 14:08:46.073433	2026-03-12 15:00:00	2026-03-13 10:30:00	24	\N	\N
5	Инвентаризация крепежных изделий	completed	24	26	2026-04-05	2026-04-08	\N	2026-04-01 08:00:00	2026-04-11 14:08:46.073433	2026-04-08 17:00:00	\N	\N	\N	\N
6	gsdgdsf	cancelled	24	24	2026-04-10	2026-04-23	fsdfasdljg sdiojgi sdhg hs;gh;sfkdg;dsfg	2026-04-11 21:50:26.330607	2026-04-11 21:53:06.591469	\N	\N	\N	2026-04-11 21:53:06.591469	24
2	Инвентаризация стройматериалов	cancelled	30	26	2026-04-01	2026-04-10	Проверка остатков цемента и песка	2026-03-28 14:00:00	2026-04-11 22:01:55.558765	\N	\N	\N	2026-04-11 22:01:55.558765	24
7	51	approved	135	135	2026-04-12	2026-04-14	\N	2026-04-13 11:25:36.718603	2026-04-13 11:26:35.587155	2026-04-13 11:25:55.569364	2026-04-13 11:26:35.587155	24	\N	\N
8	fsdfsd	draft	135	134	2026-04-08	2026-04-17	fsadfsdafdsf	2026-04-13 23:15:35.098892	2026-04-13 23:15:35.098892	\N	\N	\N	\N	\N
9	51	approved	135	135	2026-04-13	2026-04-15	\N	2026-04-13 23:16:08.077146	2026-04-13 23:17:00.015659	2026-04-13 23:16:26.821822	2026-04-13 23:17:00.015659	135	\N	\N
10	fsdfs	draft	135	134	2026-04-23	2026-04-29	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391	\N	\N	\N	\N	\N
11	fsdf	draft	135	134	2026-04-30	2026-05-03	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312	\N	\N	\N	\N	\N
\.


--
-- Data for Name: inventory_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_categories (id, inventory_id, category_id) FROM stdin;
1	1	1
2	1	2
3	1	3
4	1	4
5	1	5
6	1	6
7	1	7
8	1	8
9	1	9
10	1	10
11	2	1
12	2	2
13	4	5
14	4	10
15	4	11
16	5	15
17	6	20
18	8	24
\.


--
-- Data for Name: inventory_materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_materials (id, inventory_id, material_id) FROM stdin;
1	2	1
2	2	2
3	2	3
4	2	4
5	2	5
6	2	11
7	2	12
8	2	13
9	5	302
10	5	303
11	5	304
12	5	305
13	5	306
14	7	41
15	7	279
16	9	304
\.


--
-- Data for Name: inventory_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_results (id, inventory_id, material_id, system_quantity, actual_quantity, reason, created_at, updated_at) FROM stdin;
1	1	1	3123	3120	Погрешность при отгрузке	2026-04-11 14:08:58.650447	2026-04-11 14:08:58.650447
2	1	2	0	5	Неучтенный остаток	2026-04-11 14:08:58.650447	2026-04-11 14:08:58.650447
3	1	22	6	6	\N	2026-04-11 14:08:58.650447	2026-04-11 14:08:58.650447
4	1	50	0	15	Найден на складе	2026-04-11 14:08:58.650447	2026-04-11 14:08:58.650447
5	4	50	0	15	Остаток с прошлого периода	2026-04-11 14:08:58.650447	2026-04-11 14:08:58.650447
6	4	51	0	10	На складе	2026-04-11 14:08:58.650447	2026-04-11 14:08:58.650447
7	4	52	0	25	Новая поставка	2026-04-11 14:08:58.650447	2026-04-11 14:08:58.650447
8	6	362	0	\N	\N	2026-04-11 21:50:26.330607	2026-04-11 21:50:26.330607
9	6	363	0	\N	\N	2026-04-11 21:50:26.330607	2026-04-11 21:50:26.330607
10	6	364	0	\N	\N	2026-04-11 21:50:26.330607	2026-04-11 21:50:26.330607
11	6	365	0	\N	\N	2026-04-11 21:50:26.330607	2026-04-11 21:50:26.330607
12	6	366	0	\N	\N	2026-04-11 21:50:26.330607	2026-04-11 21:50:26.330607
13	6	367	0	\N	\N	2026-04-11 21:50:26.330607	2026-04-11 21:50:26.330607
14	6	368	0	\N	\N	2026-04-11 21:50:26.330607	2026-04-11 21:50:26.330607
15	6	369	0	\N	\N	2026-04-11 21:50:26.330607	2026-04-11 21:50:26.330607
16	6	370	0	\N	\N	2026-04-11 21:50:26.330607	2026-04-11 21:50:26.330607
17	6	371	0	\N	\N	2026-04-11 21:50:26.330607	2026-04-11 21:50:26.330607
18	6	372	0	\N	\N	2026-04-11 21:50:26.330607	2026-04-11 21:50:26.330607
19	6	361	30	\N	\N	2026-04-11 21:50:26.330607	2026-04-11 21:50:26.330607
20	7	41	11	11	\N	2026-04-13 11:25:36.718603	2026-04-13 11:25:55.547207
21	7	279	6	6	\N	2026-04-13 11:25:36.718603	2026-04-13 11:25:55.549351
22	8	548	0	\N	\N	2026-04-13 23:15:35.098892	2026-04-13 23:15:35.098892
23	8	549	0	\N	\N	2026-04-13 23:15:35.098892	2026-04-13 23:15:35.098892
24	8	550	0	\N	\N	2026-04-13 23:15:35.098892	2026-04-13 23:15:35.098892
25	8	551	0	\N	\N	2026-04-13 23:15:35.098892	2026-04-13 23:15:35.098892
26	8	552	0	\N	\N	2026-04-13 23:15:35.098892	2026-04-13 23:15:35.098892
27	8	553	0	\N	\N	2026-04-13 23:15:35.098892	2026-04-13 23:15:35.098892
28	8	554	0	\N	\N	2026-04-13 23:15:35.098892	2026-04-13 23:15:35.098892
29	8	555	0	\N	\N	2026-04-13 23:15:35.098892	2026-04-13 23:15:35.098892
30	8	556	0	\N	\N	2026-04-13 23:15:35.098892	2026-04-13 23:15:35.098892
31	8	557	0	\N	\N	2026-04-13 23:15:35.098892	2026-04-13 23:15:35.098892
32	8	546	0	\N	\N	2026-04-13 23:15:35.098892	2026-04-13 23:15:35.098892
33	8	547	0	\N	\N	2026-04-13 23:15:35.098892	2026-04-13 23:15:35.098892
34	9	304	5	12	Так надо	2026-04-13 23:16:08.077146	2026-04-13 23:16:26.772254
35	10	3	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
36	10	4	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
37	10	5	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
38	10	6	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
39	10	7	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
40	10	8	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
41	10	10	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
42	10	11	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
43	10	12	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
44	10	13	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
45	10	14	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
46	10	15	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
47	10	16	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
48	10	17	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
49	10	18	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
50	10	19	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
51	10	20	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
52	10	21	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
53	10	23	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
54	10	24	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
55	10	25	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
56	10	26	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
57	10	27	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
58	10	28	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
59	10	29	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
60	10	30	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
61	10	31	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
62	10	32	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
63	10	33	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
64	10	34	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
65	10	35	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
66	10	36	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
67	10	37	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
68	10	38	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
69	10	548	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
70	10	22	6	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
71	10	39	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
72	10	40	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
73	10	42	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
74	10	43	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
75	10	44	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
76	10	45	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
77	10	46	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
78	10	47	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
79	10	48	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
80	10	49	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
81	10	50	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
82	10	51	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
83	10	52	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
84	10	53	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
85	10	54	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
86	10	55	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
87	10	56	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
88	10	57	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
89	10	58	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
90	10	59	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
91	10	60	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
92	10	61	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
93	10	62	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
94	10	63	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
95	10	64	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
96	10	65	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
97	10	66	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
98	10	67	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
99	10	68	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
100	10	69	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
101	10	70	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
102	10	71	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
103	10	72	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
104	10	73	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
105	10	74	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
106	10	75	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
107	10	76	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
108	10	77	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
109	10	78	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
110	10	79	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
111	10	80	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
112	10	81	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
113	10	82	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
114	10	83	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
115	10	84	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
116	10	85	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
117	10	86	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
118	10	87	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
119	10	88	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
120	10	89	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
121	10	90	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
122	10	91	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
123	10	92	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
124	10	93	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
125	10	94	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
126	10	95	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
127	10	96	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
128	10	97	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
129	10	98	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
130	10	99	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
131	10	100	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
132	10	101	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
133	10	102	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
134	10	103	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
135	10	104	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
136	10	105	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
137	10	106	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
138	10	107	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
139	10	108	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
140	10	109	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
141	10	110	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
142	10	112	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
143	10	113	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
144	10	114	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
145	10	115	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
146	10	116	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
147	10	117	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
148	10	118	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
149	10	119	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
150	10	120	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
151	10	121	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
152	10	668	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
153	10	122	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
154	10	123	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
155	10	124	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
156	10	125	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
157	10	126	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
158	10	127	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
159	10	128	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
160	10	129	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
161	10	130	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
162	10	131	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
163	10	132	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
164	10	133	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
165	10	134	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
166	10	135	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
167	10	136	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
168	10	549	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
169	10	550	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
170	10	551	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
171	10	552	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
172	10	553	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
173	10	554	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
174	10	555	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
175	10	556	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
176	10	557	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
177	10	558	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
178	10	559	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
179	10	560	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
180	10	561	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
181	10	562	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
182	10	563	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
183	10	564	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
184	10	566	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
185	10	567	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
186	10	568	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
187	10	569	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
188	10	570	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
189	10	571	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
190	10	572	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
191	10	573	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
192	10	574	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
193	10	575	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
194	10	576	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
195	10	577	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
196	10	578	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
197	10	579	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
198	10	580	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
199	10	581	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
200	10	582	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
201	10	583	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
202	10	584	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
203	10	585	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
204	10	586	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
205	10	587	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
206	10	588	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
207	10	589	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
208	10	590	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
209	10	591	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
210	10	592	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
211	10	593	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
212	10	594	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
213	10	595	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
214	10	596	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
215	10	597	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
216	10	598	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
217	10	599	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
218	10	600	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
219	10	601	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
220	10	602	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
221	10	603	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
222	10	604	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
223	10	605	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
224	10	606	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
225	10	607	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
226	10	608	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
227	10	609	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
228	10	611	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
229	10	612	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
230	10	613	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
231	10	614	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
232	10	615	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
233	10	616	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
234	10	617	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
235	10	618	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
236	10	619	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
237	10	620	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
238	10	621	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
239	10	622	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
240	10	623	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
241	10	624	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
242	10	625	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
243	10	626	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
244	10	627	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
245	10	628	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
246	10	629	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
247	10	630	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
248	10	631	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
249	10	632	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
250	10	633	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
251	10	634	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
252	10	635	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
253	10	720	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
254	10	636	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
255	10	637	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
256	10	638	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
257	10	639	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
258	10	640	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
259	10	641	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
260	10	642	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
261	10	643	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
262	10	644	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
263	10	645	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
264	10	646	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
265	10	647	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
266	10	648	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
267	10	649	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
268	10	650	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
269	10	651	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
270	10	652	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
271	10	653	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
272	10	654	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
273	10	655	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
274	10	656	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
275	10	657	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
276	10	658	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
277	10	659	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
278	10	660	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
279	10	661	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
280	10	662	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
281	10	663	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
282	10	664	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
283	10	665	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
284	10	249	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
285	10	250	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
286	10	251	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
287	10	252	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
288	10	253	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
289	10	254	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
290	10	255	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
291	10	256	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
292	10	257	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
293	10	258	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
294	10	259	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
295	10	260	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
296	10	261	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
297	10	262	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
298	10	263	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
299	10	264	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
300	10	666	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
301	10	667	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
302	10	265	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
303	10	266	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
304	10	267	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
305	10	268	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
306	10	269	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
307	10	270	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
308	10	271	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
309	10	272	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
310	10	273	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
311	10	274	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
312	10	275	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
313	10	276	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
314	10	277	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
315	10	278	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
316	10	280	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
317	10	281	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
318	10	282	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
319	10	283	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
320	10	284	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
321	10	285	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
322	10	286	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
323	10	287	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
324	10	288	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
325	10	289	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
326	10	290	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
327	10	291	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
328	10	292	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
329	10	293	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
330	10	294	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
331	10	295	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
332	10	296	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
333	10	297	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
334	10	298	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
335	10	299	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
336	10	300	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
337	10	301	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
338	10	302	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
339	10	303	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
340	10	305	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
341	10	306	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
342	10	307	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
343	10	308	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
344	10	309	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
345	10	310	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
346	10	311	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
347	10	312	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
348	10	313	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
349	10	314	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
350	10	315	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
351	10	316	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
352	10	317	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
353	10	318	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
354	10	319	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
355	10	320	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
356	10	321	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
357	10	322	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
358	10	323	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
359	10	324	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
360	10	325	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
361	10	326	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
362	10	327	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
363	10	328	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
364	10	329	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
365	10	330	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
366	10	331	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
367	10	332	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
368	10	333	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
369	10	334	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
370	10	335	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
371	10	336	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
372	10	337	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
373	10	338	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
374	10	339	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
375	10	340	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
376	10	341	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
377	10	342	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
378	10	343	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
379	10	344	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
380	10	345	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
381	10	346	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
382	10	347	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
383	10	348	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
384	10	349	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
385	10	350	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
386	10	351	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
387	10	352	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
388	10	353	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
389	10	354	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
390	10	355	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
391	10	356	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
392	10	357	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
393	10	358	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
394	10	359	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
395	10	360	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
396	10	362	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
397	10	363	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
398	10	364	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
399	10	365	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
400	10	366	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
401	10	367	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
402	10	368	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
403	10	369	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
404	10	370	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
405	10	371	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
406	10	372	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
407	10	514	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
408	10	515	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
409	10	516	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
410	10	517	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
411	10	518	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
412	10	519	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
413	10	520	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
414	10	521	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
415	10	522	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
416	10	523	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
417	10	524	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
418	10	525	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
419	10	526	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
420	10	528	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
421	10	529	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
422	10	530	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
423	10	531	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
424	10	532	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
425	10	533	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
426	10	534	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
427	10	536	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
428	10	537	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
429	10	538	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
430	10	539	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
431	10	540	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
432	10	541	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
433	10	542	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
434	10	543	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
435	10	544	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
436	10	545	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
437	10	546	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
438	10	547	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
439	10	361	30	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
440	10	535	6	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
441	10	669	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
442	10	670	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
443	10	671	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
444	10	672	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
445	10	673	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
446	10	674	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
447	10	675	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
448	10	676	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
449	10	677	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
450	10	678	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
451	10	679	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
452	10	680	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
453	10	681	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
454	10	682	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
455	10	683	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
456	10	684	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
457	10	685	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
458	10	686	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
459	10	687	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
460	10	688	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
461	10	689	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
462	10	690	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
463	10	691	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
464	10	692	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
465	10	694	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
466	10	695	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
467	10	696	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
468	10	697	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
469	10	698	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
470	10	699	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
471	10	700	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
472	10	701	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
473	10	702	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
474	10	703	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
475	10	704	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
476	10	705	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
477	10	706	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
478	10	707	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
479	10	708	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
480	10	709	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
481	10	710	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
482	10	711	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
483	10	712	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
484	10	713	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
485	10	714	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
486	10	715	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
487	10	716	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
488	10	717	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
489	10	718	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
490	10	719	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
491	10	721	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
492	10	722	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
493	10	723	0	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
494	10	610	10	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
495	10	1	3073	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
496	10	248	3	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
497	10	2	100	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
498	10	9	50	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
499	10	724	500	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
500	10	725	1000	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
501	10	726	800	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
502	10	565	2	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
503	10	727	15	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
504	10	693	1	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
505	10	41	11	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
506	10	728	8	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
507	10	729	200	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
508	10	730	500	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
509	10	111	6	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
510	10	279	6	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
511	10	527	26	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
512	10	304	12	\N	\N	2026-04-13 23:28:03.049391	2026-04-13 23:28:03.049391
513	11	3	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
514	11	4	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
515	11	5	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
516	11	6	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
517	11	7	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
518	11	8	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
519	11	10	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
520	11	11	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
521	11	12	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
522	11	13	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
523	11	14	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
524	11	15	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
525	11	16	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
526	11	17	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
527	11	18	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
528	11	19	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
529	11	20	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
530	11	21	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
531	11	23	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
532	11	24	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
533	11	25	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
534	11	26	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
535	11	27	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
536	11	28	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
537	11	29	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
538	11	30	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
539	11	31	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
540	11	32	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
541	11	33	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
542	11	34	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
543	11	35	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
544	11	36	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
545	11	37	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
546	11	38	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
547	11	548	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
548	11	22	6	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
549	11	39	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
550	11	40	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
551	11	42	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
552	11	43	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
553	11	44	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
554	11	45	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
555	11	46	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
556	11	47	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
557	11	48	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
558	11	49	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
559	11	50	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
560	11	51	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
561	11	52	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
562	11	53	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
563	11	54	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
564	11	55	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
565	11	56	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
566	11	57	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
567	11	58	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
568	11	59	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
569	11	60	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
570	11	61	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
571	11	62	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
572	11	63	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
573	11	64	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
574	11	65	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
575	11	66	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
576	11	67	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
577	11	68	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
578	11	69	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
579	11	70	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
580	11	71	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
581	11	72	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
582	11	73	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
583	11	74	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
584	11	75	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
585	11	76	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
586	11	77	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
587	11	78	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
588	11	79	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
589	11	80	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
590	11	81	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
591	11	82	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
592	11	83	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
593	11	84	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
594	11	85	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
595	11	86	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
596	11	87	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
597	11	88	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
598	11	89	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
599	11	90	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
600	11	91	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
601	11	92	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
602	11	93	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
603	11	94	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
604	11	95	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
605	11	96	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
606	11	97	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
607	11	98	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
608	11	99	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
609	11	100	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
610	11	101	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
611	11	102	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
612	11	103	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
613	11	104	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
614	11	105	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
615	11	106	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
616	11	107	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
617	11	108	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
618	11	109	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
619	11	110	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
620	11	112	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
621	11	113	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
622	11	114	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
623	11	115	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
624	11	116	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
625	11	117	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
626	11	118	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
627	11	119	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
628	11	120	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
629	11	121	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
630	11	668	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
631	11	122	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
632	11	123	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
633	11	124	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
634	11	125	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
635	11	126	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
636	11	127	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
637	11	128	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
638	11	129	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
639	11	130	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
640	11	131	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
641	11	132	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
642	11	133	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
643	11	134	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
644	11	135	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
645	11	136	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
646	11	549	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
647	11	550	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
648	11	551	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
649	11	552	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
650	11	553	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
651	11	554	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
652	11	555	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
653	11	556	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
654	11	557	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
655	11	558	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
656	11	559	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
657	11	560	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
658	11	561	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
659	11	562	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
660	11	563	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
661	11	564	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
662	11	566	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
663	11	567	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
664	11	568	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
665	11	569	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
666	11	570	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
667	11	571	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
668	11	572	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
669	11	573	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
670	11	574	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
671	11	575	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
672	11	576	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
673	11	577	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
674	11	578	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
675	11	579	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
676	11	580	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
677	11	581	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
678	11	582	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
679	11	583	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
680	11	584	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
681	11	585	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
682	11	586	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
683	11	587	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
684	11	588	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
685	11	589	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
686	11	590	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
687	11	591	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
688	11	592	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
689	11	593	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
690	11	594	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
691	11	595	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
692	11	596	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
693	11	597	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
694	11	598	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
695	11	599	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
696	11	600	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
697	11	601	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
698	11	602	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
699	11	603	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
700	11	604	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
701	11	605	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
702	11	606	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
703	11	607	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
704	11	608	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
705	11	609	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
706	11	611	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
707	11	612	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
708	11	613	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
709	11	614	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
710	11	615	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
711	11	616	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
712	11	617	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
713	11	618	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
714	11	619	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
715	11	620	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
716	11	621	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
717	11	622	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
718	11	623	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
719	11	624	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
720	11	625	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
721	11	626	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
722	11	627	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
723	11	628	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
724	11	629	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
725	11	630	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
726	11	631	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
727	11	632	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
728	11	633	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
729	11	634	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
730	11	635	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
731	11	720	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
732	11	636	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
733	11	637	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
734	11	638	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
735	11	639	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
736	11	640	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
737	11	641	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
738	11	642	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
739	11	643	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
740	11	644	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
741	11	645	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
742	11	646	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
743	11	647	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
744	11	648	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
745	11	649	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
746	11	650	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
747	11	651	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
748	11	652	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
749	11	653	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
750	11	654	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
751	11	655	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
752	11	656	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
753	11	657	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
754	11	658	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
755	11	659	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
756	11	660	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
757	11	661	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
758	11	662	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
759	11	663	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
760	11	664	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
761	11	665	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
762	11	249	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
763	11	250	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
764	11	251	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
765	11	252	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
766	11	253	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
767	11	254	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
768	11	255	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
769	11	256	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
770	11	257	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
771	11	258	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
772	11	259	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
773	11	260	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
774	11	261	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
775	11	262	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
776	11	263	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
777	11	264	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
778	11	666	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
779	11	667	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
780	11	265	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
781	11	266	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
782	11	267	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
783	11	268	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
784	11	269	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
785	11	270	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
786	11	271	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
787	11	272	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
788	11	273	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
789	11	274	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
790	11	275	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
791	11	276	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
792	11	277	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
793	11	278	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
794	11	280	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
795	11	281	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
796	11	282	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
797	11	283	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
798	11	284	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
799	11	285	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
800	11	286	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
801	11	287	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
802	11	288	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
803	11	289	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
804	11	290	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
805	11	291	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
806	11	292	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
807	11	293	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
808	11	294	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
809	11	295	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
810	11	296	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
811	11	297	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
812	11	298	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
813	11	299	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
814	11	300	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
815	11	301	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
816	11	302	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
817	11	303	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
818	11	305	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
819	11	306	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
820	11	307	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
821	11	308	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
822	11	309	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
823	11	310	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
824	11	311	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
825	11	312	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
826	11	313	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
827	11	314	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
828	11	315	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
829	11	316	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
830	11	317	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
831	11	318	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
832	11	319	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
833	11	320	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
834	11	321	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
835	11	322	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
836	11	323	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
837	11	324	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
838	11	325	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
839	11	326	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
840	11	327	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
841	11	328	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
842	11	329	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
843	11	330	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
844	11	331	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
845	11	332	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
846	11	333	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
847	11	334	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
848	11	335	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
849	11	336	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
850	11	337	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
851	11	338	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
852	11	339	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
853	11	340	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
854	11	341	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
855	11	342	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
856	11	343	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
857	11	344	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
858	11	345	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
859	11	346	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
860	11	347	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
861	11	348	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
862	11	349	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
863	11	350	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
864	11	351	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
865	11	352	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
866	11	353	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
867	11	354	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
868	11	355	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
869	11	356	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
870	11	357	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
871	11	358	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
872	11	359	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
873	11	360	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
874	11	362	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
875	11	363	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
876	11	364	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
877	11	365	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
878	11	366	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
879	11	367	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
880	11	368	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
881	11	369	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
882	11	370	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
883	11	371	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
884	11	372	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
885	11	514	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
886	11	515	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
887	11	516	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
888	11	517	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
889	11	518	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
890	11	519	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
891	11	520	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
892	11	521	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
893	11	522	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
894	11	523	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
895	11	524	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
896	11	525	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
897	11	526	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
898	11	528	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
899	11	529	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
900	11	530	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
901	11	531	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
902	11	532	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
903	11	533	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
904	11	534	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
905	11	536	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
906	11	537	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
907	11	538	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
908	11	539	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
909	11	540	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
910	11	541	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
911	11	542	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
912	11	543	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
913	11	544	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
914	11	545	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
915	11	546	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
916	11	547	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
917	11	361	30	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
918	11	535	6	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
919	11	669	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
920	11	670	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
921	11	671	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
922	11	672	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
923	11	673	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
924	11	674	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
925	11	675	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
926	11	676	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
927	11	677	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
928	11	678	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
929	11	679	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
930	11	680	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
931	11	681	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
932	11	682	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
933	11	683	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
934	11	684	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
935	11	685	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
936	11	686	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
937	11	687	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
938	11	688	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
939	11	689	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
940	11	690	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
941	11	691	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
942	11	692	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
943	11	694	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
944	11	695	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
945	11	696	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
946	11	697	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
947	11	698	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
948	11	699	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
949	11	700	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
950	11	701	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
951	11	702	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
952	11	703	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
953	11	704	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
954	11	705	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
955	11	706	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
956	11	707	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
957	11	708	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
958	11	709	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
959	11	710	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
960	11	711	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
961	11	712	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
962	11	713	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
963	11	714	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
964	11	715	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
965	11	716	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
966	11	717	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
967	11	718	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
968	11	719	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
969	11	721	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
970	11	722	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
971	11	723	0	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
972	11	610	10	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
973	11	1	3073	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
974	11	248	3	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
975	11	2	100	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
976	11	9	50	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
977	11	724	500	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
978	11	725	1000	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
979	11	726	800	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
980	11	565	2	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
981	11	727	15	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
982	11	693	1	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
983	11	41	11	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
984	11	728	8	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
985	11	729	200	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
986	11	730	500	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
987	11	111	6	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
988	11	279	6	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
989	11	527	26	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
990	11	304	12	\N	\N	2026-04-13 23:28:16.877312	2026-04-13 23:28:16.877312
\.


--
-- Data for Name: material_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_requests (id, request_type, status, created_by, reviewed_by, notes, rejection_reason, created_at, reviewed_at, is_public, title) FROM stdin;
1	incoming	approved	24	30	Закупка у поставщика ООО "СтройМаркет"	\N	2026-03-25 10:30:00	2026-03-26 14:20:00	t	Закупка цемента М500
2	outgoing	approved	25	24	На строительство дома по ул. Ленина 15	\N	2026-03-28 09:15:00	2026-03-29 11:45:00	t	Штукатурка на объект
3	incoming	approved	30	24	От поставщика Bosch	\N	2026-04-01 14:00:00	2026-04-02 10:30:00	t	Поступление электроинструмента
4	outgoing	pending	26	\N	Срочная заявка на объект	\N	2026-04-05 08:45:00	\N	t	Крепеж для монтажа
5	incoming	rejected	24	30	Закупка у нового поставщика	Не прошла проверку качества	2026-03-20 11:00:00	2026-03-22 09:00:00	t	Краска фасадная
6	incoming	approved	24	30	Для отделки офиса	\N	2026-04-03 13:20:00	2026-04-04 15:00:00	t	Гипсокартон Кнауф
7	outgoing	pending	27	\N	Клиент Иванов А.А.	\N	2026-04-08 10:00:00	\N	f	Ламинат для квартиры
8	incoming	approved	30	24	\N	\N	2026-04-02 09:30:00	2026-04-03 11:00:00	t	Песок строительный
9	outgoing	rejected	25	24	Для герметизации швов	Нет в наличии	2026-03-30 12:00:00	2026-03-31 10:00:00	t	Пена монтажная
10	incoming	approved	24	30	\N	\N	2026-04-04 15:30:00	2026-04-05 09:15:00	t	Обои виниловые
11	incoming	approved	24	30	ООО СтройМаркет	\N	2026-03-01 09:00:00	2026-03-02 14:00:00	t	Закупка цемента
12	outgoing	approved	25	24	Объект ЖК Солнечный	\N	2026-03-02 10:30:00	2026-03-03 11:00:00	t	Выдача штукатурки
13	incoming	approved	30	24	Кирпичный завод	\N	2026-03-03 14:00:00	2026-03-04 09:30:00	t	Поступление кирпича
14	outgoing	rejected	26	30	Для техники	\N	2026-03-04 08:00:00	2026-03-05 10:00:00	t	Списание ГСМ
15	incoming	approved	24	30	Краски ЛК	\N	2026-03-05 11:00:00	2026-03-06 16:00:00	t	Краска фасадная
16	outgoing	approved	27	24	Строительство коттеджа	\N	2026-03-06 09:15:00	2026-03-07 13:30:00	t	Инструмент на объект
17	incoming	pending	30	\N	Итальянская плитка	\N	2026-03-07 12:00:00	\N	t	Плитка керамическая
18	outgoing	approved	25	30	Монтаж в новостройке	\N	2026-03-08 14:30:00	2026-03-09 10:00:00	f	Сантехника
19	incoming	approved	24	30	Сварочный центр	\N	2026-03-09 10:00:00	2026-03-10 11:30:00	t	Электроды сварочные
20	outgoing	rejected	26	24	Офисное помещение	\N	2026-03-10 15:00:00	2026-03-11 09:00:00	t	Ламинат для офиса
21	incoming	approved	30	24	Дизайн-студия	\N	2026-03-11 09:30:00	2026-03-12 14:00:00	t	Обои виниловые
22	outgoing	approved	24	30	Монтажники	\N	2026-03-12 11:00:00	2026-03-13 10:30:00	t	Крепеж для монтажа
23	incoming	approved	25	24	Теплоизоляция	\N	2026-03-13 13:00:00	2026-03-14 09:00:00	t	Утеплитель минеральный
24	outgoing	rejected	26	30	Герметизация	\N	2026-03-14 08:30:00	2026-03-15 11:00:00	t	Пена монтажная
25	incoming	pending	27	\N	Дверной мир	\N	2026-03-15 14:00:00	\N	t	Двери межкомнатные
26	outgoing	approved	30	24	Каркасный дом	\N	2026-03-16 10:00:00	2026-03-17 13:00:00	t	Пиломатериалы
27	incoming	approved	24	30	Электромонтаж	\N	2026-03-17 12:30:00	2026-03-18 09:30:00	t	Кабель электрический
28	outgoing	approved	25	24	Электрика в квартире	\N	2026-03-18 09:00:00	2026-03-19 14:00:00	f	Розетки и выключатели
29	incoming	approved	26	30	Гипс	\N	2026-03-19 15:00:00	2026-03-20 10:00:00	t	Гипсокартон
30	outgoing	pending	27	\N	Отделка стен	\N	2026-03-20 11:30:00	\N	t	Шпаклевка финишная
31	incoming	approved	30	24	Бытовая техника	\N	2026-03-21 10:00:00	2026-03-22 09:00:00	t	Водонагреватель
32	outgoing	approved	24	30	Отопление дома	\N	2026-03-22 13:30:00	2026-03-23 11:00:00	t	Радиаторы отопления
33	incoming	rejected	25	24	Сантехника	\N	2026-03-23 09:00:00	2026-03-24 14:30:00	t	Смесители
34	outgoing	approved	26	30	Школа №15	\N	2026-03-24 14:00:00	2026-03-25 10:00:00	t	Линолеум
35	incoming	approved	27	24	Керамика	\N	2026-03-25 11:00:00	2026-03-26 09:30:00	t	Клей для плитки
36	outgoing	approved	30	30	Монтаж	\N	2026-03-26 08:30:00	2026-03-27 12:00:00	t	Саморезы
37	incoming	pending	24	\N	Грунт-сервис	\N	2026-03-27 15:00:00	\N	t	Грунтовка
38	outgoing	approved	25	24	Паркетные работы	\N	2026-03-28 10:00:00	2026-03-29 11:30:00	f	Лак для паркета
39	incoming	approved	26	30	Пена-М	\N	2026-03-29 12:00:00	2026-03-30 09:00:00	t	Монтажная пена
40	outgoing	rejected	27	24	Аренда	\N	2026-03-30 09:30:00	2026-03-31 14:00:00	t	Перфоратор
41	incoming	approved	24	30	Цементный завод	\N	2026-04-01 09:00:00	2026-04-02 10:00:00	t	Цемент М500
42	outgoing	approved	25	24	Стройка	\N	2026-04-02 11:00:00	2026-04-03 13:30:00	t	Штукатурка
43	incoming	approved	30	24	Кирпич-Плюс	\N	2026-04-03 14:00:00	2026-04-04 09:00:00	t	Кирпич облицовочный
44	outgoing	pending	26	\N	Малярные работы	\N	2026-04-04 10:30:00	\N	t	Краска
45	incoming	approved	27	30	Керамика	\N	2026-04-05 13:00:00	2026-04-06 11:00:00	t	Плитка
46	outgoing	approved	24	30	Ванная комната	\N	2026-04-06 09:00:00	2026-04-07 14:00:00	f	Сантехника
47	incoming	rejected	25	24	Bosch	\N	2026-04-07 11:30:00	2026-04-08 10:00:00	t	Электроинструмент
48	outgoing	approved	26	30	Перегородки	\N	2026-04-08 08:00:00	2026-04-09 09:30:00	t	Гипсокартон
49	incoming	pending	27	\N	Тепло	\N	2026-04-09 15:00:00	\N	t	Утеплитель
50	outgoing	approved	30	24	Квартира	\N	2026-04-10 10:00:00	2026-04-11 11:00:00	t	Обои
51	incoming	approved	24	30	Пол-Маркет	\N	2026-04-11 12:00:00	2026-04-11 14:00:00	t	Ламинат
59	incoming	approved	24	24	fsdfsdf	\N	2026-04-11 21:30:17.868429	2026-04-11 21:30:17.857	f	fsdfsdfsdf
60	incoming	approved	24	24	\N	\N	2026-04-11 21:30:32.859083	2026-04-11 21:30:38.916928	t	fsdfsdf
61	incoming	rejected	24	24	Приход	не хочу	2026-04-16 21:59:18.570647	2026-04-16 21:59:36.129919	t	На призход товара
\.


--
-- Data for Name: material_requests_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_requests_items (id, request_id, material_id, quantity, current_quantity_at_request, created_at) FROM stdin;
1	1	22	5	1	2026-04-11 14:08:36.326264
2	2	1	50	3123	2026-04-11 14:08:36.326264
3	3	248	3	0	2026-04-11 14:08:36.326264
4	4	302	10	0	2026-04-11 14:08:36.326264
5	5	50	20	0	2026-04-11 14:08:36.326264
6	6	361	30	0	2026-04-11 14:08:36.326264
7	7	65	5	0	2026-04-11 14:08:36.326264
8	8	2	100	0	2026-04-11 14:08:36.326264
9	9	514	20	0	2026-04-11 14:08:36.326264
10	10	9	50	0	2026-04-11 14:08:36.326264
11	1	22	10	1	2026-04-11 14:13:27.445133
12	2	1	100	3123	2026-04-11 14:13:27.445133
13	3	11	500	0	2026-04-11 14:13:27.445133
14	4	305	50	0	2026-04-11 14:13:27.445133
15	5	50	30	0	2026-04-11 14:13:27.445133
16	6	248	2	0	2026-04-11 14:13:27.445133
17	7	80	100	0	2026-04-11 14:13:27.445133
18	8	92	5	0	2026-04-11 14:13:27.445133
19	9	626	20	0	2026-04-11 14:13:27.445133
20	10	65	15	0	2026-04-11 14:13:27.445133
21	11	9	100	0	2026-04-11 14:13:27.445133
22	12	302	200	0	2026-04-11 14:13:27.445133
23	13	290	50	0	2026-04-11 14:13:27.445133
24	14	514	30	0	2026-04-11 14:13:27.445133
25	15	264	4	0	2026-04-11 14:13:27.445133
26	16	275	5	0	2026-04-11 14:13:27.445133
27	17	107	200	0	2026-04-11 14:13:27.445133
28	18	108	50	0	2026-04-11 14:13:27.445133
29	19	361	50	0	2026-04-11 14:13:27.445133
30	20	2	30	0	2026-04-11 14:13:27.445133
31	21	98	2	0	2026-04-11 14:13:27.445133
32	22	92	10	0	2026-04-11 14:13:27.445133
33	23	95	8	0	2026-04-11 14:13:27.445133
34	24	67	100	0	2026-04-11 14:13:27.445133
35	25	3	50	0	2026-04-11 14:13:27.445133
36	26	302	500	0	2026-04-11 14:13:27.445133
37	27	52	40	0	2026-04-11 14:13:27.445133
38	28	53	10	0	2026-04-11 14:13:27.445133
39	29	514	50	0	2026-04-11 14:13:27.445133
40	30	249	1	0	2026-04-11 14:13:27.445133
41	31	22	20	6	2026-04-11 14:13:27.445133
42	32	1	80	3073	2026-04-11 14:13:27.445133
43	33	15	300	0	2026-04-11 14:13:27.445133
44	34	50	25	15	2026-04-11 14:13:27.445133
45	35	81	60	0	2026-04-11 14:13:27.445133
46	36	93	3	0	2026-04-11 14:13:27.445133
47	37	250	2	0	2026-04-11 14:13:27.445133
48	38	361	40	30	2026-04-11 14:13:27.445133
49	39	291	30	0	2026-04-11 14:13:27.445133
50	40	9	80	100	2026-04-11 14:13:27.445133
51	41	65	20	0	2026-04-11 14:13:27.445133
59	59	279	1	4	2026-04-11 21:30:17.868429
60	59	111	1	5	2026-04-11 21:30:17.868429
61	60	279	1	5	2026-04-11 21:30:32.859083
62	60	527	1	25	2026-04-11 21:30:32.859083
63	61	41	1	11	2026-04-16 21:59:18.570647
\.


--
-- Data for Name: materialcategories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materialcategories (id, name, description, created_by, updated_by, created_at, updated_at) FROM stdin;
1	Сухие строительные смеси	Штукатурки, шпаклевки, клеи для плитки, наливные полы, ремонтные составы	24	24	2026-01-14 16:39:43.120855	2026-01-14 16:39:43.120855
2	Кирпич, блоки и перекрытия	Стеновые материалы: кирпич, газобетонные и пеноблоки, плиты перекрытия	24	24	2026-01-14 16:39:43.120855	2026-01-14 16:39:43.120855
3	Кровельные материалы	Металлочерепица, мягкая кровля, профнастил, водосточные системы, изоляция	24	24	2026-01-14 16:39:43.120855	2026-01-14 16:39:43.120855
4	Отделочные материалы	Панели для стен и потолка, декоративный камень, 3D-панели, комплектующие	24	24	2026-01-14 16:39:43.120855	2026-01-14 16:39:43.120855
5	Лакокрасочные материалы	Краски для стен и фасадов, эмали, грунтовки, лаки, морилки, инструменты для нанесения	24	24	2026-01-14 16:39:43.120855	2026-01-14 16:39:43.120855
6	Напольные покрытия	Ламинат, паркетная доска, линолеум, ковролин, плитка ПВХ, пробка, сопутствующие товары	24	24	2026-01-14 16:39:43.120855	2026-01-14 16:39:43.120855
7	Керамическая плитка и клей	Напольная и настенная плитка, мозаика, декоративные элементы, затирки, клеевые составы	24	24	2026-01-14 16:39:43.120855	2026-01-14 16:39:43.120855
8	Сантехника и водоснабжение	Раковины, унитазы, ванны, смесители, трубы, фитинги, водонагреватели	24	24	2026-01-14 16:39:43.120855	2026-01-14 16:39:43.120855
9	Электротовары и освещение	Кабель, розетки, выключатели, щитки, светильники, лампы, системы "умный дом"	24	24	2026-01-14 16:39:43.120855	2026-01-14 16:39:43.120855
10	Инструменты	Ручной, измерительный и садовый инструмент, оснастка и расходники	24	24	2026-01-14 16:39:43.120855	2026-01-14 16:39:43.120855
11	Электроинструмент и оборудование	Дрели, перфораторы, шлифмашины, пилы, станки, компрессоры, генераторы	24	24	2026-01-14 16:39:43.120855	2026-01-14 16:39:43.120855
12	Окна, двери, стекло	Металлические и межкомнатные двери, оконные системы, зеркала, стекло, фурнитура	24	24	2026-01-14 16:39:43.120855	2026-01-14 16:39:43.120855
13	Пиломатериалы и изделия из дерева	Доска, брус, вагонка, фанера, OSB, мебельный щит, лестницы	24	24	2026-01-14 16:39:43.120855	2026-01-14 16:39:43.120855
14	Изоляционные материалы	Тепло-, звуко- и гидроизоляция: утеплители, пленки, мембраны, скотчи	24	24	2026-01-14 16:39:43.120855	2026-01-14 16:39:43.120855
15	Крепеж и метизы	Саморезы, дюбели, анкеры, гвозди, шурупы, химические анкеры, монтажные системы	24	24	2026-01-14 16:39:43.120855	2026-01-14 16:39:43.120855
16	Фасадные материалы	Фасадные панели, сайдинг, штукатурные системы, элементы фасадного декора	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
17	Лестницы и комплектующие	Готовые лестницы, ступени, балясины, перила, поручни, кронштейны	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
18	Потолочные системы	Натяжные потолки, потолочные панели, реечные потолки, армстронг, каркасы	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
19	Стеновые панели МДФ/ПВХ	Декоративные панели для внутренней отделки, рейки, плитка из МДФ и ПВХ	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
20	Гипсокартон и комплектующие	Листы ГКЛ, ГВЛ, профили, крепеж, ленты, шпаклевки для швов	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
21	Пены, герметики, клеи	Монтажные пены, герметики силиконовые и акриловые, строительные клеи	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
22	Химия для строительства	Грунтовки глубокого проникновения, пропитки, антисептики, очистители	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
23	Камины и печи	Готовые камины, печи для бани, дымоходы, аксессуары, топки	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
24	Вентиляция и кондиционирование	Воздуховоды, вентиляторы, решетки, сплит-системы, комплектующие	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
25	Системы хранения	Стеллажи, полки, гардеробные системы, кронштейны, антресоли	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
26	Садовый инвентарь	Лопаты, грабли, вилы, тачки, шланги, опрыскиватели, перчатки	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
27	Садовая мебель и декор	Садовые скамейки, столы, качели, беседки, вазоны, фигурки	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
28	Лакокрасочные инструменты	Кисти, валики, краскопульты, ванночки, шпатели малярные	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
29	Защита и спецодежда	Каски, очки, перчатки, респираторы, спецодежда, страховочные системы	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
30	Измерительные инструменты	Рулетки, уровни, угольники, лазерные нивелиры, дальномеры	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
31	Сварочное оборудование	Сварочные аппараты, маски, электроды, проволока, газовые баллоны	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
32	Пневмоинструмент	Пневмопистолеты, гайковерты, шлифмашины, компрессоры, шланги	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
33	Климатическая техника	Обогреватели, тепловые пушки, увлажнители, осушители, вентиляторы	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
34	Счетчики и КИП	Счетчики воды, газа, электроэнергии, манометры, термометры	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
36	Бассейны и оборудование	Каркасные и надувные бассейны, насосы, фильтры, химия для бассейнов	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
37	Банно-сауное оборудование	Печи для сауны, полки, аксессуары, ковши, термометры, ароматизаторы	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
38	Дорожное покрытие и благоустройство	Тротуарная плитка, бордюры, водостоки, газонные решетки	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
39	Уличное освещение	Фонари, светильники, прожекторы, солнечные батареи, опоры	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
40	Сезонные товары	Снегоуборочная техника, противогололедные материалы, мангалы, товары для отдыха	24	24	2026-01-14 16:42:45.769651	2026-01-14 16:42:45.769651
35	Автоматика и системы управления	Реле, датчики, контроллеры, приводы для ворот, системы контроля	24	24	2026-01-14 16:42:45.769651	2026-04-08 01:59:57.946402
\.


--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materials (id, category_id, name, code, description, unit, quantity, created_by, updated_by, created_at, updated_at) FROM stdin;
3	1	Клей для плитки Ceresit CM11 25 кг	SSS003	Цементный клей для керамической плитки	мешок	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
4	1	Наливной пол Bergauf Boden Zement 25 кг	SSS004	Быстротвердеющая самовыравнивающаяся смесь	мешок	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
5	1	Штукатурка цементная Основит Стартвэлл 25 кг	SSS005	Цементная штукатурка для фасадных работ	мешок	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
6	1	Ремонтная смесь Mapei Planitop Fast 25 кг	SSS006	Быстротвердеющая ремонтная смесь для бетона	мешок	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
7	1	Клей для газобетона Bonolit 25 кг	SSS007	Тонкослойный клей для кладки газобетонных блоков	мешок	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
8	1	Затирка для швов Litokol Starlike 5 кг	SSS008	Эпоксидная затирка для плиточных швов	кг	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
10	1	Смесь для стяжки Perfekta Толстый слой 50 кг	SSS010	Пескобетон для устройства стяжек толщиной до 100 мм	мешок	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
11	2	Кирпич керамический полнотелый М150	KBP001	Стандартный строительный кирпич	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
12	2	Газобетонный блок D500 600x300x200 мм	KBP002	Автоклавный газобетон для стен	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
13	2	Пеноблок D600 600x300x200 мм	KBP003	Пенобетонный блок для перегородок	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
14	2	Плита перекрытия ПК 60-15-8	KBP004	Пустотная плита перекрытия длиной 6м	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
15	2	Кирпич облицовочный коричневый	KBP005	Фасадный кирпич для декоративной кладки	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
16	2	Блок керамический поризованный 14,3 НФ	KBP006	Теплая керамика для наружных стен	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
17	2	Перемычка брусковая 2ПБ 16-2	KBP007	Железобетонная перемычка для проемов	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
18	2	Блок фундаментный ФБС 24-6-6	KBP008	Бетонный блок для устройства фундаментов	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
19	2	Кирпич шамотный ШБ-5	KBP009	Огнеупорный кирпич для печей и каминов	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
20	2	Блок пескобетонный 390x190x188 мм	KBP010	Стеновой блок для подвалов и цоколей	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
21	2	Плита дорожная ПДН 6х2х0,18 м	KBP011	Бетонная плита для дорожного покрытия	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
23	3	Металлочерепица Монтеррей 0,5 мм цвет шоколад	KM001	Стальная металлочерепица с полимерным покрытием	м²	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
24	3	Профнастил С8 оцинкованный 0,5 мм	KM002	Гофрированный лист для заборов и кровли	м²	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
25	3	Гибкая черепица Shinglas Джаз 3 м²	KM003	Битумная черепица с самоклеящимся слоем	уп	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
26	3	Водосточная система Grand Line 125/90	KM004	Пластиковая водосточная система	комплект	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
27	3	Подкровельная пленка Tyvek Soft 75 м²	KM005	Паро-ветрозащитная мембрана	рулон	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
28	3	Конек кровельный 2 м цвет коричневый	KM006	Коньковый элемент для металлочерепицы	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
29	3	Ендова нижняя 2 м оцинкованная	KM007	Доборный элемент для внутренних углов кровли	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
30	3	Снегозадержатель трубчатый 3 м	KM008	Система удержания снега на кровле	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
31	3	Капельник карнизный 2 м	KM009	Металлический капельник для карниза	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
32	3	Фальцевая кровля 0,5 мм цинк-титан	KM010	Листовая кровля из цветного металла	м²	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
33	3	Композитная черепица Decra 0,4 мм	KM011	Черепица из стального листа с каменной крошкой	м²	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
34	3	Аэратор кровельный 300 мм	KM012	Устройство для вентиляции подкровельного пространства	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
35	3	Лестница кровельная 2 секции	KM013	Стационарная лестница для обслуживания кровли	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
36	3	Кровельный костыль 200 мм	KM014	Крепежный элемент для деревянных конструкций	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
37	3	Вентиляционная лента коньковая 10 м	KM015	Лента для вентилируемого конька	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
38	4	Панель ПВХ 250 мм белая матовая	OM001	Стеновая панель для влажных помещений	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
548	24	Решетка вентиляционная	HVAC003	Пластиковая решетка	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
22	2	Армопояс U-блок 500x400x250 мм	KBP012	U-образный блок для устройства армопояса	шт	6	24	24	2026-01-14 16:50:15.921766	2026-04-11 14:08:41.562635
39	4	Декоративный камень Белый кирпич	OM002	Искусственный камень для внутренней отделки	м²	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
40	4	Панель МДФ 2,6 м дуб светлый	OM003	Ламинированная стеновая панель	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
42	4	Плинтус ПВХ 60 мм белый	OM005	Напольный плинтус с кабель-каналом	м	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
43	4	Уголок ПВХ 20х20 мм белый	OM006	Декоративный уголок для защиты углов	м	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
44	4	Молдинг полиуретановый 70 мм	OM007	Декоративный элемент для потолков и стен	м	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
45	4	Стеклянная панель 8 мм матовая	OM008	Декоративное стекло для интерьеров	м²	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
46	4	Панель акустическая 60х60 см	OM009	Звукопоглощающая панель для стен	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
47	4	Керамогранитная плитка 600x600 мм	OM010	Напольная плитка повышенной прочности	м²	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
48	4	Стеновые панели из бамбука	OM011	Экологичные панели для отделки	м²	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
49	4	Кромка ПВХ 2 мм 100 м	OM012	Кромочная лента для мебели	рулон	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
50	5	Краска интерьерная белая матовая 10 л	LKM001	Водно-дисперсионная краска для стен	банка	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
51	5	Эмаль ПФ-115 белая 3 кг	LKM002	Масляная эмаль для дерева и металла	банка	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
52	5	Грунтовка глубокого проникновения 10 л	LKM003	Универсальная акриловая грунтовка	канистра	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
53	5	Лак паркетный глянцевый 2,5 л	LKM004	Полиуретановый лак для деревянных полов	банка	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
54	5	Краска фасадная бежевая 15 кг	LKM005	Фасадная силиконовая краска	ведро	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
55	5	Морилка для дерева дуб темный 1 л	LKM006	Тонирующий состав для древесины	банка	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
56	5	Эмаль аэрозольная черная 400 мл	LKM007	Баллончик с краской для мелких работ	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
57	5	Лак яхтный 0,9 л	LKM008	Водостойкий лак для наружных работ	банка	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
58	5	Краска по ржавчине 1 кг	LKM009	Грунт-эмаль по ржавчине 3 в 1	банка	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
59	5	Шпатлевка автомобильная 1 кг	LKM010	Полиэфирная шпатлевка для авторемонта	банка	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
60	5	Олифа натуральная 1 л	LKM011	Пропитка для дерева перед покраской	банка	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
61	5	Лак для ногтей прозрачный 0,5 л	LKM012	Прозрачный лак для защиты поверхностей	банка	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
62	5	Краска для радиаторов белая 0,9 л	LKM013	Термостойкая эмаль для батарей	банка	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
63	5	Пигмент красный 100 мл	LKM014	Колер для самостоятельного окрашивания	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
64	5	Воск для дерева 0,5 л	LKM015	Защитно-декоративное покрытие	банка	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
65	6	Ламинат 33 класс дуб светлый 2,16 м²	NP001	Влагостойкий ламинат для жилых помещений	уп	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
66	6	Паркетная доска ясень 3-полосная 2,2 м²	NP002	Массивная паркетная доска	уп	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
67	6	Линолеум бытовой 3 м 2,5 мм	NP003	Гомогенный линолеум для квартир	м²	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
68	6	Ковролин нейлоновый серый 4 м	NP004	Износостойкий ковровое покрытие	м²	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
69	6	Плитка ПВХ самоклеющаяся 30х30 см	NP005	Виниловая плитка для пола	уп	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
70	6	Пробковый пол 3 мм 1 м²	NP006	Натуральное пробковое покрытие	уп	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
71	6	Подложка под ламинат 3 мм 10 м²	NP007	Вспененная полиэтиленовая подложка	рулон	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
72	6	Плинтус деревянный 60 мм 2,5 м	NP008	Массивный плинтус из сосны	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
73	6	Клей для паркета 5 кг	NP009	Дисперсионный клей для деревянных полов	ведро	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
74	6	Лак для паркета матовый 2,5 л	NP010	Износостойкий лак для деревянных полов	банка	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
75	6	Кромочная лента 10 см 25 м	NP011	Лента для компенсации расширения	рулон	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
76	6	Шумоизоляция под стяжку 10 мм 10 м²	NP012	Звукоизолирующий материал	рулон	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
77	6	Коврик придверный 60х90 см	NP013	Грязезащитный коврик	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
78	6	Противоскользящая лента 5 см 10 м	NP014	Самоклеющаяся лента для ступеней	рулон	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
79	6	Ремкомплект для ламината	NP015	Набор для ремонта повреждений	набор	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
80	7	Плитка настенная 25х40 см белая	KPP001	Керамическая плитка для ванной	м²	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
81	7	Плитка напольная 60х60 см под дерево	KPP002	Керамогранитная напольная плитка	м²	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
82	7	Мозаика стеклянная 30х30 см	KPP003	Декоративная мозаика для фартуков	лист	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
83	7	Плитка для фасада 30х60 см	KPP004	Морозостойкая плитка для наружных работ	м²	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
84	7	Клей для плитки усиленный 25 кг	KPP005	Клей для крупноформатной плитки	мешок	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
85	7	Затирка для швов белая 5 кг	KPP006	Цементная затирка для плиточных швов	мешок	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
86	7	Крестики для плитки 2 мм 100 шт	KPP007	Пластиковые крестики для ровных швов	уп	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
87	7	Система выравнивания плитки 100 шт	KPP008	Клипсы для бесшовной укладки	набор	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
88	7	Плитка для ступеней 30х60 см	KPP009	Противоскользящая плитка для лестниц	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
89	7	Бордюр декоративный 7,5х25 см	KPP010	Фриз для отделки плиточных поверхностей	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
90	7	Плитка мраморная 60х60 см	KPP011	Полированная плитка из натурального камня	м²	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
91	7	Клей для мозаики 5 кг	KPP012	Белый клей для прозрачных материалов	ведро	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
92	8	Раковина тюльпан белая 50 см	SV001	Напольная раковина с пьедесталом	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
93	8	Унитаз компакт с микролифтом	SV002	Напольный унитаз с бачком	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
94	8	Ванна акриловая 170х70 см	SV003	Стальная ванна с акриловым покрытием	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
95	8	Смеситель для ванны с душем	SV004	Двухвентильный смеситель	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
96	8	Труба полипропиленовая 20 мм 4 м	SV005	Труба для холодного водоснабжения	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
97	8	Фитинг угол 90° 20 мм	SV006	Угловой соединитель для труб	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
98	8	Водонагреватель накопительный 80 л	SV007	Электрический бойлер	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
99	8	Сифон для раковины с переливом	SV008	Пластиковый сифон 1 1/4"	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
100	8	Полотенцесушитель электрический 120 см	SV009	Настенный змеевик с ТЭНом	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
101	8	Коллектор распределительный 3 выхода	SV010	Гребенка для разводки воды	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
102	8	Счетчик воды холодной 1/2"	SV011	Крыльчатый счетчик расхода воды	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
103	8	Гофра для унитаза 1,5 м	SV012	Гибкая подводка для подключения	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
104	8	Фильтр грубой очистки 1/2"	SV013	Сетчатый фильтр-грязевик	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
105	8	Душ тропический 25х25 см	SV014	Верхний душ с регулировкой	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
106	8	Кран шаровый 1/2"	SV015	Запорная арматура для труб	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
107	9	Кабель ВВГ 3х2,5 100 м	ET001	Медный силовой кабель	бухта	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
108	9	Розетка двойная с заземлением	ET002	Встраиваемая розетка для скрытого монтажа	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
109	9	Выключатель одноклавишный	ET003	Клавишный выключатель	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
110	9	Щиток распределительный 12 модулей	ET004	Пластиковый щиток для автоматов	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
112	9	Светильник потолочный LED 40 Вт	ET006	Встраиваемый точечный светильник	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
113	9	Лампа LED 10 Вт E27	ET007	Светодиодная лампа теплый свет	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
114	9	Люстра 5-рожковая хрусталь	ET008	Подвесная люстра для гостиной	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
115	9	Бра настенное с абажуром	ET009	Декоративный светильник для стен	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
116	9	Трехжильный провод ПВС 3х1,5	ET010	Гибкий провод для подключения	бухта	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
117	9	Коробка распределительная 100х100 мм	ET011	Монтажная коробка для соединений	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
118	9	Терморегулятор для теплого пола	ET012	Программируемый регулятор температуры	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
119	9	Датчик движения для освещения	ET013	Инфракрасный датчик включения света	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
120	9	Звонок дверной беспроводной	ET014	Радиозвонок с приемником и кнопкой	комплект	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
121	9	Таймер электронный суточный	ET015	Программатор для автоматического включения	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
668	35	Домофон система	AS005	Видеодомофон	комплект	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
122	10	Молоток слесарный 500 г	IN001	Стальной молоток с фиберглассовой ручкой	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
123	10	Отвертка крестовая PH2	IN002	Диэлектрическая отвертка	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
124	10	Ключ разводной 12"	IN003	Регулируемый гаечный ключ	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
125	10	Плоскогубцы 180 мм	IN004	Комбинированные плоскогубцы	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
126	10	Ножовка по металлу 300 мм	IN005	Ручная пила с полотном	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
127	10	Уровень пузырьковый 60 см	IN006	Алюминиевый уровень 3 глазка	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
128	10	Рулетка 5 м	IN007	Стальная измерительная лента	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
129	10	Набор бит 50 предметов	IN008	Набор сменных насадок для шуруповерта	набор	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
130	10	Топор плотницкий 1 кг	IN009	Топор с деревянной ручкой	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
131	10	Лопата штыковая из стали	IN010	Садово-строительная лопата	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
132	10	Киянка резиновая 500 г	IN011	Молоток для деликатных работ	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
133	10	Стамеска 20 мм	IN012	Плотницкая стамеска по дереву	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
134	10	Ножницы по металлу 250 мм	IN013	Ручные ножницы для резки жести	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
135	10	Клещи для снятия изоляции	IN014	Стриппер для проводов	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
136	10	Гравер электрический набор	IN015	Мини-дрель с насадками	набор	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
549	24	Кондиционер сплит-система 9000 BTU	HVAC004	Настенная система	комплект	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
550	24	Клапан приточный оконный	HVAC005	Приточная вентиляция	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
551	24	Вентилятор канальный 150 мм	HVAC006	Для систем вентиляции	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
552	24	Хомут для воздуховода	HVAC007	Крепеж для вентиляции	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
553	24	Фильтр угольный для вытяжки	HVAC008	Сменный фильтр	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
554	24	Отвод воздуховода 90°	HVAC009	Поворотный элемент	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
555	24	Теплообменник рекуператор	HVAC010	Система рекуперации тепла	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
556	24	Заглушка для воздуховода	HVAC011	Заглушка торцевая	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
557	24	Кронштейн для кондиционера	HVAC012	Крепление наружного блока	комплект	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
558	25	Стеллаж металлический 5 полок	ST001	Сборный стеллаж для гаража	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
559	25	Полка настенная 600х300 мм	ST002	Регулируемая полка	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
560	25	Кронштейн для полки 300 мм	ST003	Угловой кронштейн	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
561	25	Система хранения в гардероб	ST004	Комплект штанг и полок	комплект	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
562	25	Вешалка настенная	ST005	Для верхней одежды	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
563	25	Ящик пластиковый 60л	ST006	Складской контейнер	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
564	25	Крючок настенный 5 шт	ST007	Набор крючков	набор	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
566	25	Сетка для хранения	ST009	Органайзер для мелочей	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
567	25	Штанга для одежды 1 м	ST010	Выдвижная штанга	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
568	26	Лопата штыковая из стали	GI001	Садово-строительная лопата	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
569	26	Грабли веерные 20 зубьев	GI002	Для уборки листьев	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
570	26	Вилы садовые 4 зубца	GI003	Для перекопки почвы	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
571	26	Тачка строительная 80 л	GI004	Садовая тачка	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
572	26	Шланг поливочный 1/2" 20 м	GI005	Полипропиленовый шланг	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
573	26	Опрыскиватель ручной 2 л	GI006	Садовый распылитель	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
574	26	Перчатки садовые	GI007	Прорезиненные перчатки	пара	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
575	26	Секатор садовый	GI008	Для обрезки веток	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
576	26	Коса ручная	GI009	Для скашивания травы	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
577	26	Лейка пластмассовая 10 л	GI010	Садовая лейка	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
578	26	Ножницы для травы	GI011	Кусторез ручной	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
579	26	Рыхлитель почвы	GI012	Ручной культиватор	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
580	27	Скамейка садовая деревянная	GF001	Садовые лавочки	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
581	27	Стол садовый пластиковый	GF002	Складной стол	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
582	27	Качели садовые	GF003	Подвесные качели	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
583	27	Беседка садовая 3x3 м	GF004	Металлическая беседка	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
584	27	Вазон для цветов 50 л	GF005	Декоративный горшок	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
585	27	Фонарь садовый на солнечных батареях	GF006	Автономное освещение	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
586	27	Гриль садовый	GF007	Угольный гриль	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
587	27	Гамак садовый	GF008	Подвесной гамак	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
588	27	Фигурка садовая гном	GF009	Декоративная фигурка	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
589	27	Шезлонг садовый	GF010	Раскладное кресло	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
590	28	Кисть флейцевая 100 мм	PT001	Плоская кисть для красок	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
591	28	Валик малярный 250 мм	PT002	Ворсовый валик	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
592	28	Ванночка для валика	PT003	Кювета малярная	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
593	28	Краскопульт электрический	PT004	Распылитель для краски	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
594	28	Кисть круглая №4	PT005	Для тонких работ	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
595	28	Шпатель малярный 100 мм	PT006	Гибкий шпатель	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
596	28	Миксер для красок	PT007	Насадка на дрель	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
597	28	Скотч малярный 50 мм	PT008	Бумажный скотч	рулон	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
598	28	Пленка защитная 3х10 м	PT009	Для укрывания поверхностей	рулон	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
599	28	Перчатки малярные 100 шт	PT010	Одноразовые перчатки	уп	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
600	29	Каска строительная	PPE001	Защитная каска	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
601	29	Очки защитные	PPE002	Прозрачные защитные очки	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
602	29	Респиратор противопылевой	PPE003	Маска-респиратор	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
603	29	Перчатки защитные	PPE004	Хлопчатобумажные перчатки	пара	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
604	29	Жилет сигнальный	PPE005	Светоотражающий жилет	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
605	29	Наушники противошумные	PPE006	Защита от шума	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
606	29	Обувь защитная	PPE007	Металлический носок	пара	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
607	29	Комбинезон рабочий	PPE008	Защитный костюм	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
608	29	Пояс монтажный	PPE009	Страховочный пояс	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
609	29	Маска сварщика	PPE010	Защитная маска	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
611	29	Огнетушитель 5 кг	PPE012	Порошковый огнетушитель	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
612	30	Рулетка 10 м	2MI001	Измерительная лента	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
613	30	Уровень пузырьковый 120 см	2MI002	Алюминиевый уровень	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
614	30	Лазерный нивелир	2MI003	Построитель плоскостей	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
615	30	Угольник строительный 30 см	2MI004	Металлический угольник	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
616	30	Дальномер лазерный 50 м	2MI005	Электронный дальномер	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
617	30	Отвес строительный 200 г	2MI006	Шнуровой отвес	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
618	30	Угломер цифровой	2MI007	Электронный угломер	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
619	30	Линейка складная 1 м	2MI008	Метровая линейка	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
620	30	Штангенциркуль 150 мм	2MI009	Измерительный инструмент	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
621	30	Мерная лента 50 м	2MI010	Стальная измерительная лента	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
622	30	Уровень водяной 10 м	2MI011	Гидравлический уровень	комплект	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
623	30	Трассоискатель	2MI012	Поиск скрытых коммуникаций	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
624	31	Сварочный аппарат инверторный 200А	WE001	Дуговой сварочный аппарат	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
625	31	Маска сварочная хамелеон	WE002	Автоматическая маска	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
626	31	Электроды 3 мм 5 кг	WE003	Сварочные электроды	пачка	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
627	31	Проволока сварочная 1 кг	WE004	Для полуавтомата	катушка	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
628	31	Краги сварочные	WE005	Защитные перчатки	пара	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
629	31	Баллон газовый 10 л	WE006	Для аргоновой сварки	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
630	31	Резак пропановый	WE007	Газовый резак	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
631	31	Щетка по металлу	WE008	Для зачистки швов	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
632	31	Молоток сварочный	WE009	Для отбивания шлака	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
633	31	Клемма заземления	WE010	Заземляющий зажим	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
634	32	Компрессор 100 л 2,2 кВт	PA001	Поршневой компрессор	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
635	32	Пистолет для подкачки шин	PA002	Шинный манометр	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
720	40	Зонт пляжный 3 м	SS007	Пляжный зонт	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
636	32	Гайковерт пневматический	PA003	Ударный гайковерт	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
637	32	Краскопульт пневматический	PA004	Распылитель для краски	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
638	32	Шлифмашина пневматическая	PA005	Орбитальная шлифмашина	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
639	32	Шланг пневматический 10 м	PA006	Воздушный шланг	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
640	32	Масло для компрессора	PA007	Специальное масло	л	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
641	32	Фильтр-влагоотделитель	PA008	Очистка воздуха	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
642	32	Пистолет для продувки	PA009	Очистка от пыли	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
643	32	Регулятор давления	PA010	Редуктор давления	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
644	33	Обогреватель масляный 1,5 кВт	CT001	Радиаторный обогреватель	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
645	33	Тепловая пушка 3 кВт	CT002	Электрический тепловентилятор	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
646	33	Конвектор настенный 2 кВт	CT003	Электрический конвектор	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
647	33	Увлажнитель воздуха	CT004	Ультразвуковой увлажнитель	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
648	33	Осушитель воздуха	CT005	Для бассейнов и подвалов	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
649	33	Вентилятор напольный	CT006	Бытовой вентилятор	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
650	33	ИК обогреватель 800 Вт	CT007	Инфракрасный обогреватель	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
651	33	Теплый пол электрический 10 м²	CT008	Нагревательный мат	комплект	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
652	33	Терморегулятор программируемый	CT009	Для системы теплый пол	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
653	33	Очиститель воздуха	CT010	С HEPA фильтром	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
654	34	Счетчик воды холодной	MI001	Крыльчатый счетчик	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
655	34	Счетчик электроэнергии	MI002	Однофазный счетчик	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
656	34	Манометр 0-10 бар	MI003	Измеритель давления	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
657	34	Термометр комнатный	MI004	Настенный термометр	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
658	34	Термометр уличный	MI005	Наружный термометр	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
659	34	Счетчик газа бытовой	MI006	Для учета расхода газа	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
660	34	Барометр анероид	MI007	Измеритель атмосферного давления	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
661	34	Гигрометр комнатный	MI008	Измеритель влажности	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
662	34	Таймер электронный	MI009	Программируемый таймер	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
663	34	Реле напряжения	MI010	Защита от скачков напряжения	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
664	35	Реле времени	AS001	Таймер включения/выключения	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
665	35	Датчик движения	AS002	Инфракрасный датчик	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
249	11	Перфоратор SDS-plus 800 Вт	EIO002	Ударный перфоратор для бетона	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
250	11	Болгарка 125 мм 1100 Вт	EIO003	Угловая шлифмашина	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
251	11	Циркулярная пила 1900 Вт	EIO004	Ручная дисковая пила	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
252	11	Лобзик электрический 700 Вт	EIO005	Электролобзик с маятниковым ходом	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
253	11	Шлифмашина вибрационная 250 Вт	EIO006	Плоская шлифмашина для стен	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
254	11	Фрезер ручной 1200 Вт	EIO007	Фрезер для работы по дереву	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
255	11	Торцовочная пила 210 мм	EIO008	Пила для точных угловых резов	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
256	11	Компрессор 50 л 1,5 кВт	EIO009	Поршневой компрессор	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
257	11	Генератор бензиновый 3 кВт	EIO010	Резервный источник питания	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
258	11	Пистолет краскопульт 600 Вт	EIO011	Электрический краскопульт	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
259	11	Рубанок электрический 850 Вт	EIO012	Строгальный станок	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
260	11	Тепловая пушка 3 кВт	EIO013	Электрический тепловентилятор	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
261	11	Шуруповерт аккумуляторный 12В	EIO014	Компактный шуруповерт	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
262	11	Набор оснастки 100 предметов	EIO015	Диски, сверла, биты	набор	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
263	12	Окно ПВХ 1200х1200 мм белое	ODS001	Глухое пластиковое окно	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
264	12	Дверь входная металлическая	ODS002	Усиленная дверь с замком	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
666	35	Контроллер температуры	AS003	Терморегулятор	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
667	35	Привод для ворот	AS004	Автоматика для распашных ворот	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
265	12	Дверь межкомнатная филенчатая	ODS003	Деревянная дверь с стеклом	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
266	12	Стекло 4 мм 1500х2000 мм	ODS004	Полированное оконное стекло	лист	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
267	12	Зеркало 600х800 мм	ODS005	Настенное зеркало	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
268	12	Ручка оконная белая	ODS006	Фурнитура для ПВХ окон	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
269	12	Петли дверные 100 мм 2 шт	ODS007	Накладные петли	комплект	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
270	12	Замок врезной сувальдный	ODS008	Дверной замок с ключами	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
271	12	Подоконник ПВХ 3000х300 мм	ODS009	Пластиковый подоконник	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
272	12	Москитная сетка 1200х1500 мм	ODS010	Сетка от насекомых	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
273	12	Отлив оконный 2000 мм	ODS011	Металлический отлив	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
274	12	Уплотнитель для окон 10 м	ODS012	Резиновый уплотнитель	уп	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
275	13	Доска обрезная 25х150х6000 мм	PD001	Сосновая доска естественной влажности	м³	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
276	13	Брус 100х100х6000 мм	PD002	Строительный брус	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
277	13	Вагонка сосновая 12,5х96 мм	PD003	Отделочная доска с пазом	м²	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
278	13	Фанера ФК 1525х1525х10 мм	PD004	Березовая фанера 4 сорта	лист	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
280	13	Блок-хаус 20х140 мм	PD006	Имитация бревна для отделки	м²	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
281	13	Имитация бруса 20х140 мм	PD007	Отделочная доска с шипом	м²	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
282	13	Террасная доска 28х140 мм	PD008	ДПК доска для улицы	м²	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
283	13	Плинтус деревянный 60 мм	PD009	Плинтус из массива сосны	м	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
284	13	Нагель деревянный 25х250 мм	PD010	Деревянный штырь для бруса	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
285	13	Уголок деревянный 50х50 мм	PD011	Декоративный уголок	м	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
286	13	Лестничный косоур 50х300 мм	PD012	Несущий элемент лестницы	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
287	13	Щит мебельный 18х600х2400 мм	PD013	Ламинированная ДСП	лист	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
288	13	Рейка обрешетки 25х50 мм	PD014	Брусок для обрешетки	м	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
289	13	Подставка для цветов деревянная	PD015	Декоративная этажерка	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
290	14	Утеплитель минеральная вата 100 мм	IM001	Теплоизоляция для стен	уп	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
291	14	Пенополистирол 50 мм 1 м²	IM002	Плиты ППС для утепления	лист	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
292	14	Пенофол фольгированный 3 мм	IM003	Теплоотражающая изоляция	рулон	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
293	14	Пленка пароизоляционная 75 м²	IM004	Защита от влаги и пара	рулон	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
294	14	Мембрана диффузионная 50 м²	IM005	Ветро-влагозащита для кровли	рулон	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
295	14	Скотч алюминиевый 50 мм 25 м	IM006	Лента для соединения изоляции	рулон	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
296	14	Пенополиуретан монтажный 750 мл	IM007	Монтажная пена профессиональная	баллон	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
297	14	Лента уплотнительная для окон	IM008	Самоклеющаяся лента	уп	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
298	14	Пробка листовая 10 мм	IM009	Натуральная пробковая изоляция	м²	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
299	14	Войлок строительный 10 мм	IM010	Межвенцовый утеплитель	рулон	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
300	14	Звукоизоляция 12 мм	IM011	Панели для шумоизоляции стен	м²	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
301	14	Керамзит 20-40 мм 0,05 м³	IM012	Насыпной утеплитель	мешок	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
302	15	Саморез по дереву 3,5х35 мм	2KM001	Оцинкованный саморез 100 шт	уп	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
303	15	Дюбель распорный 6х40 мм	2KM002	Пластиковый дюбель 100 шт	уп	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
305	15	Гвоздь строительный 100 мм	2KM004	Стальной гвоздь 1 кг	кг	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
306	15	Шуруп по металлу 4,2х19 мм	2KM005	Саморез с буром 200 шт	уп	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
307	15	Болт М10х60 мм с гайкой	2KM006	Метрический болт 10 шт	комплект	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
308	15	Шайба плоская 10 мм	2KM007	Стальная шайба 50 шт	уп	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
309	15	Гайка шестигранная М8	2KM008	Оцинкованная гайка 100 шт	уп	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
310	15	Заклепка алюминиевая 4х10 мм	2KM009	Вытяжные заклепки 100 шт	уп	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
311	15	Шпилька резьбовая М10х1000 мм	2KM010	Стальная шпилька с резьбой	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
312	15	Кронштейн для полки 200 мм	2KM011	Угловой кронштейн 2 шт	комплект	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
313	15	Перфолента оцинкованная 20х0,7 мм	2KM012	Монтажная лента 10 м	рулон	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
314	15	Скоба строительная 6 мм	2KM013	Скоба для степлера 1000 шт	уп	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
315	15	Хомут червячный 20-32 мм	2KM014	Нейлоновый хомут 100 шт	уп	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
316	15	Уголок стальной 50х50 мм	2KM015	Крепежный уголок 10 шт	уп	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
317	16	Сайдинг виниловый белый 3,66 м	FM001	Наружная облицовка	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
318	16	Фасадная панель под камень	FM002	ПВХ панель для цоколя	м²	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
319	16	Штукатурка короед 25 кг	FM003	Фактурная штукатурка для фасада	мешок	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
320	16	Декоративный элемент фасадный	FM004	Полиуретановый карниз	м	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
321	16	Кронштейн для вентилируемого фасада	FM005	Оцинкованный кронштейн	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
322	16	Термопанель с клинкерной плиткой	FM006	Утепленная фасадная панель	м²	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
323	16	Молдинг фасадный 100 мм	FM007	Декоративная планка	м	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
324	16	Краска для фасада 15 кг	FM008	Силиконовая краска	ведро	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
325	16	Грунтовка для фасада 10 л	FM009	Акриловая грунтовка	канистра	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
326	16	Сетка фасадная армирующая	FM010	Стеклосетка 160 г/м²	рулон	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
327	16	Дюбель для теплоизоляции 100 мм	FM011	Тарельчатый дюбель 100 шт	уп	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
328	16	Уголок фасадный арочный	FM012	Декоративный угол для арок	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
329	17	Лестница деревянная прямая	LS001	Готовая лестница на второй этаж	комплект	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
330	17	Ступень деревянная 1000х300 мм	LS002	Дубовая ступень	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
331	17	Балясина деревянная 900 мм	LS003	Точеная стойка для перил	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
332	17	Поручень сосновый 60х60 мм	LS004	Перила для лестницы	м	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
333	17	Кронштейн для лестницы	LS005	Стальной крепеж	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
334	17	Подступенок 1000х200 мм	LS006	Вертикальная часть ступени	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
335	17	Лестница алюминиевая 10 ступеней	LS007	Раздвижная стремянка	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
336	17	Накладка на ступень противоскользящая	LS008	Резиновая накладка	м	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
337	17	Столб опорный 100х100 мм	LS009	Угловой столб для перил	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
338	17	Коврик для лестницы 70х120 см	LS010	Ковровое покрытие	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
339	18	Натяжной потолок глянцевый белый	PS001	ПВХ пленка для потолка	м²	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
340	18	Панель потолочная 600х600 мм	PS002	Плита типа Армстронг	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
341	18	Реечный потолок алюминиевый	PS003	Подвесная система	м²	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
342	18	Профиль для ГКЛ 60х27 мм	PS004	Направляющий профиль	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
343	18	Подвес прямой для профиля	PS005	Крепление для каркаса	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
344	18	Уголок для ГКЛ перфорированный	PS006	Защитный уголок	м	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
345	18	Люк ревизионный 300х300 мм	PS007	Доступ в межпотолочное пространство	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
346	18	Светильник для потолка Армстронг	PS008	Встраиваемый светильник	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
347	18	Плинтус потолочный ПВХ 50 мм	PS009	Декоративный галтель	м	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
348	18	Профиль соединительный	PS010	Соединитель для профилей	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
349	18	Крестовина для реечного потолка	PS011	Соединительный элемент	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
350	18	Ткань для натяжного потолка	PS012	Тканевое полотно	м²	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
351	19	Панель МДФ 2,6 м дуб	SP001	Ламинированная стеновая панель	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
352	19	Панель ПВХ 250 мм ваниль	SP002	Влагостойкая панель для ванной	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
353	19	Рейка деревянная 20х80 мм	SP003	Декоративная рейка	м	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
354	19	Уголок для панелей ПВХ	SP004	Внутренний угол	м	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
355	19	Стартовая планка для панелей	SP005	Начальный профиль	м	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
356	19	Завершающая планка	SP006	Финишный профиль	м	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
357	19	Кляймер для панелей	SP007	Скрытый крепеж 100 шт	уп	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
358	19	Панель 3D гипсовая	SP008	Объемная декоративная панель	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
359	19	Клей для панелей ПВХ	SP009	Специальный монтажный клей	туба	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
360	19	Панель акриловая зеркальная	SP010	Отражающая панель	м²	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
362	20	Профиль потолочный 60х27 мм	GK002	Направляющий профиль	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
363	20	Профиль стоечный 50х50 мм	GK003	Стоечный профиль	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
364	20	Подвес прямой с зажимом	GK004	Крепление для профиля	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
365	20	Саморез по металлу 3,5х25 мм	GK005	Саморез для гипсокартона 1000 шт	уп	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
366	20	Дюбель для профиля 6х40 мм	GK006	Быстрый монтаж 100 шт	уп	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
367	20	Лента армирующая 50 мм	GK007	Серпянка для швов	рулон	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
368	20	Шпаклевка для швов 25 кг	GK008	Финишная шпаклевка	мешок	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
369	20	Уголок арочный гибкий	GK009	Перфорированный уголок	м	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
370	20	Гипсокартон влагостойкий	GK010	ГКЛВ для ванных комнат	лист	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
371	20	Профиль угловой защитный	GK011	Уголок для наружных углов	м	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
372	20	Клей для гипсокартона	GK012	Монтажный клей	мешок	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
514	21	Монтажная пена 750 мл	PGK001	Полиуретановая пена профессиональная	баллон	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
515	21	Герметик силиконовый санитарный	PGK002	Влагостойкий для ванной комнаты	туба	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
516	21	Герметик акриловый 310 мл	PGK003	Для внутренних работ, окрашиваемый	туба	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
517	21	Клей Момент монтажный	PGK004	Универсальный клей-пистолет	туба	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
518	21	Клей для пенопласта	PGK005	Специальный клей для утеплителя	ведро	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
519	21	Пистолет для монтажной пены	PGK006	Профессиональный аппликатор	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
520	21	Клей жидкие гвозди 400 мл	PGK007	Высокопрочный монтажный клей	туба	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
521	21	Герметик тиоколовый	PGK008	Для кровли и фундамента	ведро	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
522	21	Пена огнестойкая 500 мл	PGK009	Пена с огнезащитными свойствами	баллон	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
523	21	Клей ПВА строительный 5 кг	PGK010	Универсальный клей для дерева	ведро	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
524	21	Герметик для стекол	PGK011	Прозрачный для оконных рам	туба	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
525	21	Очиститель монтажной пены	PGK012	Растворитель для очистки инструмента	баллон	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
526	22	Грунтовка глубокого проникновения	CS001	Укрепляющая грунтовка для стен	л	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
528	22	Огнезащита для дерева	CS003	Огнебиозащитный состав	кг	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
529	22	Очиститель фасада	CS004	Для удаления высолов и загрязнений	л	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
530	22	Пропитка для бетона	CS005	Упрочняющая пропитка	л	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
531	22	Растворитель 646 1 л	CS006	Универсальный растворитель	баллон	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
532	22	Средство для удаления ржавчины	CS007	Химический преобразователь ржавчины	л	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
533	22	Гидрофобизатор для камня	CS008	Водоотталкивающая пропитка	л	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
534	22	Очиститель для инструмента	CS009	Средство для чистки после работ	баллон	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
536	23	Камин электрический с эффектом пламени	FP001	Декоративный камин с обогревом	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
537	23	Печь для бани дровяная	FP002	Металлическая печь-каменка	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
538	23	Дымоход сэндвич 115 мм	FP003	Утепленный дымоход	м	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
539	23	Топка каминная чугунная	FP004	Встраиваемая каминная топка	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
540	23	Портал для камина мраморный	FP005	Декоративное обрамление	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
541	23	Колосниковая решетка	FP006	Для каминов и печей	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
542	23	Дверца топочная со стеклом	FP007	Жаропрочное стекло	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
543	23	Набор каминных инструментов	FP008	Кочерга, совок, щипцы	набор	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
544	23	Дымоходный тройник 45°	FP009	Отвод для дымохода	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
545	23	Экран каминный защитный	FP010	Защита от искр	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
546	24	Вентилятор вытяжной для ванной	HVAC001	Осевой вентилятор 100 мм	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
547	24	Воздуховод пластиковый 100 мм	HVAC002	Круглый воздуховод	м	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
361	20	Гипсокартон 12,5 мм 1200х2500 мм	GK001	Стандартный лист ГКЛ	лист	30	24	24	2026-01-14 16:56:20.499819	2026-04-11 14:08:41.562635
535	22	Антискользящее покрытие	CS010	Напольное покрытие для безопасности	кг	6	24	24	2026-01-14 17:01:25.806664	2026-04-11 01:38:46.786348
669	35	Реле промежуточное	AS006	Для управления цепями	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
670	35	Датчик освещенности	AS007	Фотореле	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
671	35	Контроллер для котла	AS008	Программируемый контроллер	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
672	35	ИБП 1000 ВА	AS009	Источник бесперебойного питания	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
673	35	Щиток управления	AS010	Распределительный щит	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
674	36	Бассейн каркасный 4,6 м	PE001	Летний каркасный бассейн	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
675	36	Насос для бассейна 1 л/с	PE002	Циркуляционный насос	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
676	36	Фильтр для бассейна песочный	PE003	Система фильтрации	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
677	36	Хлор для бассейна 1 кг	PE004	Дезинфицирующее средство	кг	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
678	36	Тент для бассейна	PE005	Защитное покрытие	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
679	36	Лестница для бассейна	PE006	Стальная лестница	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
680	36	Пылесос для бассейна	PE007	Очистка дна бассейна	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
681	36	Подогреватель для бассейна	PE008	Теплообменник	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
682	36	Тестер для воды	PE009	Измерение pH и хлора	набор	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
683	36	Скиммер для бассейна	PE010	Поверхностный очиститель	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
684	37	Печь для сауны 9 кВт	SE001	Электрическая печь-каменка	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
685	37	Полки для сауны	SE002	Деревянные полки из абаши	комплект	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
686	37	Камень для печи 20 кг	SE003	Талькохлорит для каменки	мешок	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
687	37	Ведро для сауны	SE004	Деревянное ведро	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
688	37	Ковшик для пара	SE005	Деревянный ковшик	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
689	37	Термометр для сауны	SE006	Банный термометр	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
690	37	Гигрометр для сауны	SE007	Измеритель влажности	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
691	37	Ограждение для печи	SE008	Защитное ограждение	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
692	37	Светильник для сауны	SE009	Влагостойкий светильник	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
694	38	Тротуарная плитка 30х30 см	RP001	Брусчатка бетонная	м²	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
695	38	Бордюр садовый 1000х200х80 мм	RP002	Дорожный бордюр	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
696	38	Водосток бетонный	RP003	Ливневая канализация	м	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
697	38	Газонная решетка	RP004	Для парковок и дорожек	м²	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
698	38	Лоток дренажный 1000 мм	RP005	Водоотводный лоток	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
699	38	Решетка чугунная для ливневки	RP006	Дренажная решетка	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
700	38	Плитка резиновая 50х50 см	RP007	Безопасное покрытие	м²	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
701	38	Колонное ограждение	RP008	Дорожное ограждение	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
702	38	Знак дорожный	RP009	Предупреждающий знак	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
703	38	Краска для разметки	RP010	Дорожная разметка	кг	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
704	39	Фонарь уличный на столбе	OL001	Уличный светильник	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
705	39	Светильник садовый на солнечных батареях	OL002	Автономное освещение	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
706	39	Прожектор светодиодный 50 Вт	OL003	Наружное освещение	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
707	39	Столб для освещения 3 м	OL004	Опорный столб	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
708	39	Лампа ДНаТ 150 Вт	OL005	Газоразрядная лампа	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
709	39	Кронштейн для фонаря	OL006	Крепление для светильника	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
710	39	Панель солнечная 100 Вт	OL007	Солнечная батарея	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
711	39	Контроллер заряда 20А	OL008	Для солнечных систем	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
712	39	Кабель для уличной прокладки	OL009	Влагозащищенный кабель	м	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
713	39	Датчик освещенности уличный	OL010	Фотореле для уличного света	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
714	40	Снегоуборщик бензиновый	SS001	Машина для уборки снега	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
715	40	Лопата снеговая	SS002	Пластиковая лопата для снега	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
716	40	Противогололедный реагент	SS003	Средство от наледи	кг	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
717	40	Мангал стальной	SS004	Угольный мангал	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
718	40	Гриль электрический	SS005	Электрический гриль	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
719	40	Шезлонг пляжный	SS006	Раскладное кресло	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
721	40	Холодильник переносной	SS008	Термоконтейнер	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
722	40	Обогреватель газовый	SS009	Портативный обогреватель	шт	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
723	40	Средство от комаров	SS010	Антимоскитные спирали	уп	0	24	24	2026-01-14 17:01:25.806664	2026-01-14 17:01:25.806664
610	29	Аптечка первой помощи	PPE011	Комплект медикаментов	набор	10	24	24	2026-01-14 17:01:25.806664	2026-04-09 21:07:04.982413
1	1	Штукатурка гипсовая Knauf Ротбанд 30 кг	SSS001	Гипсовая штукатурка для ручного нанесения	мешок	3073	24	24	2026-01-14 16:50:15.921766	2026-04-11 14:08:41.562635
248	11	Дрель-шуруповерт аккумуляторная 18В	EIO001	Беспроводная дрель с 2 аккумуляторами	шт	3	24	24	2026-01-14 16:56:20.499819	2026-04-11 14:08:41.562635
2	1	Шпаклевка финишная Weber Vetonit LR+ 25 кг	SSS002	Финишная шпаклевка для внутренних работ	мешок	100	24	24	2026-01-14 16:50:15.921766	2026-04-11 14:08:41.562635
9	1	Клей для обоев Quelyd 250 г	SSS009	Сухой клей для всех типов обоев	шт	50	24	24	2026-01-14 16:50:15.921766	2026-04-11 14:08:41.562635
724	15	Гвозди строительные 100мм	GVZ001	Стальные гвозди, 1 кг	кг	500	24	\N	2026-04-11 14:15:51.961682	2026-04-11 14:15:51.961682
725	15	Саморезы 3.5х35	SMR001	Оцинкованные, 1000 шт	уп	1000	24	\N	2026-04-11 14:15:51.961682	2026-04-11 14:15:51.961682
726	15	Дюбель 6х40	DUB001	Пластиковый, 100 шт	уп	800	24	\N	2026-04-11 14:15:51.961682	2026-04-11 14:15:51.961682
565	25	Антресоль настенная	ST008	Верхняя полка для хранения	шт	2	24	24	2026-01-14 17:01:25.806664	2026-04-08 16:01:07.374991
727	11	Шуруповерт аккумуляторный	SHR001	12В, с 2 аккумуляторами	шт	15	24	\N	2026-04-11 14:15:51.961682	2026-04-11 14:15:51.961682
693	37	Ароматизатор для сауны	SE010	Эфирные масла	набор	1	24	24	2026-01-14 17:01:25.806664	2026-04-08 16:01:59.108846
41	4	3D панель гипсовая Волна 60х60 см	OM004	Объемная декоративная панель	шт	11	24	24	2026-01-14 16:50:15.921766	2026-04-08 16:03:32.965035
728	11	Перфоратор SDS-plus	PRF001	800Вт, для бетона	шт	8	24	\N	2026-04-11 14:15:51.961682	2026-04-11 14:15:51.961682
729	6	Ламинат дуб светлый	LAM001	33 класс, 2.16 м²	уп	200	24	\N	2026-04-11 14:15:51.961682	2026-04-11 14:15:51.961682
730	6	Линолеум бытовой	LIN001	3 м, 2.5 мм	м²	500	24	\N	2026-04-11 14:15:51.961682	2026-04-11 14:15:51.961682
111	9	Автомат 16А однополюсный	ET005	Автоматический выключатель	шт	6	24	24	2026-01-14 16:50:15.921766	2026-04-11 21:30:17.868429
279	13	OSB-3 2500х1250х9 мм	PD005	Ориентированно-стружечная плита	лист	6	24	24	2026-01-14 16:56:20.499819	2026-04-11 21:30:38.916928
527	22	Антисептик для древесины	CS002	Защита от грибка и плесени	л	26	24	24	2026-01-14 17:01:25.806664	2026-04-11 21:30:38.916928
304	15	Анкер химический 10х100 мм	2KM003	Двухкомпонентная химическая анкеровка	шт	12	24	24	2026-01-14 16:56:20.499819	2026-04-13 23:17:00.015659
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, chat_id, sender_id, message, image_url, file_url, file_name, file_size, is_read, read_at, is_deleted_for_sender, is_deleted_for_receiver, edited_at, created_at) FROM stdin;
57	13	24	fds	\N	\N	\N	\N	f	\N	f	f	\N	2026-04-13 02:43:58.652081
58	13	24	f;oijdsaoipsopdhgpoisd hgpos	\N	\N	\N	\N	f	\N	f	f	\N	2026-04-13 02:45:39.941737
59	13	24	fsdokfh soidghousidghoiusdfh gpuidsfhgjoih sfodjghojidf hguihfodg hdfjkg hdpfui ghdsfh gipsfjd gjksfdh gidsfhgjhdsfh gkdsfjh gksfdjgh lsfid	\N	\N	\N	\N	f	\N	f	f	\N	2026-04-13 02:46:41.641655
60	13	24	fsdokfh soidghousidghoiusdfh gpuidsfhgjoih sfodjghojidf hguihfodg hdfjkg hdpfui ghdsfh gipsfjd gjksfdh gidsfhgjhdsfh gkdsfjh gksfdjgh lsfidfsdokfh soidghousidghoiusdfh gpuidsfhgjoih sfodjghojidf hguihfodg hdfjkg hdpfui ghdsfh gipsfjd gjksfdh gidsfhgjhdsfh gkdsfjh gksfdjgh lsfidfsdokfh soidghousidghoiusdfh gpuidsfhgjoih sfodjghojidf hguihfodg hdfjkg hdpfui ghdsfh gipsfjd gjksfdh gidsfhgjhdsfh gkdsfjh gksfdjgh lsfidfsdokfh soidghousidghoiusdfh gpuidsfhgjoih sfodjghojidf hguihfodg hdfjkg hdpfui ghdsfh gipsfjd gjksfdh gidsfhgjhdsfh gkdsfjh gksfdjgh lsfidfsdokfh soidghousidghoiusdfh gpuidsfhgjoih sfodjghojidf hguihfodg hdfjkg hdpfui ghdsfh gipsfjd gjksfdh gidsfhgjhdsfh gkdsfjh gksfdjgh lsfidfsdokfh soidghousidghoiusdfh gpuidsfhgjoih sfodjghojidf hguihfodg hdfjkg hdpfui ghdsfh gipsfjd gjksfdh gidsfhgjhdsfh gkdsfjh gksfdjgh lsfid	\N	\N	\N	\N	f	\N	f	f	\N	2026-04-13 02:46:58.464383
61	14	24	fsdfsdf	\N	\N	\N	\N	f	\N	f	f	\N	2026-04-13 02:49:46.386447
62	20	24	fsafsdfsdfasdfs	\N	\N	\N	\N	f	\N	f	f	\N	2026-04-13 02:53:12.107461
63	20	24	fsdjafosajdfsdhggfjsdghjasghdjksdghlkfsdhgdsf	\N	\N	\N	\N	f	\N	f	f	\N	2026-04-13 02:53:27.2252
64	20	24	fjsbdljbgsfjdbgjldsfbgljkdf sgkjfd hgjkdfhgkjsdfh gkfdjhg dfjhgk jdfh gkfhdgjkdfhgkjlsdfhgl sfdg	\N	\N	\N	\N	f	\N	f	f	\N	2026-04-13 02:53:57.909772
65	20	24	jgkhsdfjkghljfkdghjlkdfghkjlfdghl jkdfhgjlk dfhgjlkdfhgjflkdghjkfdh gkjlfdghj fkdhgjl khgkjfdhgld kfghopifdh geroigoriepghpoi erghper ghpoeirg hpoer ghpee	\N	\N	\N	\N	f	\N	f	f	\N	2026-04-13 02:54:06.232831
66	14	24	fsdf	\N	\N	\N	\N	f	\N	f	f	\N	2026-04-13 02:55:33.847887
67	13	24	😍😍😍😍😍😍😍	\N	\N	\N	\N	f	\N	f	f	\N	2026-04-13 03:05:37.369464
68	21	135	привет	\N	\N	\N	\N	t	2026-04-13 11:41:30.471593	f	f	\N	2026-04-13 11:41:17.826296
69	21	135	хелло	\N	\N	\N	\N	t	2026-04-13 11:41:41.308859	f	f	\N	2026-04-13 11:41:41.283322
70	21	135	Шкшк	\N	\N	\N	\N	t	2026-04-13 11:45:58.429602	f	f	\N	2026-04-13 11:45:55.590514
71	21	135	Лкла	\N	\N	\N	\N	t	2026-04-13 11:46:07.054146	f	f	\N	2026-04-13 11:46:07.031828
72	21	135	Щлала	\N	\N	\N	\N	t	2026-04-13 11:47:06.558718	f	f	\N	2026-04-13 11:47:06.551458
73	21	135	Ладклк	\N	\N	\N	\N	t	2026-04-13 11:47:09.801104	f	f	\N	2026-04-13 11:47:09.796215
74	21	135	Лклкок	\N	\N	\N	\N	t	2026-04-13 11:47:14.07669	f	f	\N	2026-04-13 11:47:14.051443
75	21	24	fsdfsdfasdfsdfsdfsdfsdf	\N	\N	\N	\N	t	2026-04-13 15:34:45.266515	f	f	\N	2026-04-13 11:54:00.730365
76	21	24	fsdfsdfsfsdfsdf	\N	\N	\N	\N	t	2026-04-13 15:34:45.266515	f	f	\N	2026-04-13 11:54:13.294532
77	21	24	fddfsd	\N	\N	\N	\N	t	2026-04-13 15:34:45.266515	f	f	\N	2026-04-13 11:54:14.989598
78	21	24	ffdf	\N	\N	\N	\N	t	2026-04-13 15:34:45.266515	f	f	\N	2026-04-13 11:54:17.664065
79	21	24	f	\N	\N	\N	\N	t	2026-04-13 15:34:45.266515	f	f	\N	2026-04-13 11:54:19.383901
80	21	24	f	\N	\N	\N	\N	t	2026-04-13 15:34:45.266515	f	f	\N	2026-04-13 11:54:20.152547
81	21	24	f	\N	\N	\N	\N	t	2026-04-13 15:34:45.266515	f	f	\N	2026-04-13 11:54:20.792687
82	21	24	f	\N	\N	\N	\N	t	2026-04-13 15:34:45.266515	f	f	\N	2026-04-13 11:54:22.173824
83	21	24	f	\N	\N	\N	\N	t	2026-04-13 15:34:45.266515	f	f	\N	2026-04-13 11:54:22.872003
84	21	24	fljksdbfjsbdfkshbfjhsdmvfjsvfbjsbd gbskjdfbkj0asfkjasbd fhjbsfdkbsjdfbjl sdbfklhjsdgj ksd  vasdkj ghsjk;dgh k;shdg ;khg;,sh gjsgh;jk h;akj;f vhkjch vjhasldf	\N	\N	\N	\N	t	2026-04-13 15:34:45.266515	f	f	\N	2026-04-13 11:59:02.392132
85	21	135	Jdjdi	\N	\N	\N	\N	t	2026-04-13 15:34:55.307515	f	f	\N	2026-04-13 15:34:49.149638
86	21	135	Ujdjd	\N	\N	\N	\N	t	2026-04-13 15:35:00.962231	f	f	\N	2026-04-13 15:35:00.956188
87	21	135	Hdud	\N	\N	\N	\N	t	2026-04-13 15:35:06.739368	f	f	\N	2026-04-13 15:35:06.735129
88	21	135	Udur	\N	\N	\N	\N	t	2026-04-13 15:35:14.649377	f	f	\N	2026-04-13 15:35:13.814136
97	13	24	😅😅😅😅😅😅😅😅	\N	\N	\N	\N	f	\N	f	f	\N	2026-04-13 16:13:21.198476
90	21	24	Изините сэр	\N	\N	\N	\N	t	2026-04-13 15:50:41.466358	f	f	2026-04-13 15:49:58.376554	2026-04-13 15:49:46.781946
92	21	135	Уберай	\N	\N	\N	\N	t	2026-04-13 16:01:56.781972	f	f	\N	2026-04-13 16:01:56.773164
94	21	24	\N	/uploads/1776089037762-147861680.png	\N	\N	\N	t	2026-04-13 16:03:57.857773	f	f	\N	2026-04-13 16:03:57.80797
98	21	24	\N	\N	/uploads/1776089707195-712816003.docx	Zachet_dlya_ISP.docx	775127	t	2026-04-13 16:15:07.369861	f	f	\N	2026-04-13 16:15:07.246405
96	13	24	😵‍💫😵‍💫😵‍💫😵‍💫😵‍💫😵‍💫😵‍💫	\N	\N	\N	\N	f	\N	f	f	\N	2026-04-13 16:12:42.901121
99	21	135	Шмшмшп	\N	\N	\N	\N	t	2026-04-13 16:26:14.024832	f	f	\N	2026-04-13 16:21:52.976163
100	21	24	АЫВАЫВА	\N	\N	\N	\N	t	2026-04-13 16:30:50.607889	f	f	\N	2026-04-13 16:30:47.650222
101	21	135	Ищи8р	\N	\N	\N	\N	t	2026-04-13 16:30:52.450042	f	f	\N	2026-04-13 16:30:52.436652
102	21	135	Гшш	\N	\N	\N	\N	t	2026-04-13 16:30:58.186356	f	f	\N	2026-04-13 16:30:58.172137
103	21	135	Нош	\N	\N	\N	\N	f	\N	f	f	\N	2026-04-13 16:36:41.838624
104	21	135	68	\N	\N	\N	\N	f	\N	f	f	\N	2026-04-13 16:36:45.00938
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, message, read, created_at) FROM stdin;
486	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-08 11:37:09.161107
487	24	request_created	Создание заявки	[user:24:admin] создал заявку [request:25] "ewqeqw" на расход	t	2026-04-08 11:37:24.346787
488	24	request_approved	Подтверждение заявки	[user:24:admin] подтвердил заявку [request:25] "ewqeqw" на расход	t	2026-04-08 11:37:24.351184
489	24	request_created	Создание заявки	[user:24:admin] создал заявку [request:26] "Gg" на приход	t	2026-04-08 14:51:34.793957
490	24	request_approved	Подтверждение заявки	[user:24:admin] подтвердил заявку [request:26] "Gg" на приход	t	2026-04-08 14:52:19.841582
491	24	request_created	Создание заявки	[user:24:admin] создал заявку [request:27] "1234t" на приход	t	2026-04-08 15:19:20.388976
492	24	request_created	Создание заявки	[user:24:admin] создал заявку [request:32] "ЗАЯВКА" на приход	t	2026-04-08 15:31:18.147111
476	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-08 01:35:02.467595
477	135	login	Вход в систему	[user:135:51] вошел в систему	t	2026-04-08 01:35:11.25498
478	135	login	Вход в систему	[user:135:51] вошел в систему	t	2026-04-08 01:43:58.146133
479	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-08 01:49:36.152393
480	24	category_updated	Изменение категории	Администратор admin изменил категорию "Автоматика и системы управления": описание изменено	t	2026-04-08 01:59:26.07738
481	24	category_updated	Изменение категории	Администратор admin изменил категорию "Автоматика и системы управления": описание изменено	t	2026-04-08 01:59:40.251669
482	24	category_updated	Изменение категории	Администратор admin изменил категорию "Автоматика и системы управления": описание изменено	t	2026-04-08 01:59:58.015535
483	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-08 10:50:57.545105
484	135	login	Вход в систему	[user:135:51] вошел в систему	t	2026-04-08 10:52:25.857503
485	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-08 11:01:01.500548
493	24	request_created	Создание заявки	[user:24:admin] создал заявку [request:33] "мсмсмвмва пвап цавпв ап" на расход	t	2026-04-08 15:56:52.56876
494	24	request_rejected	Отклонение заявки	[user:24:admin] отклонил заявку [request:33] "мсмсмвмва пвап цавпв ап" на расход. Причина: аыва	t	2026-04-08 15:57:40.853739
501	24	user_created	Создание пользователя	[user:24:admin] создал пользователя [user:136:Бухгалтер]	t	2026-04-09 01:54:51.370097
496	24	request_approved	Подтверждение заявки	[user:24:admin] подтвердил заявку [request:27] "1234t" на приход	t	2026-04-08 16:01:59.193911
502	24	user_created	Создание пользователя	[user:24:admin] создал пользователя [user:137:Кладовщик]	t	2026-04-09 01:55:18.309541
498	24	request_created	Создание заявки	[user:24:admin] создал [request:34] "йкуцк" на приход	t	2026-04-08 16:16:46.310753
499	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-09 01:50:58.101062
500	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-09 01:52:52.944168
503	136	login	Вход в систему	[user:136:Бухгалтер] вошел в систему	t	2026-04-09 01:55:32.229584
504	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-09 16:11:39.919039
505	135	login	Вход в систему	[user:135:51] вошел в систему	t	2026-04-09 19:56:50.770611
506	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-09 20:07:49.123394
507	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию "сывмчм"	t	2026-04-09 20:16:39.175309
508	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию "высасыв"	t	2026-04-09 20:23:04.669918
509	24	inventory_cancelled	Отмена инвентаризации	[user:24:admin] отменил инвентаризацию "высасыв"	t	2026-04-09 20:23:14.19821
510	135	login	Вход в систему	[user:135:51] вошел в систему	t	2026-04-09 20:30:56.71065
511	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-09 20:31:13.068932
512	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию "Инвентаризация N1"	t	2026-04-09 20:34:52.699986
513	135	login	Вход в систему	[user:135:51] вошел в систему	t	2026-04-09 20:41:02.597208
514	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию "ало"	t	2026-04-09 20:42:19.352193
515	135	inventory_started	Начало инвентаризации	[user:135:51] начал инвентаризацию "ало"	t	2026-04-09 20:42:36.112808
516	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию "12321312"	t	2026-04-09 20:48:18.105126
517	24	inventory_started	Начало инвентаризации	[user:24:admin] начал инвентаризацию "12321312"	t	2026-04-09 20:49:00.246573
518	24	inventory_cancelled	Отмена инвентаризации	[user:24:admin] отменил инвентаризацию "ало"	t	2026-04-09 20:54:21.474497
519	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию "NEW"	t	2026-04-09 20:55:00.121848
520	24	inventory_started	Начало инвентаризации	[user:24:admin] начал инвентаризацию "NEW"	t	2026-04-09 20:55:07.908739
521	24	inventory_saved	Сохранение результатов	[user:24:admin] сохранил результаты инвентаризации "NEW"	t	2026-04-09 20:55:19.760112
522	24	inventory_saved	Сохранение результатов	[user:24:admin] сохранил результаты инвентаризации "NEW"	t	2026-04-09 20:55:53.424383
523	24	inventory_saved	Сохранение результатов	[user:24:admin] сохранил результаты инвентаризации "NEW"	t	2026-04-09 20:56:13.606396
524	24	inventory_completed	Завершение инвентаризации	[user:24:admin] завершил инвентаризацию "NEW" и отправил на проверку	t	2026-04-09 20:56:13.630831
525	24	inventory_approved	Подтверждение инвентаризации	[user:24:admin] подтвердил инвентаризацию "NEW", обновлено 1 позиций	t	2026-04-09 21:07:05.058027
526	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию "fsdf"	t	2026-04-09 21:15:15.303014
527	135	inventory_started	Начало инвентаризации	[user:135:51] начал инвентаризацию "fsdf"	t	2026-04-09 21:15:46.830564
528	135	inventory_saved	Сохранение результатов	[user:135:51] сохранил результаты инвентаризации "fsdf"	t	2026-04-09 21:16:12.754877
529	135	inventory_saved	Сохранение результатов	[user:135:51] сохранил результаты инвентаризации "fsdf"	t	2026-04-09 21:16:23.311803
530	135	inventory_saved	Сохранение результатов	[user:135:51] сохранил результаты инвентаризации "fsdf"	t	2026-04-09 21:16:39.666107
531	135	inventory_saved	Сохранение результатов	[user:135:51] сохранил результаты инвентаризации "fsdf"	t	2026-04-09 21:16:40.019317
532	135	inventory_saved	Сохранение результатов	[user:135:51] сохранил результаты инвентаризации "fsdf"	t	2026-04-09 21:16:50.996712
533	135	inventory_completed	Завершение инвентаризации	[user:135:51] завершил инвентаризацию "fsdf" и отправил на проверку	t	2026-04-09 21:16:51.052813
534	24	inventory_approved	Подтверждение инвентаризации	[user:24:admin] подтвердил инвентаризацию "fsdf", обновлено 0 позиций	t	2026-04-09 21:17:59.695931
535	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию [inventory:8] "admin"	t	2026-04-09 21:19:17.537538
536	24	inventory_started	Начало инвентаризации	[user:24:admin] начал инвентаризацию [inventory:8] "admin"	t	2026-04-09 21:19:22.563562
537	24	inventory_saved	Сохранение результатов	[user:24:admin] сохранил результаты инвентаризации [inventory:undefined] "admin"	t	2026-04-09 21:19:37.785
538	24	inventory_saved	Сохранение результатов	[user:24:admin] сохранил результаты инвентаризации [inventory:undefined] "admin"	t	2026-04-09 21:19:41.139833
539	24	inventory_completed	Завершение инвентаризации	[user:24:admin] завершил инвентаризацию [inventory:undefined] "admin" и отправил на проверку	t	2026-04-09 21:19:41.159727
540	24	inventory_approved	Подтверждение инвентаризации	[user:24:admin] подтвердил инвентаризацию [inventory:undefined] "admin", обновлено 0 позиций	t	2026-04-09 21:19:47.298384
541	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию [inventory:9] "fgdgdf"	t	2026-04-09 21:21:14.539414
542	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию [inventory:10] "fsdfdsfsdf324"	t	2026-04-09 21:29:56.866093
543	24	inventory_started	Начало инвентаризации	[user:24:admin] начал инвентаризацию [inventory:10] "fsdfdsfsdf324"	t	2026-04-09 21:30:21.113368
544	24	inventory_saved	Сохранение результатов	[user:24:admin] сохранил результаты инвентаризации [inventory:10] "fsdfdsfsdf324"	t	2026-04-09 21:30:32.065636
545	24	inventory_saved	Сохранение результатов	[user:24:admin] сохранил результаты инвентаризации [inventory:10] "fsdfdsfsdf324"	t	2026-04-09 21:30:35.661102
546	24	inventory_completed	Завершение инвентаризации	[user:24:admin] завершил инвентаризацию [inventory:10] "fsdfdsfsdf324" и отправил на проверку	t	2026-04-09 21:30:35.681637
547	24	inventory_approved	Подтверждение инвентаризации	[user:24:admin] подтвердил инвентаризацию [inventory:10] "fsdfdsfsdf324", обновлено 0 позиций	t	2026-04-09 21:30:41.775635
548	24	inventory_cancelled	Отмена инвентаризации	[user:24:admin] отменил инвентаризацию [inventory:9] "fgdgdf"	t	2026-04-09 21:30:47.174428
549	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию [inventory:11] "аыпвапва23"	t	2026-04-09 21:34:12.096185
550	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-10 01:56:43.216394
551	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию [inventory:12] "fsdfsdkjgjhd sfoighdfuoi gouidfj ghoijdfh gjsdfhgj fdhg dsfoip sfdhgpo sdfhg"	t	2026-04-10 02:07:51.315531
552	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию [inventory:13] "выаываы"	t	2026-04-10 02:10:52.060419
553	24	inventory_started	Начало инвентаризации	[user:24:admin] начал инвентаризацию [inventory:11] "аыпвапва23"	t	2026-04-10 02:11:44.263264
554	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию [inventory:14] "51"	t	2026-04-10 02:12:41.711232
555	135	login	Вход в систему	[user:135:51] вошел в систему	t	2026-04-10 02:12:49.521211
556	135	inventory_started	Начало инвентаризации	[user:135:51] начал инвентаризацию [inventory:14] "51"	t	2026-04-10 02:12:59.450795
557	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-10 15:07:32.056811
558	135	login	Вход в систему	[user:135:51] вошел в систему	t	2026-04-10 15:08:14.517478
559	24	inventory_deleted	Удаление инвентаризации	[user:24:admin] удалил инвентаризацию [inventory:9] "fgdgdf"	t	2026-04-10 15:21:35.193061
560	24	inventory_deleted	Удаление инвентаризации	[user:24:admin] удалил инвентаризацию [inventory:4] "ало"	t	2026-04-10 15:21:42.699349
561	135	inventory_saved	Сохранение результатов	[user:135:51] сохранил результаты инвентаризации [inventory:14] "51"	t	2026-04-10 15:35:03.694222
562	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию [inventory:15] "fsdfd"	t	2026-04-10 15:50:06.083825
563	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-10 16:02:07.691513
564	135	login	Вход в систему	[user:135:51] вошел в систему	t	2026-04-10 16:07:17.173932
565	135	login	Вход в систему	[user:135:51] вошел в систему	t	2026-04-11 00:29:26.352879
566	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-11 00:40:47.672855
567	24	inventory_started	Начало инвентаризации	[user:24:admin] начал инвентаризацию [inventory:13] "выаываы"	t	2026-04-11 00:41:06.104762
568	24	user_created	Создание пользователя	[user:24:admin] создал пользователя [user:138:kladovshik]	t	2026-04-11 00:59:07.954603
569	138	login	Вход в систему	[user:138:kladovshik] вошел в систему	t	2026-04-11 00:59:29.8819
570	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию [inventory:16] "liyg"	t	2026-04-11 01:00:09.595478
571	138	inventory_started	Начало инвентаризации	[user:138:kladovshik] начал инвентаризацию [inventory:16] "liyg"	t	2026-04-11 01:00:36.090172
572	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию [inventory:17] "kfnsdfgodfn gosfd ghifdh gidfh ghdfhgfdh gpodfh gpodfhg oipfdh  gpdhfgsdf"	t	2026-04-11 01:02:21.571896
573	24	inventory_started	Начало инвентаризации	[user:24:admin] начал инвентаризацию [inventory:17] "kfnsdfgodfn gosfd ghifdh gidfh ghdfhgfdh gpodfh gpodfhg oipfdh  gpdhfgsdf"	t	2026-04-11 01:02:24.343973
574	24	inventory_saved	Сохранение результатов	[user:24:admin] сохранил результаты инвентаризации [inventory:13] "выаываы"	t	2026-04-11 01:14:17.673362
575	24	inventory_completed	Завершение инвентаризации	[user:24:admin] завершил инвентаризацию [inventory:13] "выаываы" и отправил на проверку	t	2026-04-11 01:14:17.686521
576	24	inventory_created	Создание инвентаризации	[user:24:admin] создал инвентаризацию [inventory:18] "аодыв арщфывр пзшывфр пошыропрао пжвыавы првыа рыв"	t	2026-04-11 01:16:38.867929
577	24	inventory_started	Начало инвентаризации	[user:24:admin] начал инвентаризацию [inventory:18] "аодыв арщфывр пзшывфр пошыропрао пжвыавы првыа рыв"	t	2026-04-11 01:16:42.155494
578	24	inventory_saved	Сохранение результатов	[user:24:admin] сохранил результаты инвентаризации [inventory:18] "аодыв арщфывр пзшывфр пошыропрао пжвыавы првыа рыв"	t	2026-04-11 01:17:00.020176
579	24	inventory_completed	Завершение инвентаризации	[user:24:admin] завершил инвентаризацию [inventory:18] "аодыв арщфывр пзшывфр пошыропрао пжвыавы првыа рыв" и отправил на проверку	t	2026-04-11 01:17:00.031373
580	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-11 01:19:52.501251
581	24	inventory_approved	Подтверждение инвентаризации	[user:24:admin] подтвердил инвентаризацию [inventory:18] "аодыв арщфывр пзшывфр пошыропрао пжвыавы првыа рыв", обновлено 2 позиций	t	2026-04-11 01:38:46.825155
582	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-11 01:47:35.050776
583	24	backup_created	Создание бэкапа	[user:24:admin] создал бэкап: backup_2026-04-10T23-51-34-900Z.sql	t	2026-04-11 01:51:35.345931
584	24	inventory_cancelled	Отмена инвентаризации	[user:24:admin] отменил [inventory:17] "kfnsdfgodfn gosfd ghifdh gidfh ghdfhgfdh gpodfh gpodfhg oipfdh  gpdhfgsdf"	t	2026-04-11 01:59:19.138188
585	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-11 13:33:49.078342
586	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-11 13:49:51.578116
587	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-11 15:47:43.659955
588	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-11 15:52:51.403214
589	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-11 16:32:00.295008
590	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-11 21:07:52.142119
591	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-11 21:29:19.327089
592	24	request_created	Создание заявки	[user:24:admin] создал [request:59] "fsdfsdfsdf" на приход	t	2026-04-11 21:30:17.916744
593	24	request_approved	Подтверждение заявки	[user:24:admin] подтвердил [request:59] "fsdfsdfsdf" на приход	t	2026-04-11 21:30:17.919276
594	24	request_created	Создание заявки	[user:24:admin] создал [request:60] "fsdfsdf" на приход	t	2026-04-11 21:30:33.006026
595	24	request_approved	Подтверждение заявки	[user:24:admin] подтвердил [request:60] "fsdfsdf" на приход	t	2026-04-11 21:30:38.91936
596	24	inventory_created	Создание инвентаризации	[user:24:admin] создал [inventory:6] "gsdgdsf"	t	2026-04-11 21:50:26.372578
597	24	inventory_cancelled	Отмена инвентаризации	[user:24:admin] отменил [inventory:6] "gsdgdsf"	t	2026-04-11 21:53:06.626713
598	24	inventory_cancelled	Отмена инвентаризации	[user:24:admin] отменил [inventory:2] "Инвентаризация стройматериалов"	t	2026-04-11 22:01:55.595172
599	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-12 02:33:10.534425
600	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-12 02:48:09.514315
601	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-13 01:37:10.957743
602	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-13 01:52:03.584846
603	135	login	Вход в систему	[user:135:51] вошел в систему	t	2026-04-13 01:52:21.485943
604	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-13 02:01:39.236259
605	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-13 02:07:21.381967
606	135	login	Вход в систему	[user:135:51] вошел в систему	t	2026-04-13 02:08:28.191546
607	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-13 11:23:26.787986
608	135	login	Вход в систему	[user:135:51] вошел в систему	t	2026-04-13 11:23:59.711577
609	135	inventory_created	Создание инвентаризации	[user:135:51] создал [inventory:7] "51"	t	2026-04-13 11:25:36.757758
610	135	inventory_started	Начало инвентаризации	[user:135:51] начал [inventory:7] "51"	t	2026-04-13 11:25:42.409238
611	135	inventory_saved	Сохранение результатов	[user:135:51] сохранил результаты [inventory:7] "51"	t	2026-04-13 11:25:52.93196
612	135	inventory_saved	Сохранение результатов	[user:135:51] сохранил результаты [inventory:7] "51"	t	2026-04-13 11:25:55.549913
613	135	inventory_completed	Завершение инвентаризации	[user:135:51] завершил [inventory:7] "51" и отправил на проверку	t	2026-04-13 11:25:55.569895
614	24	inventory_approved	Подтверждение инвентаризации	[user:24:admin] подтвердил [inventory:7] "51", обновлено 0 позиций	t	2026-04-13 11:26:35.623887
615	135	login	Вход в систему	[user:135:51] вошел в систему	t	2026-04-13 11:45:46.874609
616	135	login	Вход в систему	[user:135:51] вошел в систему	t	2026-04-13 15:27:56.193523
617	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-13 22:57:51.935705
618	135	login	Вход в систему	[user:135:51] вошел в систему	t	2026-04-13 22:58:18.394887
619	135	inventory_created	Создание инвентаризации	[user:135:51] создал [inventory:8] "fsdfsd"	t	2026-04-13 23:15:35.140725
620	135	inventory_created	Создание инвентаризации	[user:135:51] создал [inventory:9] "51"	t	2026-04-13 23:16:08.116896
621	135	inventory_started	Начало инвентаризации	[user:135:51] начал [inventory:9] "51"	t	2026-04-13 23:16:12.06369
622	135	inventory_saved	Сохранение результатов	[user:135:51] сохранил результаты [inventory:9] "51"	t	2026-04-13 23:16:26.808722
623	135	inventory_completed	Завершение инвентаризации	[user:135:51] завершил [inventory:9] "51" и отправил на проверку	t	2026-04-13 23:16:26.822396
624	135	inventory_approved	Подтверждение инвентаризации	[user:135:51] подтвердил [inventory:9] "51", обновлено 1 позиций	t	2026-04-13 23:17:00.054287
625	135	inventory_created	Создание инвентаризации	[user:135:51] создал [inventory:10] "fsdfs"	t	2026-04-13 23:28:03.161894
626	135	inventory_created	Создание инвентаризации	[user:135:51] создал [inventory:11] "fsdf"	t	2026-04-13 23:28:16.993048
627	135	login	Вход в систему	[user:135:51] вошел в систему	t	2026-04-13 23:29:04.018402
628	135	profile_updated	Изменение профиля	[user:135:51] изменил данные: "birthday": "2004-09-08" → "1990-12-07"	t	2026-04-13 23:40:32.478081
629	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-13 23:40:43.847746
630	24	login	Вход в систему	[user:24:admin] вошел в систему	t	2026-04-16 21:58:13.256137
631	24	request_created	Создание заявки	[user:24:admin] создал [request:61] "На призход товара" на приход	t	2026-04-16 21:59:18.614762
632	24	request_rejected	Отклонение заявки	[user:24:admin] отклонил [request:61] "На призход товара" на приход. Причина: не хочу	t	2026-04-16 21:59:36.165059
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, password, role, name, secondname, created_at, email, phone, birthday, updated_at, username) FROM stdin;
28	$2b$10$572TZDPsHhXDpFiN7RuSKeH.YjdSo3krz2Q1LerD3uppzevsskykO	admin	Руслан	Назаровываы	2026-01-14 15:34:28.102985	fjsdhfksd@mail.ru		2006-08-02	2026-01-20 13:57:28.738	123
26	$2b$10$w.AiCbS4T0xWHb4cDUCEleT9WG6P5q2LdStgIz1VyCnLMtvmLJxtG	storekeeper	hjv	kjb	2026-01-01 23:21:54.847014			1997-12-02	2026-01-01 23:23:35.544	hkjb42
25	$2b$10$Av.5P8Y2dF0L7.MDq0Mg2.0HJd1gUpUTLDTx.Ya3nFJIH51C23NUS	storekeeper	mnb	n,ma	2026-01-01 23:21:40.489459			\N	2026-01-01 23:36:48.467	as
27	$2b$10$ayukVPfSiVJeL6QNKVW8JeUB4rCKp1AIU38td/JcMLgAAK5jw49BG	storekeeper	фвыв	выфв	2026-01-01 23:34:49.764511			1994-12-02	2026-01-01 23:38:59.341415	a
29	$2b$10$DxDYgwmeT62xvNb7ZHPV/egjoAPeOySAE2cuacYoJ8ECn..z30Tw2	storekeeper	аыва	аыва	2026-01-14 15:54:40.488854			\N	2026-01-14 15:54:40.488854	ааыва81
30	$2b$10$.HnfyjTXq621wlRFVD1XTOpRyC9v/igNJ/t.3hhpcoX4WEEHehFSK	accountant	аыва	фыва	2026-01-14 15:58:04.829497			\N	2026-01-14 15:58:04.829497	афыва41
24	$2b$10$c3RPA4Mt03gXwzckGDPNm.lenyVYv0dx6cRVoOt6ea.IaN2cVeZZi	admin	Данила	Клименков	2026-01-01 23:21:19.12148	d_siclehnbko@,ail.tu	3295739432`	1900-01-01	2026-01-14 16:01:09.437	admin
31	hashed_password_1	admin	Александр	Иванов	2026-01-14 16:15:58.049715	alex.ivanov@example.com	+79990001111	1985-03-15	2026-01-14 16:15:58.049715	admin1
32	hashed_password_2	storekeeper	Мария	Петрова	2026-01-14 16:15:58.049715	maria.petrova@example.com	+79990001112	1990-07-22	2026-01-14 16:15:58.049715	storekeeper1
33	hashed_password_3	accountant	Дмитрий	Сидоров	2026-01-14 16:15:58.049715	dmitry.sidorov@example.com	+79990001113	1988-11-30	2026-01-14 16:15:58.049715	accountant1
34	hashed_password_4	admin	Елена	Кузнецова	2026-01-14 16:15:58.049715	elena.kuznetsova@example.com	+79990001114	1983-05-18	2026-01-14 16:15:58.049715	admin2
35	hashed_password_5	storekeeper	Сергей	Смирнов	2026-01-14 16:15:58.049715	sergey.smirnov@example.com	+79990001115	1992-09-05	2026-01-14 16:15:58.049715	storekeeper2
36	hashed_password_6	accountant	Ольга	Васильева	2026-01-14 16:15:58.049715	olga.vasileva@example.com	+79990001116	1991-12-10	2026-01-14 16:15:58.049715	accountant2
37	hashed_password_7	admin	Андрей	Попов	2026-01-14 16:15:58.049715	andrey.popov@example.com	+79990001117	1987-01-25	2026-01-14 16:15:58.049715	admin3
38	hashed_password_8	storekeeper	Наталья	Морозова	2026-01-14 16:15:58.049715	natalia.morozova@example.com	+79990001118	1993-04-14	2026-01-14 16:15:58.049715	storekeeper3
39	hashed_password_9	accountant	Иван	Новиков	2026-01-14 16:15:58.049715	ivan.novikov@example.com	+79990001119	1989-08-08	2026-01-14 16:15:58.049715	accountant3
40	hashed_password_10	admin	Татьяна	Фёдорова	2026-01-14 16:15:58.049715	tatiana.fedorova@example.com	+79990001120	1984-06-19	2026-01-14 16:15:58.049715	admin4
41	hashed_password_11	storekeeper	Алексей	Волков	2026-01-14 16:15:58.049715	aleksey.volkov@example.com	+79990001121	1994-02-28	2026-01-14 16:15:58.049715	storekeeper4
42	hashed_password_12	accountant	Юлия	Алексеева	2026-01-14 16:15:58.049715	yulia.alekseeva@example.com	+79990001122	1990-10-03	2026-01-14 16:15:58.049715	accountant4
43	hashed_password_13	admin	Михаил	Лебедев	2026-01-14 16:15:58.049715	mikhail.lebedev@example.com	+79990001123	1986-03-12	2026-01-14 16:15:58.049715	admin5
44	hashed_password_14	storekeeper	Екатерина	Семёнова	2026-01-14 16:15:58.049715	ekaterina.semenova@example.com	+79990001124	1995-07-07	2026-01-14 16:15:58.049715	storekeeper5
45	hashed_password_15	accountant	Павел	Егоров	2026-01-14 16:15:58.049715	pavel.egorov@example.com	+79990001125	1987-11-21	2026-01-14 16:15:58.049715	accountant5
46	hashed_password_16	admin	Анна	Павлова	2026-01-14 16:15:58.049715	anna.pavlova@example.com	+79990001126	1982-09-17	2026-01-14 16:15:58.049715	admin6
47	hashed_password_17	storekeeper	Владимир	Козлов	2026-01-14 16:15:58.049715	vladimir.kozlov@example.com	+79990001127	1991-04-26	2026-01-14 16:15:58.049715	storekeeper6
48	hashed_password_18	accountant	Светлана	Степанова	2026-01-14 16:15:58.049715	svetlana.stepanova@example.com	+79990001128	1993-12-05	2026-01-14 16:15:58.049715	accountant6
49	hashed_password_19	admin	Николай	Никитин	2026-01-14 16:15:58.049715	nikolay.nikitin@example.com	+79990001129	1988-02-14	2026-01-14 16:15:58.049715	admin7
50	hashed_password_20	storekeeper	Людмила	Орлова	2026-01-14 16:15:58.049715	lyudmila.orlova@example.com	+79990001130	1994-08-30	2026-01-14 16:15:58.049715	storekeeper7
51	hashed_password_21	accountant	Артём	Андреев	2026-01-14 16:15:58.049715	artem.andreev@example.com	+79990001131	1989-05-23	2026-01-14 16:15:58.049715	accountant7
52	hashed_password_22	admin	Виктория	Макарова	2026-01-14 16:15:58.049715	victoria.makarova@example.com	+79990001132	1985-01-09	2026-01-14 16:15:58.049715	admin8
53	hashed_password_23	storekeeper	Константин	Захаров	2026-01-14 16:15:58.049715	konstantin.zakharov@example.com	+79990001133	1992-06-11	2026-01-14 16:15:58.049715	storekeeper8
54	hashed_password_24	accountant	Галина	Ильина	2026-01-14 16:15:58.049715	galina.ilina@example.com	+79990001134	1990-03-27	2026-01-14 16:15:58.049715	accountant8
55	hashed_password_25	admin	Роман	Гусев	2026-01-14 16:15:58.049715	roman.gusev@example.com	+79990001135	1983-10-15	2026-01-14 16:15:58.049715	admin9
56	hashed_password_26	storekeeper	Валентина	Титова	2026-01-14 16:15:58.049715	valentina.titova@example.com	+79990001136	1996-01-20	2026-01-14 16:15:58.049715	storekeeper9
57	hashed_password_27	accountant	Борис	Кузьмин	2026-01-14 16:15:58.049715	boris.kuzmin@example.com	+79990001137	1986-07-04	2026-01-14 16:15:58.049715	accountant9
58	hashed_password_28	admin	Ирина	Кудрявцева	2026-01-14 16:15:58.049715	irina.kudryavtseva@example.com	+79990001138	1984-12-12	2026-01-14 16:15:58.049715	admin10
59	hashed_password_29	storekeeper	Григорий	Баранов	2026-01-14 16:15:58.049715	grigory.baranov@example.com	+79990001139	1993-09-18	2026-01-14 16:15:58.049715	storekeeper10
60	hashed_password_30	accountant	Лариса	Киселёва	2026-01-14 16:15:58.049715	larisa.kiseleva@example.com	+79990001140	1988-11-02	2026-01-14 16:15:58.049715	accountant10
61	hashed_password_31	admin	Фёдор	Герасимов	2026-01-14 16:15:58.049715	fedor.gerasimov@example.com	+79990001141	1987-04-25	2026-01-14 16:15:58.049715	admin11
62	hashed_password_32	storekeeper	Маргарита	Тарасова	2026-01-14 16:15:58.049715	margarita.tarasova@example.com	+79990001142	1995-02-14	2026-01-14 16:15:58.049715	storekeeper11
63	hashed_password_33	accountant	Василий	Соловьёв	2026-01-14 16:15:58.049715	vasily.solovyov@example.com	+79990001143	1989-06-30	2026-01-14 16:15:58.049715	accountant11
64	hashed_password_34	admin	Жанна	Филиппова	2026-01-14 16:15:58.049715	zhanna.filippova@example.com	+79990001144	1982-08-08	2026-01-14 16:15:58.049715	admin12
65	hashed_password_35	storekeeper	Станислав	Комиссаров	2026-01-14 16:15:58.049715	stanislav.komissarov@example.com	+79990001145	1991-03-19	2026-01-14 16:15:58.049715	storekeeper12
66	hashed_password_36	accountant	Алла	Максимова	2026-01-14 16:15:58.049715	alla.maximova@example.com	+79990001146	1992-10-22	2026-01-14 16:15:58.049715	accountant12
67	hashed_password_37	admin	Виталий	Белов	2026-01-14 16:15:58.049715	vitaly.belov@example.com	+79990001147	1985-05-17	2026-01-14 16:15:58.049715	admin13
68	hashed_password_38	storekeeper	Регина	Шестакова	2026-01-14 16:15:58.049715	regina.shestakova@example.com	+79990001148	1994-07-11	2026-01-14 16:15:58.049715	storekeeper13
69	hashed_password_39	accountant	Георгий	Осипов	2026-01-14 16:15:58.049715	georgy.osipov@example.com	+79990001149	1986-12-28	2026-01-14 16:15:58.049715	accountant13
70	hashed_password_40	admin	Ксения	Дмитриева	2026-01-14 16:15:58.049715	ksenia.dmitrieva@example.com	+79990001150	1983-01-31	2026-01-14 16:15:58.049715	admin14
71	hashed_password_41	storekeeper	Ярослав	Бирюков	2026-01-14 16:15:58.049715	yaroslav.biryukov@example.com	+79990001151	1996-04-05	2026-01-14 16:15:58.049715	storekeeper14
72	hashed_password_42	accountant	Элина	Карасева	2026-01-14 16:15:58.049715	elina.karaseva@example.com	+79990001152	1990-09-13	2026-01-14 16:15:58.049715	accountant14
73	hashed_password_43	admin	Леонид	Антонов	2026-01-14 16:15:58.049715	leonid.antonov@example.com	+79990001153	1988-02-24	2026-01-14 16:15:58.049715	admin15
74	hashed_password_44	storekeeper	Вера	Фомина	2026-01-14 16:15:58.049715	vera.fomina@example.com	+79990001154	1993-11-07	2026-01-14 16:15:58.049715	storekeeper15
75	hashed_password_45	accountant	Руслан	Давыдов	2026-01-14 16:15:58.049715	ruslan.davydov@example.com	+79990001155	1987-08-16	2026-01-14 16:15:58.049715	accountant15
76	hashed_password_46	admin	Зоя	Мельникова	2026-01-14 16:15:58.049715	zoya.melnikova@example.com	+79990001156	1984-06-09	2026-01-14 16:15:58.049715	admin16
77	hashed_password_47	storekeeper	Эдуард	Щербаков	2026-01-14 16:15:58.049715	eduard.shcherbakov@example.com	+79990001157	1992-03-03	2026-01-14 16:15:58.049715	storekeeper16
78	hashed_password_48	accountant	Тамара	Блинова	2026-01-14 16:15:58.049715	tamara.blinova@example.com	+79990001158	1991-05-29	2026-01-14 16:15:58.049715	accountant16
79	hashed_password_49	admin	Семён	Колесников	2026-01-14 16:15:58.049715	semen.kolesnikov@example.com	+79990001159	1989-10-12	2026-01-14 16:15:58.049715	admin17
80	hashed_password_50	storekeeper	Диана	Карпова	2026-01-14 16:15:58.049715	diana.karpova@example.com	+79990001160	1995-12-01	2026-01-14 16:15:58.049715	storekeeper17
81	hashed_password_51	accountant	Вячеслав	Афанасьев	2026-01-14 16:15:58.049715	vyacheslav.afanasyev@example.com	+79990001161	1986-04-18	2026-01-14 16:15:58.049715	accountant17
82	hashed_password_52	admin	Лидия	Власова	2026-01-14 16:15:58.049715	lidiya.vlasova@example.com	+79990001162	1982-07-26	2026-01-14 16:15:58.049715	admin18
83	hashed_password_53	storekeeper	Тимур	Маслов	2026-01-14 16:15:58.049715	timur.maslov@example.com	+79990001163	1994-01-14	2026-01-14 16:15:58.049715	storekeeper18
84	hashed_password_54	accountant	Нина	Исакова	2026-01-14 16:15:58.049715	nina.isakova@example.com	+79990001164	1990-08-21	2026-01-14 16:15:58.049715	accountant18
85	hashed_password_55	admin	Яков	Тихонов	2026-01-14 16:15:58.049715	yakov.tikhonov@example.com	+79990001165	1985-11-05	2026-01-14 16:15:58.049715	admin19
86	hashed_password_56	storekeeper	Алёна	Савельева	2026-01-14 16:15:58.049715	alyona.savelyeva@example.com	+79990001166	1996-02-27	2026-01-14 16:15:58.049715	storekeeper19
87	hashed_password_57	accountant	Евгений	Жуков	2026-01-14 16:15:58.049715	evgeny.zhukov@example.com	+79990001167	1988-06-08	2026-01-14 16:15:58.049715	accountant19
88	hashed_password_58	admin	Клавдия	Лаврентьева	2026-01-14 16:15:58.049715	klavdiya.lavrentyeva@example.com	+79990001168	1983-03-23	2026-01-14 16:15:58.049715	admin20
89	hashed_password_59	storekeeper	Аркадий	Бобров	2026-01-14 16:15:58.049715	arkady.bobrov@example.com	+79990001169	1991-09-09	2026-01-14 16:15:58.049715	storekeeper20
90	hashed_password_60	accountant	Марина	Ершова	2026-01-14 16:15:58.049715	marina.ershova@example.com	+79990001170	1993-12-15	2026-01-14 16:15:58.049715	accountant20
91	hashed_password_61	admin	Денис	Григорьев	2026-01-14 16:15:58.049715	denis.grigoryev@example.com	+79990001171	1987-05-20	2026-01-14 16:15:58.049715	admin21
92	hashed_password_62	storekeeper	Агата	Федосеева	2026-01-14 16:15:58.049715	agata.fedoseeva@example.com	+79990001172	1995-10-04	2026-01-14 16:15:58.049715	storekeeper21
93	hashed_password_63	accountant	Степан	Зиновьев	2026-01-14 16:15:58.049715	stepan.zinovyev@example.com	+79990001173	1989-01-11	2026-01-14 16:15:58.049715	accountant21
94	hashed_password_64	admin	Лилия	Пахомова	2026-01-14 16:15:58.049715	liliya.pakhomova@example.com	+79990001174	1984-07-28	2026-01-14 16:15:58.049715	admin22
95	hashed_password_65	storekeeper	Игнат	Шубин	2026-01-14 16:15:58.049715	ignat.shubin@example.com	+79990001175	1992-04-02	2026-01-14 16:15:58.049715	storekeeper22
96	hashed_password_66	accountant	Раиса	Кондратьева	2026-01-14 16:15:58.049715	raisa.kondratyeva@example.com	+79990001176	1990-11-19	2026-01-14 16:15:58.049715	accountant22
97	hashed_password_67	admin	Вадим	Борисов	2026-01-14 16:15:58.049715	vadim.borisov@example.com	+79990001177	1986-08-13	2026-01-14 16:15:58.049715	admin23
98	hashed_password_68	storekeeper	Ульяна	Молчанова	2026-01-14 16:15:58.049715	ulyana.molchanova@example.com	+79990001178	1994-05-24	2026-01-14 16:15:58.049715	storekeeper23
99	hashed_password_69	accountant	Тарас	Ермаков	2026-01-14 16:15:58.049715	taras.ermakov@example.com	+79990001179	1988-12-06	2026-01-14 16:15:58.049715	accountant23
100	hashed_password_70	admin	Каролина	Гордеева	2026-01-14 16:15:58.049715	karolina.gordeeva@example.com	+79990001180	1983-02-17	2026-01-14 16:15:58.049715	admin24
101	hashed_password_71	storekeeper	Платон	Ситников	2026-01-14 16:15:58.049715	platon.sitnikov@example.com	+79990001181	1996-06-29	2026-01-14 16:15:58.049715	storekeeper24
102	hashed_password_72	accountant	Антонина	Ковалёва	2026-01-14 16:15:58.049715	antonina.kovalyova@example.com	+79990001182	1991-07-31	2026-01-14 16:15:58.049715	accountant24
103	hashed_password_73	admin	Игорь	Третьяков	2026-01-14 16:15:58.049715	igor.tretyakov@example.com	+79990001183	1985-09-26	2026-01-14 16:15:58.049715	admin25
104	hashed_password_74	storekeeper	Эльвира	Калмыкова	2026-01-14 16:15:58.049715	elvira.kalmykova@example.com	+79990001184	1993-03-08	2026-01-14 16:15:58.049715	storekeeper25
105	hashed_password_75	accountant	Всеволод	Наумов	2026-01-14 16:15:58.049715	vsevolod.naumov@example.com	+79990001185	1987-10-10	2026-01-14 16:15:58.049715	accountant25
106	hashed_password_76	admin	Нонна	Сорокина	2026-01-14 16:15:58.049715	nonna.sorokina@example.com	+79990001186	1982-12-23	2026-01-14 16:15:58.049715	admin26
107	hashed_password_77	storekeeper	Даниил	Воронов	2026-01-14 16:15:58.049715	danila.voronov@example.com	+79990001187	1995-01-16	2026-01-14 16:15:58.049715	storekeeper26
108	hashed_password_78	accountant	Зинаида	Моисеева	2026-01-14 16:15:58.049715	zinaida.moiseeva@example.com	+79990001188	1990-04-07	2026-01-14 16:15:58.049715	accountant26
109	hashed_password_79	admin	Альберт	Рыбаков	2026-01-14 16:15:58.049715	albert.rybakov@example.com	+79990001189	1988-05-01	2026-01-14 16:15:58.049715	admin27
110	hashed_password_80	storekeeper	Кира	Суханова	2026-01-14 16:15:58.049715	kira.sukhanova@example.com	+79990001190	1994-08-25	2026-01-14 16:15:58.049715	storekeeper27
111	hashed_password_81	accountant	Геннадий	Ефимов	2026-01-14 16:15:58.049715	gennady.efimov@example.com	+79990001191	1986-11-14	2026-01-14 16:15:58.049715	accountant27
112	hashed_password_82	admin	Ангелина	Трофимова	2026-01-14 16:15:58.049715	angelina.trofimova@example.com	+79990001192	1984-02-09	2026-01-14 16:15:58.049715	admin28
113	hashed_password_83	storekeeper	Матвей	Куликов	2026-01-14 16:15:58.049715	matvey.kulikov@example.com	+79990001193	1992-06-03	2026-01-14 16:15:58.049715	storekeeper28
114	hashed_password_84	accountant	Лиана	Савина	2026-01-14 16:15:58.049715	liana.savina@example.com	+79990001194	1991-09-28	2026-01-14 16:15:58.049715	accountant28
115	hashed_password_85	admin	Филипп	Жданов	2026-01-14 16:15:58.049715	filipp.zhdanov@example.com	+79990001195	1989-03-16	2026-01-14 16:15:58.049715	admin29
116	hashed_password_86	storekeeper	Яна	Романова	2026-01-14 16:15:58.049715	yana.romanova@example.com	+79990001196	1996-07-19	2026-01-14 16:15:58.049715	storekeeper29
117	hashed_password_87	accountant	Арсений	Марков	2026-01-14 16:15:58.049715	arseny.markov@example.com	+79990001197	1987-12-22	2026-01-14 16:15:58.049715	accountant29
118	hashed_password_88	admin	Евдокия	Воронцова	2026-01-14 16:15:58.049715	evdokiya.vorontsova@example.com	+79990001198	1983-10-08	2026-01-14 16:15:58.049715	admin30
119	hashed_password_89	storekeeper	Прохор	Логинов	2026-01-14 16:15:58.049715	prokhor.loginov@example.com	+79990001199	1993-01-27	2026-01-14 16:15:58.049715	storekeeper30
120	hashed_password_90	accountant	Варвара	Беляева	2026-01-14 16:15:58.049715	varvara.belyaeva@example.com	+79990001200	1990-05-06	2026-01-14 16:15:58.049715	accountant30
121	hashed_password_91	storekeeper	Глеб	Котов	2026-01-14 16:15:58.049715	gleb.kotov@example.com	+79990001201	1994-11-11	2026-01-14 16:15:58.049715	storekeeper31
122	hashed_password_92	storekeeper	Любовь	Журавлёва	2026-01-14 16:15:58.049715	lyubov.zhuravlyova@example.com	+79990001202	1995-04-13	2026-01-14 16:15:58.049715	storekeeper32
123	hashed_password_93	storekeeper	Родион	Петухов	2026-01-14 16:15:58.049715	rodion.petukhov@example.com	+79990001203	1992-08-20	2026-01-14 16:15:58.049715	storekeeper33
124	hashed_password_94	accountant	Снежана	Лапина	2026-01-14 16:15:58.049715	snezhana.lapina@example.com	+79990001204	1989-02-03	2026-01-14 16:15:58.049715	accountant31
125	hashed_password_95	accountant	Ипполит	Прокофьев	2026-01-14 16:15:58.049715	ippolit.prokofyev@example.com	+79990001205	1986-06-27	2026-01-14 16:15:58.049715	accountant32
126	hashed_password_96	accountant	Кристина	Носкова	2026-01-14 16:15:58.049715	kristina.noskova@example.com	+79990001206	1993-12-31	2026-01-14 16:15:58.049715	accountant33
127	hashed_password_97	storekeeper	Егор	Медведев	2026-01-14 16:15:58.049715	egor.medvedev@example.com	+79990001207	1991-07-09	2026-01-14 16:15:58.049715	storekeeper34
128	hashed_password_98	accountant	Анфиса	Потапова	2026-01-14 16:15:58.049715	anfisa.potapova@example.com	+79990001208	1988-04-04	2026-01-14 16:15:58.049715	accountant34
129	hashed_password_99	storekeeper	Савелий	Николаев	2026-01-14 16:15:58.049715	savely.nikolaev@example.com	+79990001209	1996-03-21	2026-01-14 16:15:58.049715	storekeeper35
130	hashed_password_100	accountant	Лев	Соболев	2026-01-14 16:15:58.049715	lev.sobolev@example.com	+79990001210	1987-09-17	2026-01-14 16:15:58.049715	accountant35
131	$2b$10$GgDr4N/jztshytAeAALMweUcD0DGw9Fp0q4dLUWeLXOTkW96Ymp/6	storekeeper	Даниока	Полка	2026-01-15 05:12:25.953395	d_silchenkov@mail.ru	891185735842	2006-08-06	2026-01-15 05:14:09.609	1
132	$2b$10$MOX4qoqiV/rVD13E2pNyzOKqmwgGFIRWmowJVtibMxU45CONMUbLS	admin	b	b	2026-04-06 18:27:39.361909			\N	2026-04-06 18:27:39.361909	4
133	$2b$10$ijY7uYp1ToyVrU.8hRkN9uze0xiplkAzyDlwCR.KdgSNcVrmM78hG	storekeeper	fsd	fds	2026-04-06 22:50:32.067478			\N	2026-04-06 22:50:32.067478	13
134	$2b$10$CHjRcPA6FSogS8n1.WhWzufNtRkLRIIYDTVaCHxcrIMsZ9ctn0wtS	accountant	123	3123	2026-04-07 12:58:46.224238			\N	2026-04-07 12:58:46.224238	23
136	$2b$10$fL5nGeLo3YWWkqyaR01fDu5Ka5Q1KHMyhIW9yl7pM6ffnzc0609iy	accountant	Бухгалтер	Бухгалтер	2026-04-09 01:54:51.300406			\N	2026-04-09 01:54:51.300406	Бухгалтер
137	$2b$10$vyTvtAsY2GMBMd8wtCTU4OqCKsMZnGym5t2Ke0q.wXkgoHAIk5zBC	storekeeper	Кладовщик	Кладовщик	2026-04-09 01:55:18.250901			\N	2026-04-09 01:55:18.250901	Кладовщик
138	$2b$10$njvPS8rF67uyTnwUJtlzH./b4V5ja5wkDj6MAmTp9e/uoHnKyH4w.	storekeeper	store	store	2026-04-11 00:59:07.910902			\N	2026-04-11 00:59:07.910902	kladovshik
135	$2b$10$ydeDhBpKguzPb5GpPAoG/OHhwlT4gdVwMgGwycUEfb6JJ6l13y7Ue	accountant	Юля	юля	2026-04-07 13:58:25.278585			1990-12-07	2026-04-13 23:40:32.44	51
\.


--
-- Name: backups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.backups_id_seq', 3, true);


--
-- Name: chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chats_id_seq', 21, true);


--
-- Name: inventories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventories_id_seq', 11, true);


--
-- Name: inventory_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_categories_id_seq', 18, true);


--
-- Name: inventory_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_materials_id_seq', 16, true);


--
-- Name: inventory_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_results_id_seq', 990, true);


--
-- Name: material_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.material_requests_id_seq', 61, true);


--
-- Name: material_requests_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.material_requests_items_id_seq', 63, true);


--
-- Name: materialcategories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materialcategories_id_seq', 40, true);


--
-- Name: materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materials_id_seq', 730, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 104, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 632, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 138, true);


--
-- Name: backups backups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backups
    ADD CONSTRAINT backups_pkey PRIMARY KEY (id);


--
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


--
-- Name: chats chats_user1_id_user2_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_user1_id_user2_id_key UNIQUE (user1_id, user2_id);


--
-- Name: inventories inventories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventories
    ADD CONSTRAINT inventories_pkey PRIMARY KEY (id);


--
-- Name: inventory_categories inventory_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_categories
    ADD CONSTRAINT inventory_categories_pkey PRIMARY KEY (id);


--
-- Name: inventory_materials inventory_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_materials
    ADD CONSTRAINT inventory_materials_pkey PRIMARY KEY (id);


--
-- Name: inventory_results inventory_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_results
    ADD CONSTRAINT inventory_results_pkey PRIMARY KEY (id);


--
-- Name: material_requests_items material_requests_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests_items
    ADD CONSTRAINT material_requests_items_pkey PRIMARY KEY (id);


--
-- Name: material_requests material_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests
    ADD CONSTRAINT material_requests_pkey PRIMARY KEY (id);


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
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


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
-- Name: idx_chats_updated_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chats_updated_at ON public.chats USING btree (updated_at);


--
-- Name: idx_chats_users; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chats_users ON public.chats USING btree (user1_id, user2_id);


--
-- Name: idx_messages_chat_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_chat_id ON public.messages USING btree (chat_id);


--
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at);


--
-- Name: backups backups_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backups
    ADD CONSTRAINT backups_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: chats chats_user1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chats chats_user2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: inventories inventories_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventories
    ADD CONSTRAINT inventories_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: inventories inventories_cancelled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventories
    ADD CONSTRAINT inventories_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: inventories inventories_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventories
    ADD CONSTRAINT inventories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: inventories inventories_responsible_person_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventories
    ADD CONSTRAINT inventories_responsible_person_fkey FOREIGN KEY (responsible_person) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: inventory_categories inventory_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_categories
    ADD CONSTRAINT inventory_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.materialcategories(id) ON DELETE CASCADE;


--
-- Name: inventory_categories inventory_categories_inventory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_categories
    ADD CONSTRAINT inventory_categories_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventories(id) ON DELETE CASCADE;


--
-- Name: inventory_materials inventory_materials_inventory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_materials
    ADD CONSTRAINT inventory_materials_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventories(id) ON DELETE CASCADE;


--
-- Name: inventory_materials inventory_materials_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_materials
    ADD CONSTRAINT inventory_materials_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE CASCADE;


--
-- Name: inventory_results inventory_results_inventory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_results
    ADD CONSTRAINT inventory_results_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventories(id) ON DELETE CASCADE;


--
-- Name: inventory_results inventory_results_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_results
    ADD CONSTRAINT inventory_results_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE CASCADE;


--
-- Name: material_requests material_requests_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests
    ADD CONSTRAINT material_requests_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: material_requests_items material_requests_items_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests_items
    ADD CONSTRAINT material_requests_items_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE CASCADE;


--
-- Name: material_requests_items material_requests_items_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests_items
    ADD CONSTRAINT material_requests_items_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.material_requests(id) ON DELETE CASCADE;


--
-- Name: material_requests material_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests
    ADD CONSTRAINT material_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


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
-- Name: messages messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict lVQV6xRg10iWhklRThHKZqcHPXaVXqiaamNEqMRHOXpnbWfjnvKlTsxVVZjtlq5

