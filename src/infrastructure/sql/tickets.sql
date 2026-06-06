-- =============================================================================
-- PLUGIN FACTURACIÓN — Esquema SQL (Persistencia Políglota)
-- Base de datos relacional para tickets y transacciones ACID
-- Compatible con: PostgreSQL 15+ / MySQL 8+ / SQLite 3.35+
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLA: meseros
-- Referencia de personal. Separada para integridad referencial.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meseros (
  id          VARCHAR(128)  PRIMARY KEY,        -- ID espejado desde Convex Auth
  nombre      VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  activo      BOOLEAN       NOT NULL DEFAULT TRUE,
  creado_en   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- TABLA: tickets
-- Registro financiero formal de cada orden cerrada.
-- Fuente de verdad para facturación, impuestos y reportes contables.
-- Se popula vía webhook desde Convex cuando un pedido cambia a "Pagado".
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
  -- Identificador único del ticket (folio fiscal)
  id            SERIAL        PRIMARY KEY,

  -- Monto total cobrado al cliente (en pesos MXN)
  total         DECIMAL(10,2) NOT NULL CHECK (total >= 0),

  -- Referencia al mesero responsable de la orden
  id_mesero     VARCHAR(128)  NOT NULL
                REFERENCES meseros(id) ON DELETE RESTRICT,

  -- Fecha y hora en que se generó el ticket
  fecha         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- -----------------------------------------------------------------------
  -- Campos de trazabilidad NoSQL ↔ SQL (Microkernel: Plugin Facturación)
  -- -----------------------------------------------------------------------

  -- ID del pedido en Convex para rastrear el origen operativo
  convex_pedido_id  VARCHAR(128)  NOT NULL UNIQUE,

  -- Mesa que originó el ticket
  numero_mesa       INTEGER       NOT NULL CHECK (numero_mesa > 0),

  -- Subtotal antes de impuestos
  subtotal          DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),

  -- IVA aplicado (16% en México)
  iva               DECIMAL(10,2) NOT NULL CHECK (iva >= 0),

  -- Método de pago registrado por el mesero
  metodo_pago       VARCHAR(30)   NOT NULL DEFAULT 'efectivo'
                    CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia')),

  -- Estado de sincronización con Convex
  sync_status       VARCHAR(10)   NOT NULL DEFAULT 'synced'
                    CHECK (sync_status IN ('synced', 'error'))
);

-- -----------------------------------------------------------------------------
-- TABLA: detalle_ticket
-- Items individuales del ticket (persistencia ACID para auditoría fiscal)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS detalle_ticket (
  id                SERIAL        PRIMARY KEY,
  ticket_id         INTEGER       NOT NULL
                    REFERENCES tickets(id) ON DELETE CASCADE,
  nombre_platillo   VARCHAR(150)  NOT NULL,
  cantidad          INTEGER       NOT NULL CHECK (cantidad > 0),
  precio_unitario   DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
  subtotal_item     DECIMAL(10,2) NOT NULL GENERATED ALWAYS AS
                    (cantidad * precio_unitario) STORED
);

-- -----------------------------------------------------------------------------
-- ÍNDICES para consultas de reportes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tickets_fecha
  ON tickets (fecha DESC);

CREATE INDEX IF NOT EXISTS idx_tickets_mesero
  ON tickets (id_mesero);

CREATE INDEX IF NOT EXISTS idx_tickets_convex_pedido
  ON tickets (convex_pedido_id);

CREATE INDEX IF NOT EXISTS idx_detalle_ticket
  ON detalle_ticket (ticket_id);

-- -----------------------------------------------------------------------------
-- VISTA: resumen_diario
-- Agrega totales por día y mesero para los reportes del Administrador
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW resumen_diario AS
SELECT
  DATE(fecha)                     AS dia,
  id_mesero,
  COUNT(*)                        AS total_tickets,
  SUM(subtotal)                   AS suma_subtotales,
  SUM(iva)                        AS suma_iva,
  SUM(total)                      AS suma_total
FROM tickets
GROUP BY DATE(fecha), id_mesero
ORDER BY dia DESC;
