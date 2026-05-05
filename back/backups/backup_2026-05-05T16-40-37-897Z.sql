--
-- PostgreSQL database dump
--

\restrict naBRWAtC0zYmKomdAMe5GIxKcBvJc1h8qYyGIBTwFepkO1B0nscKNfGeMqCDi2W

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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
1	backup_2026-04-27T00-55-30-964Z.sql	C:\\Users\\d_sil\\Desktop\\dip30.12\\back\\backups\\backup_2026-04-27T00-55-30-964Z.sql	49835	25	2026-04-27 03:55:31.243128	ww
2	backup_2026-04-27T00-56-48-777Z.sql	C:\\Users\\d_sil\\Desktop\\dip30.12\\back\\backups\\backup_2026-04-27T00-56-48-777Z.sql	50157	25	2026-04-27 03:56:49.042976	fsdf
3	backup_2026-04-27T01-00-07-493Z.sql	C:\\Users\\d_sil\\Desktop\\dip30.12\\back\\backups\\backup_2026-04-27T01-00-07-493Z.sql	50482	25	2026-04-27 04:00:07.621366	рпие отм
4	backup_2026-04-27T01-07-13-513Z.sql	C:\\Users\\d_sil\\Desktop\\dip30.12\\back\\backups\\backup_2026-04-27T01-07-13-513Z.sql	50818	25	2026-04-27 04:07:13.648805	вфы
5	backup_2026-04-27T01-07-49-579Z.sql	C:\\Users\\d_sil\\Desktop\\dip30.12\\back\\backups\\backup_2026-04-27T01-07-49-579Z.sql	51145	25	2026-04-27 04:07:49.839743	вы
\.


--
-- Data for Name: inventories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventories (id, title, status, created_by, responsible_person, start_date, end_date, description, created_at, updated_at, completed_at, approved_at, approved_by, cancelled_at, cancelled_by) FROM stdin;
1	sea of thieves	cancelled	\N	\N	2026-04-11	2026-04-11	Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo cupiditate eos vitae sequi, repellendus adipisci totam aspernatur molestias unde praesentium, debitis nulla voluptate quidem, explicabo odit? Architecto soluta officiis facere?\nNostrum laborum quas nisi pariatur porro quidem obcaecati a deleniti. Exercitationem, corrupti suscipit delectus, sequi ipsum quos minus iure quia impedit dolorem pariatur reprehenderit eaque architecto quas eligendi a quidem.\nLibero consequuntur excepturi repudiandae ex temporibus tenetur, dolore minima praesentium aliquid voluptatem? Aperiam dolorum cum optio asperiores accusantium perferendis adipisci quae iusto quaerat nisi libero ad, at repellendus exercitationem reiciendis.\nProvident at deleniti consequatur tempore eius, velit aliquam repudiandae quae veritatis vero quibusdam quaerat nesciunt minus id tempora accusamus laudantium eaque officia expedita excepturi voluptatum corporis laboriosam explicabo. Quibusdam, a?	2026-04-10 19:17:18.274861	2026-04-12 16:56:03.334946	\N	\N	\N	2026-04-10 19:41:16.859099	\N
3	gdfgdfg	draft	\N	\N	2026-04-01	2026-04-17	\N	2026-04-12 16:55:25.571097	2026-04-12 17:08:35.283864	\N	\N	\N	\N	\N
4	fsadfas	draft	\N	\N	2026-04-02	2026-04-25	dasdasdasd	2026-04-12 19:20:33.007111	2026-04-12 19:20:33.007111	\N	\N	\N	\N	\N
5	вфывфы	draft	\N	\N	2026-04-02	2026-04-24	вфывфывфыв	2026-04-12 19:23:47.935052	2026-04-12 19:23:47.935052	\N	\N	\N	\N	\N
6	dfgdfg	approved	\N	\N	2026-04-24	2026-04-25	\N	2026-04-24 17:53:03.179787	2026-04-24 17:55:13.132221	2026-04-24 17:55:03.650362	2026-04-24 17:55:13.132221	\N	\N	\N
2	gdfgsdfgdfsg	cancelled	\N	\N	2026-04-09	2026-04-11	\N	2026-04-10 19:38:55.393488	2026-04-24 17:53:12.642488	\N	\N	\N	2026-04-24 17:53:12.642488	\N
7	tter	approved	\N	\N	2026-04-26	2026-04-30	gfgdf	2026-04-26 03:05:01.511108	2026-04-26 03:05:57.870994	2026-04-26 03:05:40.506124	2026-04-26 03:05:57.870994	\N	\N	\N
8	Аыва	draft	25	25	2026-04-27	2026-04-27	\N	2026-04-27 03:23:40.579741	2026-04-27 03:23:40.579741	\N	\N	\N	\N	\N
9	Аыва	draft	25	25	2026-04-18	2026-04-26	\N	2026-04-27 03:23:50.039009	2026-04-27 03:23:50.039009	\N	\N	\N	\N	\N
10	Аывавы	draft	25	25	2026-04-11	2026-04-23	\N	2026-04-27 03:24:08.118237	2026-04-27 03:24:08.118237	\N	\N	\N	\N	\N
11	Аыва	cancelled	25	25	2026-04-03	2026-04-16	\N	2026-04-27 03:24:13.363273	2026-05-04 19:41:11.456275	\N	\N	\N	2026-05-04 19:41:11.456275	25
12	124	draft	25	25	2026-05-04	2026-05-04	jhgb jkhgk	2026-05-04 19:41:46.54913	2026-05-04 19:42:02.158048	\N	\N	\N	\N	\N
\.


