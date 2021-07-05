--
-- PostgreSQL database dump
--

-- Dumped from database version 12.3 (Debian 12.3-1.pgdg100+1)
-- Dumped by pg_dump version 12.3

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

CREATE DATABASE "simulator-db" WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.utf8' LC_CTYPE = 'en_US.utf8';


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
    picturepath character varying(250),
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
    is_default_game boolean,
    gameinstance_name character varying(250),
    gameinstance_photo_path character varying(250),
    game_parameters json,
    createdby_adminid uuid NOT NULL,
    invite_url character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.gameinstances OWNER TO postgres;
--
-- Name: gamerooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gamerooms (
    gameroomid uuid NOT NULL,
    gameinstanceid uuid NOT NULL,
    gameroom_name character varying(250),
    gameroom_url character varying(250),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.gamerooms OWNER TO postgres;
--
-- Name: gameroles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gameroles (
    gameroleid uuid NOT NULL,
    gameinstanceid uuid NOT NULL,
    gamerole character varying(250),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.gameroles OWNER TO postgres;

--
-- Name: gameplayers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gameplayers (
    gameplayerid uuid NOT NULL,
    gameinstanceid uuid NOT NULL,
    gameroomid uuid,
    player_email character varying(250),
    gamestarttimestamp timestamp without time zone,
    gamerole_id uuid
);


ALTER TABLE public.gameplayers OWNER TO postgres;

--
-- Name: gameactions gameactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gameactions
    ADD CONSTRAINT gameactions_pkey PRIMARY KEY (gameactionid);


--
-- Name: gameplayers gameplayers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gameplayers
    ADD CONSTRAINT gameplayers_pkey PRIMARY KEY (gameplayerid);


--
-- PostgreSQL database dump complete
--

