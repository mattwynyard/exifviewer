-- Table: public.project

-- DROP TABLE public.project;

CREATE TABLE public.project
(
    code character varying(20) COLLATE pg_catalog."default" NOT NULL,
    client character varying(20) COLLATE pg_catalog."default",
    description character varying(100) COLLATE pg_catalog."default",
    date character varying(20) COLLATE pg_catalog."default",
    tacode integer,
    CONSTRAINT project_pkey PRIMARY KEY (code)
)

TABLESPACE pg_default;

ALTER TABLE public.project
    OWNER to postgres;