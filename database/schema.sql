-- ============================================================
-- SIGETRAD - Esquema de Base de Datos MySQL 8.0
-- Transportes y Servicios Dannas, S.A.
-- Carga Pesada y Granel (Puerto Barrios & Puerto Quetzal)
-- ============================================================

CREATE DATABASE IF NOT EXISTS sigetrad_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sigetrad_db;

-- 1. Tabla de Usuarios & Roles (RBAC)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('ADMIN', 'SUPERVISOR', 'OPERADOR', 'PILOTO') NOT NULL DEFAULT 'OPERADOR',
  cargo VARCHAR(100) NOT NULL,
  telefono VARCHAR(30) DEFAULT '',
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Clientes & Retenedores SAT
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(30) UNIQUE NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  nit VARCHAR(30) NOT NULL,
  direccion VARCHAR(255) DEFAULT '',
  telefono VARCHAR(50) DEFAULT '',
  correo VARCHAR(100) DEFAULT '',
  es_agente_retenedor BOOLEAN DEFAULT TRUE,
  buques_habituales TEXT,
  contacto_principal VARCHAR(150) DEFAULT '',
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Pilotos / Operadores
CREATE TABLE IF NOT EXISTS pilotos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(150) NOT NULL,
  dpi VARCHAR(30) UNIQUE NOT NULL,
  licencia VARCHAR(30) NOT NULL,
  telefono VARCHAR(50) DEFAULT '',
  tipo_licencia VARCHAR(10) DEFAULT 'A',
  vencimiento_licencia DATE,
  estado VARCHAR(30) DEFAULT 'Disponible',
  tarifa_viaje DECIMAL(10,2) DEFAULT 350.00,
  gondola_habitual VARCHAR(20) DEFAULT '',
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Flota de Góndolas & Hermanos Dannas
CREATE TABLE IF NOT EXISTS gondolas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  placa VARCHAR(20) UNIQUE NOT NULL,
  propietario VARCHAR(50) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'Triaxial Volteo',
  capacidad_toneladas DECIMAL(8,2) DEFAULT 38.00,
  estado VARCHAR(30) DEFAULT 'Disponible',
  kilometraje_actual INT DEFAULT 120000,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Operaciones de Viajes & Básculas Portuarias
CREATE TABLE IF NOT EXISTS viajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_viaje VARCHAR(40) UNIQUE NOT NULL,
  cliente_id VARCHAR(50) NOT NULL,
  cliente_nombre VARCHAR(150) NOT NULL,
  buque_nombre VARCHAR(80) NOT NULL,
  categoria_movimiento VARCHAR(80) NOT NULL,
  material VARCHAR(80) NOT NULL,
  gondola_id VARCHAR(50) NOT NULL,
  placa VARCHAR(30) NOT NULL,
  piloto_id VARCHAR(50) NOT NULL,
  piloto_nombre VARCHAR(150) NOT NULL,
  origen VARCHAR(100) NOT NULL,
  destino VARCHAR(100) NOT NULL,
  fecha_salida VARCHAR(50) NOT NULL,
  fecha_llegada VARCHAR(50),
  estado VARCHAR(30) DEFAULT 'En Curso',
  peso_bruto_puerto DECIMAL(10,2) DEFAULT 0.00,
  tara_puerto DECIMAL(10,2) DEFAULT 0.00,
  peso_neto_puerto DECIMAL(10,2) DEFAULT 0.00,
  ticket_puerto VARCHAR(50),
  peso_bruto_destino DECIMAL(10,2) DEFAULT 0.00,
  tara_destino DECIMAL(10,2) DEFAULT 0.00,
  peso_neto_destino DECIMAL(10,2) DEFAULT 0.00,
  ticket_destino VARCHAR(50),
  tarifa_acordada DECIMAL(10,2) DEFAULT 0.00,
  factura_id VARCHAR(50),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Facturación y Retenciones Fiscales
CREATE TABLE IF NOT EXISTS facturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_factura VARCHAR(50) UNIQUE NOT NULL,
  cliente_id VARCHAR(50) NOT NULL,
  cliente_nombre VARCHAR(150) NOT NULL,
  nit_cliente VARCHAR(30) NOT NULL,
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  buque_proyecto VARCHAR(100) NOT NULL,
  material VARCHAR(100) NOT NULL,
  cantidad_viajes INT NOT NULL DEFAULT 1,
  monto_bruto DECIMAL(12,2) NOT NULL,
  es_agente_retenedor BOOLEAN DEFAULT TRUE,
  retencion_isr_estimada DECIMAL(12,2) DEFAULT 0.00,
  retencion_iva_estimada DECIMAL(12,2) DEFAULT 0.00,
  neto_esperado DECIMAL(12,2) NOT NULL,
  estado_pago VARCHAR(30) DEFAULT 'Emitida',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de Pagos Bancarios y Conciliación 3 Hermanos
CREATE TABLE IF NOT EXISTS pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  factura_id VARCHAR(50) NOT NULL,
  numero_factura VARCHAR(50) NOT NULL,
  cliente_nombre VARCHAR(150) NOT NULL,
  fecha_deposito DATE NOT NULL,
  banco_destino VARCHAR(80) NOT NULL,
  numero_cuenta VARCHAR(60) NOT NULL,
  titular_cuenta VARCHAR(100) NOT NULL,
  monto_bruto_factura DECIMAL(12,2) NOT NULL,
  retencion_isr_aplicada DECIMAL(12,2) DEFAULT 0.00,
  retencion_iva_aplicada DECIMAL(12,2) DEFAULT 0.00,
  monto_neto_depositado DECIMAL(12,2) NOT NULL,
  numero_transferencia VARCHAR(60) NOT NULL,
  numero_constancia_sat VARCHAR(60),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabla de Despachos de Combustible
CREATE TABLE IF NOT EXISTS combustible (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  gondola_placa VARCHAR(30) NOT NULL,
  piloto_nombre VARCHAR(150) NOT NULL,
  tipo_movimiento VARCHAR(80) NOT NULL,
  galones DECIMAL(8,2) NOT NULL,
  precio_por_galon DECIMAL(8,2) NOT NULL,
  total_gasto DECIMAL(10,2) NOT NULL,
  estacion_servicio VARCHAR(100) NOT NULL,
  numero_vale VARCHAR(50) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DATOS INICIALES (SEMILLAS REALISTAS PARA GUATEMALA)
-- ============================================================

INSERT IGNORE INTO usuarios (id, nombre, username, email, password, rol, cargo) VALUES
(1, 'Jairo Dannas', 'jairo.dannas', 'jairo.dannas@dannas.com', 'admin', 'ADMIN', 'Gerente General y Propietario');

INSERT IGNORE INTO clientes (codigo, nombre, nit, direccion, telefono, correo, es_agente_retenedor, buques_habituales) VALUES
('CLI-001', 'Ingenio Pantaleón S.A.', '1234567-8', 'Escuintla, Guatemala', '+502 7889-0000', 'contacto@pantaleon.gt', 1, 'Sofía, Sakura, Barrios'),
('CLI-002', 'Cales y Agregados del Atlántico, S.A.', '9876543-2', 'Puerto Barrios, Izabal', '+502 7948-1234', 'logistica@calesatlantico.com', 1, 'Sakura, Carbón, Clinkers'),
('CLI-003', 'Almacenadora Portuaria del Sur, S.A.', '4567890-1', 'Puerto Quetzal, Escuintla', '+502 7881-5555', 'operaciones@almaport.com', 0, 'Sofía, Mi Guate, Palo Gordo');
