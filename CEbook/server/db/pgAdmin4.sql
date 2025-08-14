--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

-- Started on 2025-08-14 02:47:11

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

--
-- TOC entry 232 (class 1255 OID 24620)
-- Name: limit_water_quality_records(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.limit_water_quality_records() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- ตรวจสอบจำนวน record และลบเก่าที่สุดถ้าเกิน 8
    PERFORM 1 FROM water_quality
    WHERE (SELECT COUNT(*) FROM water_quality) > 8
    LIMIT 1;

    IF FOUND THEN
        DELETE FROM water_quality
        WHERE id IN (
            SELECT id FROM water_quality
            ORDER BY recorded_at ASC
            LIMIT (SELECT COUNT(*) - 8 FROM water_quality)
        );
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.limit_water_quality_records() OWNER TO postgres;

--
-- TOC entry 231 (class 1255 OID 24694)
-- Name: user_login(character varying, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.user_login(_email character varying, _password text) RETURNS TABLE(user_id integer, email character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE 
    stored_password TEXT;
    uid INTEGER;
BEGIN
    -- ดึงรหัสผ่านที่เก็บไว้
    SELECT user_id, password_hash INTO uid, stored_password 
    FROM users WHERE email = _email;

    -- ตรวจสอบรหัสผ่าน (ควรใช้ bcrypt/pgcrypto)
    IF stored_password IS NOT NULL AND stored_password = _password THEN
        RETURN QUERY SELECT uid, _email;
    ELSE
        RAISE EXCEPTION 'Invalid email or password';
    END IF;
END;
$$;


ALTER FUNCTION public.user_login(_email character varying, _password text) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 16390)
-- Name: authors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authors (
    author_id integer NOT NULL,
    name character varying(100) NOT NULL,
    birth_date date,
    nationality character varying(50)
);


ALTER TABLE public.authors OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16389)
-- Name: authors_author_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.authors_author_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.authors_author_id_seq OWNER TO postgres;

--
-- TOC entry 4867 (class 0 OID 0)
-- Dependencies: 217
-- Name: authors_author_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.authors_author_id_seq OWNED BY public.authors.author_id;


--
-- TOC entry 222 (class 1259 OID 16404)
-- Name: books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.books (
    book_id integer NOT NULL,
    title character varying(100),
    price numeric(7,2),
    genre character varying(100),
    published date,
    publisher_id integer,
    author_id integer
);


ALTER TABLE public.books OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16403)
-- Name: books_book_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.books_book_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.books_book_id_seq OWNER TO postgres;

--
-- TOC entry 4868 (class 0 OID 0)
-- Dependencies: 221
-- Name: books_book_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.books_book_id_seq OWNED BY public.books.book_id;


--
-- TOC entry 228 (class 1259 OID 24623)
-- Name: login_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_logs (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    login_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(10) DEFAULT 'online'::character varying
);


ALTER TABLE public.login_logs OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 24622)
-- Name: login_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.login_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.login_logs_id_seq OWNER TO postgres;

--
-- TOC entry 4869 (class 0 OID 0)
-- Dependencies: 227
-- Name: login_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.login_logs_id_seq OWNED BY public.login_logs.id;


--
-- TOC entry 226 (class 1259 OID 16431)
-- Name: member; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.member (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100),
    password character varying(255)
);


ALTER TABLE public.member OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16430)
-- Name: member_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.member_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.member_id_seq OWNER TO postgres;

--
-- TOC entry 4870 (class 0 OID 0)
-- Dependencies: 225
-- Name: member_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.member_id_seq OWNED BY public.member.id;


--
-- TOC entry 220 (class 1259 OID 16397)
-- Name: publishers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.publishers (
    publisher_id integer NOT NULL,
    publisher_name character varying(100) NOT NULL
);


ALTER TABLE public.publishers OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16396)
-- Name: publishers_publisher_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.publishers_publisher_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.publishers_publisher_id_seq OWNER TO postgres;

--
-- TOC entry 4871 (class 0 OID 0)
-- Dependencies: 219
-- Name: publishers_publisher_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.publishers_publisher_id_seq OWNED BY public.publishers.publisher_id;


