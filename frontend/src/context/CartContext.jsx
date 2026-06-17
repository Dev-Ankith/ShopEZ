import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart items from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('shopez_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Failed to parse cart storage:', err.message);
      }
    }
  }, []);

  // Sync cart items with localStorage when modified
  const saveCartToStorage = (items) => {
    setCartItems(items);
    localStorage.setItem('shopez_cart', JSON.stringify(items));
  };

  // Add Item to Cart
  const addToCart = (product, quantity = 1) => {
    const qty = parseInt(quantity, 10) || 1;
    const items = [...cartItems];
    const existingIndex = items.findIndex(item => item.productId === product._id);

    if (existingIndex >= 0) {
      items[existingIndex].quantity = Math.min(product.inventory, items[existingIndex].quantity + qty);
    } else {
      items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        discountPercent: product.discountPercent || 0,
        imageUrl: product.imageUrl,
        inventory: product.inventory,
        quantity: Math.min(product.inventory, qty)
      });
    }

    saveCartToStorage(items);
  };

  // Remove Item from Cart
  const removeFromCart = (productId) => {
    const items = cartItems.filter(item => item.productId !== productId);
    saveCartToStorage(items);
  };

  // Update Item Quantity in Cart
  const updateCartQuantity = (productId, quantity) => {
    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    const items = cartItems.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: Math.min(item.inventory, qty) };
      }
      return item;
    });

    saveCartToStorage(items);
  };

  // Clear all items in Cart
  const clearCart = () => {
    saveCartToStorage([]);
  };

  // Compute total items count
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Compute total cost (incorporating item discount percentages)
  const cartTotal = cartItems.reduce((acc, item) => {
    const discountPrice = item.price * (1 - (item.discountPercent / 100));
    return acc + (discountPrice * item.quantity);
  }, 0);

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
