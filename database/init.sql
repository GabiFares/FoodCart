-- Crear la extensión pgcrypto para la encriptación de contraseñas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Crear tabla de telefono sin la clave foránea al usuario inicialmente
CREATE TABLE IF NOT EXISTS telefono (
    id SERIAL PRIMARY KEY,
    numeroTel VARCHAR(20) NOT NULL
);

-- Crear tabla de direccion sin la clave foránea al usuario inicialmente
CREATE TABLE IF NOT EXISTS direccion (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(10) NOT NULL,
    calle VARCHAR(20) NOT NULL,
    apto VARCHAR(5) NULL
);

-- Crear la tabla local con claves foráneas a las tablas telefono y direccion
CREATE TABLE IF NOT EXISTS local (
    id_local SERIAL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    id_telefono INTEGER NOT NULL,
    id_direccion INTEGER NOT NULL,
    foto BOOLEAN NULL,
    CONSTRAINT fk_telefono FOREIGN KEY (id_telefono) REFERENCES telefono (id) ON DELETE CASCADE,
    CONSTRAINT fk_direccion FOREIGN KEY (id_direccion) REFERENCES direccion (id) ON DELETE CASCADE
);

-- Crear la tabla usuario que hará referencia a direccion y telefono más adelante
CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    apellido VARCHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    id_direccion INTEGER NOT NULL,
    id_telefono INTEGER NOT NULL,
    contraseña VARCHAR(225) NOT NULL,
    foto BOOLEAN NULL,
    admin BOOLEAN NOT NULL DEFAULT FALSE,
    repartidor BOOLEAN NOT NULL DEFAULT FALSE
);

-- Crear tabla usuarios_direcciones para manejar la relación entre usuarios y direcciones
CREATE TABLE IF NOT EXISTS usuarios_direcciones (
    id_usuario INT,
    CONSTRAINT fk_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id) ON DELETE CASCADE,
    id_direccion INT,
    CONSTRAINT fk_direccion FOREIGN KEY (id_direccion) REFERENCES direccion (id) ON DELETE CASCADE
);

-- Alterar tabla usuario para añadir claves foráneas a direccion y telefono
ALTER TABLE usuario 
    ADD CONSTRAINT fk_telefono FOREIGN KEY (id_telefono) REFERENCES telefono (id),
    ADD CONSTRAINT fk_direccion FOREIGN KEY (id_direccion) REFERENCES direccion (id);

-- Crear la tabla categoria con una restricción CHECK para los valores posibles
CREATE TABLE IF NOT EXISTS categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(15) CHECK (nombre IN ('BEBIDA', 'COMIDA', 'ACOMPAÑAMIENTO'))
);

-- Crear la tabla producto con claves foráneas a categoria y restricciones adicionales
CREATE TABLE IF NOT EXISTS producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(300) NOT NULL,
    precio_unidad NUMERIC(10,2) NOT NULL,
    id_categoria INTEGER NOT NULL,
    foto BOOLEAN NULL, 
    CONSTRAINT fk_categoria FOREIGN KEY (id_categoria) 
        REFERENCES categoria (id_categoria) ON DELETE RESTRICT,
    CONSTRAINT precio_positivo CHECK (precio_unidad > 0)
); 

-- Crear la tabla pedido con claves foráneas a local y usuario
CREATE TABLE IF NOT EXISTS pedido (
    id_pedido SERIAL PRIMARY KEY,
    fecha_hora TIMESTAMP DEFAULT current_timestamp,
    estado VARCHAR(15) CHECK (estado IN ('PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO')),
    importe_total NUMERIC(10,2) CHECK (importe_total >= 0),
    id_local INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    id_direccion INTEGER NOT NULL,
    CONSTRAINT fk_local FOREIGN KEY (id_local) 
        REFERENCES local (id_local) ON DELETE RESTRICT,
    CONSTRAINT fk_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT fk_direccion FOREIGN KEY (id_direccion) 
        REFERENCES direccion (id) ON DELETE RESTRICT
);

-- Crear la tabla detalle_pedido con claves foráneas a pedido y producto
CREATE TABLE IF NOT EXISTS detalle_pedido (
    cantidad INTEGER NOT NULL, 
    indicaciones VARCHAR(200) NULL, 
    id_pedido INTEGER NOT NULL, 
    id_producto INTEGER NOT NULL, 
    CONSTRAINT fk_pedido FOREIGN KEY (id_pedido) 
        REFERENCES pedido (id_pedido) ON DELETE RESTRICT,
    CONSTRAINT fk_producto FOREIGN KEY (id_producto) 
        REFERENCES producto (id_producto) ON DELETE RESTRICT
);