--
-- TOC entry 224 (class 1259 OID 16421)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16420)
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
-- TOC entry 4872 (class 0 OID 0)
-- Dependencies: 223
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 230 (class 1259 OID 24735)
-- Name: water_quality; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.water_quality (
    id integer NOT NULL,
    salinity numeric(5,2),
    ph numeric(4,2),
    dissolved_oxygen numeric(5,2),
    nitrogen numeric(5,2),
    hydrogen_sulfide numeric(5,2),
    bod numeric(5,2),
    temperature numeric(5,2),
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.water_quality OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 24734)
-- Name: water_quality_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.water_quality_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.water_quality_id_seq OWNER TO postgres;

--
-- TOC entry 4873 (class 0 OID 0)
-- Dependencies: 229
-- Name: water_quality_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.water_quality_id_seq OWNED BY public.water_quality.id;


--
-- TOC entry 4673 (class 2604 OID 16393)
-- Name: authors author_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authors ALTER COLUMN author_id SET DEFAULT nextval('public.authors_author_id_seq'::regclass);


--
-- TOC entry 4675 (class 2604 OID 16407)
-- Name: books book_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books ALTER COLUMN book_id SET DEFAULT nextval('public.books_book_id_seq'::regclass);


--
-- TOC entry 4679 (class 2604 OID 24626)
-- Name: login_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_logs ALTER COLUMN id SET DEFAULT nextval('public.login_logs_id_seq'::regclass);


--
-- TOC entry 4678 (class 2604 OID 16434)
-- Name: member id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member ALTER COLUMN id SET DEFAULT nextval('public.member_id_seq'::regclass);


--
-- TOC entry 4674 (class 2604 OID 16400)
-- Name: publishers publisher_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publishers ALTER COLUMN publisher_id SET DEFAULT nextval('public.publishers_publisher_id_seq'::regclass);


--
-- TOC entry 4676 (class 2604 OID 16424)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4682 (class 2604 OID 24738)
-- Name: water_quality id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.water_quality ALTER COLUMN id SET DEFAULT nextval('public.water_quality_id_seq'::regclass);


--
-- TOC entry 4849 (class 0 OID 16390)
-- Dependencies: 218
-- Data for Name: authors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authors (author_id, name, birth_date, nationality) FROM stdin;
1	J.K. Rowling	1965-07-31	British
2	George Orwell	1903-06-25	British
3	Haruki Murakami	1949-01-12	Japanese
4	ttttttttttttttttt	1999-12-31	Thai
\.


--
-- TOC entry 4853 (class 0 OID 16404)
-- Dependencies: 222
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.books (book_id, title, price, genre, published, publisher_id, author_id) FROM stdin;
1	Harry Potter and the Philosopher Stone	19.99	Fantasy	1997-06-26	1	1
2	1984	15.50	Dystopian	1949-06-08	2	2
3	Norwegian Wood	12.75	Romance	1987-09-04	3	3
4	Animal Farm	10.25	Political Satire	1945-08-17	2	2
5	Kafka on the Shore	13.50	Magical Realism	2002-09-12	3	3
6	Harry Potter and the Chamber of Secrets	18.99	Fantasy	1998-07-02	1	1
7	1Q84	20.99	Science Fiction	2009-05-29	3	3
8	Harry Potter and the Prisoner of Azkaban	20.50	Fantasy	1999-07-08	1	1
9	Down and Out in Paris and London	14.75	Memoir	1933-01-09	2	2
10	Dance Dance Dance	16.25	Mystery	1988-10-18	3	3
11	The Wind-Up Bird Chronicle	18.50	Magical Realism	1994-04-12	3	3
12	The Casual Vacancy	21.00	Drama	2012-09-27	1	1
13	Brave New World	16.99	Dystopian	1932-08-30	2	2
14	Sputnik Sweetheart	14.50	Romance	1999-04-15	3	3
15	The Testaments	22.50	Dystopian	2019-09-10	2	2
16	Lord of the Rings	25.99	Fantasy	1954-07-29	1	1
17	The Hobbit	18.75	Fantasy	1937-09-21	1	1
18	Fahrenheit 451	17.25	Dystopian	1953-10-19	2	2
19	The Great Gatsby	14.00	Drama	1925-04-10	2	2
20	Hard-Boiled Wonderland and the End of the World	19.50	Magical Realism	1985-10-01	3	3
\.


