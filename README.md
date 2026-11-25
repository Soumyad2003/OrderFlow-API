# E-Commerce REST API

A production-ready RESTful E-Commerce backend API built with Node.js, Express 5, MongoDB, Mongoose, and JWT authentication.

## Tech Stack

- **Runtime:** Node.js (`>=18`)
- **Framework:** Express 5
- **Database:** MongoDB & Mongoose
- **Authentication:** JSON Web Tokens (JWT) & `bcrypt`
- **Security:** `helmet`, `cors`, `express-rate-limit`
- **File Uploads:** `multer` (5MB limit, image MIME validation)
- **Logging:** `winston` (with sensitive field redaction)
- **API Documentation:** Swagger UI (`swagger-ui-express`)
- **Testing:** Node.js built-in test runner (`node --test`)

## Features

- **User Management:** Registration, login, profile retrieval, and password reset with `bcrypt` hashing and JWT authentication.
- **Product Catalog:** Full CRUD, image upload, price/category filtering, 1–5 star user ratings, and average price aggregation by category.
- **Shopping Cart:** Add items, view cart with populated product details, update quantities, and remove items.
- **Order Processing:** Place orders from cart items with line-item snapshots, order history, and single-order lookup (uses MongoDB transactions on replica sets with automatic standalone fallback).
- **Polymorphic Likes:** Toggle likes on products or categories, list likes, and remove likes.
- **Production Middleware:** Security headers (`helmet`), configurable `cors`, `/api/` rate limiting, request logging (`winston`), centralized error handling, and 404 JSON responses.
- **Interactive Docs & Health Check:** Swagger UI at `/api-docs` and server/DB health check at `/health`.
- **Graceful Shutdown:** Cleanly closes the MongoDB connection on `SIGTERM` and `SIGINT`.

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd E-COM-API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. **Run the server**
   - Development mode (with auto-reload via `nodemon`):
     ```bash
     npm run dev
     ```
   - Production mode:
     ```bash
     npm start
     ```

5. **Run tests**
   ```bash
   npm test
   ```

6. **Access API Documentation**
   Open `http://localhost:3200/api-docs` in your browser once the server is running.

## API Endpoints

| Resource | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| Root | `GET` | `/` | No | API welcome response and docs link |
| Health | `GET` | `/health` | No | Server uptime and database connection status |
| Docs | `GET` | `/api-docs` | No | Swagger UI API documentation |
| Users | `POST` | `/api/users/signup` | No | Register a new user |
| Users | `POST` | `/api/users/signin` | No | Authenticate user and receive JWT |
| Users | `GET` | `/api/users/profile` | Yes | Get authenticated user's profile |
| Users | `PUT` | `/api/users/resetpassword` | Yes | Reset authenticated user's password |
| Products | `GET` | `/api/products` | No | Get all products |
| Products | `GET` | `/api/products/filter` | No | Filter products by `minPrice`, `maxPrice`, `category` |
| Products | `GET` | `/api/products/averageprice` | No | Get average product price by category |
| Products | `GET` | `/api/products/:id` | No | Get a single product by ID |
| Products | `POST` | `/api/products` | Yes | Add a new product (supports `imageUrl` upload) |
| Products | `PUT` | `/api/products/:id` | Yes | Update a product by ID |
| Products | `DELETE` | `/api/products/:id` | Yes | Delete a product by ID |
| Products | `POST` | `/api/products/rate` | Yes | Rate a product (1–5) |
| Cart | `GET` | `/api/cartItems` | Yes | Get user's cart items |
| Cart | `POST` | `/api/cartItems` | Yes | Add item to cart |
| Cart | `PUT` | `/api/cartItems/:id` | Yes | Update cart item quantity |
| Cart | `DELETE` | `/api/cartItems/:id` | Yes | Remove item from cart |
| Orders | `POST` | `/api/orders` | Yes | Place an order from cart items |
| Orders | `GET` | `/api/orders` | Yes | Get user's order history |
| Orders | `GET` | `/api/orders/:id` | Yes | Get a single order by ID |
| Likes | `POST` | `/api/likes/toggle` | Yes | Toggle like on a `Product` or `Category` |
| Likes | `GET` | `/api/likes` | Yes | Get likes for a product or category |
| Likes | `DELETE` | `/api/likes/:id` | Yes | Remove a like by ID |

## Project Structure

```text
E-COM-API/
├── server.js                          # Application entry point & server configuration
├── package.json                       # Project metadata, scripts, and dependencies
├── swagger.json                       # OpenAPI 3.0 specification
├── .env.example                       # Environment variable template
├── .gitignore                         # Git ignore rules (.env, node_modules, logs, uploads)
├── logs/                              # Winston log output directory (gitignored)
├── tests/                             # Automated unit & schema validation tests
│   ├── middleware.test.js
│   └── schemas.test.js
└── src/
    ├── config/
    │   └── mongooseConfig.js          # Mongoose connection setup
    ├── error-handler/
    │   └── applicationError.js        # Custom application error class
    ├── middlewares/
    │   ├── jwt.middleware.js          # Bearer JWT authentication middleware
    │   ├── logger.middleware.js       # Winston request logger with field redaction
    │   ├── fileupload.middleware.js   # Multer image upload middleware
    │   ├── errorHandler.middleware.js # Global JSON error handler
    │   └── notFound.middleware.js     # 404 Not Found JSON handler
    └── features/
        ├── user/                      # User routes, controller, repository, model, schema
        ├── product/                   # Product, review & category schemas, routes, controller, repository
        ├── cart/                      # Cart routes, controller, repository, model, schema
        ├── order/                     # Order routes, controller, repository, model, schema
        └── like/                      # Like routes, controller, repository, schema
```

## Environment Variables

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port number the Express server listens on | `3200` |
| `DB_URL` | MongoDB connection string | `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>` |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens | `<your-jwt-secret-here>` |
| `CORS_ORIGIN` | Allowed CORS origin(s) | `http://localhost:5500` |
| `NODE_ENV` | Application runtime environment | `development` |
