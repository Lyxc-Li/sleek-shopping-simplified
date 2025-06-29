
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type DatabaseProduct = Database['public']['Tables']['products']['Row'];

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  description?: string;
  isCustomizable?: boolean;
  customizationFields?: any[];
}

// Map database product to frontend Product interface
export const mapDatabaseProductToProduct = (dbProduct: DatabaseProduct): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.title,
    price: Number(dbProduct.price),
    image: dbProduct.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    category: dbProduct.category === 'boxes' ? 'Boxen' : 
              dbProduct.category === 'pillows' ? 'Kissen' : 
              dbProduct.category === 'invitations' ? 'Einladungen' : dbProduct.category,
    rating: 4.5, // Default rating - you can add this to the database later
    reviewCount: Math.floor(Math.random() * 200) + 50, // Random review count for now
    inStock: true,
    isNew: new Date(dbProduct.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000,
    isBestseller: Math.random() > 0.7,
    description: dbProduct.description || '',
    isCustomizable: dbProduct.is_customizable || false,
    customizationFields: Array.isArray(dbProduct.customization_fields) ? dbProduct.customization_fields : []
  };
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return data.map(mapDatabaseProductToProduct);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return mapDatabaseProductToProduct(data);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
};