--
-- TOC entry 4859 (class 0 OID 24623)
-- Dependencies: 228
-- Data for Name: login_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_logs (id, email, login_time, status) FROM stdin;
1	kittidaj.im@ksu.ac.th	2025-03-11 14:19:35.803537	online
2	kittidaj.im@ksu.ac.th	2025-03-11 14:47:53.376235	online
3	kittidaj.im@ksu.ac.th	2025-03-11 14:58:19.848892	online
4	kittidaj.im@ksu.ac.th	2025-03-12 13:14:30.109622	online
5	kittidaj.im@ksu.ac.th	2025-03-13 10:54:14.950647	online
6	jakkree@gmail.com	2025-03-13 11:06:19.395036	offline
7	jakkree@gmail.com	2025-03-13 11:06:57.940439	online
8	jakkree@gmail.com	2025-03-13 11:07:15.570239	online
9	asd@gmail.com	2025-03-16 16:51:16.241327	online
10	kittidaj.im@ksu.ac.th	2025-03-16 17:35:18.272455	online
11	asd@gmail.com	2025-03-17 11:35:37.171181	online
12	asd@gmail.com	2025-03-17 11:35:37.702177	online
13	kittidaj.im@ksu.ac.th	2025-03-19 12:00:21.592553	online
14	kittidaj.im@ksu.ac.th	2025-03-19 12:23:18.715563	online
15	kittidaj.im@ksu.ac.th	2025-03-19 12:36:01.997618	online
16	kittidaj.im@ksu.ac.th	2025-03-19 19:53:48.409047	online
17	kittidaj.im@ksu.ac.th	2025-03-23 16:06:42.934489	online
18	kittidaj.im@ksu.ac.th	2025-03-24 14:34:30.271408	online
19	kittidaj.im@ksu.ac.th	2025-03-26 16:14:15.068178	online
20	kittidaj.im@ksu.ac.th	2025-03-27 16:34:04.38534	online
21	jjjjj@gmail.com	2025-06-30 15:26:06.746613	online
22	j@gmail.com	2025-07-02 15:12:42.185906	online
23	kittidaj.im@ksu.ac.th	2025-07-15 09:53:11.883541	online
24	kittidaj.im@ksu.ac.th	2025-08-10 22:01:53.261367	online
25	kittidaj.im@ksu.ac.th	2025-08-12 17:47:41.13238	online
26	kittidaj.im@ksu.ac.th	2025-08-12 18:19:14.955847	online
27	kittidaj.im@ksu.ac.th	2025-08-13 22:03:51.838193	online
28	kittidaj.im@ksu.ac.th	2025-08-13 22:03:52.915973	offline
29	kittidaj.im@ksu.ac.th	2025-08-13 22:30:08.996029	offline
\.


--
-- TOC entry 4857 (class 0 OID 16431)
-- Dependencies: 226
-- Data for Name: member; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.member (id, name, email, password) FROM stdin;
1	kittidaj imraksak	kittidaj.im@ksu.ac.th	$2b$10$uVWjWRVBXD6zegppGt8DdOVURgZizChmoCpx3tJV/bOesatAVslbe
\.


--
-- TOC entry 4851 (class 0 OID 16397)
-- Dependencies: 220
-- Data for Name: publishers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.publishers (publisher_id, publisher_name) FROM stdin;
1	Bloomsbury
2	Secker & Warburg
3	Kodansha
\.


--
-- TOC entry 4855 (class 0 OID 16421)
-- Dependencies: 224
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, created_at) FROM stdin;
1	kittidaj	kittidaj.im@ksu.ac.th	$2b$10$7Ef26OswkWoiR5azdVqb7OiAnm1X.TmltiePgssleuIlYeJlxNDsG	2025-03-11 14:08:20.381108
2	sadsda	jakkree@gmail.com	$2b$10$7DRoZNOD/9vCYbgIzaru5egaCx1S8ovhoXO1bRok9.S4Vcvzx5aOy	2025-03-13 11:05:19.313072
3	asd	asd@gmail.com	$2b$10$bNpBeGcOSKXMc8sq.p/3tuWUJTKR3lq8qGosu.sqJrr3joPj.JZo.	2025-03-16 16:51:01.650126
4	gdfgd	fsddfsf@gmail.com	$2b$10$LWNNWj3axJ51.GmO0CN8aOAjLB5n8cjzMKWx4waSlv/fZO.MxMx.q	2025-03-19 11:59:06.770987
5	sddsd	jjjjj@gmail.com	$2b$10$fZP5ftbpFECUdnKZNkPeLuBUJozaEZdMRkH/nHoHyt6c9/PjLrqqa	2025-06-30 15:25:51.52931
6	ewewe	j@gmail.com	$2b$10$iy0nsVX0sd2hawNklj44geLw34412uWAakpMXB6NIiqgQdu.JyybW	2025-07-02 15:12:16.697471
\.


