import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000/api';
let authToken = '';
let productId = '';

// Test user credentials - replace with valid credentials
const testUser = {
  email: 'testuser@example.com',
  password: 'Test@123456'
};

// Helper functions
const logResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
    return data;
  } else {
    const text = await response.text();
    console.log(text);
    return text;
  }
};

const login = async () => {
  console.log('\n--- Logging in ---');
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const data = await logResponse(response);
    
    if (response.ok && data.token) {
      authToken = data.token;
      console.log('Login successful');
    } else {
      console.error('Login failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('Login error:', error.message);
    process.exit(1);
  }
};

const getProducts = async () => {
  console.log('\n--- Getting a product ID ---');
  
  try {
    const response = await fetch(`${API_URL}/products?limit=1`);
    const data = await logResponse(response);
    
    if (response.ok && data.products && data.products.length > 0) {
      productId = data.products[0]._id;
      console.log(`Selected product ID: ${productId}`);
    } else {
      console.error('Failed to get products');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error getting products:', error.message);
    process.exit(1);
  }
};

// Cart API Tests
const testCart = async () => {
  console.log('\n=== CART API TESTS ===');
  
  // Get empty cart
  console.log('\n--- Get Cart (should be empty) ---');
  try {
    const response = await fetch(`${API_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    await logResponse(response);
  } catch (error) {
    console.error('Error getting cart:', error.message);
  }
  
  // Add item to cart
  console.log('\n--- Add item to cart ---');
  try {
    const response = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        productId,
        quantity: 2
      })
    });
    await logResponse(response);
  } catch (error) {
    console.error('Error adding to cart:', error.message);
  }
  
  // Get cart with items
  console.log('\n--- Get Cart (with items) ---');
  try {
    const response = await fetch(`${API_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    await logResponse(response);
  } catch (error) {
    console.error('Error getting cart:', error.message);
  }
  
  // Update cart item quantity
  console.log('\n--- Update cart item quantity ---');
  try {
    const response = await fetch(`${API_URL}/cart/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        quantity: 3
      })
    });
    await logResponse(response);
  } catch (error) {
    console.error('Error updating cart item:', error.message);
  }
  
  // Remove item from cart
  console.log('\n--- Remove item from cart ---');
  try {
    const response = await fetch(`${API_URL}/cart/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    await logResponse(response);
  } catch (error) {
    console.error('Error removing from cart:', error.message);
  }
  
  // Clear cart
  console.log('\n--- Clear cart ---');
  try {
    const response = await fetch(`${API_URL}/cart`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    await logResponse(response);
  } catch (error) {
    console.error('Error clearing cart:', error.message);
  }
};

// Wishlist API Tests
const testWishlist = async () => {
  console.log('\n=== WISHLIST API TESTS ===');
  
  // Get wishlist
  console.log('\n--- Get Wishlist ---');
  try {
    const response = await fetch(`${API_URL}/wishlist`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    await logResponse(response);
  } catch (error) {
    console.error('Error getting wishlist:', error.message);
  }
  
  // Add to wishlist
  console.log('\n--- Add to wishlist ---');
  try {
    const response = await fetch(`${API_URL}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        productId
      })
    });
    await logResponse(response);
  } catch (error) {
    console.error('Error adding to wishlist:', error.message);
  }
  
  // Check if product is in wishlist
  console.log('\n--- Check if product is in wishlist ---');
  try {
    const response = await fetch(`${API_URL}/wishlist/check/${productId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    await logResponse(response);
  } catch (error) {
    console.error('Error checking wishlist:', error.message);
  }
  
  // Toggle wishlist (remove)
  console.log('\n--- Toggle wishlist (should remove) ---');
  try {
    const response = await fetch(`${API_URL}/wishlist/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        productId
      })
    });
    await logResponse(response);
  } catch (error) {
    console.error('Error toggling wishlist:', error.message);
  }
  
  // Toggle wishlist (add back)
  console.log('\n--- Toggle wishlist (should add back) ---');
  try {
    const response = await fetch(`${API_URL}/wishlist/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        productId
      })
    });
    await logResponse(response);
  } catch (error) {
    console.error('Error toggling wishlist:', error.message);
  }
  
  // Remove from wishlist
  console.log('\n--- Remove from wishlist ---');
  try {
    const response = await fetch(`${API_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    await logResponse(response);
  } catch (error) {
    console.error('Error removing from wishlist:', error.message);
  }
};

// Main test function
const runTests = async () => {
  console.log('Starting API tests for Cart and Wishlist...');
  
  try {
    await login();
    await getProducts();
    await testCart();
    await testWishlist();
    
    console.log('\nAll tests completed');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

// Run the tests
runTests(); 