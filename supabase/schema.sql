-- ==============================================================================
-- House of Shakya — Railing Studio
-- Supabase PostgreSQL Database Schema
-- ==============================================================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  material TEXT NOT NULL,
  price_per_sqft NUMERIC NOT NULL DEFAULT 0,
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::JSONB,
  applications JSONB NOT NULL DEFAULT '[]'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ENQUIRIES / QUOTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  location TEXT NOT NULL,
  project_type TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  material TEXT NOT NULL,
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  quantity INTEGER NOT NULL DEFAULT 1,
  area NUMERIC NOT NULL DEFAULT 0,
  total_area NUMERIC NOT NULL DEFAULT 0,
  rate NUMERIC NOT NULL DEFAULT 0,
  estimated_total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'NEW',
  additional_requirements TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. STUDIO SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  company_name TEXT NOT NULL DEFAULT 'House of Shakya',
  studio_name TEXT NOT NULL DEFAULT 'Railing Studio',
  whatsapp_number TEXT NOT NULL DEFAULT '9779843935689',
  phone TEXT NOT NULL DEFAULT '+977 984-3935689',
  email TEXT NOT NULL DEFAULT 'studio@houseofshakya.com',
  address TEXT NOT NULL DEFAULT 'Imadole, Mahalaxmi, Nepal',
  currency TEXT NOT NULL DEFAULT 'NPR',
  currency_locale TEXT NOT NULL DEFAULT 'en-IN',
  instagram TEXT NOT NULL DEFAULT 'https://instagram.com/houseofshakya',
  website TEXT NOT NULL DEFAULT 'https://houseofshakya.com',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Products Policies: Public can read active products; anyone with anon key can manage (for prototype/admin)
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow all operations for products" ON public.products
  FOR ALL USING (true) WITH CHECK (true);

-- Enquiries Policies: Anyone can submit enquiries; anyone can read/update (for admin)
CREATE POLICY "Allow public to insert enquiries" ON public.enquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all operations for enquiries" ON public.enquiries
  FOR ALL USING (true) WITH CHECK (true);

-- Settings Policies: Public can read settings; anyone can update
CREATE POLICY "Public can view settings" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations for settings" ON public.settings
  FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- SEED DATA: 13 RAILING DESIGNS & STUDIO CONFIGURATION
-- ==============================================================================

INSERT INTO public.settings (id, company_name, studio_name, whatsapp_number, phone, email, address, currency, currency_locale, instagram, website)
VALUES (
  'default',
  'House of Shakya',
  'Railing Studio',
  '9779843935689',
  '+977 984-3935689',
  'studio@houseofshakya.com',
  'Imadole, Mahalaxmi, Nepal',
  'NPR',
  'en-IN',
  'https://instagram.com/houseofshakya',
  'https://houseofshakya.com'
)
ON CONFLICT (id) DO UPDATE SET
  whatsapp_number = EXCLUDED.whatsapp_number,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  updated_at = NOW();