--
-- Data for Name: inventory_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_categories (id, inventory_id, category_id) FROM stdin;
1	3	2
2	3	1
3	4	1
4	4	2
5	4	3
6	5	1
7	5	2
8	5	3
9	6	1
10	6	2
11	12	4
12	12	3
13	12	2
\.


--
-- Data for Name: inventory_materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_materials (id, inventory_id, material_id) FROM stdin;
1	1	1
3	1	3
4	1	4
5	7	3
6	7	4
7	7	5
\.


--
-- Data for Name: inventory_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_results (id, inventory_id, material_id, system_quantity, actual_quantity, reason, created_at, updated_at) FROM stdin;
1	1	1	0	\N	\N	2026-04-10 19:17:18.274861	2026-04-10 19:17:18.274861
3	1	3	0	\N	\N	2026-04-10 19:17:18.274861	2026-04-10 19:17:18.274861
4	1	4	0	\N	\N	2026-04-10 19:17:18.274861	2026-04-10 19:17:18.274861
5	2	1	0	\N	\N	2026-04-10 19:38:55.393488	2026-04-10 19:45:12.029439
7	2	3	0	3123	\N	2026-04-10 19:38:55.393488	2026-04-10 19:45:12.029986
8	2	4	0	3123	\N	2026-04-10 19:38:55.393488	2026-04-10 19:45:12.03016
9	2	5	0	31233123	\N	2026-04-10 19:38:55.393488	2026-04-10 19:45:12.030317
10	3	3	0	\N	\N	2026-04-12 16:55:25.571097	2026-04-12 16:55:25.571097
11	3	4	0	\N	\N	2026-04-12 16:55:25.571097	2026-04-12 16:55:25.571097
13	4	3	0	\N	\N	2026-04-12 19:20:33.007111	2026-04-12 19:20:33.007111
14	4	1	1	\N	\N	2026-04-12 19:20:33.007111	2026-04-12 19:20:33.007111
15	4	4	1	\N	\N	2026-04-12 19:20:33.007111	2026-04-12 19:20:33.007111
17	5	3	0	\N	\N	2026-04-12 19:23:47.935052	2026-04-12 19:23:47.935052
18	5	1	1	\N	\N	2026-04-12 19:23:47.935052	2026-04-12 19:23:47.935052
19	5	4	1	\N	\N	2026-04-12 19:23:47.935052	2026-04-12 19:23:47.935052
20	6	3	0	123	fsdf	2026-04-24 17:53:03.179787	2026-04-24 17:55:03.639302
21	6	4	1	112	\N	2026-04-24 17:53:03.179787	2026-04-24 17:55:03.639756
23	7	3	122	3213	fsdfsdf	2026-04-26 03:05:01.511108	2026-04-26 03:05:40.465724
22	7	4	112	112	\N	2026-04-26 03:05:01.511108	2026-04-26 03:05:40.466854
24	7	5	0	0	\N	2026-04-26 03:05:01.511108	2026-04-26 03:05:40.467163
26	8	4	112	\N	\N	2026-04-27 03:23:40.579741	2026-04-27 03:23:40.579741
27	8	5	0	\N	\N	2026-04-27 03:23:40.579741	2026-04-27 03:23:40.579741
28	8	6	100	\N	\N	2026-04-27 03:23:40.579741	2026-04-27 03:23:40.579741
29	8	1	2	\N	\N	2026-04-27 03:23:40.579741	2026-04-27 03:23:40.579741
30	8	3	3212	\N	\N	2026-04-27 03:23:40.579741	2026-04-27 03:23:40.579741
32	9	4	112	\N	\N	2026-04-27 03:23:50.039009	2026-04-27 03:23:50.039009
33	9	5	0	\N	\N	2026-04-27 03:23:50.039009	2026-04-27 03:23:50.039009
34	9	6	100	\N	\N	2026-04-27 03:23:50.039009	2026-04-27 03:23:50.039009
35	9	1	2	\N	\N	2026-04-27 03:23:50.039009	2026-04-27 03:23:50.039009
36	9	3	3212	\N	\N	2026-04-27 03:23:50.039009	2026-04-27 03:23:50.039009
38	10	4	112	\N	\N	2026-04-27 03:24:08.118237	2026-04-27 03:24:08.118237
39	10	5	0	\N	\N	2026-04-27 03:24:08.118237	2026-04-27 03:24:08.118237
40	10	6	100	\N	\N	2026-04-27 03:24:08.118237	2026-04-27 03:24:08.118237
41	10	1	2	\N	\N	2026-04-27 03:24:08.118237	2026-04-27 03:24:08.118237
42	10	3	3212	\N	\N	2026-04-27 03:24:08.118237	2026-04-27 03:24:08.118237
44	11	4	112	\N	\N	2026-04-27 03:24:13.363273	2026-04-27 03:24:13.363273
45	11	5	0	\N	\N	2026-04-27 03:24:13.363273	2026-04-27 03:24:13.363273
46	11	6	100	\N	\N	2026-04-27 03:24:13.363273	2026-04-27 03:24:13.363273
47	11	1	2	\N	\N	2026-04-27 03:24:13.363273	2026-04-27 03:24:13.363273
48	11	3	3212	\N	\N	2026-04-27 03:24:13.363273	2026-04-27 03:24:13.363273
50	12	5	0	\N	\N	2026-05-04 19:41:46.54913	2026-05-04 19:41:46.54913
51	12	3	3212	\N	\N	2026-05-04 19:41:46.54913	2026-05-04 19:41:46.54913
52	12	1	2	\N	\N	2026-05-04 19:41:46.54913	2026-05-04 19:41:46.54913
\.


