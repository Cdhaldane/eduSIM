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
-- Name: simulator-db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE "simulator-db" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en_US.utf8';


ALTER DATABASE "simulator-db" OWNER TO postgres;

\connect -reuse-previous=on "dbname='simulator-db'"

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: adminaccounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.adminaccounts (
    adminid uuid NOT NULL,
    email character varying(50),
    name character varying(50),
    createdtimestamp timestamp without time zone,
    issuperadmin boolean
);


ALTER TABLE public.adminaccounts OWNER TO postgres;

--
-- Name: game; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game (
    gameid uuid NOT NULL,
    createdbyadminid uuid NOT NULL,
    name character varying(50),
    createdtimestamp timestamp without time zone,
    gameroles json
);


ALTER TABLE public.game OWNER TO postgres;

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
    gameid uuid NOT NULL,
    createdtimestamp timestamp without time zone,
    gamestate json,
    createdbyadminid uuid NOT NULL,
    url character varying
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
-- Data for Name: adminaccounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.adminaccounts (adminid, email, name, createdtimestamp, issuperadmin) FROM stdin;
\.


--
-- Data for Name: game; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game (gameid, createdbyadminid, name, createdtimestamp, gameroles) FROM stdin;
\.


--
-- Data for Name: gameactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gameactions (gameactionid, gameinstanceid, gameplayerid, gameaction, createdtimestamp) FROM stdin;
\.


--
-- Data for Name: gameinstances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gameinstances (gameid, createdtimestamp, gamestate, createdbyadminid, url) FROM stdin;
\.


--
-- Data for Name: gameplayers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gameplayers (gameplayerid, player_id, gameinstanceid, gamestarttimestamp, roleid) FROM stdin;
\.


--
-- Name: adminaccounts adminaccounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adminaccounts
    ADD CONSTRAINT adminaccounts_pkey PRIMARY KEY (adminid);


--
-- Name: game game_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game
    ADD CONSTRAINT game_pkey PRIMARY KEY (gameid);


--
-- Name: gameactions gameactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gameactions
    ADD CONSTRAINT gameactions_pkey PRIMARY KEY (gameactionid);


--
-- Name: gameinstances gameinstances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gameinstances
    ADD CONSTRAINT gameinstances_pkey PRIMARY KEY (gameid);


--
-- Name: gameplayers gameplayers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gameplayers
    ADD CONSTRAINT gameplayers_pkey PRIMARY KEY (gameplayerid);


--
-- PostgreSQL database dump complete
--

