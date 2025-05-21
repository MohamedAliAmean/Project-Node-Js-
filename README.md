# E-commerce API

A RESTful API for an e-commerce platform built with Node.js and Express.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

3. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/users/register`
- Body: `{ "name": "string", "email": "string", "password": "string", "role": "customer" | "seller" }`

#### Login
- **POST** `/api/users/login`
- Body: `{ "email": "string", "password": "string" }`

#### Reset Password
- **POST** `/api/users/reset-password`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "currentPassword": "string", "newPassword": "string" }`

#### Forgot Password
- **POST** `/api/users/forgot-password`
- Body: `{ "email": "string" }`

### Products

#### Get All Products
- **GET** `/api/products`
- Query Parameters:
  - `search`: Search by name or description
  - `seller`: Filter by seller ID

#### Get Single Product
- **GET** `/api/products/:id`

#### Create Product (Seller only)
- **POST** `/api/products`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "name": "string", "description": "string", "photo": "string", "price": number }`

#### Update Product (Seller only)
- **PATCH** `/api/products/:id`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "name": "string", "description": "string", "photo": "string", "price": number }`

#### Delete Product (Seller only)
- **DELETE** `/api/products/:id`
- Headers: `Authorization: Bearer <token>`

### Cart

#### Get Cart
- **GET** `/api/cart`
- Headers: `Authorization: Bearer <token>`

#### Add Item to Cart
- **POST** `/api/cart/items`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "productId": "string", "quantity": number }`

#### Update Cart Item
- **PATCH** `/api/cart/items/:productId`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "quantity": number }`

#### Remove Item from Cart
- **DELETE** `/api/cart/items/:productId`
- Headers: `Authorization: Bearer <token>`

### Orders

#### Get User's Orders
- **GET** `/api/orders`
- Headers: `Authorization: Bearer <token>`

#### Create Order
- **POST** `/api/orders`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "products": [{ "product": "string", "quantity": number, "price": number }], "paymentMethod": "cash_on_delivery" | "stripe" | "paypal" }`

#### Update Order Status
- **PATCH** `/api/orders/:id`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "status": "pending" | "processing" | "shipped" | "delivered" | "cancelled" }`

#### Delete Order
- **DELETE** `/api/orders/:id`
- Headers: `Authorization: Bearer <token>`

## Testing with Postman

1. Import the following collection into Postman:
```json
{
  "info": {
    "name": "E-commerce API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/api/users/register",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\",\n  \"role\": \"customer\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/api/users/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    }
  ]
}
```

2. After login, copy the token from the response and add it to the Authorization header for protected routes:
   - Key: `Authorization`
   - Value: `Bearer <your_token>`

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses include a message explaining the error:
```json
{
  "message": "Error description"
}
``` 