--
-- Data for Name: material_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_requests (id, request_type, status, created_by, reviewed_by, notes, rejection_reason, created_at, reviewed_at, is_public, title) FROM stdin;
3	incoming	approved	\N	\N	fadsfasdfsadf	\N	2026-04-12 17:12:29.434894	2026-04-12 17:13:00.157117	t	czxczxc
2	incoming	approved	\N	\N	оапроапро прао паро апро дьапвт родщлапо рщлпаор дапоыр щлапордшщ вапжд лроапвщдшорждалпор лджавпо рдлапор длапвор злвоапрлдовапр оапроапро прао паро апро дьапвт родщлапо рщлпаор дапоыр щлапордшщ вапжд лроапвщдшорждалпор лджавпо рдлапор длапвор злвоапрлдовапр оапроапро прао паро апро дьапвт родщлапо рщлпаор дапоыр щлапордшщ вапжд лроапвщдшорждалпор лджавпо рдлапор длапвор злвоапрлдовапр оапроапро прао паро апро дьапвт родщлапо рщлпаор дапоыр щлапордшщ вапжд лроапвщдшорждалпор лджавпо рдлапор длапвор злвоапрлдовапр	\N	2026-04-10 19:33:55.356346	2026-04-12 17:13:14.030691	t	опраоапро
1	incoming	rejected	\N	\N	\N	да иди ты	2026-04-10 19:31:57.376301	2026-04-12 17:13:28.247787	t	афываыв
4	outgoing	rejected	\N	\N	\N	gbcv	2026-04-12 17:14:23.574644	2026-04-12 17:14:27.268825	t	bcvb
5	incoming	approved	\N	\N	\N	\N	2026-04-22 02:29:19.990571	2026-04-22 02:29:22.489986	t	авыа
7	incoming	pending	\N	\N	\N	\N	2026-04-26 15:45:25.640149	\N	t	вфывыфв
6	outgoing	approved	\N	\N	\N	\N	2026-04-26 02:59:26.004641	2026-04-26 02:59:35.139498	t	vdfgdf
8	outgoing	pending	25	\N	\N	\N	2026-04-27 03:22:19.662264	\N	t	Аываываыв
9	incoming	pending	25	\N	\N	\N	2026-04-27 03:22:26.142347	\N	t	Аываыв
10	incoming	pending	25	\N	\N	\N	2026-04-27 03:22:33.400901	\N	t	Аываыва
11	outgoing	approved	25	25	\N	\N	2026-04-27 03:22:38.009849	2026-04-27 03:22:38.009	t	Аываыва
12	incoming	pending	25	\N	\N	\N	2026-04-27 03:22:42.268004	\N	t	Ыавыав
14	incoming	approved	25	25	\N	\N	2026-05-05 02:20:10.001963	2026-05-05 19:36:48.518364	t	Dasd
13	incoming	rejected	25	25	\N	l	2026-04-27 03:22:48.277558	2026-05-05 19:37:16.973719	t	Аыва
\.


