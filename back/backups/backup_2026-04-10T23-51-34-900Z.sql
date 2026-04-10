--
-- PostgreSQL database dump
--

\restrict JJlpeK2xFGmVN5o0YzFonsIvf09XEjXNw9oiQfHEJiAEZcDYaG6w8b0OFtgHF54

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
\.


--
-- Data for Name: inventories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventories (id, title, status, created_by, responsible_person, start_date, end_date, description, created_at, updated_at, completed_at, approved_at, approved_by, cancelled_at, cancelled_by) FROM stdin;
1	сывмчм	draft	24	27	2026-04-03	2026-04-04	аываыва	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232	\N	\N	\N	\N	\N
2	высасыв	cancelled	24	28	2026-04-10	2026-04-18	\N	2026-04-09 20:23:04.596598	2026-04-09 20:23:14.188461	\N	\N	\N	2026-04-09 20:23:14.188461	24
3	Инвентаризация N1	draft	24	26	2026-04-10	2026-04-22	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668	\N	\N	\N	\N	\N
5	12321312	in_progress	24	24	2026-04-08	2026-05-03	\N	2026-04-09 20:48:17.853021	2026-04-09 20:49:00.181439	\N	\N	\N	\N	\N
6	NEW	approved	24	24	2026-04-16	2026-04-16	\N	2026-04-09 20:55:00.054518	2026-04-09 21:07:04.982413	2026-04-09 20:56:13.62978	2026-04-09 21:07:04.982413	24	\N	\N
7	fsdf	approved	24	135	2026-04-10	2026-04-17	\N	2026-04-09 21:15:15.220058	2026-04-09 21:17:59.626351	2026-04-09 21:16:51.05164	2026-04-09 21:17:59.626351	24	\N	\N
8	admin	approved	24	24	2026-04-30	2026-05-03	\N	2026-04-09 21:19:17.458365	2026-04-09 21:19:47.295233	2026-04-09 21:19:41.158508	2026-04-09 21:19:47.295233	24	\N	\N
10	fsdfdsfsdf324	approved	24	24	2026-04-08	2026-04-10	fdsff	2026-04-09 21:29:56.784821	2026-04-09 21:30:41.76166	2026-04-09 21:30:35.680314	2026-04-09 21:30:41.76166	24	\N	\N
12	fsdfsdkjgjhd sfoighdfuoi gouidfj ghoijdfh gjsdfhgj fdhg dsfoip sfdhgpo sdfhg	draft	24	28	2026-04-17	2026-04-21	\N	2026-04-10 02:07:51.276498	2026-04-10 02:07:51.276498	\N	\N	\N	\N	\N
11	аыпвапва23	in_progress	24	24	2026-04-23	2026-04-26	\N	2026-04-09 21:34:12.018639	2026-04-10 02:11:44.229237	\N	\N	\N	\N	\N
14	51	in_progress	24	135	2026-04-08	2026-04-18	\N	2026-04-10 02:12:41.672218	2026-04-10 02:12:59.448886	\N	\N	\N	\N	\N
15	fsdfd	draft	24	28	2026-04-09	2026-04-23	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951	\N	\N	\N	\N	\N
16	liyg	in_progress	24	138	2026-04-10	2026-04-22	uygfygfu tfuti ftyf if iyfif jghcghc ytyg g ifiubgokfduygfygfu tfuti ftyf if iyfif jghcghc ytyg g ifiubgokfduygfygfu tfuti ftyf if iyfif jghcghc ytyg g ifiubgokfduygfygfu tfuti ftyf if iyfif jghcghc ytyg g ifiubgokfduygfygfu tfuti ftyf if iyfif jghcghc ytyg g ifiubgokfduygfygfu tfuti ftyf if iyfif jghcghc ytyg g ifiubgokfduygfygfu tfuti ftyf if iyfif jghcghc ytyg g ifiubgokfduygfygfu tfuti ftyf if iyfif jghcghc ytyg g ifiubgokfd	2026-04-11 01:00:09.536535	2026-04-11 01:00:36.057595	\N	\N	\N	\N	\N
17	kfnsdfgodfn gosfd ghifdh gidfh ghdfhgfdh gpodfh gpodfhg oipfdh  gpdhfgsdf	in_progress	24	24	2026-04-09	2026-04-23	адол ыивщаш рывщш пuygfygfu tfuti ftyf if iyfif jghcghc ytyg g ifiubgokfduygfygfu tfuti ftyf if iyfif jghcghc ytyg g ifiubgokfduygfygfu tfuti ftyf if iyfif jghcghc ytyg g ifiubgokfduygfygfu tfuti ftyf if iyfif jghcghc ytyg g ifiubgokfduygfygfu tfuti ftyf if iyfif jghcghc ytyg g ifiubgokfduygfygfu tfuti ftyf if iyfif jghcghc ytyg g ifiubgokfduygfygfu tfuti ftyf if iyfif jghcghc ytyg g ifiubgokfd	2026-04-11 01:02:21.514085	2026-04-11 01:02:24.342953	\N	\N	\N	\N	\N
13	выаываы	completed	24	24	2026-04-11	2026-04-15	\N	2026-04-10 02:10:52.0208	2026-04-11 01:14:17.685922	2026-04-11 01:14:17.685922	\N	\N	\N	\N
18	аодыв арщфывр пзшывфр пошыропрао пжвыавы првыа рыв	approved	24	24	2026-04-10	2026-04-17	шо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр шшо арыщвфшопрщшыврп оывшпр шоывр ш	2026-04-11 01:16:38.818418	2026-04-11 01:38:46.786348	2026-04-11 01:17:00.03081	2026-04-11 01:38:46.786348	24	\N	\N
\.


--
-- Data for Name: inventory_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_categories (id, inventory_id, category_id) FROM stdin;
1	3	37
2	3	35
4	11	35
5	16	36
6	17	20
7	17	36
8	17	23
9	17	28
\.


--
-- Data for Name: inventory_materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_materials (id, inventory_id, material_id) FROM stdin;
1	2	88
2	6	610
3	7	111
4	7	304
5	7	527
6	8	304
7	8	527
9	10	565
10	12	304
11	13	41
12	14	279
13	18	535
14	18	527
15	18	304
\.