--
-- TOC entry 4861 (class 0 OID 24735)
-- Dependencies: 230
-- Data for Name: water_quality; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.water_quality (id, salinity, ph, dissolved_oxygen, nitrogen, hydrogen_sulfide, bod, temperature, recorded_at) FROM stdin;
8	16.20	8.15	6.55	0.57	0.08	2.65	29.20	2025-03-19 12:03:01.822977
9	16.30	8.20	6.60	0.58	0.09	2.70	29.30	2025-03-19 12:03:01.822977
10	15.50	7.80	6.20	0.30	0.05	2.10	28.30	2025-03-19 12:32:26.800634
11	1.00	1.00	1.00	1.00	1.00	1.00	1.00	2025-03-19 12:36:45.706221
12	99.00	99.00	99.00	99.00	99.00	99.00	99.00	2025-03-26 16:26:21.919755
13	1.00	1.00	1.00	1.00	1.00	1.00	1.00	2025-03-27 15:25:51.212612
14	30.00	9.00	2.00	0.50	0.01	30.00	35.00	2025-07-15 10:57:38.70478
15	30.00	9.00	2.00	0.50	0.01	30.00	35.00	2025-07-15 11:26:21.814703
16	300.00	90.00	20.00	0.50	0.01	300.00	350.00	2025-07-15 11:39:24.846552
\.


--
-- TOC entry 4874 (class 0 OID 0)
-- Dependencies: 217
-- Name: authors_author_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.authors_author_id_seq', 4, true);


--
-- TOC entry 4875 (class 0 OID 0)
-- Dependencies: 221
-- Name: books_book_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.books_book_id_seq', 21, true);


--
-- TOC entry 4876 (class 0 OID 0)
-- Dependencies: 227
-- Name: login_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.login_logs_id_seq', 29, true);


--
-- TOC entry 4877 (class 0 OID 0)
-- Dependencies: 225
-- Name: member_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.member_id_seq', 1, true);


--
-- TOC entry 4878 (class 0 OID 0)
-- Dependencies: 219
-- Name: publishers_publisher_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.publishers_publisher_id_seq', 3, true);


--
-- TOC entry 4879 (class 0 OID 0)
-- Dependencies: 223
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- TOC entry 4880 (class 0 OID 0)
-- Dependencies: 229
-- Name: water_quality_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.water_quality_id_seq', 16, true);


--
-- TOC entry 4685 (class 2606 OID 16395)
-- Name: authors authors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_pkey PRIMARY KEY (author_id);


--
-- TOC entry 4689 (class 2606 OID 16409)
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (book_id);


--
-- TOC entry 4697 (class 2606 OID 24630)
-- Name: login_logs login_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_logs
    ADD CONSTRAINT login_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4695 (class 2606 OID 16436)
-- Name: member member_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (id);


--
-- TOC entry 4687 (class 2606 OID 16402)
-- Name: publishers publishers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publishers
    ADD CONSTRAINT publishers_pkey PRIMARY KEY (publisher_id);


--
-- TOC entry 4691 (class 2606 OID 16429)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4693 (class 2606 OID 16427)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4699 (class 2606 OID 24741)
-- Name: water_quality water_quality_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.water_quality
    ADD CONSTRAINT water_quality_pkey PRIMARY KEY (id);


--
-- TOC entry 4702 (class 2620 OID 24742)
-- Name: water_quality limit_water_quality; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER limit_water_quality BEFORE INSERT ON public.water_quality FOR EACH ROW EXECUTE FUNCTION public.limit_water_quality_records();


--
-- TOC entry 4700 (class 2606 OID 16415)
-- Name: books books_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.authors(author_id);


--
-- TOC entry 4701 (class 2606 OID 16410)
-- Name: books books_publisher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.publishers(publisher_id);


-- Completed on 2025-08-14 02:47:11

--
-- PostgreSQL database dump complete
--