--
-- Data for Name: material_requests_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_requests_items (id, request_id, material_id, quantity, current_quantity_at_request, created_at) FROM stdin;
1	1	1	1	0	2026-04-10 19:31:57.376301
2	2	4	1	0	2026-04-10 19:33:55.356346
3	3	1	1	0	2026-04-12 17:12:29.434894
4	3	4	1	0	2026-04-12 17:12:29.434894
5	3	5	1	0	2026-04-12 17:12:29.434894
6	4	1	1	1	2026-04-12 17:14:23.574644
7	5	1	1	1	2026-04-22 02:29:19.990571
8	6	3	1	123	2026-04-26 02:59:26.004641
9	6	5	1	1	2026-04-26 02:59:26.004641
10	7	1	1	2	2026-04-26 15:45:25.640149
11	7	3	1	3213	2026-04-26 15:45:25.640149
12	8	1	1	2	2026-04-27 03:22:19.662264
13	9	1	1	2	2026-04-27 03:22:26.142347
14	9	3	1	3213	2026-04-27 03:22:26.142347
15	9	4	1	112	2026-04-27 03:22:26.142347
16	10	3	1	3213	2026-04-27 03:22:33.400901
17	10	4	1	112	2026-04-27 03:22:33.400901
18	11	3	1	3213	2026-04-27 03:22:38.009849
19	12	1	1	2	2026-04-27 03:22:42.268004
20	12	3	1	3212	2026-04-27 03:22:42.268004
22	14	1	1	2	2026-05-05 02:20:10.001963
\.


--
-- Data for Name: materialcategories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materialcategories (id, name, description, created_by, updated_by, created_at, updated_at) FROM stdin;
1	fsdfsdf	fsdf	\N	\N	2026-04-10 18:53:51.903575	2026-04-10 18:53:51.903575
2	fsadf	asfdsd	\N	\N	2026-04-10 18:53:54.616147	2026-04-10 18:53:54.616147
3	234234	4234	\N	\N	2026-04-10 18:53:56.722254	2026-04-10 18:53:56.722254
4	1234567uhybtgfredfdsa	fsedwfdas	\N	\N	2026-04-10 18:54:00.722216	2026-04-12 17:12:03.194066
5	Gdfgfd	fsdf	\N	\N	2026-04-26 16:18:58.069877	2026-04-26 16:19:06.135865
\.


