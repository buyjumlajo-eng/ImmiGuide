-- Supabase Schema for Visa Guide AI

-- 1. Attorneys Table
CREATE TABLE attorneys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    firm TEXT NOT NULL,
    image TEXT,
    specialties TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    rating NUMERIC(3, 1) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    success_rate INTEGER DEFAULT 0,
    price_start INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    next_available TEXT
);

-- 2. Attorney Applications Table
CREATE TABLE attorney_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    firm_name TEXT NOT NULL,
    bar_state TEXT NOT NULL,
    bar_number TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Insert some initial mock data for attorneys
INSERT INTO attorneys (name, firm, image, specialties, languages, rating, review_count, success_rate, price_start, is_verified, next_available)
VALUES 
('Sarah Chen, Esq.', 'Chen & Associates Immigration', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200', '{"Family Visas", "RFE Response", "Consular Processing"}', '{"English", "Chinese (Mandarin)"}', 4.9, 128, 98, 250, true, 'Tomorrow, 10:00 AM'),
('Alejandro Rodriguez', 'Rodriguez Legal Group', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200', '{"Deportation Defense", "Family Visas", "Waivers"}', '{"English", "Spanish"}', 4.8, 215, 96, 200, true, 'Today, 4:00 PM'),
('Michael Ross', 'Pearson Specter Litt', 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=200&h=200', '{"Business Visas", "Employment Based"}', '{"English"}', 5.0, 85, 99, 450, true, 'Wed, 2:00 PM'),
('Layla Al-Fayed', 'Global Citizens Law', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200', '{"Asylum", "RFE Response", "Family Visas"}', '{"English", "Arabic", "French"}', 4.9, 94, 97, 300, true, 'Thu, 11:00 AM');
