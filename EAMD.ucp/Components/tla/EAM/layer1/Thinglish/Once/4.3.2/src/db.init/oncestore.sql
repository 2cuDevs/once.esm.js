--
-- PostgreSQL database dump
--

-- Dumped from database version 13.2 (Ubuntu 13.2-1.pgdg20.04+1)
-- Dumped by pg_dump version 13.2 (Ubuntu 13.2-1.pgdg20.04+1)

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
-- Name: ucp_domain_entity; Type: TABLE; Schema: public; Owner: beckstein
--

CREATE TABLE public.ucp_domain_entity (
    ior_id uuid,
    type character varying,
    version uuid NOT NULL,
    predecessor_version _uuid,
    object_ior character varying,
    object_checksum character varying,
    owner_ior character varying,
    particle json,
    "time" numeric(14,0)
);


ALTER TABLE public.ucp_domain_entity OWNER TO beckstein;

--
-- Name: ucp_domain_entity_alias; Type: TABLE; Schema: public; Owner: beckstein
--

CREATE TABLE public.ucp_domain_entity_alias (
    ior uuid,
    alias_ior character varying NOT NULL
);


ALTER TABLE public.ucp_domain_entity_alias OWNER TO beckstein;

--
-- Data for Name: ucp_domain_entity; Type: TABLE DATA; Schema: public; Owner: beckstein
--

COPY public.ucp_domain_entity (ior_id, type, version, predecessor_version, object_ior, object_checksum, owner_ior, particle, "time") FROM stdin;
\.


--
-- Data for Name: ucp_domain_entity_alias; Type: TABLE DATA; Schema: public; Owner: beckstein
--

COPY public.ucp_domain_entity_alias (ior, alias_ior) FROM stdin;
\.


--
-- Name: ucp_domain_entity_alias ucp_domain_entity_alias_pk; Type: CONSTRAINT; Schema: public; Owner: beckstein
--

ALTER TABLE ONLY public.ucp_domain_entity_alias
    ADD CONSTRAINT ucp_domain_entity_alias_pk PRIMARY KEY (alias_ior);


--
-- Name: ucp_domain_entity ucp_domain_entity_pk; Type: CONSTRAINT; Schema: public; Owner: beckstein
--

ALTER TABLE ONLY public.ucp_domain_entity
    ADD CONSTRAINT ucp_domain_entity_pk PRIMARY KEY (version);


--
-- Name: ucp_domain_entity_alias_ior_idx; Type: INDEX; Schema: public; Owner: beckstein
--

CREATE INDEX ucp_domain_entity_alias_ior_idx ON public.ucp_domain_entity_alias USING btree (ior);


--
-- Name: ucp_domain_entity_ior_idx; Type: INDEX; Schema: public; Owner: beckstein
--

CREATE INDEX ucp_domain_entity_ior_idx ON public.ucp_domain_entity USING btree (ior_id);


--
-- Name: TABLE ucp_domain_entity; Type: ACL; Schema: public; Owner: beckstein
--

GRANT SELECT,INSERT,DELETE ON TABLE public.ucp_domain_entity TO once;


--
-- Name: TABLE ucp_domain_entity_alias; Type: ACL; Schema: public; Owner: beckstein
--

GRANT SELECT,INSERT,DELETE ON TABLE public.ucp_domain_entity_alias TO once;


--
-- PostgreSQL database dump complete
--

