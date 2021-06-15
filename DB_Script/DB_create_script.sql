--
-- PostgreSQL database dump
--

-- Dumped from database version 13.2 (Debian 13.2-1.pgdg100+1)
-- Dumped by pg_dump version 13.2 (Debian 13.2-1.pgdg100+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: simulatordb; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE simulatordb WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en_US.utf8';


ALTER DATABASE simulatordb OWNER TO postgres;

\connect simulatordb

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: adminaccounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.adminaccounts (
    adminid uuid NOT NULL,
    email character varying(50) NOT NULL,
    name character varying(50),
    picture json,
    issuperadmin boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.adminaccounts OWNER TO postgres;

--
-- Name: gameactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gameactions (
    gameactionid uuid NOT NULL,
    gameinstanceid uuid NOT NULL,
    gameplayerid uuid NOT NULL,
    gameaction json,
    createdtimestamp timestamp without time zone
);


ALTER TABLE public.gameactions OWNER TO postgres;

--
-- Name: gameinstances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gameinstances (
    gameinstanceid uuid NOT NULL,
    createdtimestamp timestamp with time zone NOT NULL,
    gamestate json,
    createdbyadminid uuid NOT NULL,
    url character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.gameinstances OWNER TO postgres;

--
-- Name: gameplayers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gameplayers (
    gameplayerid uuid NOT NULL,
    player_id uuid NOT NULL,
    gameinstanceid uuid NOT NULL,
    gamestarttimestamp timestamp without time zone,
    roleid uuid NOT NULL
);


ALTER TABLE public.gameplayers OWNER TO postgres;

--
-- Name: games; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.games (
    gameid uuid NOT NULL,
    createdbyadminid uuid NOT NULL,
    name character varying(50),
    createdtimestamp timestamp with time zone NOT NULL,
    gameroles json,
    status character varying(250),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.games OWNER TO postgres;

--
-- Data for Name: adminaccounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.adminaccounts (adminid, email, name, picture, issuperadmin, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: gameactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gameactions (gameactionid, gameinstanceid, gameplayerid, gameaction, createdtimestamp) FROM stdin;
\.


--
-- Data for Name: gameinstances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gameinstances (gameinstanceid, createdtimestamp, gamestate, createdbyadminid, url, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: gameplayers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gameplayers (gameplayerid, player_id, gameinstanceid, gamestarttimestamp, roleid) FROM stdin;
\.


--
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.games (gameid, createdbyadminid, name, createdtimestamp, gameroles, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: adminaccounts adminaccounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adminaccounts
    ADD CONSTRAINT adminaccounts_pkey PRIMARY KEY (adminid);


--
-- Name: gameactions gameactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gameactions
    ADD CONSTRAINT gameactions_pkey PRIMARY KEY (gameactionid);


--
-- Name: gameinstances gameinstances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gameinstances
    ADD CONSTRAINT gameinstances_pkey PRIMARY KEY (gameinstanceid);


--
-- Name: gameplayers gameplayers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gameplayers
    ADD CONSTRAINT gameplayers_pkey PRIMARY KEY (gameplayerid);


--
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (gameid);


--
-- PostgreSQL database dump complete
--

