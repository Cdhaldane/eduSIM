-- PostgreSQL database dump

-- Dumped from database version 12.3 (Debian 12.3-1.pgdg100+1)
-- Dumped by pg_dump version 12.3

-- Database setup and configuration

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

-- Database creation and ownership

-- CREATE DATABASE "simulator-db" WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.utf8' LC_CTYPE = 'en_US.utf8';
-- ALTER DATABASE "simulator-db" OWNER TO postgres;
-- \connect -reuse-previous=on "dbname='simulator-db'"

-- Extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';

-- Set default attributes

SET default_tablespace = '';
SET default_table_access_method = heap;

-- Tables

CREATE TABLE IF NOT EXISTS public.adminaccounts (
    adminid uuid NOT NULL,
    email character varying(50) NOT NULL,
    name character varying(50),
    pictur character varying(250),
    issuperadmin boolean DEFAULT true,
    followers integer DEFAULT 0,
    following character[],
    bannerPath character varying(250),
    likedSims character[],
    downloadedSims character[],
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.gameactions (
    gameactionid uuid NOT NULL,
    gameinstanceid uuid NOT NULL,
    gameplayerid uuid NOT NULL,
    gamedata json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.gameinstances (
    gameinstanceid uuid NOT NULL,
    isdefaultgame boolean,
    gameinstance_name character varying(250),
    gameinstance_photo_path character varying(250),
    game_parameters json,
    downloads integer DEFAULT 0,
    likes integer DEFAULT 0,
    createdby_adminid uuid NOT NULL,
    status character varying(250),
    invite_url character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.collaborators (
  collaboratorid uuid NOT NULL,
  adminid uuid NOT NULL,
  gameinstanceid uuid NOT NULL,
  verified boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.gamerooms (
    gameroomid uuid NOT NULL,
    gameinstanceid uuid NOT NULL,
    gameroom_name character varying(250),
    gameroom_url character varying(250),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.gameroles (
    gameroleid uuid NOT NULL,
    gameinstanceid uuid NOT NULL,
    gamerole character varying(250),
    numspots integer NOT NULL,
    roleDesc character varying(250),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.gameplayers (
    gameplayerid uuid NOT NULL,
    fname character varying(250),
    lname character varying(250),
    gameinstanceid uuid NOT NULL,
    game_room character varying(250),
    player_email character varying(250),
    gamerole character varying(250),
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp with time zone NOT NULL
);

-- Constraints

-- ALTER TABLE ONLY public.gameactions
--     ADD CONSTRAINT gameactions_pkey PRIMARY KEY (gameactionid);

-- ALTER TABLE ONLY public.gameplayers
--     ADD CONSTRAINT gameplayers_pkey PRIMARY KEY (gameplayerid);

-- PostgreSQL database dump complete
