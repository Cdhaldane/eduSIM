drop table games;
drop table public.adminaccounts;
CREATE TABLE public.adminaccounts (
    adminid uuid NOT NULL,
    email character varying(50) NOT NULL,
    name character varying(50),
    picturePath varchar(250),
    issuperadmin boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);
Drop table public.gameinstances;
CREATE TABLE public.gameinstances (
    gameinstanceid uuid NOT NULL,
    is_default_game bool,
    gameinstance_name varchar(250),
    gameinstance_photo_path varchar(250),
    game_parameters json, 
    game_rooms json, -- includes the game rooms and the link to each room
    createdby_adminid uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);
