
import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/services/products';
import { CartItem } from '@/components/Cart';
import { Filter, Loader2 } from 'lucide-react';

interface ProductsPageProps {
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
}

const ProductsPage = ({ cartItems, onAddToCart }: ProductsPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  const { data: products = [], isLoading, error } = useProducts();

  const categories = ['Boxen', 'Kissen', 'Einladungen'];

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
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
  }, [products, searchQuery, selectedCategory, selectedCategories, priceRange, showInStockOnly, sortBy]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, category]);
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    }
  };

  // Calculate max price for slider
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 100;
    return Math.ceil(Math.max(...products.map(p => p.price)) / 10) * 10;
  }, [products]);

  // Update price range when products load
  React.useEffect(() => {
    if (products.length > 0 && priceRange[1] === 100) {
      setPriceRange([0, maxPrice]);
    }
  }, [products, maxPrice, priceRange]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          cartItemCount={cartItems.length}
          onSearchChange={setSearchQuery}
          onCategoryFilter={setSelectedCategory}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-600" />
              <p className="text-gray-600">Produkte werden geladen...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          cartItemCount={cartItems.length}
          onSearchChange={setSearchQuery}
          onCategoryFilter={setSelectedCategory}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Fehler beim Laden der Produkte</p>
              <Button onClick={() => window.location.reload()}>
                Erneut versuchen
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  Filter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Active Filters */}
                {(selectedCategory || selectedCategories.length > 0) && (
                  <div>
                    <h4 className="font-medium mb-2">Aktive Filter</h4>
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
                  <h4 className="font-medium mb-3">Kategorien</h4>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => 
                            handleCategoryChange(category, checked === true)
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
                  <h4 className="font-medium mb-3">Preisbereich</h4>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={maxPrice}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{priceRange[0]}€</span>
                      <span>{priceRange[1]}€</span>
                    </div>
                  </div>
                </div>

                {/* Stock Filter */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    checked={showInStockOnly}
                    onCheckedChange={(checked) => setShowInStockOnly(checked === true)}
                  />
                  <label htmlFor="inStock" className="text-sm cursor-pointer">
                    Nur verfügbare Artikel
                  </label>
                </div>

                {/* Clear Filters */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedCategories([]);
                    setPriceRange([0, maxPrice]);
                    setShowInStockOnly(false);
                    setSearchQuery('');
                  }}
                >
                  Alle Filter löschen
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Products */}
          <div className="lg:w-3/4">
            {/* Sort and Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <p className="text-gray-600">
                {filteredProducts.length} von {products.length} Produkten angezeigt
              </p>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sortieren nach:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="name">Name</option>
                  <option value="price-low">Preis: Niedrig zu Hoch</option>
                  <option value="price-high">Preis: Hoch zu Niedrig</option>
                  <option value="rating">Bestbewertet</option>
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
