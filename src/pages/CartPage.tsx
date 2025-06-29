
import React from 'react';
import Header from '@/components/Header';
import Cart from '@/components/Cart';
import { CartItem } from '@/components/Cart';

interface CartPageProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

const CartPage = ({ cartItems, onUpdateQuantity, onRemoveItem }: CartPageProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartItemCount={cartItems.length} />
      <Cart 
        items={cartItems}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
      />
    </div>
  );
};

export default CartPage;
