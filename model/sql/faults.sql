-- Table: public.fault

-- DROP TABLE public.fault;

CREATE TABLE public.fault
(
    gid integer NOT NULL DEFAULT nextval('fault_gid_seq'::regclass),
    code character varying(254) COLLATE pg_catalog."default",
    roadid bigint,
    carriagewa bigint,
    location character varying(254) COLLATE pg_catalog."default",
    erp bigint,
    side character varying(254) COLLATE pg_catalog."default",
    "position" character varying(254) COLLATE pg_catalog."default",
    fault character varying(254) COLLATE pg_catalog."default",
    repair character varying(254) COLLATE pg_catalog."default",
    priority bigint,
    size character varying(254) COLLATE pg_catalog."default",
    length bigint,
    width bigint,
    total bigint,
    comment character varying(254) COLLATE pg_catalog."default",
    easting numeric,
    northing numeric,
    latitude numeric,
    longitude numeric,
    faulttime character varying(254) COLLATE pg_catalog."default",
    inspector character varying(254) COLLATE pg_catalog."default",
    photo character varying(254) COLLATE pg_catalog."default",
    seq bigint,
    faultid bigint,
    photoid character varying(254) COLLATE pg_catalog."default",
    field_26 character varying(254) COLLATE pg_catalog."default",
    field_27 character varying(254) COLLATE pg_catalog."default",
    field_28 character varying(254) COLLATE pg_catalog."default",
    field_29 character varying(254) COLLATE pg_catalog."default",
    field_30 character varying(254) COLLATE pg_catalog."default",
    geom geometry(Point),
    CONSTRAINT fault_pkey PRIMARY KEY (gid),
    CONSTRAINT "code_FK" FOREIGN KEY (code)
        REFERENCES public.project (code) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE public.fault
    OWNER to postgres;

-- Index: fault_geom_idx

-- DROP INDEX public.fault_geom_idx;

CREATE INDEX fault_geom_idx
    ON public.fault USING gist
    (geom)
    TABLESPACE pg_default;

-- Index: fki_code_FK

-- DROP INDEX public."fki_code_FK";

CREATE INDEX "fki_code_FK"
    ON public.fault USING btree
    (code COLLATE pg_catalog."default")
    TABLESPACE pg_default;