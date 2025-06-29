
-- Create products table with German product categories
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('boxes', 'pillows', 'invitations')),
  is_customizable BOOLEAN DEFAULT false,
  customization_fields JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table for customer accounts
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered')),
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  customization_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products (public read access)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can manage products" ON public.products FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for order items
CREATE POLICY "Users can view own order items" ON public.order_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert sample German products
INSERT INTO public.products (title, description, price, category, is_customizable, customization_fields) VALUES
('Handgefertigte Geschenkbox', 'Wunderschöne handgefertigte Box für besondere Anlässe', 24.99, 'boxes', true, '[{"name": "Farbe", "type": "select", "options": ["Rot", "Blau", "Grün", "Rosa"]}, {"name": "Personalisierter Text", "type": "text"}]'),
('Kleine Schmuckbox', 'Elegante kleine Box für Schmuck und kleine Schätze', 18.50, 'boxes', true, '[{"name": "Gravur", "type": "text"}]'),
('Personalisiertes Kissen', 'Weiches Kissen mit individuellem Aufdruck', 29.99, 'pillows', true, '[{"name": "Name", "type": "text"}, {"name": "Farbe", "type": "select", "options": ["Weiß", "Beige", "Grau", "Blau"]}]'),
('Dekokissen mit Spruch', 'Gemütliches Kissen mit inspirierendem Spruch', 24.99, 'pillows', true, '[{"name": "Spruch auswählen", "type": "select", "options": ["Zuhause ist wo die Liebe wohnt", "Träume groß", "Familie ist alles"]}]'),
('Einladung zur Einschulung', 'Liebevoll gestaltete Einladungskarte für den ersten Schultag', 12.99, 'invitations', true, '[{"name": "Kindername", "type": "text"}, {"name": "Datum", "type": "date"}, {"name": "Schule", "type": "text"}]'),
('Bunte Einschulungskarte', 'Fröhliche Karte mit bunten Motiven für die Einschulung', 14.99, 'invitations', true, '[{"name": "Kindername", "type": "text"}, {"name": "Einschulungsdatum", "type": "date"}]');
