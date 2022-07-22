// SQL code

DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS profiles;


CREATE TABLE signatures (
     id serial primary key,
     user_id integer not null unique references users(id),
     signature VARCHAR NOT NULL CHECK (signature != ''),
     timestamp timestamp default current_timestamp
);

CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     first VARCHAR NOT NULL CHECK (first != ''),
     last VARCHAR NOT NULL CHECK (last != ''),
     email VARCHAR NOT NULL CHECK (email != '') unique,
     password VARCHAR NOT NULL CHECK (password != ''),
     timestamp timestamp default current_timestamp
);

CREATE TABLE profiles (
     id serial primary key,
     url varchar,
     city varchar,
     age integer,
     user_id integer not null unique references users(id)
);

        select first, last, age, city, url from users
        join signatures
        on users.id = signatures.user_id
        join profiles
        on users.id = profiles.user_id;



INSERT INTO users (first, last, email)
        VALUES ('lass', 'mal', 'machen')
        ON CONFLICT (id)
        DO UPDATE SET first='lass', last='mal'
        WHERE users.id=64