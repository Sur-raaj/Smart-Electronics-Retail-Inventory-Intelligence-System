# Backend Integration Guide — Owner Section

> **For the Backend Developer**: The frontend Owner section is **fully built** and calls real API endpoints (no mock data). Follow this guide to build the Django backend that powers it.

---

## Current State

| Layer | Status |
|-------|--------|
| **Frontend** | Done — 4 pages, 8 components, API service with Axios, JWT auth interceptors. All pages call real API endpoints. |
| **Backend** | Blank Django 6.0.2 project (`page`), SQLite3, no apps, no DRF yet |

**Frontend API base URL**: `http://localhost:8000/api` (configured in `src/Config/Config.js`)

---

## What Was Removed

| Item | Reason |
|------|--------|
| `src/data/mockData.js` | Deleted — all pages now fetch from backend API |
| `src/data/` folder | Deleted — was only used for mock data |

---

## Frontend File Structure (Final)

```
frontend/src/
├── Config/
│   └── Config.js                  ← API base URL config
├── Context/
│   └── AuthContext.jsx            ← Auth state, login/logout, role management
├── services/
│   └── api.js                     ← Axios instance + all API endpoints (ownerAPI + authAPI)
├── components/Common/
│   ├── Navbar.jsx                 ← Customer navbar
│   └── Footer.jsx                 ← Customer footer
├── components/Owner/
│   ├── OwnerNavbar.jsx            ← Owner navbar with accent bar, user dropdown
│   ├── OwnerLayout.jsx            ← Layout wrapper + auth guard for /owner/* routes
│   ├── SalesOverviewCards.jsx     ← 4 KPI cards (receives data prop from API)
│   ├── RevenueChart.jsx           ← Revenue + Profit line chart (Recharts, receives data prop)
│   ├── TopProductsTable.jsx       ← Top 10 products table (receives data prop)
│   ├── CategoryChart.jsx          ← Category pie chart (Recharts, receives data prop)
│   ├── ProductModal.jsx           ← Add/Edit product modal
│   └── OrderDetailsModal.jsx      ← Order details + timeline modal
├── pages/Owner/
│   ├── Dashboard.jsx              ← Calls ownerAPI.getSalesOverview/getRevenueTrend/getTopProducts/getCategoryPerformance
│   ├── ProductManagement.jsx      ← Calls ownerAPI.getAllProducts/createProduct/updateProduct/deleteProduct + getCategories/getSuppliers
│   ├── OrderManagement.jsx        ← Calls ownerAPI.getAllOrders/updateOrderStatus
│   └── Analytics.jsx              ← Calls ownerAPI.getSalesOverview/getRevenueTrend/getTopProducts/getCategoryPerformance + getPaymentMethodStats/getOrderStatusStats/getLowStockProducts/getAllOrders
└── App.jsx                        ← Main routing
```

---

## STEP 1: Install Required Python Packages

```bash
cd backend
pip install djangorestframework django-cors-headers djangorestframework-simplejwt Pillow django-filter
pip freeze > requirements.txt
```

Your `requirements.txt` should include at minimum:
```
Django==6.0.2
djangorestframework
django-cors-headers
djangorestframework-simplejwt
Pillow
django-filter
```

---

## STEP 2: Update `page/settings.py`

Add these to **INSTALLED_APPS**:
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'corsheaders',
    'django_filters',
    # Custom apps
    'accounts',
    'products',
    'orders',
    'analytics',
]
```

Add CORS middleware (MUST be before CommonMiddleware):
```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',       # <-- ADD THIS
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

Add these settings at the bottom of `settings.py`:
```python
# ── CORS ──
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',   # Vite dev server
    'http://127.0.0.1:5173',
]
CORS_ALLOW_CREDENTIALS = True

# ── REST Framework ──
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# ── JWT ──
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# ── Media Files ──
import os
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

---

## STEP 3: Create Django Apps

```bash
cd backend
python manage.py startapp products
python manage.py startapp orders
python manage.py startapp analytics
python manage.py startapp accounts
```

---

## STEP 4: Define Models

### `products/models.py`

```python
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Supplier(models.Model):
    name = models.CharField(max_length=200)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Discontinued', 'Discontinued'),
        ('Out of Stock', 'Out of Stock'),
    ]

    name = models.CharField(max_length=300)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    brand = models.CharField(max_length=100)
    model_number = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    specifications = models.TextField(blank=True, null=True)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=10)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    warranty_months = models.IntegerField(default=12, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.brand})'
```

### `orders/models.py`

```python
from django.db import models
from django.contrib.auth.models import User
from products.models import Product

class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Failed', 'Failed'),
        ('Refunded', 'Refunded'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    payment_method = models.CharField(max_length=50)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='Pending')
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    shipping_address = models.TextField()

    class Meta:
        ordering = ['-order_date']

    def __str__(self):
        return f'Order #{self.pk} - {self.user.get_full_name()}'

    @property
    def user_name(self):
        return self.user.get_full_name() or self.user.username

    @property
    def user_email(self):
        return self.user.email

    @property
    def items_count(self):
        return self.items.count()


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f'{self.product.name} x{self.quantity}'
```

### `accounts/models.py`

```python
from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('owner', 'Owner'),
    ]
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} ({self.role})'
```

### `accounts/serializers.py`

```python
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile
import re
from datetime import date

