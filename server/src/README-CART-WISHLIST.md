# Cart and Wishlist Backend Implementation

This document outlines the backend implementation for the cart and wishlist functionality in the FAMS (Fashion and Makeup Store) application.

## Models

### Cart Model

The Cart model is implemented in `models/Cart.js` and contains:

- `user`: Reference to the User model (unique)
- `items`: Array of cart items, each containing:
  - `product`: Reference to the Product model
  - `quantity`: Number of items

The model includes a method to calculate the total cart value based on product prices and discounts.

### Wishlist

The Wishlist functionality is implemented directly in the User model (`models/User.js`) as an array of Product references.

## API Endpoints

### Cart Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart` | Add item to cart |
| PUT | `/api/cart/:productId` | Update item quantity in cart |
| DELETE | `/api/cart/:productId` | Remove item from cart |
| DELETE | `/api/cart` | Clear cart |

### Wishlist Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wishlist` | Get user's wishlist |
| POST | `/api/wishlist` | Add product to wishlist |
| DELETE | `/api/wishlist/:productId` | Remove product from wishlist |
| GET | `/api/wishlist/check/:productId` | Check if product is in wishlist |
| POST | `/api/wishlist/toggle` | Toggle product in wishlist |

## Security

All cart and wishlist endpoints are protected by the authentication middleware, ensuring that only authenticated users can access and modify their own cart and wishlist.

## Testing

A test script is available to test the cart and wishlist functionality:

```bash
npm run test:cart-wishlist
```

This script runs through all the API endpoints for cart and wishlist operations and logs the responses.

## Frontend Integration

The frontend uses the ShopContext to interact with these endpoints. The context exposes functions like:

- `addToCart(product, quantity)`
- `removeFromCart(productId)`
- `updateCartQuantity(productId, quantity)`
- `toggleWishlist(product)`
- `clearCart()`

These functions make the appropriate API calls to the backend endpoints.

## Error Handling

All API endpoints include proper error handling for cases such as:

- Product not found
- Insufficient stock
- User not authenticated
- Cart not found
- Item not found in cart

## Future Enhancements

Potential future enhancements include:

1. Adding support for product variants in the cart
2. Implementing cart persistence between sessions for non-authenticated users
3. Adding price history for wishlisted items
4. Implementing notifications for price drops on wishlisted items
5. Adding a "Move to cart" feature for wishlist items 