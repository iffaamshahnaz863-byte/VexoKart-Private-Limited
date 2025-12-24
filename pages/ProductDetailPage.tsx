
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import StarRating from '../components/StarRating';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import { useCart } from '../hooks/useCart';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct } = useProducts();
  const { addToCart } = useCart();
  const product = getProduct(parseInt(id || ''));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) {
    return <div className="text-center p-8">Product not found</div>;
  }
  
  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-navy-charcoal">
      <div className="relative h-80">
        <img
          src={product.images[currentImageIndex] || 'https://picsum.photos/600/600'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-navy-charcoal to-transparent"></div>
        
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 bg-black/30 rounded-full text-white">
          <ChevronLeftIcon className="h-6 w-6" />
        </button>

        <div className="absolute bottom-2 left-0 w-full flex justify-center space-x-2">
            {product.images.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${currentImageIndex === index ? 'w-6 bg-purple-500' : 'w-2 bg-gray-500/70'}`}
                />
            ))}
        </div>
      </div>

      <div className="p-4 -mt-10 relative z-10">
        <div className="bg-navy-light/50 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-white mb-2">{product.name}</h1>
             <button className="p-2 text-gray-400 hover:text-red-500 transition">
                <HeartIcon className="w-6 h-6"/>
            </button>
          </div>
          <p className="text-sm text-gray-400 mb-4">{product.category}</p>
          <div className="flex items-center mb-4">
            <StarRating rating={product.rating} />
            <span className="text-xs text-gray-400 ml-2">{product.rating} ({product.reviewCount} reviews)</span>
          </div>

          <div className="flex items-baseline space-x-2 mb-6">
            <p className="text-3xl font-bold text-purple-400">₹{product.price.toFixed(2)}</p>
            {product.originalPrice && (
              <p className="text-lg text-gray-500 line-through">₹{product.originalPrice.toFixed(2)}</p>
            )}
          </div>
          
          <p className="text-gray-300 leading-relaxed mb-6">{product.description}</p>
          
           {product.features && product.features.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-2">Features</h2>
              <ul className="list-disc list-inside text-gray-400 space-y-1">
                {product.features.map((feature, index) => <li key={index}>{feature}</li>)}
              </ul>
            </div>
          )}

        </div>
      </div>
      
      <div className="sticky bottom-20 px-4 py-3 bg-navy-charcoal/90 backdrop-blur-sm flex items-center gap-4">
         <button 
           onClick={handleAddToCart}
           className="w-1/2 bg-white/10 border border-purple-500 text-purple-400 font-bold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
          Add to Cart
        </button>
        <button 
           onClick={handleBuyNow}
           className="w-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