--
-- Data for Name: inventory_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_results (id, inventory_id, material_id, system_quantity, actual_quantity, reason, created_at, updated_at) FROM stdin;
1	1	2	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
2	1	3	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
3	1	4	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
4	1	5	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
5	1	6	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
6	1	7	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
7	1	8	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
8	1	9	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
9	1	10	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
10	1	11	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
11	1	12	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
12	1	13	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
13	1	14	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
14	1	15	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
15	1	16	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
16	1	17	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
17	1	18	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
18	1	19	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
19	1	20	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
20	1	21	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
21	1	23	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
22	1	24	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
23	1	25	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
24	1	26	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
25	1	27	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
26	1	28	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
27	1	29	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
28	1	30	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
29	1	31	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
30	1	32	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
31	1	33	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
32	1	34	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
33	1	35	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
34	1	36	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
35	1	37	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
36	1	38	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
37	1	548	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
38	1	22	1	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
39	1	39	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
40	1	40	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
41	1	42	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
42	1	43	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
43	1	44	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
44	1	45	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
45	1	46	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
46	1	47	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
47	1	48	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
48	1	49	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
49	1	50	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
50	1	51	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
51	1	52	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
52	1	53	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
53	1	54	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
54	1	55	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
55	1	56	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
56	1	57	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
57	1	58	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
58	1	59	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
59	1	60	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
60	1	61	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
61	1	62	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
62	1	63	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
63	1	64	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
64	1	65	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
65	1	66	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
66	1	67	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
67	1	68	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
68	1	69	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
69	1	70	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
70	1	71	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
71	1	72	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
72	1	73	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
73	1	74	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
74	1	75	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
75	1	76	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
76	1	77	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
77	1	78	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
78	1	79	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
79	1	80	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
80	1	81	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
81	1	82	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
82	1	83	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
83	1	84	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
84	1	85	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
85	1	86	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
86	1	87	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
87	1	88	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
88	1	89	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
89	1	90	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
90	1	91	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
91	1	92	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
92	1	93	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
93	1	94	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
94	1	95	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
95	1	96	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
96	1	97	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
97	1	98	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
98	1	99	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
99	1	100	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
100	1	101	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
101	1	102	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
102	1	103	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
103	1	104	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
104	1	105	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
105	1	106	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
106	1	107	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
107	1	108	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
108	1	109	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
109	1	110	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
110	1	112	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
111	1	113	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
112	1	114	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
113	1	115	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
114	1	116	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
115	1	117	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
116	1	118	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
117	1	119	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
118	1	120	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
119	1	121	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
120	1	668	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
121	1	122	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
122	1	123	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
123	1	124	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
124	1	125	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
125	1	126	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
126	1	127	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
127	1	128	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
128	1	129	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
129	1	130	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
130	1	131	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
131	1	132	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
132	1	133	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
133	1	134	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
134	1	135	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
135	1	136	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
136	1	549	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
137	1	550	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
138	1	551	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
139	1	552	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
140	1	553	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
141	1	554	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
142	1	555	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
143	1	556	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
144	1	557	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
145	1	558	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
146	1	559	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
147	1	560	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
148	1	561	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
149	1	562	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
150	1	563	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
151	1	564	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
152	1	566	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
153	1	567	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
154	1	568	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
155	1	569	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
156	1	570	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
157	1	571	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
158	1	572	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
159	1	573	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
160	1	574	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
161	1	575	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
162	1	576	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
163	1	577	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
164	1	578	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
165	1	579	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
166	1	580	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
167	1	581	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
168	1	582	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
169	1	583	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
170	1	584	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
171	1	585	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
172	1	586	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
173	1	587	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
174	1	588	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
175	1	589	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
176	1	590	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
177	1	591	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
178	1	592	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
179	1	593	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
180	1	594	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
181	1	595	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
182	1	596	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
183	1	597	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
184	1	598	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
185	1	599	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
186	1	600	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
187	1	601	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
188	1	602	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
189	1	603	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
190	1	604	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
191	1	605	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
192	1	606	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
193	1	607	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
194	1	608	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
195	1	609	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
196	1	611	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
197	1	612	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
198	1	613	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
199	1	614	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
200	1	615	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
201	1	616	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
202	1	617	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
203	1	618	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
204	1	619	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
205	1	620	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
206	1	621	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
207	1	622	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
208	1	623	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
209	1	624	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
210	1	625	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
211	1	626	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
212	1	627	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
213	1	628	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
214	1	629	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
215	1	630	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
216	1	631	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
217	1	632	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
218	1	633	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
219	1	634	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
220	1	635	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
221	1	720	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
222	1	636	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
223	1	637	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
224	1	638	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
225	1	639	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
226	1	640	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
227	1	641	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
228	1	642	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
229	1	643	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
230	1	644	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
231	1	645	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
232	1	646	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
233	1	647	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
234	1	648	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
235	1	649	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
236	1	650	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
237	1	651	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
238	1	652	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
239	1	653	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
240	1	654	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
241	1	655	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
242	1	656	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
243	1	657	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
244	1	658	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
245	1	659	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
246	1	660	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
247	1	661	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
248	1	662	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
249	1	663	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
250	1	664	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
251	1	665	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
252	1	248	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
253	1	249	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
254	1	250	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
255	1	251	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
256	1	252	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
257	1	253	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
258	1	254	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
259	1	255	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
260	1	256	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
261	1	257	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
262	1	258	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
263	1	259	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
264	1	260	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
265	1	261	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
266	1	262	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
267	1	263	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
268	1	264	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
269	1	666	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
270	1	667	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
271	1	265	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
272	1	266	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
273	1	267	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
274	1	268	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
275	1	269	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
276	1	270	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
277	1	271	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
278	1	272	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
279	1	273	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
280	1	274	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
281	1	275	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
282	1	276	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
283	1	277	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
284	1	278	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
285	1	280	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
286	1	281	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
287	1	282	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
288	1	283	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
289	1	284	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
290	1	285	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
291	1	286	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
292	1	287	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
293	1	288	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
294	1	289	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
295	1	290	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
296	1	291	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
297	1	292	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
298	1	293	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
299	1	294	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
300	1	295	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
301	1	296	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
302	1	297	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
303	1	298	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
304	1	299	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
305	1	300	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
306	1	301	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
307	1	302	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
308	1	303	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
309	1	305	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
310	1	306	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
311	1	307	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
312	1	308	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
313	1	309	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
314	1	310	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
315	1	311	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
316	1	312	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
317	1	313	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
318	1	314	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
319	1	315	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
320	1	316	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
321	1	317	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
322	1	318	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
323	1	319	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
324	1	320	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
325	1	321	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
326	1	322	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
327	1	323	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
328	1	324	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
329	1	325	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
330	1	326	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
331	1	327	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
332	1	328	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
333	1	329	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
334	1	330	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
335	1	331	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
336	1	332	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
337	1	333	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
338	1	334	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
339	1	335	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
340	1	336	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
341	1	337	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
342	1	338	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
343	1	339	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
344	1	340	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
345	1	341	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
346	1	342	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
347	1	343	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
348	1	344	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
349	1	345	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
350	1	346	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
351	1	347	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
352	1	348	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
353	1	349	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
354	1	350	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
355	1	351	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
356	1	352	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
357	1	353	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
358	1	354	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
359	1	355	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
360	1	356	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
361	1	357	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
362	1	358	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
363	1	359	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
364	1	360	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
365	1	361	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
366	1	362	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
367	1	363	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
368	1	364	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
369	1	365	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
370	1	366	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
371	1	367	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
372	1	368	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
373	1	369	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
374	1	370	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
375	1	371	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
376	1	372	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
377	1	514	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
378	1	515	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
379	1	516	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
380	1	517	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
381	1	518	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
382	1	519	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
383	1	520	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
384	1	521	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
385	1	522	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
386	1	523	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
387	1	524	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
388	1	525	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
389	1	526	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
390	1	528	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
391	1	529	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
392	1	530	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
393	1	531	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
394	1	532	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
395	1	533	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
396	1	534	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
397	1	536	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
398	1	537	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
399	1	538	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
400	1	539	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
401	1	540	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
402	1	541	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
403	1	542	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
404	1	543	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
405	1	544	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
406	1	545	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
407	1	546	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
408	1	547	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
409	1	535	3	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
410	1	669	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
411	1	670	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
412	1	671	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
413	1	672	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
414	1	673	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
415	1	674	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
416	1	675	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
417	1	676	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
418	1	677	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
419	1	678	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
420	1	679	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
421	1	680	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
422	1	681	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
423	1	682	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
424	1	683	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
425	1	684	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
426	1	685	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
427	1	686	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
428	1	687	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
429	1	688	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
430	1	689	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
431	1	690	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
432	1	691	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
433	1	692	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
434	1	694	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
435	1	695	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
436	1	696	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
437	1	697	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
438	1	698	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
439	1	699	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
440	1	700	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
441	1	701	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
442	1	702	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
443	1	703	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
444	1	704	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
445	1	705	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
446	1	706	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
447	1	707	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
448	1	708	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
449	1	709	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
450	1	710	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
451	1	711	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
452	1	712	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
453	1	713	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
454	1	714	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
455	1	715	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
456	1	716	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
457	1	717	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
458	1	718	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
459	1	719	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
460	1	721	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
461	1	722	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
462	1	723	0	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
463	1	1	3123	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
464	1	527	24	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
465	1	565	2	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
466	1	610	433	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
467	1	693	1	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
468	1	279	4	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
469	1	111	5	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
470	1	304	5	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
471	1	41	11	\N	\N	2026-04-09 20:16:38.904232	2026-04-09 20:16:38.904232
472	2	88	0	\N	\N	2026-04-09 20:23:04.596598	2026-04-09 20:23:04.596598
473	3	668	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
474	3	664	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
475	3	665	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
476	3	666	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
477	3	667	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
478	3	669	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
479	3	670	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
480	3	671	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
481	3	672	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
482	3	673	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
483	3	684	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
484	3	685	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
485	3	686	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
486	3	687	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
487	3	688	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
488	3	689	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
489	3	690	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
490	3	691	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
491	3	692	0	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
492	3	693	1	\N	\N	2026-04-09 20:34:52.510668	2026-04-09 20:34:52.510668
1466	16	674	0	\N	\N	2026-04-11 01:00:09.536535	2026-04-11 01:00:09.536535
1467	16	675	0	\N	\N	2026-04-11 01:00:09.536535	2026-04-11 01:00:09.536535
1468	16	676	0	\N	\N	2026-04-11 01:00:09.536535	2026-04-11 01:00:09.536535
1469	16	677	0	\N	\N	2026-04-11 01:00:09.536535	2026-04-11 01:00:09.536535
1470	16	678	0	\N	\N	2026-04-11 01:00:09.536535	2026-04-11 01:00:09.536535
1471	16	679	0	\N	\N	2026-04-11 01:00:09.536535	2026-04-11 01:00:09.536535
1472	16	680	0	\N	\N	2026-04-11 01:00:09.536535	2026-04-11 01:00:09.536535
1473	16	681	0	\N	\N	2026-04-11 01:00:09.536535	2026-04-11 01:00:09.536535
1474	16	682	0	\N	\N	2026-04-11 01:00:09.536535	2026-04-11 01:00:09.536535
1475	16	683	0	\N	\N	2026-04-11 01:00:09.536535	2026-04-11 01:00:09.536535
503	5	2	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
504	5	3	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
505	5	4	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
506	5	5	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
507	5	6	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
508	5	7	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
509	5	8	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
510	5	9	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
511	5	10	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
512	5	11	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
513	5	12	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
514	5	13	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
515	5	14	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
516	5	15	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
517	5	16	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
518	5	17	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
519	5	18	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
520	5	19	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
521	5	20	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
522	5	21	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
523	5	23	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
524	5	24	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
525	5	25	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
526	5	26	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
527	5	27	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
528	5	28	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
529	5	29	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
530	5	30	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
531	5	31	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
532	5	32	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
533	5	33	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
534	5	34	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
535	5	35	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
536	5	36	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
537	5	37	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
538	5	38	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
539	5	548	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
540	5	22	1	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
541	5	39	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
542	5	40	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
543	5	42	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
544	5	43	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
545	5	44	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
546	5	45	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
547	5	46	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
548	5	47	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
549	5	48	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
550	5	49	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
551	5	50	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
552	5	51	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
553	5	52	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
554	5	53	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
555	5	54	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
556	5	55	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
557	5	56	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
558	5	57	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
559	5	58	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
560	5	59	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
561	5	60	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
562	5	61	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
563	5	62	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
564	5	63	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
565	5	64	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
566	5	65	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
567	5	66	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
568	5	67	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
569	5	68	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
570	5	69	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
571	5	70	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
572	5	71	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
573	5	72	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
574	5	73	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
575	5	74	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
576	5	75	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
577	5	76	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
578	5	77	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
579	5	78	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
580	5	79	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
581	5	80	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
582	5	81	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
583	5	82	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
584	5	83	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
585	5	84	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
586	5	85	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
587	5	86	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
588	5	87	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
589	5	88	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
590	5	89	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
591	5	90	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
592	5	91	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
593	5	92	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
594	5	93	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
595	5	94	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
596	5	95	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
597	5	96	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
598	5	97	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
599	5	98	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
600	5	99	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
601	5	100	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
602	5	101	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
603	5	102	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
604	5	103	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
605	5	104	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
606	5	105	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
607	5	106	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
608	5	107	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
609	5	108	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
610	5	109	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
611	5	110	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
612	5	112	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
613	5	113	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
614	5	114	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
615	5	115	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
616	5	116	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
617	5	117	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
618	5	118	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
619	5	119	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
620	5	120	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
621	5	121	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
622	5	668	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
623	5	122	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
624	5	123	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
625	5	124	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
626	5	125	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
627	5	126	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
628	5	127	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
629	5	128	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
630	5	129	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
631	5	130	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
632	5	131	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
633	5	132	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
634	5	133	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
635	5	134	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
636	5	135	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
637	5	136	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
638	5	549	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
639	5	550	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
640	5	551	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
641	5	552	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
642	5	553	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
643	5	554	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
644	5	555	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
645	5	556	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
646	5	557	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
647	5	558	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
648	5	559	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
649	5	560	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
650	5	561	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
651	5	562	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
652	5	563	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
653	5	564	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
654	5	566	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
655	5	567	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
656	5	568	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
657	5	569	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
658	5	570	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
659	5	571	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
660	5	572	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
661	5	573	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
662	5	574	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
663	5	575	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
664	5	576	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
665	5	577	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
666	5	578	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
667	5	579	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
668	5	580	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
669	5	581	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
670	5	582	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
671	5	583	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
672	5	584	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
673	5	585	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
674	5	586	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
675	5	587	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
676	5	588	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
677	5	589	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
678	5	590	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
679	5	591	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
680	5	592	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
681	5	593	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
682	5	594	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
683	5	595	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
684	5	596	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
685	5	597	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
686	5	598	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
687	5	599	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
688	5	600	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
689	5	601	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
690	5	602	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
691	5	603	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
692	5	604	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
693	5	605	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
694	5	606	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
695	5	607	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
696	5	608	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
697	5	609	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
698	5	611	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
699	5	612	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
700	5	613	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
701	5	614	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
702	5	615	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
703	5	616	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
704	5	617	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
705	5	618	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
706	5	619	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
707	5	620	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
708	5	621	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
709	5	622	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
710	5	623	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
711	5	624	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
712	5	625	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
713	5	626	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
714	5	627	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
715	5	628	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
716	5	629	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
717	5	630	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
718	5	631	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
719	5	632	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
720	5	633	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
721	5	634	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
722	5	635	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
723	5	720	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
724	5	636	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
725	5	637	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
726	5	638	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
727	5	639	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
728	5	640	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
729	5	641	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
730	5	642	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
731	5	643	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
732	5	644	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
733	5	645	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
734	5	646	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
735	5	647	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
736	5	648	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
737	5	649	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
738	5	650	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
739	5	651	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
740	5	652	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
741	5	653	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
742	5	654	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
743	5	655	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
744	5	656	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
745	5	657	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
746	5	658	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
747	5	659	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
748	5	660	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
749	5	661	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
750	5	662	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
751	5	663	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
752	5	664	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
753	5	665	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
754	5	248	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
755	5	249	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
756	5	250	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
757	5	251	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
758	5	252	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
759	5	253	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
760	5	254	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
761	5	255	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
762	5	256	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
763	5	257	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
764	5	258	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
765	5	259	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
766	5	260	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
767	5	261	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
768	5	262	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
769	5	263	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
770	5	264	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
771	5	666	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
772	5	667	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
773	5	265	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
774	5	266	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
775	5	267	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
776	5	268	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
777	5	269	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
778	5	270	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
779	5	271	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
780	5	272	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
781	5	273	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
782	5	274	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
783	5	275	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
784	5	276	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
785	5	277	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
786	5	278	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
787	5	280	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
788	5	281	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
789	5	282	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
790	5	283	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
791	5	284	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
792	5	285	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
793	5	286	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
794	5	287	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
795	5	288	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
796	5	289	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
797	5	290	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
798	5	291	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
799	5	292	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
800	5	293	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
801	5	294	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
802	5	295	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
803	5	296	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
804	5	297	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
805	5	298	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
806	5	299	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
807	5	300	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
808	5	301	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
809	5	302	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
810	5	303	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
811	5	305	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
812	5	306	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
813	5	307	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
814	5	308	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
815	5	309	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
816	5	310	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
817	5	311	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
818	5	312	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
819	5	313	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
820	5	314	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
821	5	315	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
822	5	316	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
823	5	317	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
824	5	318	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
825	5	319	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
826	5	320	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
827	5	321	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
828	5	322	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
829	5	323	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
830	5	324	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
831	5	325	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
832	5	326	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
833	5	327	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
834	5	328	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
835	5	329	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
836	5	330	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
837	5	331	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
838	5	332	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
839	5	333	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
840	5	334	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
841	5	335	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
842	5	336	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
843	5	337	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
844	5	338	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
845	5	339	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
846	5	340	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
847	5	341	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
848	5	342	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
849	5	343	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
850	5	344	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
851	5	345	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
852	5	346	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
853	5	347	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
854	5	348	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
855	5	349	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
856	5	350	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
857	5	351	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
858	5	352	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
859	5	353	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
860	5	354	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
861	5	355	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
862	5	356	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
863	5	357	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
864	5	358	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
865	5	359	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
866	5	360	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
867	5	361	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
868	5	362	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
869	5	363	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
870	5	364	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
871	5	365	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
872	5	366	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
873	5	367	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
874	5	368	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
875	5	369	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
876	5	370	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
877	5	371	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
878	5	372	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
879	5	514	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
880	5	515	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
881	5	516	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
882	5	517	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
883	5	518	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
884	5	519	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
885	5	520	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
886	5	521	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
887	5	522	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
888	5	523	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
889	5	524	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
890	5	525	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
891	5	526	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
892	5	528	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
893	5	529	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
894	5	530	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
895	5	531	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
896	5	532	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
897	5	533	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
898	5	534	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
899	5	536	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
900	5	537	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
901	5	538	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
902	5	539	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
903	5	540	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
904	5	541	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
905	5	542	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
906	5	543	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
907	5	544	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
908	5	545	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
909	5	546	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
910	5	547	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
911	5	535	3	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
912	5	669	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
913	5	670	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
914	5	671	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
915	5	672	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
916	5	673	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
917	5	674	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
918	5	675	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
919	5	676	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
920	5	677	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
921	5	678	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
922	5	679	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
923	5	680	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
924	5	681	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
925	5	682	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
926	5	683	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
927	5	684	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
928	5	685	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
929	5	686	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
930	5	687	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
931	5	688	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
932	5	689	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
933	5	690	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
934	5	691	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
935	5	692	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
936	5	694	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
937	5	695	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
938	5	696	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
939	5	697	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
940	5	698	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
941	5	699	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
942	5	700	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
943	5	701	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
944	5	702	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
945	5	703	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
946	5	704	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
947	5	705	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
948	5	706	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
949	5	707	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
950	5	708	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
951	5	709	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
952	5	710	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
953	5	711	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
954	5	712	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
955	5	713	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
956	5	714	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
957	5	715	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
958	5	716	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
959	5	717	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
960	5	718	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
961	5	719	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
962	5	721	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
963	5	722	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
964	5	723	0	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
965	5	1	3123	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
966	5	527	24	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
967	5	565	2	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
968	5	610	433	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
969	5	693	1	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
970	5	279	4	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
971	5	111	5	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
972	5	304	5	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
973	5	41	11	\N	\N	2026-04-09 20:48:17.853021	2026-04-09 20:48:17.853021
1476	17	590	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1477	17	591	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
974	6	610	433	10	да хз	2026-04-09 20:55:00.054518	2026-04-09 20:56:13.542043
1478	17	592	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1479	17	593	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1480	17	594	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1481	17	595	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1482	17	596	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1483	17	597	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1484	17	598	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1485	17	599	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1486	17	361	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1487	17	362	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1488	17	363	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1489	17	364	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
977	7	111	5	5	\N	2026-04-09 21:15:15.220058	2026-04-09 21:16:50.824908
975	7	304	5	5	\N	2026-04-09 21:15:15.220058	2026-04-09 21:16:50.828742
976	7	527	24	24	\N	2026-04-09 21:15:15.220058	2026-04-09 21:16:50.829766
1490	17	365	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1491	17	366	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
978	8	304	5	5	\N	2026-04-09 21:19:17.458365	2026-04-09 21:19:41.128837
979	8	527	24	24	\N	2026-04-09 21:19:17.458365	2026-04-09 21:19:41.138927
1492	17	367	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1493	17	368	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
981	10	565	2	2	\N	2026-04-09 21:29:56.784821	2026-04-09 21:30:35.651021
982	11	668	0	\N	\N	2026-04-09 21:34:12.018639	2026-04-09 21:34:12.018639
983	11	664	0	\N	\N	2026-04-09 21:34:12.018639	2026-04-09 21:34:12.018639
984	11	665	0	\N	\N	2026-04-09 21:34:12.018639	2026-04-09 21:34:12.018639
985	11	666	0	\N	\N	2026-04-09 21:34:12.018639	2026-04-09 21:34:12.018639
986	11	667	0	\N	\N	2026-04-09 21:34:12.018639	2026-04-09 21:34:12.018639
987	11	669	0	\N	\N	2026-04-09 21:34:12.018639	2026-04-09 21:34:12.018639
988	11	670	0	\N	\N	2026-04-09 21:34:12.018639	2026-04-09 21:34:12.018639
989	11	671	0	\N	\N	2026-04-09 21:34:12.018639	2026-04-09 21:34:12.018639
990	11	672	0	\N	\N	2026-04-09 21:34:12.018639	2026-04-09 21:34:12.018639
991	11	673	0	\N	\N	2026-04-09 21:34:12.018639	2026-04-09 21:34:12.018639
992	12	304	5	\N	\N	2026-04-10 02:07:51.276498	2026-04-10 02:07:51.276498
994	14	279	4	4	\N	2026-04-10 02:12:41.672218	2026-04-10 15:35:03.615395
995	15	2	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
996	15	3	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
997	15	4	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
998	15	5	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
999	15	6	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1000	15	7	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1001	15	8	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1002	15	9	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1003	15	10	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1004	15	11	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1005	15	12	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1006	15	13	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1007	15	14	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1008	15	15	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1009	15	16	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1010	15	17	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1011	15	18	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1012	15	19	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1013	15	20	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1014	15	21	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1015	15	23	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1016	15	24	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1017	15	25	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1018	15	26	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1019	15	27	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1020	15	28	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1021	15	29	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1022	15	30	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1023	15	31	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1024	15	32	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1025	15	33	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1026	15	34	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1027	15	35	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1028	15	36	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1029	15	37	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1030	15	38	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1031	15	548	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1032	15	22	1	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1033	15	39	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1034	15	40	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1035	15	42	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1036	15	43	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1037	15	44	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1038	15	45	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1039	15	46	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1040	15	47	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1041	15	48	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1042	15	49	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1043	15	50	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1044	15	51	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1045	15	52	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1046	15	53	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1047	15	54	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1048	15	55	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1049	15	56	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1050	15	57	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1051	15	58	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1052	15	59	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1494	17	369	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1495	17	370	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1496	17	371	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1497	17	372	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1498	17	536	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1499	17	537	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1500	17	538	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1501	17	539	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1502	17	540	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1053	15	60	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1054	15	61	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1055	15	62	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1056	15	63	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1057	15	64	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1058	15	65	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1059	15	66	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1060	15	67	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1061	15	68	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1062	15	69	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1063	15	70	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1064	15	71	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1065	15	72	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1066	15	73	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1067	15	74	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1068	15	75	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1069	15	76	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1070	15	77	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1071	15	78	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1072	15	79	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1073	15	80	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1074	15	81	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1075	15	82	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1076	15	83	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1077	15	84	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1078	15	85	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1079	15	86	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1080	15	87	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1081	15	88	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1082	15	89	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1083	15	90	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1084	15	91	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1085	15	92	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1086	15	93	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1087	15	94	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1088	15	95	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1089	15	96	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1090	15	97	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1091	15	98	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1092	15	99	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1093	15	100	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1094	15	101	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1095	15	102	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1096	15	103	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1097	15	104	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1098	15	105	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1099	15	106	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1100	15	107	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1101	15	108	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1102	15	109	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1103	15	110	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1104	15	112	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1105	15	113	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1106	15	114	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1107	15	115	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1108	15	116	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1109	15	117	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1110	15	118	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1111	15	119	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1112	15	120	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1113	15	121	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1114	15	668	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1115	15	122	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1116	15	123	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1117	15	124	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1118	15	125	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1119	15	126	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1120	15	127	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1121	15	128	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1122	15	129	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1123	15	130	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1124	15	131	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1125	15	132	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1126	15	133	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1127	15	134	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1128	15	135	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1129	15	136	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1130	15	549	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1131	15	550	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1132	15	551	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1133	15	552	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1134	15	553	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1135	15	554	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1136	15	555	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1137	15	556	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1138	15	557	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1139	15	558	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1140	15	559	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1141	15	560	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1142	15	561	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1143	15	562	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1144	15	563	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1145	15	564	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1146	15	566	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1147	15	567	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1148	15	568	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1149	15	569	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1150	15	570	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1151	15	571	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1152	15	572	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1153	15	573	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1154	15	574	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1155	15	575	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1156	15	576	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1157	15	577	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1158	15	578	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1159	15	579	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1160	15	580	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1161	15	581	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1162	15	582	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1163	15	583	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1164	15	584	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1165	15	585	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1166	15	586	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1167	15	587	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1168	15	588	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1169	15	589	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1170	15	590	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1171	15	591	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1172	15	592	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1173	15	593	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1174	15	594	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1175	15	595	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1176	15	596	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1177	15	597	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1178	15	598	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1179	15	599	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1180	15	600	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1181	15	601	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1182	15	602	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1183	15	603	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1184	15	604	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1185	15	605	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1186	15	606	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1187	15	607	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1188	15	608	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1189	15	609	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1190	15	611	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1191	15	612	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1192	15	613	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1193	15	614	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1194	15	615	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1195	15	616	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1196	15	617	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1197	15	618	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1198	15	619	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1199	15	620	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1200	15	621	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1201	15	622	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1202	15	623	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1203	15	624	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1204	15	625	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1205	15	626	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1206	15	627	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1207	15	628	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1208	15	629	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1209	15	630	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1210	15	631	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1211	15	632	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1212	15	633	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1213	15	634	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1214	15	635	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1215	15	720	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1216	15	636	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1217	15	637	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1218	15	638	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1219	15	639	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1220	15	640	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1221	15	641	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1222	15	642	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1223	15	643	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1224	15	644	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1225	15	645	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1226	15	646	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1227	15	647	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1228	15	648	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1229	15	649	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1230	15	650	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1231	15	651	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1232	15	652	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1233	15	653	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1234	15	654	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1235	15	655	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1236	15	656	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1237	15	657	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1238	15	658	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1239	15	659	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1240	15	660	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1241	15	661	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1242	15	662	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1243	15	663	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1244	15	664	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1245	15	665	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1246	15	248	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1247	15	249	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1248	15	250	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1249	15	251	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1250	15	252	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1251	15	253	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1252	15	254	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1253	15	255	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1254	15	256	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1255	15	257	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1256	15	258	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1257	15	259	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1258	15	260	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1259	15	261	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1260	15	262	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1261	15	263	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1262	15	264	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1263	15	666	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1264	15	667	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1265	15	265	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1266	15	266	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1267	15	267	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1268	15	268	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1269	15	269	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1270	15	270	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1271	15	271	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1272	15	272	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1273	15	273	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1274	15	274	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1275	15	275	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1276	15	276	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1277	15	277	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1278	15	278	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1279	15	280	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1280	15	281	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1281	15	282	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1282	15	283	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1283	15	284	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1284	15	285	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1285	15	286	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1286	15	287	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1287	15	288	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1288	15	289	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1289	15	290	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1290	15	291	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1291	15	292	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1292	15	293	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1293	15	294	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1294	15	295	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1295	15	296	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1296	15	297	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1297	15	298	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1298	15	299	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1299	15	300	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1300	15	301	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1301	15	302	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1302	15	303	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1303	15	305	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1304	15	306	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1305	15	307	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1306	15	308	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1307	15	309	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1308	15	310	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1309	15	311	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1310	15	312	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1311	15	313	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1312	15	314	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1313	15	315	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1314	15	316	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1315	15	317	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1316	15	318	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1317	15	319	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1318	15	320	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1319	15	321	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1320	15	322	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1321	15	323	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1322	15	324	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1323	15	325	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1324	15	326	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1325	15	327	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1326	15	328	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1327	15	329	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1328	15	330	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1329	15	331	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1330	15	332	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1331	15	333	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1332	15	334	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1333	15	335	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1334	15	336	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1335	15	337	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1336	15	338	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1337	15	339	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1338	15	340	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1339	15	341	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1340	15	342	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1341	15	343	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1342	15	344	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1343	15	345	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1344	15	346	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1345	15	347	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1346	15	348	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1347	15	349	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1348	15	350	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1349	15	351	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1350	15	352	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1351	15	353	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1352	15	354	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1353	15	355	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1354	15	356	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1355	15	357	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1356	15	358	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1357	15	359	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1358	15	360	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1359	15	361	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1360	15	362	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1361	15	363	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1362	15	364	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1363	15	365	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1364	15	366	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1365	15	367	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1366	15	368	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1367	15	369	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1368	15	370	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1369	15	371	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1370	15	372	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1371	15	514	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1372	15	515	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1373	15	516	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1374	15	517	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1375	15	518	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1376	15	519	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1377	15	520	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1378	15	521	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1379	15	522	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1380	15	523	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1381	15	524	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1382	15	525	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1383	15	526	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1384	15	528	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1385	15	529	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1386	15	530	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1387	15	531	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1388	15	532	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1389	15	533	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1390	15	534	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1391	15	536	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1392	15	537	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1393	15	538	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1394	15	539	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1395	15	540	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1396	15	541	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1397	15	542	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1398	15	543	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1399	15	544	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1400	15	545	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1401	15	546	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1402	15	547	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1403	15	535	3	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1404	15	669	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1405	15	670	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1406	15	671	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1407	15	672	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1408	15	673	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1409	15	674	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1410	15	675	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1411	15	676	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1412	15	677	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1413	15	678	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1414	15	679	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1415	15	680	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1416	15	681	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1417	15	682	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1418	15	683	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1419	15	684	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1420	15	685	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1421	15	686	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1422	15	687	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1423	15	688	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1424	15	689	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1425	15	690	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1426	15	691	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1427	15	692	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1428	15	694	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1429	15	695	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1430	15	696	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1431	15	697	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1432	15	698	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1433	15	699	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1434	15	700	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1435	15	701	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1436	15	702	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1437	15	703	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1438	15	704	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1439	15	705	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1440	15	706	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1441	15	707	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1442	15	708	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1443	15	709	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1444	15	710	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1445	15	711	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1446	15	712	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1447	15	713	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1448	15	714	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1449	15	715	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1450	15	716	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1451	15	717	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1452	15	718	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1453	15	719	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1454	15	721	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1455	15	722	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1456	15	723	0	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1457	15	1	3123	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1458	15	610	10	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1459	15	527	24	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1460	15	565	2	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1461	15	693	1	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1462	15	279	4	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1463	15	111	5	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1464	15	304	5	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1465	15	41	11	\N	\N	2026-04-10 15:50:05.840951	2026-04-10 15:50:05.840951
1503	17	541	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1504	17	542	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1505	17	543	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1506	17	544	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1507	17	545	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1508	17	674	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1509	17	675	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1510	17	676	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1511	17	677	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1512	17	678	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1513	17	679	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1514	17	680	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1515	17	681	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1516	17	682	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
1517	17	683	0	\N	\N	2026-04-11 01:02:21.514085	2026-04-11 01:02:21.514085
993	13	41	11	11	\N	2026-04-10 02:10:52.0208	2026-04-11 01:14:17.528113
1519	18	304	5	5	\N	2026-04-11 01:16:38.818418	2026-04-11 01:16:59.980582
1520	18	527	24	25	\N	2026-04-11 01:16:38.818418	2026-04-11 01:16:59.982514
1518	18	535	3	6	\N	2026-04-11 01:16:38.818418	2026-04-11 01:16:59.982895
\.


