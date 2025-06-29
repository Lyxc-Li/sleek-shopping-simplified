
import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { sampleProducts } from '@/data/products';
import { Product } from '@/components/ProductCard';
import { CartItem } from '@/components/Cart';
import { Filter } from 'lucide-react';

interface ProductsPageProps {
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
}

const ProductsPage = ({ cartItems, onAddToCart }: ProductsPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  const categories = Array.from(new Set(sampleProducts.map(p => p.category)));

  const filteredProducts = useMemo(() => {
    let filtered = sampleProducts.filter(product => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter (from header dropdown)
      const matchesHeaderCategory = !selectedCategory || product.category === selectedCategory;
      
      // Category filter (from sidebar checkboxes)
      const matchesSidebarCategories = selectedCategories.length === 0 || 
                                     selectedCategories.includes(product.category);
      
      // Price filter
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      // Stock filter
      const matchesStock = !showInStockOnly || product.inStock;
      
      return matchesSearch && matchesHeaderCategory && matchesSidebarCategories && 
             matchesPrice && matchesStock;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedCategories, priceRange, showInStockOnly, sortBy]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, category]);
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartItemCount={cartItems.length}
        onSearchChange={setSearchQuery}
        onCategoryFilter={setSelectedCategory}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Active Filters */}
                {(selectedCategory || selectedCategories.length > 0) && (
                  <div>
                    <h4 className="font-medium mb-2">Active Filters</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategory && (
                        <Badge 
                          variant="secondary" 
                          className="cursor-pointer"
                          onClick={() => setSelectedCategory('')}
                        >
                          {selectedCategory} ×
                        </Badge>
                      )}
                      {selectedCategories.map(category => (
                        <Badge 
                          key={category}
                          variant="secondary" 
                          className="cursor-pointer"
                          onClick={() => handleCategoryChange(category, false)}
                        >
                          {category} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories */}
                <div>
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => 
                            handleCategoryChange(category, checked as boolean)
                          }
                        />
                        <label htmlFor={category} className="text-sm cursor-pointer">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={1000}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Stock Filter */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    checked={showInStockOnly}
                    onCheckedChange={setShowInStockOnly}
                  />
                  <label htmlFor="inStock" className="text-sm cursor-pointer">
                    In stock only
                  </label>
                </div>

                {/* Clear Filters */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedCategories([]);
                    setPriceRange([0, 1000]);
                    setShowInStockOnly(false);
                    setSearchQuery('');
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Products */}
          <div className="lg:w-3/4">
            {/* Sort and Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {sampleProducts.length} products
              </p>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            <ProductGrid products={filteredProducts} onAddToCart={onAddToCart} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