class SignupSerializer(serializers.Serializer):
    firstName = serializers.CharField(max_length=30)
    lastName = serializers.CharField(max_length=30)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirmPassword = serializers.CharField(write_only=True)
    phone = serializers.CharField(max_length=15)
    address = serializers.CharField()
    gender = serializers.ChoiceField(choices=['male', 'female', 'other'])
    dob = serializers.DateField()

    def validate_email(self, value):
        value = value.lower().strip()
        if not re.search(r'(@gmail\.com|\.edu\.np)$', value, re.IGNORECASE):
            raise serializers.ValidationError('Email must end with @gmail.com or .edu.np')
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('An account with this email already exists')
        return value

    def validate_password(self, value):
        if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$', value):
            raise serializers.ValidationError(
                'Password must be 8+ chars with uppercase, lowercase, number, and special character'
            )
        return value

    def validate_phone(self, value):
        if not re.match(r'^\d{10}$', value):
            raise serializers.ValidationError('Phone number must be exactly 10 digits')
        return value

    def validate_dob(self, value):
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 16:
            raise serializers.ValidationError('You must be at least 16 years old to sign up')
        return value

    def validate(self, data):
        if data['password'] != data['confirmPassword']:
            raise serializers.ValidationError({'confirmPassword': 'Passwords do not match'})
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],  # Use email as username
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['firstName'],
            last_name=validated_data['lastName'],
        )
        Profile.objects.create(
            user=user,
            role='customer',
            phone=validated_data['phone'],
            address=validated_data['address'],
            gender=validated_data['gender'],
            dob=validated_data['dob'],
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class UserProfileSerializer(serializers.Serializer):
    """Returns user data in the format the frontend expects (camelCase)."""
    id = serializers.IntegerField(source='user.id')
    firstName = serializers.CharField(source='user.first_name')
    lastName = serializers.CharField(source='user.last_name')
    email = serializers.EmailField(source='user.email')
    phone = serializers.CharField()
    address = serializers.CharField()
    gender = serializers.CharField()
    dob = serializers.DateField()
    role = serializers.CharField()
    createdAt = serializers.DateTimeField(source='created_at')
```

### `accounts/views.py`

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .serializers import SignupSerializer, LoginSerializer, UserProfileSerializer
from .models import Profile


class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if not serializer.is_valid():
            # Return first error message
            first_error = next(iter(serializer.errors.values()))[0]
            return Response(
                {'message': str(first_error)},
                status=status.HTTP_400_BAD_REQUEST
            )
        user = serializer.save()
        tokens = RefreshToken.for_user(user)
        profile = user.profile
        return Response({
            'user': UserProfileSerializer(profile).data,
            'access': str(tokens.access_token),
            'refresh': str(tokens),
            'message': 'Account created successfully',
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email'].lower().strip()
        password = serializer.validated_data['password']

        # Find user by email
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'message': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = authenticate(username=user_obj.username, password=password)
        if user is None:
            return Response(
                {'message': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        tokens = RefreshToken.for_user(user)
        profile = user.profile
        return Response({
            'user': UserProfileSerializer(profile).data,
            'access': str(tokens.access_token),
            'refresh': str(tokens),
        })


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        return Response(UserProfileSerializer(profile).data)
```

### `accounts/urls.py`

```python
from django.urls import path
from .views import SignupView, LoginView, ProfileView

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth_login'),
    path('signup/', SignupView.as_view(), name='auth_signup'),
    path('profile/', ProfileView.as_view(), name='auth_profile'),
]
```

---

## STEP 5: Create Serializers

### `products/serializers.py`

```python
from rest_framework import serializers
from .models import Category, Supplier, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'rating']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True, default=None)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'category_name', 'brand',
            'model_number', 'description', 'specifications',
            'cost_price', 'selling_price', 'stock_quantity',
            'reorder_level', 'supplier', 'supplier_name',
            'warranty_months', 'status', 'image_url',
            'created_at', 'updated_at',
        ]
```

### `orders/serializers.py`

```python
from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal']


class OrderListSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(read_only=True)
    user_email = serializers.CharField(read_only=True)
    items_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_name', 'user_email',
            'order_date', 'items_count', 'total_amount',
            'tax_amount', 'shipping_cost', 'discount_amount',
            'grand_total', 'status', 'payment_method',
            'payment_status', 'tracking_number', 'shipping_address',
        ]


class OrderDetailSerializer(OrderListSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta(OrderListSerializer.Meta):
        fields = OrderListSerializer.Meta.fields + ['items']
```

---

## STEP 6: Create Views

### `products/views.py`

```python
from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Category, Supplier, Product
from .serializers import CategorySerializer, SupplierSerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Return all categories (small list)


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category', 'supplier').all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'status', 'brand']
    search_fields = ['name', 'brand', 'description']
    ordering_fields = ['name', 'selling_price', 'stock_quantity', 'created_at']
```

### `orders/views.py`

```python
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Order
from .serializers import OrderListSerializer, OrderDetailSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('user').all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'payment_method']
    search_fields = ['id', 'user__first_name', 'user__last_name', 'user__email']
    ordering_fields = ['order_date', 'grand_total']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrderDetailSerializer
        return OrderListSerializer

    def partial_update(self, request, *args, **kwargs):
        """Handle status updates via PATCH"""
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status:
            order.status = new_status
            order.save()
            return Response(OrderListSerializer(order).data)
        return super().partial_update(request, *args, **kwargs)
```

### `analytics/views.py`

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count, Avg, F, Value
from django.db.models.functions import TruncDate, TruncMonth
from datetime import datetime, timedelta
from orders.models import Order, OrderItem
from products.models import Product, Category


class SalesOverviewView(APIView):
    """
    GET /api/analytics/sales-overview/
    Query params: start_date, end_date (YYYY-MM-DD)

    Returns the KPI object the frontend SalesOverviewCards component expects.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start = request.query_params.get('start_date')
        end = request.query_params.get('end_date')

        orders = Order.objects.exclude(status='Cancelled')
        if start:
            orders = orders.filter(order_date__date__gte=start)
        if end:
            orders = orders.filter(order_date__date__lte=end)

        metrics = orders.aggregate(
            total_revenue=Sum('grand_total'),
            total_orders=Count('id'),
            avg_order_value=Avg('grand_total'),
            total_customers=Count('user', distinct=True),
        )

        items_agg = OrderItem.objects.filter(order__in=orders).aggregate(
            total_items_sold=Sum('quantity'),
        )

        # Calculate profit (revenue - cost)
        total_revenue = float(metrics['total_revenue'] or 0)
        item_cost = OrderItem.objects.filter(order__in=orders).aggregate(
            total_cost=Sum(F('quantity') * F('product__cost_price'))
        )
        total_cost = float(item_cost['total_cost'] or 0)
        total_profit = total_revenue - total_cost
        profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0

        return Response({
            'total_revenue': round(total_revenue, 2),
            'total_profit': round(total_profit, 2),
            'total_items_sold': items_agg['total_items_sold'] or 0,
            'total_orders': metrics['total_orders'] or 0,
            'avg_order_value': round(float(metrics['avg_order_value'] or 0), 2),
            'profit_margin': round(profit_margin, 1),
            'revenue_change': 0,   # Implement comparison with previous period
            'profit_change': 0,
            'total_customers': metrics['total_customers'] or 0,
            'period_start': start,
            'period_end': end,
        })


class RevenueTrendView(APIView):
    """
    GET /api/analytics/revenue-trend/
    Query params: start_date, end_date, period (daily|monthly)

    Returns array the frontend RevenueChart expects.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start = request.query_params.get('start_date')
        end = request.query_params.get('end_date')
        period = request.query_params.get('period', 'daily')

        orders = Order.objects.exclude(status='Cancelled')
        if start:
            orders = orders.filter(order_date__date__gte=start)
        if end:
            orders = orders.filter(order_date__date__lte=end)

        trunc_fn = TruncDate if period == 'daily' else TruncMonth

        data = (
            orders.annotate(p=trunc_fn('order_date'))
            .values('p')
            .annotate(
                revenue=Sum('grand_total'),
                order_count=Count('id'),
            )
            .order_by('p')
        )

        result = []
        for d in data:
            # Estimate profit as 30% of revenue (improve later with actual cost calc)
            rev = float(d['revenue'] or 0)
            result.append({
                'period': d['p'].isoformat() if d['p'] else '',
                'revenue': round(rev, 2),
                'profit': round(rev * 0.3, 2),
                'order_count': d['order_count'],
            })

        return Response(result)


class TopProductsView(APIView):
    """
    GET /api/analytics/top-products/
    Query params: start_date, end_date, limit (default 10)

    Returns array the frontend TopProductsTable expects.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start = request.query_params.get('start_date')
        end = request.query_params.get('end_date')
        limit = int(request.query_params.get('limit', 10))

        items = OrderItem.objects.filter(order__status__in=['Processing', 'Shipped', 'Delivered'])
        if start:
            items = items.filter(order__order_date__date__gte=start)
        if end:
            items = items.filter(order__order_date__date__lte=end)

        top = (
            items.values('product')
            .annotate(
                total_quantity_sold=Sum('quantity'),
                total_revenue=Sum('subtotal'),
                total_cost=Sum(F('quantity') * F('product__cost_price')),
            )
            .order_by('-total_revenue')[:limit]
        )

        result = []
        for rank, item in enumerate(top, 1):
            product = Product.objects.select_related('category').get(pk=item['product'])
            revenue = float(item['total_revenue'] or 0)
            cost = float(item['total_cost'] or 0)
            profit = revenue - cost
            margin = (profit / revenue * 100) if revenue > 0 else 0
            result.append({
                'rank': rank,
                'product_id': product.pk,
                'name': product.name,
                'brand': product.brand,
                'category': product.category.name,
                'total_quantity_sold': item['total_quantity_sold'],
                'total_revenue': round(revenue, 2),
                'total_profit': round(profit, 2),
                'profit_margin': round(margin, 1),
            })

        return Response(result)


class CategoryPerformanceView(APIView):
    """
    GET /api/analytics/category-performance/
    Query params: start_date, end_date

    Returns array the frontend CategoryChart expects.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start = request.query_params.get('start_date')
        end = request.query_params.get('end_date')

        items = OrderItem.objects.filter(order__status__in=['Processing', 'Shipped', 'Delivered'])
        if start:
            items = items.filter(order__order_date__date__gte=start)
        if end:
            items = items.filter(order__order_date__date__lte=end)

        cats = (
            items.values(
                category_id=F('product__category__id'),
                category_name=F('product__category__name'),
            )
            .annotate(
                total_revenue=Sum('subtotal'),
                product_count=Count('product', distinct=True),
            )
            .order_by('-total_revenue')
        )

        grand = sum(float(c['total_revenue'] or 0) for c in cats)

        result = []
        for c in cats:
            rev = float(c['total_revenue'] or 0)
            result.append({
                'category_id': c['category_id'],
                'category_name': c['category_name'],
                'product_count': c['product_count'],
                'total_revenue': round(rev, 2),
                'percentage': round((rev / grand * 100) if grand > 0 else 0, 1),
            })

        return Response(result)
```

---

## STEP 7: Configure URLs

### `products/urls.py` (create this file)

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, SupplierViewSet, ProductViewSet

router = DefaultRouter()
router.register('products', ProductViewSet)
router.register('categories', CategoryViewSet)
router.register('suppliers', SupplierViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

### `orders/urls.py` (create this file)

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

router = DefaultRouter()
router.register('orders', OrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

### `analytics/urls.py` (create this file)

```python
from django.urls import path
from .views import (
    SalesOverviewView,
    RevenueTrendView,
    TopProductsView,
    CategoryPerformanceView,
    PaymentMethodStatsView,
    OrderStatusStatsView,
    LowStockProductsView,
)

urlpatterns = [
    path('analytics/sales-overview/', SalesOverviewView.as_view()),
    path('analytics/revenue-trend/', RevenueTrendView.as_view()),
    path('analytics/top-products/', TopProductsView.as_view()),
    path('analytics/category-performance/', CategoryPerformanceView.as_view()),
    path('analytics/payment-methods/', PaymentMethodStatsView.as_view()),
    path('analytics/order-status/', OrderStatusStatsView.as_view()),
    path('analytics/low-stock/', LowStockProductsView.as_view()),
]
```

### Update `page/urls.py`

```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth (custom login/signup/profile via accounts app)
    path('api/auth/', include('accounts.urls')),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # App APIs (all under /api/)
    path('api/', include('products.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

---

## STEP 8: Run Migrations

```bash
cd backend
python manage.py makemigrations products orders
python manage.py migrate
python manage.py createsuperuser
```

---

## STEP 9: Seed Sample Data (Optional)

Create `products/management/commands/seed_data.py`:

```python
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from products.models import Category, Supplier, Product
from orders.models import Order, OrderItem
from decimal import Decimal
import random
from datetime import timedelta
from django.utils import timezone


class Command(BaseCommand):
    help = 'Seed sample data for development'

    def handle(self, *args, **kwargs):
        # Categories
        cat_names = ['Smartphones', 'Laptops', 'Tablets', 'Smart Watches',
                     'Headphones', 'Cameras', 'Drones', 'Gaming',
                     'Speakers', 'Display', 'Accessories', 'Smart Home']
        cats = {}
        for name in cat_names:
            c, _ = Category.objects.get_or_create(name=name)
            cats[name] = c

        # Suppliers
        sup_data = [
            ('Apple Inc.', 4.8), ('Samsung Electronics', 4.5),
            ('Sony Corporation', 4.6), ('Dell Technologies', 4.3),
            ('Lenovo Group', 4.2), ('Canon Inc.', 4.4),
            ('DJI Technology', 4.7), ('Bose Corporation', 4.5),
        ]
        sups = {}
        for name, rating in sup_data:
            s, _ = Supplier.objects.get_or_create(name=name, defaults={'rating': rating})
            sups[name] = s

        # Products
        products_data = [
            ('iPhone 15 Pro Max', 'Smartphones', 'Apple', 104999, 149999, 45, 'Apple Inc.'),
            ('Samsung Galaxy S24 Ultra', 'Smartphones', 'Samsung', 89999, 129999, 32, 'Samsung Electronics'),
            ('MacBook Pro 16"', 'Laptops', 'Apple', 174999, 249900, 18, 'Apple Inc.'),
            ('Dell XPS 15', 'Laptops', 'Dell', 124999, 179999, 22, 'Dell Technologies'),
            ('iPad Pro 12.9"', 'Tablets', 'Apple', 89999, 129999, 28, 'Apple Inc.'),
            ('Sony WH-1000XM5', 'Headphones', 'Sony', 19999, 29999, 67, 'Sony Corporation'),
            ('Apple Watch Ultra 2', 'Smart Watches', 'Apple', 59999, 89999, 35, 'Apple Inc.'),
            ('Canon EOS R6 Mark II', 'Cameras', 'Canon', 174999, 249999, 8, 'Canon Inc.'),
            ('Samsung Galaxy Tab S9', 'Tablets', 'Samsung', 55999, 79999, 41, 'Samsung Electronics'),
            ('DJI Mini 4 Pro', 'Drones', 'DJI', 69999, 99999, 15, 'DJI Technology'),
        ]
        prods = []
        for name, cat, brand, cost, sell, stock, sup in products_data:
            p, _ = Product.objects.get_or_create(
                name=name,
                defaults={
                    'category': cats[cat], 'brand': brand,
                    'cost_price': Decimal(cost), 'selling_price': Decimal(sell),
                    'stock_quantity': stock, 'supplier': sups.get(sup),
                }
            )
            prods.append(p)

        # ── Create 5 Owner accounts ──
        owners_data = [
            ('owner1', 'Sushant', 'Adhikari', 'owner1@gmail.com', '9841000001'),
            ('owner2', 'Aarav', 'Sharma', 'owner2@gmail.com', '9841000002'),
            ('owner3', 'Priya', 'Thapa', 'owner3@gmail.com', '9841000003'),
            ('owner4', 'Bikash', 'Poudel', 'owner4@gmail.com', '9841000004'),
            ('owner5', 'Sneha', 'Karki', 'owner5@gmail.com', '9841000005'),
        ]
        for uname, fname, lname, email, phone in owners_data:
            owner, created = User.objects.get_or_create(
                username=uname,
                defaults={
                    'first_name': fname, 'last_name': lname,
                    'email': email, 'is_staff': True,
                }
            )
            if created or not owner.has_usable_password():
                owner.set_password('Owner@123')
                owner.save()
            # Create/update profile with role='owner'
            from accounts.models import Profile
            Profile.objects.update_or_create(
                user=owner,
                defaults={'role': 'owner', 'phone': phone, 'address': 'Kathmandu, Nepal', 'gender': 'male' if uname != 'owner3' and uname != 'owner5' else 'female'}
            )
        self.stdout.write(self.style.SUCCESS(f'Created {len(owners_data)} owner accounts'))

        # ── Create test customer ──
        user, _ = User.objects.get_or_create(
            username='testcustomer',
            defaults={'first_name': 'Rahul', 'last_name': 'Sharma', 'email': 'rahul@example.com'}
        )
        if not user.has_usable_password():
            user.set_password('test1234')
            user.save()
        Profile.objects.update_or_create(
            user=user,
            defaults={'role': 'customer', 'phone': '9841234567', 'address': 'Sankhamul, Kathmandu', 'gender': 'male'}
        )

        # Sample orders
        statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
        methods = ['Credit Card', 'UPI', 'Debit Card', 'Cash on Delivery', 'Net Banking']
        for i in range(10):
            prod = random.choice(prods)
            qty = random.randint(1, 3)
            total = prod.selling_price * qty
            tax = total * Decimal('0.1')
            grand = total + tax
            order = Order.objects.create(
                user=user,
                total_amount=total,
                tax_amount=tax,
                grand_total=grand,
                status=random.choice(statuses),
                payment_method=random.choice(methods),
                payment_status='Completed' if random.random() > 0.3 else 'Pending',
                shipping_address='Sankhamul, Kathmandu',
            )
            order.order_date = timezone.now() - timedelta(days=random.randint(0, 30))
            order.save()
            OrderItem.objects.create(
                order=order,
                product=prod,
                quantity=qty,
                unit_price=prod.selling_price,
                subtotal=prod.selling_price * qty,
            )

        self.stdout.write(self.style.SUCCESS('Sample data seeded successfully!'))
```

Run it:
```bash
mkdir -p products/management/commands
# Create __init__.py files
touch products/management/__init__.py
touch products/management/commands/__init__.py
# Then run:
python manage.py seed_data
```

---

## API Endpoint Reference

These are the **exact** endpoints the frontend calls. All are prefixed with `/api/`:

| Method | Endpoint | Frontend Usage | Response |
|--------|----------|---------------|----------|
| `POST` | `/api/auth/login/` | Login (owner + customer) | `{ user: {..., role}, access, refresh }` |
| `POST` | `/api/auth/signup/` | Customer signup | `{ user: {..., role}, access, refresh, message }` |
| `POST` | `/api/auth/refresh/` | Token refresh | `{ access }` |
| `GET` | `/api/auth/profile/` | Get user profile (authenticated) | `{ id, firstName, lastName, email, phone, address, role, ... }` |
| `GET` | `/api/analytics/sales-overview/?start_date=&end_date=` | Dashboard KPIs | `{ total_revenue, total_profit, total_items_sold, total_orders, avg_order_value, profit_margin, revenue_change, profit_change, total_customers }` |
| `GET` | `/api/analytics/revenue-trend/?start_date=&end_date=&period=daily` | Revenue chart | `[{ period, revenue, profit, order_count }]` |
| `GET` | `/api/analytics/top-products/?start_date=&end_date=&limit=10` | Top products table | `[{ rank, product_id, name, brand, category, total_quantity_sold, total_revenue, total_profit, profit_margin }]` |
| `GET` | `/api/analytics/category-performance/?start_date=&end_date=` | Category pie chart | `[{ category_id, category_name, product_count, total_revenue, percentage }]` |
| `GET` | `/api/analytics/payment-methods/?start_date=&end_date=` | Payment method breakdown (Analytics) | `[{ name, value }]` — name = payment method, value = total amount |
| `GET` | `/api/analytics/order-status/` | Order status distribution (Analytics) | `[{ name, value }]` — name = status, value = count |
| `GET` | `/api/analytics/low-stock/` | Low stock alert table (Analytics) | `[{ id, name, category_name, stock_quantity, reorder_level, status }]` |
| `GET` | `/api/products/` | Product list | Paginated `{ count, next, previous, results: [...] }` |
| `POST` | `/api/products/` | Add product | Product object |
| `PUT` | `/api/products/:id/` | Edit product | Product object |
| `DELETE` | `/api/products/:id/` | Delete product | 204 No Content |
| `GET` | `/api/orders/` | Order list | Paginated `{ count, next, previous, results: [...] }` |
| `GET` | `/api/orders/:id/` | Order detail | Order + items |
| `PATCH` | `/api/orders/:id/` | Update status | `{ status: "Shipped" }` |
| `GET` | `/api/categories/` | Category dropdown | `[{ id, name }]` |
| `GET` | `/api/suppliers/` | Supplier dropdown | `[{ id, name, rating }]` |

---

## Frontend → Backend Field Mapping

All field names use **snake_case** (Python convention). The frontend already follows this. Key fields:

**Product fields**: `id`, `name`, `category`, `category_name`, `brand`, `model_number`, `description`, `specifications`, `cost_price`, `selling_price`, `stock_quantity`, `reorder_level`, `supplier`, `supplier_name`, `warranty_months`, `status`, `image_url`, `created_at`, `updated_at`

**Order fields**: `id`, `user`, `user_name`, `user_email`, `user_phone`, `order_date`, `items_count`, `total_amount`, `tax_amount`, `shipping_cost`, `discount_amount`, `grand_total`, `status`, `payment_method`, `payment_status`, `tracking_number`, `shipping_address`

**Important**: Products use `id` (not `product_id`) in list/CRUD endpoints. Orders use `id` (not `order_id`) in list/CRUD endpoints. Only the analytics `top-products` endpoint uses `product_id`.

**Analytics fields**: Match the response shapes in the API table above exactly.

---

## STEP 10: Additional Analytics Views (Required)

The frontend Analytics page calls 3 extra endpoints not covered in Step 6. Add these to `analytics/views.py`:

```python
class PaymentMethodStatsView(APIView):
    """
    GET /api/analytics/payment-methods/
    Query params: start_date, end_date

    Returns payment method revenue distribution for Analytics pie chart.
    Response: [{ "name": "Credit Card", "value": 192997 }, ...]
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start = request.query_params.get('start_date')
        end = request.query_params.get('end_date')

        orders = Order.objects.exclude(status='Cancelled')
        if start:
            orders = orders.filter(order_date__date__gte=start)
        if end:
            orders = orders.filter(order_date__date__lte=end)

        data = (
            orders.values('payment_method')
            .annotate(value=Sum('grand_total'))
            .order_by('-value')
        )

        result = [{'name': d['payment_method'], 'value': float(d['value'] or 0)} for d in data]
        return Response(result)


class OrderStatusStatsView(APIView):
    """
    GET /api/analytics/order-status/
    Query params: start_date, end_date

    Returns order status count distribution for Analytics pie chart.
    Response: [{ "name": "Delivered", "value": 4 }, ...]
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start = request.query_params.get('start_date')
        end = request.query_params.get('end_date')

        orders = Order.objects.all()
        if start:
            orders = orders.filter(order_date__date__gte=start)
        if end:
            orders = orders.filter(order_date__date__lte=end)

        data = orders.values('status').annotate(value=Count('id')).order_by('-value')
        result = [{'name': d['status'], 'value': d['value']} for d in data]
        return Response(result)


class LowStockProductsView(APIView):
    """
    GET /api/analytics/low-stock/
    
    Returns products where stock_quantity <= reorder_level.
    Response: [{ "id": 1, "name": "...", "category_name": "...", "stock_quantity": 0, "reorder_level": 10, "status": "Out of Stock" }]
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from products.models import Product
        products = (
            Product.objects.select_related('category')
            .filter(stock_quantity__lte=models.F('reorder_level'))
            .order_by('stock_quantity')
        )
        result = [
            {
                'id': p.pk,
                'name': p.name,
                'category_name': p.category.name,
                'stock_quantity': p.stock_quantity,
                'reorder_level': p.reorder_level,
                'status': p.status,
            }
            for p in products
        ]
        return Response(result)
```

**Don't forget** to import `Count` at the top of `analytics/views.py`:
```python
from django.db.models import Sum, Count, Avg, F, Value
```

---

## STEP 11: Add `user_phone` to Order Serializer

The frontend OrderDetailsModal displays `user_phone`. Since we now have the `accounts.Profile` model with a `phone` field, use it:

```python
# orders/serializers.py — update user_phone
class OrderListSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(read_only=True)
    user_email = serializers.CharField(read_only=True)
    user_phone = serializers.SerializerMethodField()
    items_count = serializers.IntegerField(read_only=True)

    def get_user_phone(self, obj):
        return getattr(obj.user.profile, 'phone', '') if hasattr(obj.user, 'profile') else ''
```

---

## Quick Verification Checklist

After completing all steps, verify:

- [ ] `python manage.py runserver` starts without errors
- [ ] `http://localhost:8000/admin/` loads Django admin
- [ ] `http://localhost:8000/api/products/` returns JSON (after auth)
- [ ] `http://localhost:8000/api/orders/` returns JSON (after auth)
- [ ] `http://localhost:8000/api/analytics/sales-overview/` returns KPI data
- [ ] `http://localhost:8000/api/analytics/payment-methods/` returns payment breakdown
- [ ] `http://localhost:8000/api/analytics/order-status/` returns status counts
- [ ] `http://localhost:8000/api/analytics/low-stock/` returns low stock products
- [ ] `http://localhost:8000/api/categories/` returns categories list
- [ ] `http://localhost:8000/api/suppliers/` returns suppliers list
- [ ] Frontend at `http://localhost:5173/owner/dashboard` loads without CORS errors
- [ ] JWT login works: POST to `/api/auth/login/` with `{ "email": "owner1@gmail.com", "password": "Owner@123" }` → returns `{ user, access, refresh }`
- [ ] Owner login returns `role: "owner"` and frontend redirects to `/owner/dashboard`
- [ ] Customer signup works with all validations (email, password, phone, age)
- [ ] Customer login returns `role: "customer"` and frontend redirects to `/`
- [ ] All 5 owner accounts can log in and access owner pages
- [ ] All 4 owner pages load data from backend (Dashboard, Products, Orders, Analytics)
- [ ] JWT token is attached to Owner API requests (check browser Network tab)
- [ ] Logout clears all tokens and redirects to `/login`

---

## Frontend Owner Routes (Already Built)

| Route | Page |
|-------|------|
| `/owner/dashboard` | Dashboard with KPIs, charts, top products |
| `/owner/products` | Product CRUD with search, filter, pagination |
| `/owner/orders` | Order list with status filter, detail modal |
| `/owner/analytics` | Revenue, product, and order analytics tabs |

---

## File Structure Created

```
frontend/src/
├── Config/
│   └── Config.js                  ← API base URL and environment config
├── context/                       ← (folder name: 'Context' on disk, imported as 'context')
│   └── AuthContext.jsx            ← Auth state, login/logout, role management
├── services/
│   └── api.js                     ← Axios instance + all API endpoints (ownerAPI + authAPI)
├── components/Common/
│   ├── Navbar.jsx                 ← Customer navbar (shows for non-owner routes)
│   └── Footer.jsx                 ← Customer footer (hidden on owner routes)
├── components/Owner/
│   ├── OwnerNavbar.jsx            ← Owner navbar with accent bar, notification bell, user dropdown
│   ├── OwnerLayout.jsx            ← Layout wrapper for /owner/* routes (auth guard)
│   ├── SalesOverviewCards.jsx     ← 4 KPI cards (receives data from API via parent)
│   ├── RevenueChart.jsx           ← Revenue + Profit line chart (Recharts)
│   ├── TopProductsTable.jsx       ← Top 10 products table
│   ├── CategoryChart.jsx          ← Category pie chart (Recharts)
│   ├── ProductModal.jsx           ← Add/Edit product modal
│   └── OrderDetailsModal.jsx      ← Order details + timeline modal
├── pages/Customer/
│   ├── Login.jsx                  ← Login/Signup form (handles owner + customer auth)
│   ├── Profile.jsx                ← Customer profile page
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── Compare.jsx
│   └── Wishlist.jsx
├── pages/Owner/
│   ├── Dashboard.jsx              ← Calls ownerAPI — Dashboard with KPIs, charts, top products
│   ├── ProductManagement.jsx      ← Calls ownerAPI — Product CRUD with search, filter, pagination
│   ├── OrderManagement.jsx        ← Calls ownerAPI — Order list with status filter, detail modal
│   └── Analytics.jsx              ← Calls ownerAPI — Revenue, product, and order analytics tabs
└── App.jsx                        ← Main routing (owner routes wrapped in OwnerLayout)
```

---

## Owner Login & Navigation

### 5 Owner Accounts (Backend-Validated)

Owner login is **fully validated through the backend API** — there are no hardcoded credentials in the frontend. The backend must seed 5 owner accounts during setup. All 5 use the same login form as customers at `/login`.

| # | Email | Password | First Name | Last Name |
|---|-------|----------|------------|----------|
| 1 | `owner1@gmail.com` | `Owner@123` | Sushant | Adhikari |
| 2 | `owner2@gmail.com` | `Owner@123` | Aarav | Sharma |
| 3 | `owner3@gmail.com` | `Owner@123` | Priya | Thapa |
| 4 | `owner4@gmail.com` | `Owner@123` | Bikash | Poudel |
| 5 | `owner5@gmail.com` | `Owner@123` | Sneha | Karki |

**How it works:**
1. User clicks **"Sign In"** in the customer navbar (top-right corner).
2. User enters one of the 5 owner emails + password on the `/login` page.
3. `Login.jsx` sends `{ email, password }` to **`POST /api/auth/login/`** (same endpoint for both owners and customers).
4. Backend authenticates, checks the user's `role` field, and returns `{ user: {..., role: 'owner'}, access: '...', refresh: '...' }`.
5. Frontend stores JWT tokens (`access` → `localStorage['auth_token']`, `refresh` → `localStorage['refresh_token']`) and user object.
6. Frontend checks `userData.role` — if `'owner'`, redirects to `/owner/dashboard`; if `'customer'`, redirects to `/`.
7. All `/owner/*` routes are wrapped in `<OwnerLayout>`, which:
   - Checks `user.role === 'owner'` — redirects to `/login` if not.
   - Renders `<OwnerNavbar>` instead of the customer `<Navbar>` and `<Footer>`.
8. The customer `<Navbar>` and `<Footer>` are hidden on all `/owner/*` routes.

**Note:** The owner login is NOT exposed on the home page. It's only accessible through the navbar "Sign In" link. Owner and customer use the **same login form and same backend endpoint**.

### Owner Navbar Features

**Design:**
- **Top accent bar** with store status indicator (green pulsing "Store Online" dot)
- **Gradient logo** with box shadow
- **Active link underline** — orange bar extends below navbar for current page
- **Notification bell** with red dot indicator
- **User dropdown menu** — shows **actual user name and email** from AuthContext (dynamic, not hardcoded):
  - Profile header with avatar initial + name + email
  - Quick links to Dashboard & Analytics
  - Sign Out button (clears JWT tokens + user data)
- **Fully responsive** — collapses on mobile (hides text, keeps icons)

**Navigation Links:**

| Link | Route | Icon |
|------|-------|------|
| Dashboard | `/owner/dashboard` | LayoutDashboard |
| Products | `/owner/products` | Package |
| Orders | `/owner/orders` | ShoppingCart |
| Analytics | `/owner/analytics` | BarChart3 |

**Theme:**
- Background: `#232F3E` (dark navy)
- Top bar: `#1a242f` (darker navy)
- Accent/active: `#F97316` (orange)
- Border: `3px solid #F97316`
- Active state: Orange tinted background + orange text + underline bar

---

## Customer Authentication — Backend Integration

### Files Involved
- `frontend/src/pages/Customer/Login.jsx` — Login/Signup form
- `frontend/src/pages/Customer/Profile.jsx` — Customer profile page
- `frontend/src/context/AuthContext.jsx` — Auth state management
- `frontend/src/services/api.js` — API configuration

---

### Login.jsx — Backend Connection

**Current State:**  
- Owner login: Validated through backend API (no hardcoded credentials)
- Customer login/signup: Same backend API endpoints
- Both use `POST /api/auth/login/` with `{ email, password }`

**API Base URL Configuration:**  
Located in `frontend/src/Config/Config.js`:
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
```

**Frontend Form Validations (Login):**
- Email is required
- Password is required

**Frontend Form Validations (Signup):**
- First name is required
- Last name is required
- Email must end with `@gmail.com` or `.edu.np`
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
- Confirm password must match password
- Phone number must be exactly 10 digits
- Date of birth is required, user must be ≥16 years old
- Address is required
- Gender is required

**Backend Endpoints Required:**

**POST `/api/auth/signup/`**  
Request:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string",
  "address": "string",
  "phone": "string",
  "gender": "male|female|other",
  "dob": "YYYY-MM-DD"
}
```

Response (201):
```json
{
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9841234567",
    "address": "Kathmandu, Nepal",
    "gender": "male",
    "dob": "2000-01-01",
    "role": "customer"
  },
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Account created successfully"
}
```

**Backend Validations (Signup — must mirror frontend):**
- Age check: User must be ≥16 years old
- Email: Must be `@gmail.com` or `.edu.np`
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Passwords must match
- Email uniqueness check
- Phone: Must be exactly 10 digits

**POST `/api/auth/login/`** (same endpoint for owners and customers)  
Request:
```json
{
  "email": "string",
  "password": "string"
}
```

Response (200):
```json
{
  "user": {
    "id": 1,
    "firstName": "Sushant",
    "lastName": "Adhikari",
    "email": "owner1@gmail.com",
    "phone": "9841000001",
    "address": "Kathmandu, Nepal",
    "role": "owner"
  },
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Error (401):
```json
{
  "message": "Invalid credentials"
}
```

**Frontend Handles Response:**
```javascript
// Login.jsx — JWT token storage + role-based redirect
if (data.access) localStorage.setItem('auth_token', data.access);
if (data.refresh) localStorage.setItem('refresh_token', data.refresh);

const userData = data.user || data;
if (!userData.role) userData.role = 'customer';
login(userData);  // Stores in AuthContext + localStorage

if (userData.role === 'owner') {
  navigate('/owner/dashboard');  // Owner → dashboard
} else {
  navigate('/');                 // Customer → home
}
```

---

### Profile.jsx — Backend Connection

**Current State:**  
Profile page displays user data from `AuthContext` (stored in `localStorage` after login). No backend calls currently.

**Fields Displayed:**
- Full name (`firstName + lastName`)
- Email
- Phone
- Address
- Member since (currently hardcoded to `new Date()`)

**Backend Integration Steps:**

1. **Add GET endpoint** in Django:
   ```
   GET /api/auth/profile/
   ```
   
   Headers:
   ```
   Authorization: Bearer <jwt_token>
   ```
   
   Response (200):
   ```json
   {
     "id": 1,
     "firstName": "John",
     "lastName": "Doe",
     "email": "john@example.com",
     "phone": "9841234567",
     "address": "Kathmandu, Nepal",
     "gender": "male",
     "dob": "2000-01-01",
     "createdAt": "2025-01-15T10:30:00Z",
     "role": "customer"
   }
   ```

2. **Update Profile.jsx** to fetch fresh data:
   ```javascript
   import { useState, useEffect } from 'react';
   import api from '../../services/api';
   
   export default function Profile() {
     const { user, logout, login } = useAuth();
     const [profileData, setProfileData] = useState(user);
     const [loading, setLoading] = useState(true);
     const navigate = useNavigate();
   
     useEffect(() => {
       const fetchProfile = async () => {
         try {
           const response = await api.get('/auth/profile/');
           setProfileData(response.data);
           login(response.data); // Update AuthContext with fresh data
         } catch (error) {
           console.error('Failed to fetch profile:', error);
           if (error.response?.status === 401) {
             logout();
             navigate('/login');
           }
         } finally {
           setLoading(false);
         }
       };
       
       if (user) fetchProfile();
       else setLoading(false);
     }, []);
   
     if (loading) return <div>Loading...</div>;
     if (!profileData) return <div>Please log in</div>;
   
     // Rest of component...
   }
   ```

3. **Display Member Since:**
   ```javascript
   <div style={styles.value}>
     {new Date(profileData.createdAt).toLocaleDateString('en-US', {
       year: 'numeric',
       month: 'long',
       day: 'numeric'
     })}
   </div>
   ```

---

### AuthContext — Token Management

**Current Implementation (Updated):**  
Stores user object in `localStorage` as `customer_user`. JWT tokens stored separately as `auth_token` and `refresh_token`.

**On app load (`AuthContext.jsx`):**
- Checks for both `customer_user` AND `auth_token` in localStorage
- If either is missing, clears both — forces re-login
- Prevents stale sessions where user data exists but token has been cleared

**Login flow:**
```javascript
// Login.jsx stores tokens from API response
localStorage.setItem('auth_token', data.access);     // JWT access token
localStorage.setItem('refresh_token', data.refresh);  // JWT refresh token
localStorage.setItem('customer_user', JSON.stringify(userData));  // User object
```

**Logout flow (`AuthContext.jsx` + `OwnerNavbar.jsx`):**
```javascript
// Clears ALL auth data
localStorage.removeItem('customer_user');
localStorage.removeItem('auth_token');
localStorage.removeItem('refresh_token');
```

**Request interceptor (`services/api.js`):**  
JWT access token is automatically attached to all Axios requests:
```javascript
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('auth_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
```

**401 Response interceptor (`services/api.js`):**  
On 401 (expired/invalid token), clears ALL auth data and redirects to login:
```javascript
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('customer_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Token refresh (`services/api.js`):**
```javascript
authAPI.refreshToken(refreshToken)  // POST /api/auth/refresh/ { refresh: '...' }
// Returns: { access: 'new_access_token' }
```

---

### Environment Variables Setup

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

For production:
```env
VITE_API_BASE_URL=https://yourdomain.com/api
```

**Note:** Vite requires `VITE_` prefix for all environment variables.

---

### Summary Checklist

**Backend Developer Tasks:**

- [ ] Install DRF, CORS, SimpleJWT, Pillow, django-filter (Step 1)
- [ ] Update `settings.py` — INSTALLED_APPS, CORS, REST_FRAMEWORK, JWT (Step 2)
- [ ] Create Django apps: `products`, `orders`, `analytics`, `accounts` (Step 3)
- [ ] Define models: Category, Supplier, Product, Order, OrderItem, Profile (Step 4)
- [ ] Create `accounts` app with Profile model (`role`, `phone`, `address`, `gender`, `dob`)
- [ ] Create serializers for all models (Step 5)
- [ ] Create views: ProductViewSet, OrderViewSet, 7 analytics APIViews (Steps 6 + 10)
- [ ] Configure URL routing for all endpoints (Step 7)
- [ ] Run migrations and create superuser (Step 8)
- [ ] Seed 5 owner accounts + sample data for testing (Step 9)
- [ ] Add `user_phone` to Order serializer (Step 11)
- [ ] Create `/api/auth/signup/` endpoint with validation rules (mirror frontend validations)
- [ ] Create `/api/auth/login/` endpoint returning `{ user: {..., role}, access, refresh }`
- [ ] Create `/api/auth/profile/` endpoint (authenticated, returns user data)
- [ ] Add `role` field to Profile model (`'customer'` or `'owner'`)
- [ ] Add CORS configuration for `http://localhost:5173`
- [ ] Seed 5 owners: owner1-5@gmail.com with password `Owner@123` and role `owner`
- [ ] Test all endpoints in the API endpoint reference table

**Frontend Status (Completed):**

- [x] All 4 Owner pages call real API endpoints (no mock data)
- [x] Dashboard fetches KPIs, revenue trend, top products, category performance
- [x] Analytics fetches summary, trends, payment stats, order stats, low stock
- [x] ProductManagement does full CRUD via API (create/read/update/delete)
- [x] OrderManagement fetches orders and updates status via API
- [x] Loading states with skeleton/spinner on all pages
- [x] Error states with retry buttons on all pages
- [x] Refresh buttons on all pages to re-fetch data
- [x] `data/mockData.js` removed — no mock data dependency
- [x] Owner navbar with navigation (dynamic user name/email from AuthContext)
- [x] Owner layout with auth guard
- [x] Customer + Owner login form (same form, backend-validated)
- [x] Signup form with full field validation
- [x] JWT token storage (access + refresh) on login
- [x] JWT token cleanup on logout (AuthContext + api.js 401 interceptor)
- [x] Role-based redirect (owner → /owner/dashboard, customer → /)
- [x] Profile page UI
