-- ============================================================
-- BarFlow AI — Supabase Schema + Seed
-- Paste this entire file into Supabase SQL Editor and Run
-- ============================================================

-- ── Staff ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  pin        TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'waiter',
  emoji      TEXT DEFAULT '🧑‍💼',
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Floor Tables ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS floor_tables (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number        INTEGER NOT NULL,
  capacity      INTEGER NOT NULL DEFAULT 4,
  section       TEXT NOT NULL DEFAULT 'Indoor',
  status        TEXT NOT NULL DEFAULT 'free',
  opened_at     TEXT,
  current_total DECIMAL(10,2) DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Orders ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id     UUID REFERENCES floor_tables(id) ON DELETE SET NULL,
  table_number INTEGER NOT NULL DEFAULT 0,
  destination  TEXT NOT NULL DEFAULT 'bar',
  status       TEXT NOT NULL DEFAULT 'new',
  total        DECIMAL(10,2) NOT NULL DEFAULT 0,
  items        JSONB NOT NULL DEFAULT '[]',
  staff_name   TEXT DEFAULT 'Staff',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Auto-update updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tables_updated_at
  BEFORE UPDATE ON floor_tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Disable RLS (demo mode — enable per-tenant in Phase 3) ────
ALTER TABLE staff        DISABLE ROW LEVEL SECURITY;
ALTER TABLE floor_tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders       DISABLE ROW LEVEL SECURITY;

-- ── Enable Realtime ───────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE floor_tables;

-- ── Seed: Staff ───────────────────────────────────────────────
INSERT INTO staff (name, pin, role, emoji) VALUES
  ('Owner',      '0000', 'owner',   '👑'),
  ('Alex',       '1234', 'bar',     '🍹'),
  ('Maria',      '5678', 'kitchen', '👨‍🍳'),
  ('Demo Staff', '9999', 'waiter',  '🧑‍💼');

-- ── Seed: Floor Tables (20 tables across 3 sections) ──────────
INSERT INTO floor_tables (number, capacity, section, status, opened_at, current_total) VALUES
  (1,  4, 'Indoor',  'free',     NULL,    0),
  (2,  2, 'Indoor',  'occupied', '21:00', 43.00),
  (3,  6, 'Indoor',  'occupied', '20:30', 88.00),
  (4,  4, 'Indoor',  'ordering', '20:45', 26.00),
  (5,  4, 'Indoor',  'occupied', '20:45', 66.00),
  (6,  2, 'Terrace', 'free',     NULL,    0),
  (7,  4, 'Terrace', 'free',     NULL,    0),
  (8,  6, 'Terrace', 'occupied', '21:05', 55.00),
  (9,  4, 'Terrace', 'free',     NULL,    0),
  (10, 8, 'Terrace', 'occupied', '20:30', 124.00),
  (11, 4, 'Terrace', 'free',     NULL,    0),
  (12, 6, 'Beach',   'occupied', '21:40', 44.00),
  (13, 4, 'Beach',   'occupied', '21:00', 66.00),
  (14, 4, 'Beach',   'free',     NULL,    0),
  (15, 2, 'Beach',   'free',     NULL,    0),
  (16, 6, 'Beach',   'occupied', '20:55', 93.00),
  (17, 4, 'Beach',   'free',     NULL,    0),
  (18, 8, 'Beach',   'occupied', '20:20', 180.00),
  (19, 4, 'Beach',   'occupied', '21:35', 45.00),
  (20, 6, 'Beach',   'free',     NULL,    0);

-- ── Seed: Demo Orders ─────────────────────────────────────────
-- Get table IDs dynamically
DO $$
DECLARE
  t2  UUID; t3  UUID; t4  UUID; t5  UUID;
  t8  UUID; t10 UUID; t12 UUID; t13 UUID; t16 UUID; t18 UUID;
BEGIN
  SELECT id INTO t2  FROM floor_tables WHERE number = 2;
  SELECT id INTO t3  FROM floor_tables WHERE number = 3;
  SELECT id INTO t4  FROM floor_tables WHERE number = 4;
  SELECT id INTO t5  FROM floor_tables WHERE number = 5;
  SELECT id INTO t8  FROM floor_tables WHERE number = 8;
  SELECT id INTO t10 FROM floor_tables WHERE number = 10;
  SELECT id INTO t12 FROM floor_tables WHERE number = 12;
  SELECT id INTO t13 FROM floor_tables WHERE number = 13;
  SELECT id INTO t16 FROM floor_tables WHERE number = 16;
  SELECT id INTO t18 FROM floor_tables WHERE number = 18;

  INSERT INTO orders (table_id, table_number, destination, status, total, items, created_at) VALUES
  (t2,  2,  'bar',     'in_progress', 21.00, '[{"name":"Mojito","qty":2,"price":10.00,"modifiers":[]},{"name":"Corona","qty":1,"price":5.00,"modifiers":[]}]', NOW() - INTERVAL '8 minutes'),
  (t3,  3,  'bar',     'new',         33.00, '[{"name":"Aperol Spritz","qty":2,"price":11.00,"modifiers":[]},{"name":"Hugo","qty":1,"price":11.00,"modifiers":["Extra ice"]}]', NOW() - INTERVAL '3 minutes'),
  (t4,  4,  'bar',     'new',         26.00, '[{"name":"Margarita","qty":2,"price":10.00,"modifiers":["Double"]},{"name":"Tequila Sunrise","qty":1,"price":11.00,"modifiers":[]}]', NOW() - INTERVAL '1 minute'),
  (t5,  5,  'kitchen', 'in_progress', 28.50, '[{"name":"Club Sandwich","qty":1,"price":12.00,"modifiers":[]},{"name":"Grilled Calamari","qty":1,"price":14.50,"modifiers":[]}]', NOW() - INTERVAL '12 minutes'),
  (t8,  8,  'bar',     'ready',       22.00, '[{"name":"Pina Colada","qty":2,"price":11.00,"modifiers":[]}]', NOW() - INTERVAL '18 minutes'),
  (t10, 10, 'bar',     'new',         44.00, '[{"name":"Long Island","qty":2,"price":12.00,"modifiers":["Extra rum"]},{"name":"Mojito","qty":1,"price":10.00,"modifiers":[]},{"name":"Gin Tonic","qty":1,"price":10.00,"modifiers":[]}]', NOW() - INTERVAL '2 minutes'),
  (t12, 12, 'bar',     'in_progress', 21.00, '[{"name":"Aperol Spritz","qty":1,"price":11.00,"modifiers":[]},{"name":"Hugo","qty":1,"price":11.00,"modifiers":[]}]', NOW() - INTERVAL '6 minutes'),
  (t16, 16, 'kitchen', 'new',         34.00, '[{"name":"Caesar Salad","qty":1,"price":10.00,"modifiers":[]},{"name":"Caprese","qty":1,"price":9.00,"modifiers":[]},{"name":"Bruschetta","qty":1,"price":8.00,"modifiers":[]}]', NOW() - INTERVAL '4 minutes'),
  (t18, 18, 'bar',     'new',         55.00, '[{"name":"Negroni","qty":2,"price":11.00,"modifiers":[]},{"name":"Mojito","qty":3,"price":10.00,"modifiers":[]}]', NOW() - INTERVAL '1 minute');
END $$;