INSERT INTO public.products (id, code, name, description, material, price_per_sqft, is_custom, image, features, applications, display_order)
VALUES
(
  'r01',
  'R-01',
  'Minimal Vertical Steel Railing',
  'Clean vertical steel railing designed for contemporary interiors and exteriors.',
  'MS / Mild Steel',
  650,
  FALSE,
  '/images/railings/r01.jpg',
  '["Evenly spaced vertical balusters", "Smooth welded joints", "Anti-rust primer + PU enamel finish", "Floor or side-mount configuration"]'::JSONB,
  '["Staircases", "Balconies", "Terraces", "Mezzanine floors"]'::JSONB,
  1
),
(
  'r02',
  'R-02',
  'Horizontal Linear Railing',
  'Continuous horizontal lines that widen a space visually and frame the view.',
  'MS / Mild Steel',
  700,
  FALSE,
  '/images/railings/r02.jpg',
  '["Continuous horizontal runner profile", "Heavy-gauge square support posts", "Concealed fastener base plates", "High-durability coat"]'::JSONB,
  '["Modern balconies", "Exterior parapets", "Rooftop lounges", "Open stairwells"]'::JSONB,
  2
),
(
  'r03',
  'R-03',
  'Modern Black Steel Railing',
  'Matte black powder-coated steel with a precise, architectural silhouette.',
  'Powder-Coated MS',
  750,
  FALSE,
  '/images/railings/r03.jpg',
  '["Architectural matte black finish", "Slim 25mm baluster profile", "Fingerprint and scratch resistant", "Precision mitered corners"]'::JSONB,
  '["Interior staircases", "Luxury residences", "Cafes & boutiques", "Office atriums"]'::JSONB,
  3
),
(
  'r04',
  'R-04',
  'Glass + Steel Railing',
  'Modern steel structure combined with clear toughened glass for a clean architectural appearance.',
  'Powder-Coated MS + Toughened Glass',
  1450,
  FALSE,
  '/images/railings/r04.jpg',
  '["10mm toughened safety glass", "Heavy-gauge steel frame with glass clamps", "Polished glass edges", "Wind-load tested construction"]'::JSONB,
  '["Front balconies", "Living room voids", "Terrace view points", "Commercial lobbies"]'::JSONB,
  4
),
(
  'r05',
  'R-05',
  'Frameless Glass Railing',
  'A frameless glass balustrade that disappears into the architecture.',
  'Toughened Glass + Aluminium/SS fittings',
  1650,
  FALSE,
  '/images/railings/r05.jpg',
  '["12mm toughened laminated glass", "Concealed base channel / spigots", "100% unobstructed visual field", "Heavy-duty anchoring hardware"]'::JSONB,
  '["Luxury balconies", "Pool perimeters", "Penthouse terraces", "Modern stair voids"]'::JSONB,
  5
),
(
  'r06',
  'R-06',
  'MS Box Section Railing',
  'Economical square-section railing with an honest, structural character.',
  'MS Box Section',
  600,
  FALSE,
  '/images/railings/r06.jpg',
  '["Hollow box section for strength-to-weight ratio", "Double-coat epoxy paint finish", "Cost-effective architectural solution", "Fast on-site fabrication"]'::JSONB,
  '["Residential stairs", "Boundary walls", "Utility areas", "Apartment corridors"]'::JSONB,
  6
),
(
  'r07',
  'R-07',
  'Stainless Steel Pipe Railing',
  'Classic corrosion-resistant stainless steel with a brushed satin texture.',
  'SS 304 / SS 202',
  950,
  FALSE,
  '/images/railings/r07.jpg',
  '["Grade 304 stainless steel option", "Brushed satin #4 finish", "Zero painting required ever", "Ideal for exposed outdoor conditions"]'::JSONB,
  '["Exterior balconies", "Hospitality walkways", "Rain-exposed areas", "Commercial buildings"]'::JSONB,
  7
),
(
  'r08',
  'R-08',
  'SS + Glass Railing',
  'Stainless steel posts paired with toughened safety glass panels.',
  'SS 304 + Toughened Glass',
  1550,
  FALSE,
  '/images/railings/r08.jpg',
  '["Grade 304 SS pillar posts", "10mm toughened glass infill", "Concealed glass grip fixtures", "Corrosion and weather immune"]'::JSONB,
  '["Modern villas", "Hotel balconies", "Shopping malls", "Premium residences"]'::JSONB,
  8
),
(
  'r09',
  'R-09',
  'Cable Wire Railing',
  'Tensioned stainless steel marine-grade cables for an ultra-light, nautical feel.',
  'MS Frame + SS 316 Cable Wire',
  1100,
  FALSE,
  '/images/railings/r09.jpg',
  '["Marine-grade SS 316 cable tensioners", "Minimal visual obstruction", "Slim steel frame structure", "Field-adjustable cable tension"]'::JSONB,
  '["Deck railings", "Hillside balconies", "Open-plan lofts", "Modern staircases"]'::JSONB,
  9
),
(
  'r10',
  'R-10',
  'Laser Cut CNC Pattern Railing',
  'Decorative laser-cut steel panels with bespoke geometric or floral patterns.',
  'MS Laser Cut Sheet + Frame',
  1250,
  FALSE,
  '/images/railings/r10.jpg',
  '["Custom CNC laser pattern library", "Precision cut 3mm-4mm steel sheet", "Structural perimeter frame", "Powder coated to any RAL shade"]'::JSONB,
  '["Feature staircases", "Main balcony facade", "Privacy screens", "Boutique hotels"]'::JSONB,
  10
),
(
  'r11',
  'R-11',
  'Industrial Mesh Railing',
  'Heavy-duty expanded metal mesh framed in dark structural steel.',
  'MS Frame + Expanded Wire Mesh',
  850,
  FALSE,
  '/images/railings/r11.jpg',
  '["Diamond/square expanded mesh panel", "Raw industrial texture", "Child-safe dense aperture", "Durable textured finish"]'::JSONB,
  '["Loft apartments", "Restaurants & bars", "Co-working spaces", "Urban residences"]'::JSONB,
  11
),
(
  'r12',
  'R-12',
  'Wood + Steel Hybrid Railing',
  'A solid hardwood top rail sitting atop a precision-welded steel sub-structure.',
  'MS Structure + Solid Wood Handrail',
  1200,
  FALSE,
  '/images/railings/r12.jpg',
  '["Solid seasoned hardwood handrail", "Matte black steel balusters", "Warm ergonomic hand feel", "Hand-rubbed natural oil/PU finish"]'::JSONB,
  '["Luxury interior stairs", "Duplex homes", "Heritage modern interiors", "Executive offices"]'::JSONB,
  12
),
(
  'r13',
  'R-13',
  'Custom Architectural Railing',
  'Tailored railing design fabricated to your architect''s exact drawing, material and finish requirements.',
  'Custom — Steel, Brass, Glass, Wood, Aluminium',
  0,
  TRUE,
  '/images/railings/r13.jpg',
  '["Architect drawing review & shop drawing prep", "Any material combination (Brass, Corten, Stainless, Timber)", "Custom finish sampling provided", "End-to-end site measurement & installation"]'::JSONB,
  '["Architect-designed projects", "Luxury residences", "Commercial landmarks", "Bespoke renovations"]'::JSONB,
  13
)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  price_per_sqft = EXCLUDED.price_per_sqft,
  is_custom = EXCLUDED.is_custom,
  image = EXCLUDED.image,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();
