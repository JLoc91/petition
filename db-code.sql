// SQL code

CREATE TABLE signatures (
     user_id integer not null check (user_id != ''),
     signature VARCHAR NOT NULL CHECK (signature != '')
);

CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     first VARCHAR NOT NULL CHECK (first != ''),
     last VARCHAR NOT NULL CHECK (last != ''),
     email VARCHAR NOT NULL CHECK (email != '') unique,
     password VARCHAR NOT NULL CHECK (password != '')
);