--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materials (id, category_id, name, code, description, unit, quantity, created_by, updated_by, created_at, updated_at) FROM stdin;
4	1	fsdafsdf	FSD-975	fsfasfdsad	шт	112	\N	\N	2026-04-10 18:54:35.481087	2026-04-24 17:55:13.132221
5	4	hgfi yubdfhg fdshgj fdhgldksfhgl jkgh lfgd	HY-678	gdfsgsdfg fdsgmln dfkljg hdfoiugh kljdfshg ojfdhjg ldfs hpodfijh iopdf jhoidfsjh; ;dfjh sdh fdghd	шт	0	\N	\N	2026-04-10 19:38:42.017766	2026-04-26 02:59:35.139498
6	\N	Цемент М500	CEM-001	\N	кг	100	\N	\N	2026-04-24 20:46:24.63655	2026-04-24 20:46:24.63655
3	2	fsadfvxcv	FSA-768	\N	шт	3212	\N	\N	2026-04-10 18:54:28.721634	2026-04-27 03:22:38.009849
1	3	Fasdfsadfxzfsdfdsdj	FAS-4843	fsdfsdfdasd	кг	3	\N	25	2026-04-10 18:54:10.780845	2026-05-05 19:36:48.518364
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, message, read, created_at) FROM stdin;
163	25	login	Вход в систему	[user:25:admin] вошел в систему	t	2026-04-26 17:13:56.83423
166	25	profile_updated	Изменение профиля	[user:25:admin] изменил данные: "name": "Абдурахмангаджи" → "Аываыв", "secondname": "Триждыорденакрасногознамени" → "Аываыв"	t	2026-04-26 17:20:58.402301
169	25	profile_updated	Изменение профиля	[user:25:admin] изменил данные: "name": "Аываыв" → "Ффффффф", "secondname": "Аываыв" → "Ффффф"	t	2026-04-27 03:18:35.008774
173	25	request_created	Создание заявки	[user:25:admin] создал [request:8] "Аываываыв" на расход	t	2026-04-27 03:22:19.68899
174	25	request_created	Создание заявки	[user:25:admin] создал [request:9] "Аываыв" на приход	t	2026-04-27 03:22:26.143699
175	25	request_created	Создание заявки	[user:25:admin] создал [request:10] "Аываыва" на приход	t	2026-04-27 03:22:33.40186
176	25	request_created	Создание заявки	[user:25:admin] создал [request:11] "Аываыва" на расход	t	2026-04-27 03:22:38.011291
177	25	request_approved	Подтверждение заявки	[user:25:admin] подтвердил [request:11] "Аываыва" на расход	t	2026-04-27 03:22:38.011708
178	25	request_created	Создание заявки	[user:25:admin] создал [request:12] "Ыавыав" на приход	t	2026-04-27 03:22:42.269191
179	25	request_created	Создание заявки	[user:25:admin] создал [request:13] "Аыва" на приход	t	2026-04-27 03:22:48.278543
136	\N	login	Вход в систему	[user:24:vvfyv299] вошел в систему	t	2026-04-26 15:29:28.605289
139	\N	login	Вход в систему	[user:24:vvfyv299] вошел в систему	t	2026-04-26 15:33:23.249109
121	\N	inventory_started	Начало инвентаризации	[user:22:admin] начал [inventory:7] "tter"	t	2026-04-26 03:05:13.972222
126	\N	inventory_approved	Подтверждение инвентаризации	[user:22:admin] подтвердил [inventory:7] "tter", обновлено 1 позиций	t	2026-04-26 03:05:58.001994
129	\N	login	Вход в систему	[user:22:admin] вошел в систему	t	2026-04-26 03:10:42.495945
132	\N	login	Вход в систему	[user:22:admin] вошел в систему	t	2026-04-26 15:28:02.747969
135	\N	admin_password_changed	Админ сменил пароль пользователю	[user:22:admin] сменил пароль пользователю [user:24:vvfyv299]	t	2026-04-26 15:29:19.40305
142	\N	material_updated	Изменение материала	[user:22:admin] изменил материал "fasdfsadfxz": название: "fasdfsadfxz" → "Fasdfsadfxzfsdfds"	t	2026-04-26 16:02:37.818109
145	\N	category_created	Создание категории	Администратор admin создал категорию: Gdfgfd	t	2026-04-26 16:18:58.095821
146	\N	category_updated	Изменение категории	Администратор admin изменил категорию "Gdfgfd": описание изменено	t	2026-04-26 16:19:06.136465
184	25	backup_created	Создание бэкапа	[user:25:admin] создал бэкап: backup_2026-04-27T00-55-30-964Z.sql	t	2026-04-27 03:55:31.270793
187	25	backup_created	Создание бэкапа	[user:25:admin] создал бэкап: backup_2026-04-27T01-07-13-513Z.sql	t	2026-04-27 04:07:13.677431
190	25	material_updated	Изменение материала	[user:25:admin] изменил материал "Fasdfsadfxzfsdfds": название: "Fasdfsadfxzfsdfds" → "Fasdfsadfxzfsdfdsd"	t	2026-05-04 18:23:24.872515
193	25	admin_user_updated	Админ изменил данные пользователя	[user:25:admin] изменил данные пользователя [user:26:vvfyv447]: "name": "Вфы" → "Вфыв"	t	2026-05-04 18:32:29.337616
196	25	inventory_updated	Изменение инвентаризации	[user:25:admin] изменил [inventory:12] "124": ответственный изменен, дата начала: 2026-05-03 → 2026-05-04, дата окончания: 2026-05-03 → 2026-05-04	t	2026-05-04 19:42:02.287736
199	25	login	Вход в систему	[user:25:admin] вошел в систему	t	2026-05-04 19:51:52.618904
200	25	profile_updated	Изменение профиля	[user:25:admin] изменил данные: "phone": "+79118573584" → "+7 911 857 35 84"	t	2026-05-04 19:52:01.37982
203	25	login	Вход в систему	[user:25:admin] вошел в систему	t	2026-05-04 20:11:51.876165
207	25	login	Вход в систему	[user:25:admin] вошел в систему	t	2026-05-04 20:33:04.518855
210	25	login	Вход в систему	[user:25:admin] вошел в систему	t	2026-05-05 02:07:40.896494
213	25	category_created	Создание категории	Администратор admin создал категорию: Rhgbtfd	t	2026-05-05 18:48:49.049949
216	25	request_approved	Подтверждение заявки	[user:25:admin] подтвердил [request:14] "Dasd" на приход	t	2026-05-05 19:36:48.520339
217	25	category_updated	Изменение категории	Администратор admin изменил категорию "Rhgbtfd": название: "Rhgbtfd" → "Rhgbtfdl"	t	2026-05-05 19:37:00.6804
218	25	category_deleted	Удаление категории	Администратор admin удалил категорию: Rhgbtfdl	t	2026-05-05 19:37:07.509538
219	25	request_rejected	Отклонение заявки	[user:25:admin] отклонил [request:13] "Аыва" на приход. Причина: l	t	2026-05-05 19:37:16.974283
222	25	admin_user_updated	Админ изменил данные пользователя	[user:25:admin] изменил данные пользователя [user:29:aayvayva868]: "name": "ИИИИИИИИИИИ" → "ИИИИИИИИИИИИИИИИИИИИ"	t	2026-05-05 19:38:09.295612
164	25	profile_updated	Изменение профиля	[user:25:admin] изменил данные: "name": "admin" → "Абдурахмангаджи", "secondname": "admin" → "Триждыорденакрасногознамени"	t	2026-04-26 17:16:54.068091
167	25	login	Вход в систему	[user:25:admin] вошел в систему	t	2026-04-26 20:29:31.527935
170	25	profile_updated	Изменение профиля	[user:25:admin] изменил данные: "name": "Ффффффф" → "Фффффффвфывфывфы", "secondname": "Ффффф" → "Фффффвфывфыв"	t	2026-04-27 03:21:50.580035
180	25	inventory_created	Создание инвентаризации	[user:25:admin] создал [inventory:8] "Аыва"	t	2026-04-27 03:23:40.614358
181	25	inventory_created	Создание инвентаризации	[user:25:admin] создал [inventory:9] "Аыва"	t	2026-04-27 03:23:50.042735
185	25	backup_created	Создание бэкапа	[user:25:admin] создал бэкап: backup_2026-04-27T00-56-48-777Z.sql	t	2026-04-27 03:56:49.071555
188	25	backup_created	Создание бэкапа	[user:25:admin] создал бэкап: backup_2026-04-27T01-07-49-579Z.sql	t	2026-04-27 04:07:49.979051
191	25	user_created	Создание пользователя	[user:25:admin] создал пользователя [user:26:vvfyv447]	t	2026-05-04 18:30:35.026469
194	25	inventory_cancelled	Отмена инвентаризации	[user:25:admin] отменил [inventory:11] "Аыва"	t	2026-05-04 19:41:11.482314
154	\N	profile_updated	Изменение профиля	[user:22:admin] изменил данные: "name": "Вфывфыввфывфывфывфываываывааывфафываывфаывфаываываывфаываывафываывфавыаффываываыфваыфва" → "РвпловраыплРвпловраыплРвпловраыпл"	t	2026-04-26 16:49:37.704437
155	\N	profile_updated	Изменение профиля	[user:22:admin] изменил данные: "name": "РвпловраыплРвпловраыплРвпловраыпл" → "РвпловраыплРвпловраыплРвпловраыплРвпловраыплРвпловраыпл"	t	2026-04-26 16:49:40.226353
156	\N	profile_updated	Изменение профиля	[user:22:admin] изменил данные: "name": "РвпловраыплРвпловраыплРвпловраыплРвпловраыплРвпловраыпл" → "РвпловраыплРвпловраыплРвпловраыплРвплоРвпловраыплРвпловраыплРвпловраыплвраыплРвпловраыпл"	t	2026-04-26 16:49:42.786699
159	\N	profile_updated	Изменение профиля	[user:22:admin] изменил данные: "phone": "" → "+7 911 857 35 84"	t	2026-04-26 16:59:09.873648
162	\N	login	Вход в систему	[user:22:admin] вошел в систему	t	2026-04-26 17:11:21.810998
122	\N	inventory_saved	Сохранение результатов	[user:22:admin] сохранил результаты [inventory:7] "tter"	t	2026-04-26 03:05:26.053115
123	\N	inventory_saved	Сохранение результатов	[user:22:admin] сохранил результаты [inventory:7] "tter"	t	2026-04-26 03:05:26.692174
127	\N	admin_password_changed	Админ сменил пароль пользователю	[user:22:admin] сменил пароль пользователю [user:23:dyakunin253]	t	2026-04-26 03:06:58.725749
130	\N	login	Вход в систему	[user:22:admin] вошел в систему	t	2026-04-26 15:21:11.872728
133	\N	login	Вход в систему	[user:22:admin] вошел в систему	t	2026-04-26 15:28:27.27365
137	\N	login	Вход в систему	[user:22:admin] вошел в систему	t	2026-04-26 15:32:33.208372
140	\N	login	Вход в систему	[user:22:admin] вошел в систему	t	2026-04-26 15:34:32.668867
160	\N	login	Вход в систему	[user:22:admin] вошел в систему	t	2026-04-26 17:03:39.013814
197	25	admin_user_updated	Админ изменил данные пользователя	[user:25:admin] изменил данные пользователя [user:26:vvfyv447]: "phone": "" → "+7 911 857 35 84"	t	2026-05-04 19:43:26.669469
201	25	login	Вход в систему	[user:25:admin] вошел в систему	t	2026-05-04 20:07:27.910014
204	25	login	Вход в систему	[user:25:admin] вошел в систему	t	2026-05-04 20:15:14.006649
208	25	login	Вход в систему	[user:25:admin] вошел в систему	t	2026-05-05 01:15:52.271357
211	25	request_created	Создание заявки	[user:25:admin] создал [request:14] "Dasd" на приход	t	2026-05-05 02:20:10.032467
214	25	material_updated	Изменение материала	[user:25:admin] изменил материал "Fasdfsadfxzfsdfdsd": название: "Fasdfsadfxzfsdfdsd" → "Fasdfsadfxzfsdfdsdj"	t	2026-05-05 19:36:15.059302
220	25	user_created	Создание пользователя	[user:25:admin] создал пользователя [user:29:aayvayva868]	t	2026-05-05 19:37:32.852729
221	25	admin_user_updated	Админ изменил данные пользователя	[user:25:admin] изменил данные пользователя [user:29:aayvayva868]: "name": "Аываыва" → "ИИИИИИИИИИИ"	t	2026-05-05 19:37:50.449469
165	25	login	Вход в систему	[user:25:admin] вошел в систему	t	2026-04-26 17:20:47.574589
168	25	login	Вход в систему	[user:25:admin] вошел в систему	t	2026-04-27 03:18:23.302808
171	25	profile_updated	Изменение профиля	[user:25:admin] изменил данные: "name": "Фффффффвфывфывфы" → "Данила", "secondname": "Фффффвфывфыв" → "Клименков"	t	2026-04-27 03:22:02.127527
172	25	profile_updated	Изменение профиля	[user:25:admin] изменил данные: "secondname": "Клименков" → "Пвапвап"	t	2026-04-27 03:22:06.702219
182	25	inventory_created	Создание инвентаризации	[user:25:admin] создал [inventory:10] "Аывавы"	t	2026-04-27 03:24:08.145106
183	25	inventory_created	Создание инвентаризации	[user:25:admin] создал [inventory:11] "Аыва"	t	2026-04-27 03:24:13.366479
128	\N	login	Вход в систему	[user:23:dyakunin253] вошел в систему	t	2026-04-26 03:07:12.69223
143	\N	admin_user_updated	Админ изменил данные пользователя	[user:22:admin] изменил данные пользователя [user:24:vvfyv299]: "name": "вфы" → "Вфыfsd", "secondname": "вфыв" → "Вфывfsd"	t	2026-04-26 16:14:02.378714
147	\N	profile_updated	Изменение профиля	[user:22:admin] изменил данные: "name": "Admin" → "Выфввфыв", "secondname": "Admin" → "Ааыываываыввфы"	t	2026-04-26 16:47:58.6397
148	\N	profile_updated	Изменение профиля	[user:22:admin] изменил данные: "name": "Выфввфыв" → "Выфввфыввфывфывфывфывфывфыв"	t	2026-04-26 16:48:04.863292
149	\N	profile_updated	Изменение профиля	[user:22:admin] изменил данные: "name": "Выфввфыввфывфывфывфывфывфыв" → "Выфввфыввфывфывфывфывфывфыввфывфывфывыфаывпаывфпаывапвапвапвапывапывпавыапв"	t	2026-04-26 16:48:09.777242
157	\N	profile_updated	Изменение профиля	[user:22:admin] изменил данные: "name": "РвпловраыплРвпловраыплРвпловраыплРвплоРвпловраыплРвпловраыплРвпловраыплвраыплРвпловраыпл" → "Аываыв"	t	2026-04-26 16:51:20.943366
124	\N	inventory_saved	Сохранение результатов	[user:22:admin] сохранил результаты [inventory:7] "tter"	t	2026-04-26 03:05:40.492861
125	\N	inventory_completed	Завершение инвентаризации	[user:22:admin] завершил [inventory:7] "tter" и отправил на проверку	t	2026-04-26 03:05:40.506606
120	\N	inventory_created	Создание инвентаризации	[user:22:admin] создал [inventory:7] "tter"	t	2026-04-26 03:05:01.548554
131	\N	login	Вход в систему	[user:22:admin] вошел в систему	t	2026-04-26 15:22:35.312634
134	\N	login	Вход в систему	[user:22:admin] вошел в систему	t	2026-04-26 15:29:06.510823
138	\N	login	Вход в систему	[user:22:admin] вошел в систему	t	2026-04-26 15:32:54.17648
141	\N	request_created	Создание заявки	[user:22:admin] создал [request:7] "вфывыфв" на приход	t	2026-04-26 15:45:25.66833
144	\N	profile_updated	Изменение профиля	[user:22:admin] изменил данные: "name": "admin" → "Admin", "secondname": "admin" → "Admin"	t	2026-04-26 16:15:03.754963
150	\N	profile_updated	Изменение профиля	[user:22:admin] изменил данные: "name": "Выфввфыввфывфывфывфывфывфыввфывфывфывыфаывпаывфпаывапвапвапвапывапывпавыапв" → "Вфывфыв"	t	2026-04-26 16:48:52.387987
151	\N	profile_updated	Изменение профиля	[user:22:admin] изменил данные: "name": "Вфывфыв" → "Вфывфыввфывфывфывфываываыва"	t	2026-04-26 16:48:55.245063
152	\N	profile_updated	Изменение профиля	[user:22:admin] изменил данные: "name": "Вфывфыввфывфывфывфываываыва" → "Вфывфыввфывфывфывфываываывааывфафываывфаыфваыфва"	t	2026-04-26 16:48:58.146836
153	\N	profile_updated	Изменение профиля	[user:22:admin] изменил данные: "name": "Вфывфыввфывфывфывфываываывааывфафываывфаыфваыфва" → "Вфывфыввфывфывфывфываываывааывфафываывфаывфаываываывфаываывафываывфавыаффываываыфваыфва"	t	2026-04-26 16:49:03.363566
158	\N	profile_updated	Изменение профиля	[user:22:admin] изменил данные: "name": "Аываыв" → "Аываыввфывфывфывфывф", "secondname": "Ааыываываыввфы" → "Ааыываываыввфывфывфывфывыфвывф"	t	2026-04-26 16:52:34.574732
161	\N	login	Вход в систему	[user:22:admin] вошел в систему	t	2026-04-26 17:05:12.925963
186	25	backup_created	Создание бэкапа	[user:25:admin] создал бэкап: backup_2026-04-27T01-00-07-493Z.sql	t	2026-04-27 04:00:07.647368
189	25	login	Вход в систему	[user:25:admin] вошел в систему	t	2026-05-04 18:20:09.113497
192	25	user_created	Создание пользователя	[user:25:admin] создал пользователя [user:27:ppvap224]	t	2026-05-04 18:31:42.279771
195	25	inventory_created	Создание инвентаризации	[user:25:admin] создал [inventory:12] "124"	t	2026-05-04 19:41:46.587536
198	25	profile_updated	Изменение профиля	[user:25:admin] изменил данные: "phone": "" → "+7 911 857 35 84"	t	2026-05-04 19:50:51.833708
202	25	login	Вход в систему	[user:25:admin] вошел в систему	t	2026-05-04 20:07:40.669455
205	25	user_created	Создание пользователя	[user:25:admin] создал пользователя [user:28:vfvfyv190]	t	2026-05-04 20:32:09.342008
206	28	login	Вход в систему	[user:28:vfvfyv190] вошел в систему	t	2026-05-04 20:32:17.490373
209	25	login	Вход в систему	[user:25:admin] вошел в систему	t	2026-05-05 02:07:13.902487
212	25	login	Вход в систему	[user:25:admin] вошел в систему	t	2026-05-05 18:48:42.253443
215	25	material_deleted	Удаление материала	[user:25:admin] удалил материал: fsadfsdf	t	2026-05-05 19:36:29.980779
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, role, name, secondname, created_at, email, phone, birthday, updated_at) FROM stdin;
27	ppvap224	$2b$10$qzVsh1HYEkTb7yKBZUZSIeF0P54auUWVvrFZiBK82ubfBIqMNJxBq	storekeeper	Пва	Пвап	2026-05-04 18:31:42.253389			\N	2026-05-04 18:31:42.253389
26	vvfyv447	$2b$10$Lh4RR1ymBavm9TGFvrpcOuauWB9.MzRpQC1SwZ./2zYzpYuQlSwca	storekeeper	Вфыв	Вфыв	2026-05-04 18:30:34.999553		+79118573584	\N	2026-05-04 19:43:26.637
25	admin	$2b$10$pzAkYsXE7ZUntVAMWCMCieYLs3mYZUnJrtpuiNUgAGAhmWoRecot6	admin	Данила	Пвапвап	2026-04-26 17:13:27.302554		+7 911 857 35 84	\N	2026-05-04 19:52:01.378
28	vfvfyv190	$2b$10$tQ37sHEcx1DKl6tq73n.O.7GaMGyxOEZkxtvHK3zXBQv8UFRZXATi	storekeeper	Вфыв	Фвфыв	2026-05-04 20:32:09.312719			\N	2026-05-04 20:32:09.312719
29	aayvayva868	$2b$10$wa51hwBLAWH3ai1JLE.5gemDHfxunYIClBlOvzMGFPfrROxXK3gX.	storekeeper	ИИИИИИИИИИИИИИИИИИИИ	Аываыва	2026-05-05 19:37:32.851328			\N	2026-05-05 19:38:09.292
\.


--
-- Name: backups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.backups_id_seq', 5, true);


--
-- Name: inventories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventories_id_seq', 12, true);


--
-- Name: inventory_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_categories_id_seq', 13, true);


--
-- Name: inventory_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_materials_id_seq', 7, true);


--
-- Name: inventory_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_results_id_seq', 52, true);


--
-- Name: material_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.material_requests_id_seq', 14, true);


--
-- Name: material_requests_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.material_requests_items_id_seq', 22, true);


--
-- Name: materialcategories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materialcategories_id_seq', 6, true);


--
-- Name: materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materials_id_seq', 6, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 222, true);


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

\unrestrict naBRWAtC0zYmKomdAMe5GIxKcBvJc1h8qYyGIBTwFepkO1B0nscKNfGeMqCDi2W