-- Insertar datos iniciales en las tablas telefono y direccion
INSERT INTO telefono (numeroTel) VALUES('099482111');
INSERT INTO telefono (numeroTel) VALUES('47325467');
INSERT INTO direccion (numero, calle) VALUES('123', 'Calle');
INSERT INTO direccion (numero, calle) VALUES('1251', 'Artigas');
 

-- Insertar un usuario administrador
INSERT INTO usuario (nombre, apellido, email, id_direccion, id_telefono, contraseña) 
VALUES('ad', 'min', 'admin@example.com', 1, 1, crypt('Contraseña123!', gen_salt('bf')));
UPDATE usuario SET admin = TRUE WHERE id = 1;

INSERT INTO usuario (nombre, apellido, email, id_direccion, id_telefono, contraseña) 
VALUES('Repar', 'Tidor', 'repartidor@example.com', 1, 1, crypt('Contraseña123!', gen_salt('bf')));
UPDATE usuario SET repartidor = TRUE WHERE id = 2;

INSERT INTO usuarios_direcciones (id_usuario,id_direccion) VALUES (1,1);
INSERT INTO usuarios_direcciones (id_usuario,id_direccion) VALUES (2,2);
-- Insertar categorías iniciales
INSERT INTO categoria (nombre) VALUES('COMIDA');
INSERT INTO categoria (nombre) VALUES('BEBIDA');
INSERT INTO categoria (nombre) VALUES('ACOMPAÑAMIENTO');

-- Insertar productos iniciales
INSERT INTO producto (nombre, descripcion, precio_unidad, id_categoria, foto) 
VALUES
('Hamburguesa Clásica', 'Hamburguesa con carne de res, lechuga, tomate y queso cheddar', 350, 1, true),
('Hamburguesa BBQ', 'Hamburguesa con carne de res, salsa BBQ, cebolla crujiente y queso suizo', 300, 1, true),
('Pancho', 'Frankfurter en pan con mostaza y ketchup', 200, 1, true),
('Pancho con Queso', 'Frankfurter con queso derretido y jalapeños', 220, 1, true),
('Hamburguesa Doble', 'Hamburguesa doble carne con queso y bacon', 400, 1, true),
('Hamburguesa Vegetariana', 'Hamburguesa con hamburguesa de lentejas y verduras frescas', 450, 1, true),
('Coca-cola', 'Coca de 500ml', 70, 2, true),
('Agua Mineral', 'Botella de agua mineral de 500ml', 50, 2, true),
('Jugo de Naranja', 'Jugo de naranja CAPUTTO 500 cc', 55, 2, true),
('Pepsi', 'Refresco Pepsi Original 500ml', 70, 2, true),
('Fanta', 'Refresco Fanta Naranja 500ml', 70, 2, true),
('Paso de los Toros', 'Refresco Paso de los Toros Pomelo 500ml', 65, 2, true),
('Monster Energy Original', 'Energizante Monster Original Green 473 ML', 100, 2, true),
('Monster Energy Ultra', 'Energizante Monster Ultra Lata 473 ml', 105, 2, true),
('Papas Fritas', 'Porción de papas fritas', 120, 3, true),
('Aros de Cebolla', 'Porción de aros de cebolla', 120, 3, true),
('Nuggets de Pollo', 'Porción de nuggets de pollo', 115, 3, true);

-- Insertar datos adicionales en las tablas telefono y direccion
INSERT INTO telefono (numeroTel) VALUES('098777234');
INSERT INTO direccion (numero, calle) VALUES('450', 'Brasil');

-- Insertar un local
INSERT INTO local (nombre, id_telefono, id_direccion) VALUES('Barsito', 2, 2);

-- Insertar pedidos y detalles de pedidos
INSERT INTO pedido (estado, importe_total, id_local, id_usuario,id_direccion) VALUES('CONFIRMADO', 200, 1, 1,1);
INSERT INTO detalle_pedido (cantidad, indicaciones, id_pedido, id_producto) VALUES(1, 'Sin mostaza el pancho', 1, 3);

INSERT INTO pedido (estado, importe_total, id_local, id_usuario, id_direccion) VALUES('CONFIRMADO', 220, 1, 1,1);
INSERT INTO detalle_pedido (cantidad, indicaciones, id_pedido, id_producto) VALUES(1, 'Sin pan, sin mostaza, sin pancho', 2, 4);
INSERT INTO detalle_pedido (cantidad, indicaciones, id_pedido, id_producto) VALUES(2, 'Sin pan, sin mostaza, con pancho', 2, 3);
