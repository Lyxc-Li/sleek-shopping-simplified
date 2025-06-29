
import React, { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { sampleProducts } from '@/data/products';
import { Product } from '@/services/products';
import { CartItem } from '@/components/Cart';
import { Star, Shield, Truck, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HomePageProps {
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
}

const HomePage = ({ cartItems, onAddToCart }: HomePageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Featured products (bestsellers and new items)
  const featuredProducts = sampleProducts.filter(p => p.isBestseller || p.isNew).slice(0, 4);
  const newProducts = sampleProducts.filter(p => p.isNew).slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <Header
        cartItemCount={cartItems.length}
        onSearchChange={setSearchQuery}
        onCategoryFilter={setSelectedCategory}
      />
      
      <Hero />

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-teal-100 text-teal-800 border-teal-200 mb-4">
              Featured Products
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Bestsellers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the products our customers love most
            </p>
          </div>
          
          <ProductGrid products={featuredProducts} onAddToCart={onAddToCart} />
          
          <div className="text-center mt-12">
            <Link to="/products">
              <Button size="lg" variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Free Shipping</h3>
                <p className="text-gray-600 text-sm">On orders over $50</p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Easy Returns</h3>
                <p className="text-gray-600 text-sm">30-day return policy</p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Secure Payment</h3>
                <p className="text-gray-600 text-sm">Your data is protected</p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Top Quality</h3>
                <p className="text-gray-600 text-sm">Premium products only</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4">
              New Arrivals
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fresh & Trending
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Check out our latest additions to the collection
            </p>
          </div>
          
          <ProductGrid products={newProducts} onAddToCart={onAddToCart} />
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-gray-300 mb-8">
              Subscribe to our newsletter for exclusive deals and new product announcements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Button className="bg-teal-600 hover:bg-teal-700 px-8 py-3">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
