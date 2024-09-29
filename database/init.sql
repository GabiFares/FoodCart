CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Crear tabla de telefono sin la clave foránea al usuario inicialmente
create table if not exists telefono (
    id serial primary key,
    numeroTel varchar(20) not null
);

-- Crear tabla de direccion sin la clave foránea al usuario inicialmente
create table if not exists direccion (
    id serial primary key,
    numero varchar(10) not null,
    calle varchar(20) not null,
    apto varchar(5) not null
);

-- Crear la tabla usuario que hará referencia a direccion y telefono más adelante
create table if not exists usuario (
    id serial primary key,
    nombre varchar(20) not null,
    apellido varchar(20) not null,
    email varchar(50) not null unique,
    id_direccion integer not null,
    id_telefono integer not null,
    contraseña varchar(225) not null
);

-- Alterar tabla usuario para añadir claves foráneas a direccion y telefono
alter table usuario 
    ADD CONSTRAINT fk_telefono FOREIGN KEY (id_telefono) REFERENCES telefono(id),
    ADD CONSTRAINT fk_direccion FOREIGN KEY (id_direccion) REFERENCES direccion(id);

-- Ahora que usuario existe, podemos añadir la clave foránea de id_usuario en direccion y telefono
alter table telefono ADD COLUMN id_usuario integer;
alter table direccion ADD COLUMN id_usuario integer;

alter table telefono 
    ADD CONSTRAINT fk_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id);

alter table direccion 
    ADD CONSTRAINT fk_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id);
