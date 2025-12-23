-- Ajenda Meal Navigator - Initial Schema

-- Phases table
CREATE TABLE IF NOT EXISTS phases (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  description TEXT
);

-- Insert default phases
INSERT INTO phases (id, name, display_order, description) VALUES
  ('phase-1', 'Phase 1', 1, 'Reset & Pseudo Fast - Autophagy focused'),
  ('phase-2', 'Phase 2', 2, 'Building Phase'),
  ('phase-3', 'Phase 3', 3, 'Advanced Phase'),
  ('bonus', 'Bonus', 4, 'Bonus Weeks'),
  ('m7', 'Month 7', 5, 'Month 7 - Maintenance'),
  ('m8', 'Month 8', 6, 'Month 8 - Mix & Match'),
  ('m9', 'Month 9', 7, 'Month 9 - Mix & Match'),
  ('m10', 'Month 10', 8, 'Month 10 - Mix & Match');

-- Weekly PDFs table
CREATE TABLE IF NOT EXISTS weekly_pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id TEXT NOT NULL REFERENCES phases(id),
  week_number INTEGER NOT NULL,
  pdf_storage_path TEXT NOT NULL,
  pdf_url TEXT,
  total_pages INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(phase_id, week_number)
);

-- Meal type enum
DO $$ BEGIN
  CREATE TYPE meal_type AS ENUM (
    'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Party'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Plan type enum
DO $$ BEGIN
  CREATE TYPE plan_type AS ENUM (
    'Autophagy', 'Liquid-Only', 'Wt. Adj. Avail.', 'Serves 12', 'Special Exception'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Main meals table
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_type meal_type NOT NULL,
  name TEXT NOT NULL,
  phase_id TEXT NOT NULL REFERENCES phases(id),
  week INTEGER NOT NULL,
  day TEXT NOT NULL,
  page INTEGER NOT NULL,
  calories INTEGER,
  protein_g INTEGER,
  fiber_g INTEGER,
  plan_type plan_type,
  other_meal_plans TEXT,
  recipe_text TEXT,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  normalized_name TEXT NOT NULL,
  category TEXT,
  search_vector TSVECTOR
);

-- Junction table for meal ingredients
CREATE TABLE IF NOT EXISTS meal_ingredients (
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity TEXT,
  PRIMARY KEY (meal_id, ingredient_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS meals_search_idx ON meals USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS ingredients_search_idx ON ingredients USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS meals_phase_idx ON meals(phase_id);
CREATE INDEX IF NOT EXISTS meals_type_idx ON meals(meal_type);
CREATE INDEX IF NOT EXISTS meals_plan_type_idx ON meals(plan_type);
CREATE INDEX IF NOT EXISTS meals_calories_idx ON meals(calories);
CREATE INDEX IF NOT EXISTS meals_protein_idx ON meals(protein_g);
CREATE INDEX IF NOT EXISTS meals_fiber_idx ON meals(fiber_g);
CREATE INDEX IF NOT EXISTS ingredients_normalized_idx ON ingredients(normalized_name);

-- Function to update meal search vector
CREATE OR REPLACE FUNCTION update_meal_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.recipe_text, '')), 'B');
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for meal search vector
DROP TRIGGER IF EXISTS meals_search_vector_update ON meals;
CREATE TRIGGER meals_search_vector_update
  BEFORE INSERT OR UPDATE ON meals
  FOR EACH ROW EXECUTE FUNCTION update_meal_search_vector();

-- Function to update ingredient search vector
CREATE OR REPLACE FUNCTION update_ingredient_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.name, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ingredient search vector
DROP TRIGGER IF EXISTS ingredients_search_vector_update ON ingredients;
CREATE TRIGGER ingredients_search_vector_update
  BEFORE INSERT OR UPDATE ON ingredients
  FOR EACH ROW EXECUTE FUNCTION update_ingredient_search_vector();

-- Row Level Security (public read access)
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_ingredients ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read access for phases" ON phases FOR SELECT USING (true);
CREATE POLICY "Public read access for weekly_pdfs" ON weekly_pdfs FOR SELECT USING (true);
CREATE POLICY "Public read access for meals" ON meals FOR SELECT USING (true);
CREATE POLICY "Public read access for ingredients" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Public read access for meal_ingredients" ON meal_ingredients FOR SELECT USING (true);
