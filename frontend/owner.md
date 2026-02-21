# Backend & Database Integration Guide — Complete System

> **For the Backend (Django) and MS SQL Developer**: The frontend for all roles (**Customer**, **Owner**, **Warehouse**, **Admin**) is built, with JWT auth and role-guarded layouts. Owner/Warehouse/Admin pages are API-integrated via Axios; some customer screens still run local-state flows and are ready to be connected to backend endpoints. Follow this guide to build the Django REST Framework backend + MS SQL Server database.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack & Setup](#2-tech-stack--setup)
3. [MS SQL Server Database Schema](#3-ms-sql-server-database-schema)
4. [Django Project Structure](#4-django-project-structure)
5. [Authentication API](#5-authentication-api)
6. [Owner API Endpoints](#6-owner-api-endpoints)
7. [Warehouse API Endpoints](#7-warehouse-api-endpoints)
8. [Customer API Endpoints](#8-customer-api-endpoints)
9. [Admin API Endpoints](#9-admin-api-endpoints)
10. [Frontend File Map](#10-frontend-file-map)
11. [Quick Start Checklist](#11-quick-start-checklist)

---

## 1. System Overview

| Layer | Status |
|-------|--------|
| **Frontend** | Done — React 19 + Vite 7, Plotly charts, 4 role dashboards (Customer, Owner, Warehouse, Admin), JWT auth |
| **Backend** | Blank Django project (`page`), needs DRF apps, views, serializers |
| **Database** | Needs MS SQL Server tables (schema below) |

**Frontend API base URL**: `http://localhost:8000/api` (configured in `frontend/src/Config/Config.js`)

### Roles

| Role | Route Prefix | Layout | Auth Guard |
|------|-------------|--------|------------|
| **Customer** | `/` | Navbar + Footer | Optional (some pages need login) |
| **Owner** | `/owner/*` | OwnerNavbar + OwnerLayout | `role === 'owner'` |
| **Warehouse** | `/warehouse/*` | WarehouseNavbar + WarehouseLayout | `role === 'warehouse'` |
| **Admin** | `/admin/*` | AdminNavbar + AdminLayout | `role === 'admin'` |

### Auth Bypass (for testing without backend)

Add `?bypassAuth=owner`, `?bypassAuth=warehouse`, or `?bypassAuth=admin` to any URL. You can also use `?bypass=owner|warehouse|admin` as a shorthand. This creates a fake user in context and persists in localStorage.

To check the admin panel directly, open: `http://localhost:5173/admin/dashboard?bypassAuth=admin`

---

## 2. Tech Stack & Setup

### Backend Requirements

```
Django >= 4.2
djangorestframework >= 3.14
djangorestframework-simplejwt >= 5.3
django-cors-headers >= 4.3
mssql-django >= 1.4          # MS SQL backend for Django
pyodbc >= 5.0
Pillow >= 10.0               # for product image uploads
django-filter >= 23.5        # optional, for query filtering
```

### Django settings.py additions

```python
INSTALLED_APPS = [
    ...
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'accounts',        # User & Auth
    'products',        # Products, Categories, Suppliers
    'orders',          # Orders, OrderItems
    'warehouse',       # Inventory, StockMovements, Alerts
    'analytics',       # Owner analytics views (no models, just aggregation views)
    'admin_panel',     # Admin panel: user mgmt, supplier mgmt, system logs, analytics summary
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

# MS SQL Database
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'electronics_retail_db',
        'HOST': 'localhost\\SQLEXPRESS',   # adjust to your instance
        'PORT': '',
        'USER': 'sa',
        'PASSWORD': 'your_password',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
            'extra_params': 'TrustServerCertificate=yes',
        },
    }
}

# JWT
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

# CORS
CORS_ALLOWED_ORIGINS = ['http://localhost:5173']  # Vite dev server

# Media
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

---

## 3. MS SQL Server Database Schema

### 3.1 Users / Auth

```sql
CREATE TABLE users (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    username        NVARCHAR(150) UNIQUE NOT NULL,
    email           NVARCHAR(254) UNIQUE NOT NULL,
    password_hash   NVARCHAR(256) NOT NULL,
    first_name      NVARCHAR(100) DEFAULT '',
    last_name       NVARCHAR(100) DEFAULT '',
    phone           NVARCHAR(20) DEFAULT '',
    address         NVARCHAR(500) DEFAULT '',
    dob             DATE NULL,
    gender          NVARCHAR(10) DEFAULT '',   -- 'male' | 'female' | 'other'
    role            NVARCHAR(20) DEFAULT 'customer',   -- 'customer' | 'owner' | 'warehouse' | 'admin'
    is_active       BIT DEFAULT 1,
    date_joined     DATETIME2 DEFAULT GETDATE(),
    last_login      DATETIME2 NULL
);
-- CONSTRAINT: role IN ('customer', 'owner', 'warehouse', 'admin')
```

### 3.2 Categories

```sql
CREATE TABLE categories (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    name            NVARCHAR(100) UNIQUE NOT NULL,
    description     NVARCHAR(500) DEFAULT '',
    image_url       NVARCHAR(500) NULL,
    is_active       BIT DEFAULT 1,
    created_at      DATETIME2 DEFAULT GETDATE()
);
```

### 3.3 Suppliers

```sql
CREATE TABLE suppliers (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    name            NVARCHAR(200) NOT NULL,
    contact_person  NVARCHAR(200) DEFAULT '',
    email           NVARCHAR(254) DEFAULT '',
    phone           NVARCHAR(20) DEFAULT '',
    address         NVARCHAR(500) DEFAULT '',
    is_active       BIT DEFAULT 1,
    created_at      DATETIME2 DEFAULT GETDATE()
);
```

### 3.4 Products

```sql
CREATE TABLE products (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    name            NVARCHAR(300) NOT NULL,
    description     NVARCHAR(MAX) DEFAULT '',
    sku             NVARCHAR(50) UNIQUE NULL,
    brand           NVARCHAR(100) DEFAULT '',
    cost_price      DECIMAL(12,2) NOT NULL DEFAULT 0,
    selling_price   DECIMAL(12,2) NOT NULL DEFAULT 0,
    stock_quantity  INT NOT NULL DEFAULT 0,
    reorder_level   INT DEFAULT 10,
    category_id     INT REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id     INT REFERENCES suppliers(id) ON DELETE SET NULL,
    owner_name      NVARCHAR(200) DEFAULT '',       -- store/brand owner
    image_url       NVARCHAR(500) NULL,
    status          NVARCHAR(20) DEFAULT 'Active',   -- 'Active' | 'Inactive'
    location        NVARCHAR(100) DEFAULT '',        -- warehouse location (aisle/shelf)
    weight          DECIMAL(8,2) NULL,
    warranty_months INT DEFAULT 0,
    created_at      DATETIME2 DEFAULT GETDATE(),
    updated_at      DATETIME2 DEFAULT GETDATE()
);
```

### 3.5 Orders

```sql
CREATE TABLE orders (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    user_id         INT REFERENCES users(id) ON DELETE CASCADE,
    order_date      DATETIME2 DEFAULT GETDATE(),
    status          NVARCHAR(20) DEFAULT 'Pending',
        -- 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
    subtotal        DECIMAL(12,2) DEFAULT 0,
    tax_amount      DECIMAL(12,2) DEFAULT 0,
    shipping_fee    DECIMAL(12,2) DEFAULT 0,
    discount        DECIMAL(12,2) DEFAULT 0,
    grand_total     DECIMAL(12,2) DEFAULT 0,
    payment_method  NVARCHAR(50) DEFAULT 'COD',
        -- 'COD' | 'Credit Card' | 'Debit Card' | 'UPI' | 'Net Banking' | 'Wallet'
    payment_status  NVARCHAR(20) DEFAULT 'Pending',
        -- 'Pending' | 'Completed' | 'Refunded'
    shipping_address NVARCHAR(500) DEFAULT '',
    notes           NVARCHAR(500) DEFAULT '',
    updated_at      DATETIME2 DEFAULT GETDATE()
);
```

### 3.6 Order Items

```sql
CREATE TABLE order_items (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    order_id        INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id      INT REFERENCES products(id) ON DELETE SET NULL,
    product_name    NVARCHAR(300) NOT NULL,          -- snapshot
    quantity        INT NOT NULL DEFAULT 1,
    unit_price      DECIMAL(12,2) NOT NULL,
    total_price     DECIMAL(12,2) NOT NULL
);
```

### 3.7 Cart

```sql
CREATE TABLE cart_items (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    user_id         INT REFERENCES users(id) ON DELETE CASCADE,
    product_id      INT REFERENCES products(id) ON DELETE CASCADE,
    quantity        INT NOT NULL DEFAULT 1,
    added_at        DATETIME2 DEFAULT GETDATE(),
    UNIQUE(user_id, product_id)
);
```

### 3.8 Wishlist

```sql
CREATE TABLE wishlist_items (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    user_id         INT REFERENCES users(id) ON DELETE CASCADE,
    product_id      INT REFERENCES products(id) ON DELETE CASCADE,
    added_at        DATETIME2 DEFAULT GETDATE(),
    UNIQUE(user_id, product_id)
);
```

### 3.9 Reviews

```sql
CREATE TABLE reviews (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    product_id      INT REFERENCES products(id) ON DELETE CASCADE,
    user_id         INT REFERENCES users(id) ON DELETE CASCADE,
    rating          INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         NVARCHAR(MAX) DEFAULT '',
    created_at      DATETIME2 DEFAULT GETDATE()
);
```

### 3.10 Stock Movements (Warehouse)

```sql
CREATE TABLE stock_movements (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    product_id      INT REFERENCES products(id) ON DELETE CASCADE,
    type            NVARCHAR(20) NOT NULL,
        -- 'stock_in' | 'stock_out' | 'returned' | 'damaged' | 'transferred'
    quantity        INT NOT NULL,
    reason          NVARCHAR(500) DEFAULT '',
    reference       NVARCHAR(100) DEFAULT '',        -- PO number, invoice, etc.
    performed_by    NVARCHAR(200) DEFAULT '',
    date            DATETIME2 DEFAULT GETDATE()
);
```

### 3.11 Low Stock Alerts (Warehouse)

```sql
CREATE TABLE stock_alerts (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    product_id      INT REFERENCES products(id) ON DELETE CASCADE,
    severity        NVARCHAR(20) DEFAULT 'warning',  -- 'critical' | 'warning' | 'info'
    status          NVARCHAR(20) DEFAULT 'active',   -- 'active' | 'resolved' | 'dismissed'
    current_stock   INT DEFAULT 0,
    threshold       INT DEFAULT 10,
    message         NVARCHAR(500) DEFAULT '',
    created_at      DATETIME2 DEFAULT GETDATE(),
    resolved_at     DATETIME2 NULL
);
```

---

## 4. Django Project Structure

```
backend/
├── manage.py
├── requirements.txt
├── page/                    # main project
│   ├── settings.py
│   ├── urls.py              # include all app urls under /api/
│   └── wsgi.py
├── accounts/                # User model, auth views
│   ├── models.py            # CustomUser(AbstractUser) with role field
│   ├── serializers.py       # UserSerializer, LoginSerializer, RegisterSerializer
│   ├── views.py             # LoginView, RegisterView, ProfileView
│   └── urls.py              # /api/auth/*
├── products/                # Products, Categories, Suppliers
│   ├── models.py            # Product, Category, Supplier
│   ├── serializers.py
│   ├── views.py             # ModelViewSets
│   └── urls.py              # /api/products/*, /api/categories/*, /api/suppliers/*
├── orders/                  # Orders, OrderItems, Cart, Wishlist
│   ├── models.py            # Order, OrderItem, CartItem, WishlistItem, Review
│   ├── serializers.py
│   ├── views.py
│   └── urls.py              # /api/orders/*, /api/cart/*, /api/wishlist/*
├── warehouse/               # Warehouse-specific views
│   ├── models.py            # StockMovement, StockAlert
│   ├── serializers.py
│   ├── views.py
│   └── urls.py              # /api/warehouse/*
└── analytics/               # Owner analytics (no models, aggregation queries)
    ├── views.py             # Analytics views with SQL/ORM aggregation
    └── urls.py              # /api/analytics/*
└── admin_panel/             # Admin panel (user mgmt, supplier mgmt, logs, analytics)
    ├── models.py            # SystemLog
    ├── serializers.py
    ├── views.py             # Admin-only views
    ├── permissions.py       # IsAdminRole permission class
    └── urls.py              # /api/admin/*
```

### Main URL Config (`page/urls.py`)

```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('products.urls')),
    path('api/', include('orders.urls')),
    path('api/warehouse/', include('warehouse.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/admin/', include('admin_panel.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

---

## 5. Authentication API

The frontend uses JWT (access + refresh tokens). Tokens stored in `localStorage`.

### Endpoints

| Method | URL | Request Body | Response | Auth |
|--------|-----|-------------|----------|------|
| `POST` | `/api/auth/login/` | `{ email, password }` | `{ access, refresh, user: { id, email, role, first_name, last_name } }` | No |
| `POST` | `/api/auth/register/` | `{ firstName, lastName, email, password, confirmPassword, phone, dob, gender, address, role }` | `{ access, refresh, user }` | No |
| `POST` | `/api/auth/refresh/` | `{ refresh }` | `{ access }` | No |
| `POST` | `/api/auth/logout/` | `{ refresh }` (optional) | `204` | Yes |
| `GET` | `/api/auth/profile/` | — | `{ id, email, first_name, last_name, phone, address, role, date_joined }` | Yes |
| `PATCH` | `/api/auth/profile/` | Partial user fields | Updated user | Yes |
| `POST` | `/api/auth/change-password/` | `{ old_password, new_password }` | `{ detail: "Password updated" }` | Yes |

### Login Request/Response (critical)

The frontend sends `email` + `password` to the login endpoint:
```json
// POST /api/auth/login/
{ "email": "user@example.com", "password": "secret123" }
```

Response must include JWT tokens + user object with `role` field:
```json
{
  "access": "eyJ...",
  "refresh": "eyJ...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "role": "customer",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Register Request (critical)

The frontend sends the **exact form fields** from the signup form:
```json
// POST /api/auth/register/
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@gmail.com",
  "password": "Secret@123",
  "confirmPassword": "Secret@123",
  "phone": "9812345678",
  "dob": "2000-01-15",
  "gender": "male",
  "address": "Kathmandu, Nepal",
  "role": "customer"
}
```

> **Note**: The backend must accept either camelCase field names (as sent) or map them to snake_case. The backend should validate `password == confirmPassword`, email uniqueness, etc.

### Frontend Signup Validation (already done)

The frontend validates **before** sending to the API:
- Email must end with `@gmail.com` or `.edu.np`
- Password: 8+ chars, uppercase, lowercase, number, special char
- `password === confirmPassword`
- Phone: exactly 10 digits
- Date of birth: must be ≥ 16 years old
- All fields required (firstName, lastName, email, password, confirmPassword, phone, dob, gender, address)

### Role-Based Redirect After Login

After successful login, the frontend redirects:
- `role === 'customer'` → `/` (home page)
- `role === 'owner'` → `/owner/dashboard`
- `role === 'warehouse'` → `/warehouse/dashboard`
- `role === 'admin'` → `/admin/dashboard`
```

The frontend stores:
- `access` → `localStorage` key from `Config.AUTH_TOKEN_KEY` (default: `"auth_token"`)
- `refresh` → `localStorage` key from `Config.REFRESH_TOKEN_KEY` (default: `"refresh_token"`)
- `user` → `localStorage` key `"customer_user"`

### Django Implementation

```python
# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = [('customer', 'Customer'), ('owner', 'Owner'), ('warehouse', 'Warehouse'), ('admin', 'Admin')]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=20, blank=True, default='')
    address = models.TextField(blank=True, default='')
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True, default='')  # male, female, other

# accounts/serializers.py
from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'address', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class RegisterSerializer(serializers.ModelSerializer):
    confirmPassword = serializers.CharField(write_only=True)
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
    class Meta:
        model = CustomUser
        fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'phone', 'address', 'role']
        extra_kwargs = {'password': {'write_only': True}}
    def validate(self, data):
        if data['password'] != data.pop('confirmPassword'):
            raise serializers.ValidationError({'confirmPassword': 'Passwords do not match'})
        return data
    def create(self, validated_data):
        validated_data['username'] = validated_data['email']  # Use email as username
        return CustomUser.objects.create_user(**validated_data)

# accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import UserSerializer, LoginSerializer, RegisterSerializer

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        ser = LoginSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        # Authenticate by email — look up username from email first
        from .models import CustomUser
        try:
            u = CustomUser.objects.get(email=ser.validated_data['email'])
        except CustomUser.DoesNotExist:
            return Response({'message': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
        user = authenticate(username=u.username, password=ser.validated_data['password'])
        if not user:
            return Response({'message': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response(UserSerializer(request.user).data)
    def patch(self, request):
        ser = UserSerializer(request.user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if not request.user.check_password(request.data.get('old_password', '')):
            return Response({'detail': 'Wrong current password'}, status=400)
        request.user.set_password(request.data['new_password'])
        request.user.save()
        return Response({'detail': 'Password updated'})
```

---

## 6. Owner API Endpoints

The Owner section has 4 pages: **Dashboard**, **Analytics**, **Product Management**, **Order Management**.

### 6.1 Analytics Endpoints (Owner Dashboard + Analytics page)

| Method | URL | Query Params | Response |
|--------|-----|-------------|----------|
| `GET` | `/api/analytics/sales-overview/` | `?days=30` | `{ total_revenue, total_profit, total_orders, total_customers, revenue_change, profit_change, orders_change, customers_change }` |
| `GET` | `/api/analytics/revenue-trend/` | `?days=30&period=daily` | `[{ period, revenue, profit, orders }]` |
| `GET` | `/api/analytics/top-products/` | `?days=30` | `[{ product_id, name, brand, category, total_quantity_sold, total_revenue }]` |
| `GET` | `/api/analytics/category-performance/` | `?days=30` | `[{ category_name, total_revenue, total_orders, product_count }]` |
| `GET` | `/api/analytics/payment-methods/` | `?days=30` | `[{ name, value }]` — name = payment method, value = total amount |
| `GET` | `/api/analytics/order-status/` | `?days=30` | `[{ name, value }]` — name = status, value = count |
| `GET` | `/api/analytics/low-stock/` | — | `[{ product_id, name, category_name, stock_quantity, reorder_level }]` |

#### Response Details

**Sales Overview:**
```json
{
  "total_revenue": 1250000,
  "total_profit": 320000,
  "total_orders": 156,
  "total_customers": 89,
  "revenue_change": 12.5,
  "profit_change": 8.3,
  "orders_change": -2.1,
  "customers_change": 15.0
}
```
- `*_change` fields = percentage change vs previous period (e.g., last 30 days vs 30 days before that)

**Revenue Trend:**
```json
[
  { "period": "2025-06-01", "revenue": 45000, "profit": 12000, "orders": 5 },
  { "period": "2025-06-02", "revenue": 62000, "profit": 18000, "orders": 8 }
]
```
- When `?period=monthly`: period = "2025-01", "2025-02", etc. and include `month` field too

**Top Products:**
```json
[
  {
    "product_id": 1,
    "name": "Samsung Galaxy S24 Ultra",
    "brand": "Samsung",
    "category": "Smartphones",
    "total_quantity_sold": 45,
    "total_revenue": 5850000
  }
]
```

### 6.2 Product Management Endpoints

| Method | URL | Query Params | Response |
|--------|-----|-------------|----------|
| `GET` | `/api/products/` | `?page_size=1000&search=&category=&ordering=name` | Paginated `{ results: [...], count, next, previous }` |
| `GET` | `/api/products/{id}/` | — | Single product object |
| `POST` | `/api/products/` | Product JSON body | Created product |
| `PUT` | `/api/products/{id}/` | Full product JSON | Updated product |
| `DELETE` | `/api/products/{id}/` | — | `204 No Content` |
| `GET` | `/api/categories/` | — | `[{ id, name, description }]` |
| `GET` | `/api/suppliers/` | — | `[{ id, name, contact_person, email, phone }]` |

#### Product Object

```json
{
  "id": 1,
  "name": "Samsung Galaxy S24 Ultra",
  "description": "...",
  "sku": "SAM-S24U-256",
  "brand": "Samsung",
  "cost_price": 95000,
  "selling_price": 129999,
  "stock_quantity": 25,
  "reorder_level": 10,
  "category": 1,
  "category_name": "Smartphones",
  "supplier": 2,
  "supplier_name": "Samsung Nepal",
  "owner_name": "Evo Store Nepal",
  "image_url": "/media/products/s24ultra.jpg",
  "status": "Active",
  "location": "A1-S3",
  "weight": 0.23,
  "warranty_months": 12,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-06-10T14:20:00Z"
}
```

### 6.3 Order Management Endpoints

| Method | URL | Query Params | Response |
|--------|-----|-------------|----------|
| `GET` | `/api/orders/` | `?page_size=1000&status=&search=&ordering=-order_date` | Paginated `{ results: [...], count }` |
| `GET` | `/api/orders/{id}/` | — | Order + items |
| `PATCH` | `/api/orders/{id}/` | `{ "status": "Shipped" }` | Updated order |

#### Order Object (list view)

```json
{
  "id": 101,
  "user_id": 5,
  "user_name": "Rajesh Kumar",
  "user_email": "rajesh@example.com",
  "order_date": "2025-06-10T14:30:00Z",
  "status": "Processing",
  "items_count": 3,
  "subtotal": 150000,
  "tax_amount": 19500,
  "shipping_fee": 200,
  "discount": 5000,
  "grand_total": 164700,
  "payment_method": "UPI",
  "payment_status": "Completed",
  "shipping_address": "Kathmandu, Nepal"
}
```

#### Order Detail (with items)

```json
{
  "id": 101,
  "user_name": "Rajesh Kumar",
  "user_email": "rajesh@example.com",
  "order_date": "2025-06-10T14:30:00Z",
  "status": "Processing",
  "items": [
    {
      "id": 1,
      "product_id": 5,
      "product_name": "iPhone 15 Pro",
      "quantity": 1,
      "unit_price": 150000,
      "total_price": 150000
    }
  ],
  "subtotal": 150000,
  "tax_amount": 19500,
  "shipping_fee": 200,
  "discount": 5000,
  "grand_total": 164700,
  "payment_method": "UPI",
  "payment_status": "Completed",
  "shipping_address": "Kathmandu, Nepal",
  "notes": ""
}
```

---

## 7. Warehouse API Endpoints

The Warehouse section has 4 pages: **Dashboard**, **Inventory Management**, **Stock Movements**, **Low Stock Alerts**.

### 7.1 Dashboard Endpoints

| Method | URL | Query Params | Response |
|--------|-----|-------------|----------|
| `GET` | `/api/warehouse/overview/` | `?owner=` | `{ total_items, total_quantity, low_stock_count, out_of_stock_count, total_value, recent_movements_count, pending_alerts, categories_count }` |
| `GET` | `/api/warehouse/stock-by-category/` | `?owner=` | `[{ category, quantity }]` |
| `GET` | `/api/warehouse/stock-by-owner/` | — | `[{ owner, quantity }]` |
| `GET` | `/api/warehouse/deliveries/` | `?owner=&page_size=10` | `[{ id, product_name, quantity, supplier, date, status }]` |
| `GET` | `/api/warehouse/stock-movements/` | `?owner=&type=&ordering=-date&page_size=5` | Recent movements for dashboard |
| `GET` | `/api/warehouse/alerts/` | `?owner=&status=active&page_size=5` | Active alerts for dashboard |

#### Overview Response

```json
{
  "total_items": 342,
  "total_quantity": 15420,
  "low_stock_count": 18,
  "out_of_stock_count": 5,
  "total_value": 12500000,
  "recent_movements_count": 47,
  "pending_alerts": 12,
  "categories_count": 8
}
```

### 7.2 Inventory Management Endpoints

| Method | URL | Query Params | Response |
|--------|-----|-------------|----------|
| `GET` | `/api/warehouse/inventory/` | `?search=&owner=&status=&category=&ordering=name&page_size=15` | Paginated `{ results: [...], count }` |
| `GET` | `/api/warehouse/inventory/{id}/` | — | Single inventory item |
| `PATCH` | `/api/warehouse/inventory/{id}/` | Partial fields | Updated item |

#### Inventory Item

```json
{
  "id": 1,
  "name": "Samsung Galaxy S24 Ultra",
  "sku": "SAM-S24U-256",
  "category": "Smartphones",
  "owner": "Evo Store Nepal",
  "stock_quantity": 25,
  "reorder_level": 10,
  "max_stock": 100,
  "status": "in_stock",
  "location": "A1-S3",
  "cost_price": 95000,
  "selling_price": 129999,
  "last_restocked": "2025-06-01T10:00:00Z",
  "image_url": "/media/products/s24ultra.jpg"
}
```

**Status values**: `"in_stock"`, `"low_stock"`, `"out_of_stock"`, `"overstock"`

**Filtering**: `?status=low_stock` filters by stock status. `?search=samsung` searches name/SKU/location.

### 7.3 Stock Movements Endpoints

| Method | URL | Query Params | Response |
|--------|-----|-------------|----------|
| `GET` | `/api/warehouse/stock-movements/` | `?owner=&type=stock_in&date_from=&date_to=&ordering=-date&page_size=1000` | `{ results: [...], count }` or `[...]` |
| `POST` | `/api/warehouse/stock-movements/` | `{ product_id, type, quantity, reason, reference }` | Created movement |
| `GET` | `/api/warehouse/stock-movements/{id}/` | — | Single movement |

#### Stock Movement Object

```json
{
  "id": 1,
  "product_id": 5,
  "product_name": "iPhone 15 Pro",
  "type": "stock_in",
  "quantity": 50,
  "owner": "Evo Store Nepal",
  "reason": "New shipment from supplier",
  "reference": "PO-2025-0042",
  "performed_by": "warehouse_admin",
  "date": "2025-06-10T09:30:00Z"
}
```

**Type values**: `"stock_in"`, `"stock_out"`, `"returned"`, `"damaged"`, `"transferred"`

**Important**: When creating a stock movement via POST, the backend should automatically update the product's `stock_quantity`:
- `stock_in` / `returned` → **increase** stock
- `stock_out` / `damaged` / `transferred` → **decrease** stock
- Also check if stock drops below `reorder_level` → auto-create a `stock_alert`

### 7.4 Alerts Endpoints

| Method | URL | Query Params | Response |
|--------|-----|-------------|----------|
| `GET` | `/api/warehouse/alerts/` | `?owner=&severity=&status=active&ordering=-created_at&page_size=1000` | `{ results: [...] }` or `[...]` |
| `PATCH` | `/api/warehouse/alerts/{id}/resolve/` | — | `{ detail: "Alert resolved" }` |
| `PATCH` | `/api/warehouse/alerts/{id}/dismiss/` | — | `{ detail: "Alert dismissed" }` |

#### Alert Object

```json
{
  "id": 1,
  "product_id": 5,
  "product_name": "iPhone 15 Pro",
  "sku": "APL-IP15P-256",
  "severity": "critical",
  "status": "active",
  "current_stock": 2,
  "threshold": 10,
  "owner": "Evo Store Nepal",
  "message": "Stock critically low — only 2 units remaining",
  "created_at": "2025-06-10T08:00:00Z"
}
```

**Severity logic** (backend should auto-calculate):
- `current_stock == 0` → `"critical"`
- `current_stock <= threshold * 0.5` → `"critical"`
- `current_stock <= threshold` → `"warning"`
- else → `"info"`

**Resolve** sets `status = "resolved"` and `resolved_at = now()`.
**Dismiss** sets `status = "dismissed"`.

### 3.12 System Logs (Admin)

```sql
CREATE TABLE system_logs (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    user_id         INT NULL REFERENCES users(id) ON DELETE SET NULL,
    user_name       NVARCHAR(200) DEFAULT '',
    user_email      NVARCHAR(254) DEFAULT '',
    user_role       NVARCHAR(20) DEFAULT '',
    action          NVARCHAR(20) NOT NULL,
        -- 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'ERROR' | 'EXPORT'
    description     NVARCHAR(MAX) DEFAULT '',
    ip_address      NVARCHAR(45) DEFAULT '',
    status          NVARCHAR(20) DEFAULT 'success',   -- 'success' | 'failure' | 'warning'
    metadata        NVARCHAR(MAX) NULL,               -- JSON string for extra data
    timestamp       DATETIME2 DEFAULT GETDATE()
);
CREATE INDEX idx_system_logs_action ON system_logs(action);
CREATE INDEX idx_system_logs_user ON system_logs(user_id);
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp);
CREATE INDEX idx_system_logs_status ON system_logs(status);
```

### 3.13 Supplier Extended Fields (Admin)

```sql
-- Add these columns to the existing suppliers table for admin management:
ALTER TABLE suppliers ADD
    type            NVARCHAR(20) DEFAULT 'manufacturer',  -- 'manufacturer' | 'owner'
    company         NVARCHAR(200) DEFAULT '',
    rating          DECIMAL(3,2) DEFAULT 0.00,
    on_time_delivery_rate DECIMAL(5,2) DEFAULT 0.00,
    product_count   INT DEFAULT 0;
```

### 7.5 Supporting Endpoints

| Method | URL | Response |
|--------|-----|----------|
| `GET` | `/api/warehouse/owners/` | `[{ "name": "Evo Store Nepal" }, { "name": "CG Digital" }]` or `["Evo Store Nepal", "CG Digital"]` |
| `GET` | `/api/warehouse/suppliers/` | `[{ id, name, contact_person, email, phone }]` |
| `GET` | `/api/warehouse/suppliers/{id}/` | Single supplier |

**`/api/warehouse/owners/`**: Returns distinct `owner_name` values from the products table. Used by the OwnerFilter dropdown on all warehouse pages.

---

## 8. Customer API Endpoints

The Customer section has these pages: **Home**, **Product Detail** (`/product/:id`), **Cart**, **Checkout**, **Wishlist**, **Compare**, **Profile**, **Login/Register**.

> Note: customer API endpoints are fully defined in `src/services/api.js`, but current customer UI flow still uses significant local React state for cart/wishlist/compare/checkout while backend integration is being completed.

### 8.1 Product Browsing

| Method | URL | Query Params | Response |
|--------|-----|-------------|----------|
| `GET` | `/api/products/` | `?search=&category=&brand=&min_price=&max_price=&ordering=name&page=1&page_size=20` | Paginated `{ results: [...], count }` |
| `GET` | `/api/products/{id}/` | — | Single product with reviews |
| `GET` | `/api/categories/` | — | `[{ id, name, description, image_url }]` |

### 8.2 Cart

| Method | URL | Request Body | Response |
|--------|-----|-------------|----------|
| `GET` | `/api/cart/` | — | `[{ id, product_id, product_name, product_image, selling_price, quantity, stock_quantity }]` |
| `POST` | `/api/cart/` | `{ product_id, quantity }` | Created cart item |
| `PATCH` | `/api/cart/{item_id}/` | `{ quantity }` | Updated cart item |
| `DELETE` | `/api/cart/{item_id}/` | — | `204` |
| `DELETE` | `/api/cart/clear/` | — | `204` — removes all items |

### 8.3 Wishlist

| Method | URL | Request Body | Response |
|--------|-----|-------------|----------|
| `GET` | `/api/wishlist/` | — | `[{ id, product_id, product_name, product_image, selling_price, stock_quantity, added_at }]` |
| `POST` | `/api/wishlist/` | `{ product_id }` | Created wishlist item |
| `DELETE` | `/api/wishlist/{product_id}/` | — | `204` |

### 8.4 Orders (Customer)

| Method | URL | Request Body | Response |
|--------|-----|-------------|----------|
| `POST` | `/api/orders/` | `{ shipping_address, payment_method, notes }` | Created order (auto-pulls items from cart, clears cart) |
| `GET` | `/api/orders/my/` | `?page=1&ordering=-order_date` | Paginated `{ results: [...] }` — only current user's orders |
| `GET` | `/api/orders/{id}/` | — | Order detail with items |
| `PATCH` | `/api/orders/{id}/cancel/` | — | `{ detail: "Order cancelled" }` (only if status=Pending) |

### 8.5 Reviews

| Method | URL | Request Body | Response |
|--------|-----|-------------|----------|
| `GET` | `/api/products/{id}/reviews/` | — | `[{ id, user_name, rating, comment, created_at }]` |
| `POST` | `/api/products/{id}/reviews/` | `{ rating, comment }` | Created review |

### 8.6 Profile

See [Authentication API](#5-authentication-api) — `GET/PATCH /api/auth/profile/` and `POST /api/auth/change-password/`.

---

## 9. Admin API Endpoints

The Admin section has 5 pages: **Dashboard**, **User Management**, **Supplier Management**, **System Logs**, **Analytics Summary**.

**All admin endpoints require `role === 'admin'`** — implement a custom permission class:

```python
# admin_panel/permissions.py
from rest_framework.permissions import BasePermission

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'
```

### 9.1 Dashboard / System Overview

| Method | URL | Query Params | Response |
|--------|-----|-------------|----------|
| `GET` | `/api/admin/system-overview/` | — | System-wide KPIs |
| `GET` | `/api/admin/users-by-role/` | — | User count per role |
| `GET` | `/api/admin/registration-trend/` | `?days=30` | Daily registration counts |
| `GET` | `/api/admin/recent-activity/` | `?limit=10` | Recent system log entries |
| `GET` | `/api/admin/supplier-performance/` | `?limit=5` | Top suppliers by on-time rate |

#### System Overview Response

```json
{
  "total_users": 245,
  "total_products": 1250,
  "total_orders": 3420,
  "total_revenue": 45000000,
  "active_suppliers": 28,
  "avg_order_value": 13157,
  "user_growth": 12.5,
  "product_growth": 3.2,
  "order_growth": 8.7,
  "revenue_growth": 15.3,
  "supplier_growth": 5.0,
  "aov_growth": 2.1
}
```

#### Users by Role

```json
[
  { "role": "customer", "count": 200 },
  { "role": "owner", "count": 25 },
  { "role": "warehouse", "count": 15 },
  { "role": "admin", "count": 5 }
]
```

#### Registration Trend

```json
[
  { "date": "2025-06-01", "count": 5 },
  { "date": "2025-06-02", "count": 8 }
]
```

#### Recent Activity

```json
[
  {
    "description": "User 'john@example.com' logged in",
    "type": "info",
    "timestamp": "2025-06-15T14:30:00Z"
  }
]
```
- `type`: `"info"`, `"warning"`, `"error"`, `"success"`

#### Supplier Performance

```json
[
  { "name": "Samsung Nepal", "on_time_rate": 95.5 },
  { "name": "Apple Authorized", "on_time_rate": 92.0 }
]
```

### 9.2 User Management

| Method | URL | Query Params / Body | Response |
|--------|-----|---------------------|----------|
| `GET` | `/api/admin/users/` | `?page=1&per_page=20&search=&role=&is_active=true` | Paginated `{ results: [...], count, total_pages }` |
| `GET` | `/api/admin/users/{id}/` | — | Single user detail |
| `POST` | `/api/admin/users/` | `{ first_name, last_name, email, phone, role, company_name, password }` | Created user |
| `PATCH` | `/api/admin/users/{id}/` | Partial user fields | Updated user |
| `DELETE` | `/api/admin/users/{id}/` | — | `204` (cannot delete admin users) |
| `PATCH` | `/api/admin/users/{id}/toggle-status/` | — | `{ is_active: true/false }` |
| `POST` | `/api/admin/users/{id}/reset-password/` | — | `{ detail: "Password reset email sent" }` |
| `GET` | `/api/admin/users/{id}/activity/` | `?limit=20` | `[{ action, description, timestamp }]` |

#### User Object (Admin view)

```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+977 9841234567",
  "role": "customer",
  "company_name": "",
  "is_active": true,
  "date_joined": "2025-01-15T10:30:00Z",
  "last_login": "2025-06-15T14:20:00Z"
}
```

#### User Activity

```json
[
  {
    "action": "LOGIN",
    "description": "Logged in from 192.168.1.10",
    "timestamp": "2025-06-15T14:20:00Z"
  }
]
```

**Business Rules:**
- Admin cannot delete other admin users
- `company_name` field is required when role is `owner` or `warehouse`
- Password reset generates a temporary password and sends email
- Toggle status flips `is_active` between true/false

### 9.3 Supplier Management

| Method | URL | Query Params / Body | Response |
|--------|-----|---------------------|----------|
| `GET` | `/api/admin/suppliers/` | `?page=1&per_page=20&search=&type=manufacturer` | Paginated `{ results: [...], count, total_pages }` |
| `GET` | `/api/admin/suppliers/{id}/` | — | Single supplier |
| `POST` | `/api/admin/suppliers/` | `{ name, email, phone, company, type, address }` | Created supplier |
| `PATCH` | `/api/admin/suppliers/{id}/` | Partial fields | Updated supplier |
| `PATCH` | `/api/admin/suppliers/{id}/toggle-status/` | — | `{ is_active: true/false }` |
| `GET` | `/api/admin/supplier-stats/` | — | Aggregate supplier stats |

#### Supplier Object (Admin view)

```json
{
  "id": 1,
  "name": "Samsung Nepal",
  "email": "contact@samsung.np",
  "phone": "+977 9801234567",
  "company": "Samsung Electronics",
  "type": "manufacturer",
  "address": "Kathmandu, Nepal",
  "is_active": true,
  "rating": 4.5,
  "on_time_delivery_rate": 95.5,
  "product_count": 45,
  "created_at": "2025-01-10T10:00:00Z"
}
```

#### Supplier Stats

```json
{
  "total": 28,
  "avg_on_time_rate": 88.5,
  "avg_rating": 4.2,
  "total_products": 1250
}
```

### 9.4 System Logs

| Method | URL | Query Params | Response |
|--------|-----|-------------|----------|
| `GET` | `/api/admin/logs/` | `?page=1&per_page=25&search=&action=&status=&date_from=&date_to=` | Paginated `{ results: [...], count, total_pages }` |
| `GET` | `/api/admin/log-stats/` | Same filter params | `{ total, success, failure, warning }` |
| `GET` | `/api/admin/logs/export/` | Same filter params | CSV file download |

#### Log Object

```json
{
  "id": 1,
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "user_role": "owner",
  "action": "CREATE",
  "description": "Created product 'Samsung Galaxy S24 Ultra'",
  "ip_address": "192.168.1.10",
  "status": "success",
  "timestamp": "2025-06-15T14:30:00Z"
}
```

#### Log Stats

```json
{
  "total": 1520,
  "success": 1450,
  "failure": 45,
  "warning": 25
}
```

**Log Creation Rules** (implement via Django signals or middleware):
- Log all `LOGIN` / `LOGOUT` events
- Log all `CREATE` / `UPDATE` / `DELETE` operations on products, orders, users, suppliers
- Log all `ERROR` events (failed auth, server errors)
- Log `EXPORT` events (CSV downloads)
- Capture `ip_address` from `request.META['REMOTE_ADDR']`
- Store `user_name`, `user_email`, `user_role` for denormalized access

### 9.5 Analytics Summary

| Method | URL | Query Params | Response |
|--------|-----|-------------|----------|
| `GET` | `/api/admin/analytics/revenue-summary/` | `?days=30` | Revenue KPIs |
| `GET` | `/api/admin/analytics/revenue-by-owner/` | `?days=30` | Revenue per owner |
| `GET` | `/api/admin/analytics/revenue-trend/` | `?days=30` | Daily revenue + orders |
| `GET` | `/api/admin/analytics/category-performance/` | `?days=30` | Revenue + orders per category |
| `GET` | `/api/admin/analytics/customer-analytics/` | `?days=30` | Customer behavior metrics |
| `GET` | `/api/admin/analytics/user-growth/` | `?days=30` | Daily new customers + owners |

#### Revenue Summary

```json
{
  "total_revenue": 45000000,
  "total_orders": 3420,
  "avg_order_value": 13157,
  "revenue_growth": 15.3,
  "order_growth": 8.7,
  "aov_growth": 2.1
}
```

#### Revenue by Owner

```json
[
  { "owner_name": "Evo Store Nepal", "revenue": 18000000 },
  { "owner_name": "CG Digital", "revenue": 12000000 }
]
```

#### Revenue Trend

```json
[
  { "date": "2025-06-01", "revenue": 450000, "orders": 15 },
  { "date": "2025-06-02", "revenue": 620000, "orders": 22 }
]
```

#### Category Performance

```json
[
  { "name": "Smartphones", "revenue": 25000000, "order_count": 1200 },
  { "name": "Laptops", "revenue": 12000000, "order_count": 800 }
]
```

#### Customer Analytics

```json
{
  "active_customers": 180,
  "customer_growth": 12.5,
  "repeat_rate": 35.5,
  "avg_lifetime_value": 45000,
  "cart_abandonment_rate": 22.0,
  "avg_reviews_per_product": 3.2
}
```

#### User Growth

```json
[
  { "date": "2025-06-01", "customers": 5, "owners": 1 },
  { "date": "2025-06-02", "customers": 8, "owners": 0 }
]
```

---

## 10. Frontend File Map

```
frontend/src/
├── Config/
│   └── Config.js                  ← API base URL, token keys
├── context/
│   └── AuthContext.jsx            ← Auth state, login/logout, role checks (isOwner/isWarehouse/isAdmin), bypass auth
├── services/
│   └── api.js                     ← Axios instance + ownerAPI + warehouseAPI + customerAPI + adminAPI + authAPI
│
├── components/
│   ├── Common/
│   │   ├── Navbar.jsx             ← Customer top navbar
│   │   └── Footer.jsx             ← Customer footer
│   ├── Owner/
│   │   ├── OwnerNavbar.jsx        ← Owner sidebar/top nav
│   │   ├── OwnerLayout.jsx        ← Auth guard wrapper for /owner/*
│   │   ├── SalesOverviewCards.jsx  ← 4 KPI cards (data prop from API)
│   │   ├── RevenueChart.jsx       ← Plotly revenue/profit line chart
│   │   ├── TopProductsTable.jsx   ← Top products table
│   │   ├── CategoryChart.jsx      ← Plotly category pie chart
│   │   ├── ProductModal.jsx       ← Add/Edit product modal form
│   │   └── OrderDetailsModal.jsx  ← Order detail + status update modal
│   ├── warehouse/
│   │   ├── WarehouseNavbar.jsx    ← Warehouse sidebar nav
│   │   ├── WarehouseLayout.jsx    ← Auth guard wrapper for /warehouse/*
│   │   ├── OwnerFilter.jsx        ← Owner dropdown filter (fetches from API)
│   │   ├── StockLevelCard.jsx     ← KPI card for warehouse dashboard
│   │   ├── InventoryTable.jsx     ← Reusable inventory table
│   │   ├── MovementModal.jsx      ← Dual-mode: view movement details / create new movement
│   │   ├── AlertBadge.jsx         ← Severity badge component
│   │   └── SupplierPanel.jsx      ← Supplier info panel
│   └── admin/
│       ├── AdminNavbar.jsx        ← Admin top nav (red accent, Shield icon)
│       ├── AdminLayout.jsx        ← Auth guard wrapper for /admin/*
│       ├── SystemStatsCard.jsx    ← KPI card with icon, value, change indicator
│       ├── UserTable.jsx          ← User table with avatars, role badges, action buttons
│       ├── UserModal.jsx          ← Add/Edit user modal form (role-conditional fields)
│       ├── SupplierTable.jsx      ← Supplier table with on-time rate bar, rating stars
│       ├── SupplierModal.jsx      ← Add/Edit supplier modal form
│       ├── LogTable.jsx           ← Logs table with action badges, status-tinted rows
│       └── RoleBadge.jsx          ← Role badge component (Customer=gray, Owner=blue, Warehouse=orange, Admin=red)
│
├── pages/
│   ├── Home.jsx                   ← Product showcase (featured items), category cards, add to cart/wishlist/compare actions
│   ├── Customer/
│   │   ├── Login.jsx              ← Login/Register with role selector
│   │   ├── ProductDetail.jsx      ← Product detail page (`/product/:id`) with API + fallback data
│   │   ├── Cart.jsx               ← Shopping cart
│   │   ├── Checkout.jsx           ← Checkout with address + payment
│   │   ├── Wishlist.jsx           ← Saved products
│   │   ├── Compare.jsx            ← Compare products side-by-side
│   │   └── Profile.jsx            ← User profile management
│   ├── Owner/
│   │   ├── Dashboard.jsx          ← KPIs, revenue chart, top products, category chart
│   │   ├── Analytics.jsx          ← Revenue/Products/Orders tabs, Plotly charts
│   │   ├── ProductManagement.jsx  ← CRUD table with search/filter/sort/pagination
│   │   └── OrderManagement.jsx    ← Order table with status pills, detail modal
│   ├── Warehouse/
│   │   ├── Dashboard.jsx          ← KPIs, Plotly stock charts, movements, alerts, deliveries
│   │   ├── InventoryManagement.jsx← Full inventory table, search/filter/sort/pagination, CSV export
│   │   ├── StockMovements.jsx     ← Movement log, type pills, date filters, CSV export, add modal
│   │   └── LowStockAlerts.jsx     ← Alert cards, severity stats, resolve/dismiss actions
│   └── Admin/
│       ├── Dashboard.jsx          ← 6 KPIs, user role pie chart, registration trend, activity feed
│       ├── UserManagement.jsx     ← User CRUD, search/filter, pagination, activity drawer
│       ├── SupplierManagement.jsx ← Supplier tabs (All/Manufacturer/Owner), KPIs, performance chart
│       ├── SystemLogs.jsx         ← Log table, date range, multi-filter, CSV export, pagination
│       └── AnalyticsSummary.jsx   ← Revenue cards, multi-chart analytics, customer insights
│
└── App.jsx                        ← Routes: /, /product/:id, /wishlist, /cart, /compare, /checkout, /login, /profile, /owner/*, /warehouse/*, /admin/*
```

---

## 11. Quick Start Checklist

### For Django Backend Developer

- [ ] Install packages: `pip install -r requirements.txt`
- [ ] Configure MS SQL in `settings.py` (see section 2)
- [ ] Add `corsheaders`, `rest_framework`, `rest_framework_simplejwt` to `INSTALLED_APPS`
- [ ] Create Django apps: `accounts`, `products`, `orders`, `warehouse`, `analytics`, `admin_panel`
- [ ] Create `CustomUser` model extending `AbstractUser` with `role`, `phone`, `address`
- [ ] Set `AUTH_USER_MODEL = 'accounts.CustomUser'` in settings
- [ ] Create all models matching the SQL schema (section 3), including `system_logs`
- [ ] Run `python manage.py makemigrations && python manage.py migrate`
- [ ] Create serializers for each model
- [ ] Build ViewSets/APIViews for all endpoints (sections 5-9)
- [ ] Wire up URLs under `/api/` prefix (including `/api/admin/`)
- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Seed sample data (categories, suppliers, products, users — include 1 admin user)
- [ ] Test each endpoint with Postman/curl

### For MS SQL Developer

- [ ] Create database `electronics_retail_db`
- [ ] Run all CREATE TABLE scripts from section 3
- [ ] Add indexes on frequently queried columns:
  - `products.category_id`, `products.supplier_id`, `products.owner_name`, `products.status`
  - `orders.user_id`, `orders.status`, `orders.order_date`
  - `order_items.order_id`, `order_items.product_id`
  - `stock_movements.product_id`, `stock_movements.type`, `stock_movements.date`
  - `stock_alerts.product_id`, `stock_alerts.status`, `stock_alerts.severity`
  - `cart_items.user_id`, `wishlist_items.user_id`
  - `system_logs.user_id`, `system_logs.action`, `system_logs.timestamp`, `system_logs.entity_type`
- [ ] Create stored procedures (optional, for analytics performance):
  - `sp_GetSalesOverview @days INT` — aggregate orders for sales KPIs
  - `sp_GetRevenueTrend @days INT, @period VARCHAR(10)` — daily/monthly trend
  - `sp_GetStockOverview @owner NVARCHAR(200)` — warehouse KPIs
- [ ] Seed reference data (categories, suppliers)
- [ ] Seed test products (50+ items across categories)
- [ ] Seed test users (1 owner, 1 warehouse, 1 admin, 3 customers)
- [ ] Seed test orders (20+ orders with order_items)
- [ ] Seed stock_movements (30+ records)

### Important Business Rules (implement in Django views)

1. **Order placement** (`POST /api/orders/`):
   - Pull all items from the user's cart
   - Check stock availability for each product
   - Decrement `stock_quantity` for each product
   - Create `stock_movements` records (type=`stock_out`)
   - Clear the user's cart
   - Calculate `subtotal`, `tax_amount` (13% GST), `grand_total`
   - Check if any product falls below `reorder_level` → create `stock_alert`

2. **Order cancellation** (`PATCH /api/orders/{id}/cancel/`):
   - Only allow if `status == 'Pending'`
   - Restore `stock_quantity` for each product
   - Create `stock_movements` records (type=`returned`)
   - Set `status = 'Cancelled'`

3. **Stock movement creation** (`POST /api/warehouse/stock-movements/`):
   - Auto-update product's `stock_quantity`
   - Auto-check if stock crosses `reorder_level` threshold
   - Auto-create `stock_alert` if necessary

4. **Warehouse owners list** (`GET /api/warehouse/owners/`):
   - Return `SELECT DISTINCT owner_name FROM products WHERE owner_name != ''`

5. **Permission guards**:
   - Owner endpoints (`/api/analytics/*`, product CRUD, order management) → require `role == 'owner'`
   - Warehouse endpoints (`/api/warehouse/*`) → require `role == 'warehouse'`
   - Admin endpoints (`/api/admin/*`) → require `role == 'admin'`
   - Customer endpoints (cart, wishlist, my orders) → require authenticated user
   - Product browsing, categories → public (no auth required)

6. **Login must use email** (not username):
   - The frontend sends `{ email, password }` to `/api/auth/login/`
   - The backend should look up the user by email, then authenticate
   - The response MUST include a `user` object with a `role` field

7. **Register must accept frontend form fields**:
   - The frontend sends camelCase: `firstName`, `lastName`, `email`, `password`, `confirmPassword`, `phone`, `dob`, `gender`, `address`, `role`
   - The backend should map these to Django model fields (first_name, last_name, etc.)
   - The backend should validate email uniqueness and passwords match
   - The response should return JWT tokens + user object (same format as login)

8. **JWT 401 handling**:
   - The frontend automatically clears stored tokens and redirects to `/login` on any 401 response
   - The backend should return 401 for expired/invalid tokens
   - Consider implementing token refresh endpoint (`/api/auth/refresh/`) for long sessions

9. **CORS configuration**:
   - The Django backend must allow requests from `http://localhost:5173` (Vite dev server)
   - Add `corsheaders` middleware and whitelist the frontend origin

10. **Pagination format**:
    - All paginated endpoints should return: `{ results: [...], count: N, total_pages: N }`
    - The frontend sends `?page=1&per_page=20` (or `?page_size=20`)
    - Support `?search=query` for text search across relevant fields
