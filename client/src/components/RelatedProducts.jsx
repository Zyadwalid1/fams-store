import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaShoppingCart } from 'react-icons/fa';
import { useShop } from '../context/ShopContext';

const RelatedProducts = ({ currentProduct, relatedProducts: passedRelatedProducts, maxItems = 4 }) => {
  const { products, addToCart } = useShop();
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    // If related products are passed, use them
    if (passedRelatedProducts && passedRelatedProducts.length > 0) {
      setRelatedProducts(passedRelatedProducts.slice(0, maxItems));
      return;
    }
    
    // Fallback: Find related products based on product context
    if (!currentProduct) return;

    // Find related products based on category, type, brand
    const related = products
      .filter(product => 
        // Exclude the current product
        product.id !== currentProduct.id && 
        // Match by category
        (product.category === currentProduct.category) &&
        // Additionally, try to match type or brand if available
        (
          (currentProduct.type && product.type === currentProduct.type) ||
          (currentProduct.brand && product.brand === currentProduct.brand)
        )
      )
      .slice(0, maxItems);

    // If we don't have enough related products, add more from the same category
    if (related.length < maxItems) {
      const moreFromCategory = products
        .filter(product => 
          product.id !== currentProduct.id && 
          product.category === currentProduct.category &&
          !related.some(p => p.id === product.id)
        )
        .slice(0, maxItems - related.length);
      
      setRelatedProducts([...related, ...moreFromCategory]);
    } else {
      setRelatedProducts(related);
    }
  }, [currentProduct, products, maxItems, passedRelatedProducts]);

  // If no related products, don't render anything
  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        You Might Also Like
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <RelatedProductCard key={product.id} product={product} addToCart={addToCart} />
        ))}
      </div>
    </div>
  );
};

const RelatedProductCard = ({ product, addToCart }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  // Calculate the final price after discount
  const finalPrice = product.discount 
    ? (product.price * (1 - product.discount / 100)).toFixed(2) 
    : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link 
        to={`/product/${product.id}`} 
        className="block h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-primary/10 dark:border-primary/5"
      >
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
              {product.discount}% OFF
            </div>
          )}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          >
            <FaShoppingCart className="h-5 w-5 text-primary" />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>
          
          <div className="flex items-center mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`h-3 w-3 ${
                  star <= (product.rating || 5)
                    ? 'text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            {product.discount > 0 ? (
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-primary dark:text-primary-400">
                  {(product.price * (1 - product.discount / 100)).toFixed(2)} EGP
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  {product.price} EGP
                </span>
              </div>
            ) : (
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {product.price} EGP
              </span>
            )}
            
            {product.brand && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                {product.brand}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RelatedProducts; 