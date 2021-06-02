CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--change the name of the table from game to games
ALTER TABLE game RENAME TO games;

-- change the data type of uuid columns in every table to be auto-generateable 
ALTER TABLE games ALTER COLUMN gameid SET DATA TYPE UUID USING (uuid_generate_v4());
ALTER TABLE adminaccounts ALTER COLUMN adminid SET DATA TYPE UUID USING (uuid_generate_v4());
ALTER TABLE gameactions ALTER COLUMN gameactionid SET DATA TYPE UUID USING (uuid_generate_v4());
ALTER TABLE gameinstances ALTER COLUMN gameid SET DATA TYPE UUID USING (uuid_generate_v4());
ALTER TABLE gameinstances RENAME COLUMN gameid TO gameinstanceid;
ALTER TABLE gameplayers ALTER COLUMN gameplayerid SET DATA TYPE UUID USING (uuid_generate_v4());