--
-- Data for Name: material_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_requests (id, request_type, status, created_by, reviewed_by, notes, rejection_reason, created_at, reviewed_at, is_public, title) FROM stdin;
19	incoming	approved	135	24	пщвапзщыхд	\N	2026-04-07 13:59:07.232935	2026-04-07 14:00:05.673587	t	ъуъ
20	incoming	rejected	24	24	\N	р	2026-04-07 14:01:44.532768	2026-04-07 14:02:05.682197	t	гмгм
21	incoming	pending	24	\N	\N	\N	2026-04-07 14:12:45.842801	\N	t	аыв
22	incoming	pending	24	\N	\N	\N	2026-04-07 14:15:25.629347	\N	t	Большая заявка
23	incoming	approved	24	24	\N	\N	2026-04-07 14:17:05.492753	2026-04-07 14:17:05.492	t	аыва
25	outgoing	approved	24	24	\N	\N	2026-04-08 11:37:24.27497	2026-04-08 11:37:24.274	t	ewqeqw
26	incoming	approved	24	24	\N	\N	2026-04-08 14:51:34.724658	2026-04-08 14:52:19.773921	t	Gg
27	incoming	approved	24	24	\N	\N	2026-04-08 15:19:20.313927	2026-04-08 16:01:59.108846	t	1234t
24	incoming	approved	24	24	\N	\N	2026-04-07 14:27:38.004811	2026-04-08 16:03:32.965035	f	5345
33	outgoing	rejected	24	24	\N	аыва	2026-04-08 15:56:52.485768	2026-04-08 15:57:40.779032	t	мсмсмвмва пвап цавпв ап
32	incoming	approved	24	24	Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum nisi suscipit ex repellat similique cupiditate voluptas, iure, minima ullam eveniet ipsa mollitia. Distinctio, debitis sed! Velit culpa deleniti consectetur ab!\n                        Doloribus aliquid quaerat atque, ab quos perferendis provident animi fugit quasi mollitia voluptatibus libero cumque, beatae obcaecati dolores ea sunt dolorem error voluptatum laboriosam magnam temporibus porro. Deserunt, quod tenetur?\n                        Alias corrupti deserunt velit repudiandae cum totam ipsam a neque officiis odit blanditiis pariatur consequuntur qui doloremque, molestias repellendus fugiat eum optio illo fuga tempora. Voluptas fugiat ut magni reiciendis.\n                        Error, harum! Labore deleniti ipsa quod enim nisi quia beatae iste illum autem provident neque, delectus aut, recusandae quasi. Enim commodi fugiat reiciendis sint asperiores. Nobis incidunt repellendus nihil quisquam?\n                        Odio sint praesentium at dolores illum sapiente consequatur eligendi, repellendus molestias error in unde iste temporibus labore assumenda quisquam alias atque porro ipsam quae similique esse vero necessitatibus magnam. Magni.	\N	2026-04-08 15:31:18.053684	2026-04-08 16:01:07.374991	f	ЗАЯВКА
34	incoming	pending	24	\N	\N	\N	2026-04-08 16:16:46.232327	\N	t	йкуцк
\.


--
-- Data for Name: material_requests_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_requests_items (id, request_id, material_id, quantity, current_quantity_at_request, created_at) FROM stdin;
19	19	535	1	1	2026-04-07 13:59:07.232935
20	20	279	1	2	2026-04-07 14:01:44.532768
21	21	41	1	9	2026-04-07 14:12:45.842801
22	22	41	1	9	2026-04-07 14:15:25.629347
23	22	279	1	2	2026-04-07 14:15:25.629347
24	22	111	1	3	2026-04-07 14:15:25.629347
25	22	304	1	3	2026-04-07 14:15:25.629347
26	22	527	1	2	2026-04-07 14:15:25.629347
27	22	535	1	2	2026-04-07 14:15:25.629347
28	22	565	1	1	2026-04-07 14:15:25.629347
29	22	610	1	1	2026-04-07 14:15:25.629347
30	22	22	1	0	2026-04-07 14:15:25.629347
31	22	693	1	0	2026-04-07 14:15:25.629347
32	23	279	1	2	2026-04-07 14:17:05.492753
33	23	41	1	9	2026-04-07 14:17:05.492753
34	23	111	1	3	2026-04-07 14:17:05.492753
35	23	304	1	3	2026-04-07 14:17:05.492753
36	23	527	1	2	2026-04-07 14:17:05.492753
37	23	535	1	2	2026-04-07 14:17:05.492753
38	24	41	1	10	2026-04-07 14:27:38.004811
39	25	41	8	10	2026-04-08 11:37:24.27497
40	26	41	40	2	2026-04-08 14:51:34.724658
41	27	693	1	0	2026-04-08 15:19:20.313927
42	27	279	1	3	2026-04-08 15:19:20.313927
43	27	111	1	4	2026-04-08 15:19:20.313927
44	27	304	1	4	2026-04-08 15:19:20.313927
57	32	279	1	3	2026-04-08 15:31:18.053684
58	32	111	133	4	2026-04-08 15:31:18.053684
59	32	304	24	4	2026-04-08 15:31:18.053684
60	32	527	21	3	2026-04-08 15:31:18.053684
61	32	41	1	42	2026-04-08 15:31:18.053684
62	32	693	1	0	2026-04-08 15:31:18.053684
63	32	565	1	1	2026-04-08 15:31:18.053684
64	32	610	432	1	2026-04-08 15:31:18.053684
65	32	22	1	0	2026-04-08 15:31:18.053684
66	33	41	1	42	2026-04-08 15:56:52.485768
67	34	111	1	5	2026-04-08 16:16:46.232327
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
2	1	Шпаклевка финишная Weber Vetonit LR+ 25 кг	SSS002	Финишная шпаклевка для внутренних работ	мешок	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
3	1	Клей для плитки Ceresit CM11 25 кг	SSS003	Цементный клей для керамической плитки	мешок	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
4	1	Наливной пол Bergauf Boden Zement 25 кг	SSS004	Быстротвердеющая самовыравнивающаяся смесь	мешок	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
5	1	Штукатурка цементная Основит Стартвэлл 25 кг	SSS005	Цементная штукатурка для фасадных работ	мешок	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
6	1	Ремонтная смесь Mapei Planitop Fast 25 кг	SSS006	Быстротвердеющая ремонтная смесь для бетона	мешок	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
7	1	Клей для газобетона Bonolit 25 кг	SSS007	Тонкослойный клей для кладки газобетонных блоков	мешок	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
8	1	Затирка для швов Litokol Starlike 5 кг	SSS008	Эпоксидная затирка для плиточных швов	кг	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
9	1	Клей для обоев Quelyd 250 г	SSS009	Сухой клей для всех типов обоев	шт	0	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
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
22	2	Армопояс U-блок 500x400x250 мм	KBP012	U-образный блок для устройства армопояса	шт	1	24	24	2026-01-14 16:50:15.921766	2026-04-08 16:01:07.374991
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
248	11	Дрель-шуруповерт аккумуляторная 18В	EIO001	Беспроводная дрель с 2 аккумуляторами	шт	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
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
361	20	Гипсокартон 12,5 мм 1200х2500 мм	GK001	Стандартный лист ГКЛ	лист	0	24	24	2026-01-14 16:56:20.499819	2026-01-14 16:56:20.499819
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
1	1	Штукатурка гипсовая Knauf Ротбанд 30 кг	SSS001	Гипсовая штукатурка для ручного нанесения	мешок	3123	24	24	2026-01-14 16:50:15.921766	2026-01-14 16:50:15.921766
610	29	Аптечка первой помощи	PPE011	Комплект медикаментов	набор	10	24	24	2026-01-14 17:01:25.806664	2026-04-09 21:07:04.982413
527	22	Антисептик для древесины	CS002	Защита от грибка и плесени	л	25	24	24	2026-01-14 17:01:25.806664	2026-04-11 01:38:46.786348
565	25	Антресоль настенная	ST008	Верхняя полка для хранения	шт	2	24	24	2026-01-14 17:01:25.806664	2026-04-08 16:01:07.374991
693	37	Ароматизатор для сауны	SE010	Эфирные масла	набор	1	24	24	2026-01-14 17:01:25.806664	2026-04-08 16:01:59.108846
279	13	OSB-3 2500х1250х9 мм	PD005	Ориентированно-стружечная плита	лист	4	24	24	2026-01-14 16:56:20.499819	2026-04-08 16:01:59.108846
111	9	Автомат 16А однополюсный	ET005	Автоматический выключатель	шт	5	24	24	2026-01-14 16:50:15.921766	2026-04-08 16:01:59.108846
304	15	Анкер химический 10х100 мм	2KM003	Двухкомпонентная химическая анкеровка	шт	5	24	24	2026-01-14 16:56:20.499819	2026-04-08 16:01:59.108846
41	4	3D панель гипсовая Волна 60х60 см	OM004	Объемная декоративная панель	шт	11	24	24	2026-01-14 16:50:15.921766	2026-04-08 16:03:32.965035
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
135	$2b$10$ydeDhBpKguzPb5GpPAoG/OHhwlT4gdVwMgGwycUEfb6JJ6l13y7Ue	accountant	Юля	юля	2026-04-07 13:58:25.278585			2004-09-09	2026-04-07 14:38:17.973	51
136	$2b$10$fL5nGeLo3YWWkqyaR01fDu5Ka5Q1KHMyhIW9yl7pM6ffnzc0609iy	accountant	Бухгалтер	Бухгалтер	2026-04-09 01:54:51.300406			\N	2026-04-09 01:54:51.300406	Бухгалтер
137	$2b$10$vyTvtAsY2GMBMd8wtCTU4OqCKsMZnGym5t2Ke0q.wXkgoHAIk5zBC	storekeeper	Кладовщик	Кладовщик	2026-04-09 01:55:18.250901			\N	2026-04-09 01:55:18.250901	Кладовщик
138	$2b$10$njvPS8rF67uyTnwUJtlzH./b4V5ja5wkDj6MAmTp9e/uoHnKyH4w.	storekeeper	store	store	2026-04-11 00:59:07.910902			\N	2026-04-11 00:59:07.910902	kladovshik
\.


--
-- Name: backups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.backups_id_seq', 2, true);


--
-- Name: inventories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventories_id_seq', 18, true);


--
-- Name: inventory_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_categories_id_seq', 9, true);


--
-- Name: inventory_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_materials_id_seq', 15, true);


--
-- Name: inventory_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_results_id_seq', 1520, true);


--
-- Name: material_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.material_requests_id_seq', 34, true);


--
-- Name: material_requests_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.material_requests_items_id_seq', 67, true);


--
-- Name: materialcategories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materialcategories_id_seq', 40, true);


--
-- Name: materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materials_id_seq', 723, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 582, true);


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
-- Name: backups backups_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backups
    ADD CONSTRAINT backups_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


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
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict JJlpeK2xFGmVN5o0YzFonsIvf09XEjXNw9oiQfHEJiAEZcDYaG6w8b0OFtgHF54

