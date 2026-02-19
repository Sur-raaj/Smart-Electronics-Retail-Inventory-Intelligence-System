# Backend-Frontend Integration Guide — Owner Section

> **For the Backend Developer**: The frontend Owner section is fully built and running with mock data. Follow this guide step-by-step to create the Django backend that syncs with it.

---

## Current State

| Layer | Status |
|-------|--------|
| **Frontend** | Done — 4 pages, 8 components (incl. OwnerNavbar & OwnerLayout), mock data, API service, hooks |
| **Backend** | Blank Django 6.0.2 project (`page`), SQLite3, no apps, no DRF |

**Frontend API base URL**: `http://localhost:8000/api` (configured in `src/Config/Config.js`)

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
)

urlpatterns = [
    path('analytics/sales-overview/', SalesOverviewView.as_view()),
    path('analytics/revenue-trend/', RevenueTrendView.as_view()),
    path('analytics/top-products/', TopProductsView.as_view()),
    path('analytics/category-performance/', CategoryPerformanceView.as_view()),
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

    # Auth
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain'),
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

        # Create test user
        user, _ = User.objects.get_or_create(
            username='testcustomer',
            defaults={'first_name': 'Rahul', 'last_name': 'Sharma', 'email': 'rahul@example.com'}
        )
        if not user.has_usable_password():
            user.set_password('test1234')
            user.save()

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
| `POST` | `/api/auth/login/` | Login | `{ access, refresh }` |
| `POST` | `/api/auth/refresh/` | Token refresh | `{ access }` |
| `GET` | `/api/analytics/sales-overview/?start_date=&end_date=` | Dashboard KPIs | `{ total_revenue, total_profit, total_items_sold, total_orders, avg_order_value, profit_margin, revenue_change, profit_change, total_customers }` |
| `GET` | `/api/analytics/revenue-trend/?start_date=&end_date=&period=daily` | Revenue chart | `[{ period, revenue, profit, order_count }]` |
| `GET` | `/api/analytics/top-products/?start_date=&end_date=&limit=10` | Top products table | `[{ rank, product_id, name, brand, category, total_quantity_sold, total_revenue, total_profit, profit_margin }]` |
| `GET` | `/api/analytics/category-performance/?start_date=&end_date=` | Category pie chart | `[{ category_id, category_name, product_count, total_revenue, percentage }]` |
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

**Order fields**: `id`, `user`, `user_name`, `user_email`, `order_date`, `items_count`, `total_amount`, `tax_amount`, `shipping_cost`, `discount_amount`, `grand_total`, `status`, `payment_method`, `payment_status`, `tracking_number`, `shipping_address`

**Analytics fields**: Match the response shapes in the API table above exactly.

---

## STEP 10: Switch Frontend from Mock to Live API

Once backend is running, update `src/hooks/useDashboardData.js`:

1. Uncomment the `ownerAPI` import
2. Uncomment the `Promise.all` fetch calls
3. Remove or comment out mock data imports
4. The `src/services/api.js` file already has all endpoints configured

The frontend is designed so that **only `useDashboardData.js` needs changing** for the dashboard. For Products/Orders pages, replace the mock data imports with API calls in:
- `src/pages/Owner/ProductManagement.jsx` — replace `useState(mockProducts)` with a `useEffect` fetch
- `src/pages/Owner/OrderManagement.jsx` — replace `useState(mockOrders)` with a `useEffect` fetch

---

## Quick Verification Checklist

After completing all steps, verify:

- [ ] `python manage.py runserver` starts without errors
- [ ] `http://localhost:8000/admin/` loads Django admin
- [ ] `http://localhost:8000/api/products/` returns JSON (after auth)
- [ ] `http://localhost:8000/api/orders/` returns JSON (after auth)
- [ ] `http://localhost:8000/api/analytics/sales-overview/` returns KPI data
- [ ] Frontend at `http://localhost:5173/owner/dashboard` loads without CORS errors
- [ ] JWT login works: POST to `/api/auth/login/` with `{ username, password }`

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
├── data/
│   └── mockData.js                ← Mock data (matches backend response format)
├── services/
│   └── api.js                     ← Axios instance + all API endpoints
├── hooks/
│   ├── useDashboardData.js        ← Dashboard data fetching hook
│   └── useProductFilters.js       ← Product filter/search/sort hook
├── components/Common/
│   ├── Navbar.jsx                 ← Customer navbar (shows for non-owner routes)
│   └── Footer.jsx                 ← Customer footer (hidden on owner routes)
├── components/Owner/
│   ├── OwnerNavbar.jsx            ← Owner navbar with accent bar, notification bell, user dropdown
│   ├── OwnerLayout.jsx            ← Layout wrapper for /owner/* routes (auth guard)
│   ├── SalesOverviewCards.jsx     ← 4 KPI cards
│   ├── FilterButtons.jsx          ← Time range filter (7/30/90/365 days)
│   ├── RevenueChart.jsx           ← Revenue + Profit line chart
│   ├── TopProductsTable.jsx       ← Top 10 products table
│   ├── CategoryChart.jsx          ← Category pie chart
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
│   ├── Dashboard.jsx              ← Main owner dashboard
│   ├── ProductManagement.jsx      ← Product CRUD page
│   ├── OrderManagement.jsx        ← Order management page
│   └── Analytics.jsx              ← Advanced analytics page
└── App.jsx                        ← Main routing (owner routes wrapped in OwnerLayout)
```

---

## Owner Login & Navigation

### Hardcoded Owner Credentials (Frontend-Only)

| Field | Value |
|-------|-------|
| Email | `owner@gmail.com` |
| Password | `12345` |

**How it works:**
1. User clicks **"Sign In"** in the customer navbar (top-right corner).
2. User enters the owner credentials above on `/login` page.
3. `Login.jsx` checks the email/password against the hardcoded values *before* calling the backend API.
4. On match, it creates an owner user object with `role: 'owner'` and stores it in `AuthContext` + `localStorage`.
5. The user is redirected to `/owner/dashboard`.
6. All `/owner/*` routes are wrapped in `<OwnerLayout>`, which:
   - Checks `user.role === 'owner'` — redirects to `/login` if not.
   - Renders `<OwnerNavbar>` instead of the customer `<Navbar>` and `<Footer>`.
7. The customer `<Navbar>` and `<Footer>` are hidden on all `/owner/*` routes.

**Note:** The owner login is NOT exposed on the home page. It's only accessible through the navbar "Sign In" link.

### Owner Navbar Features

**Design:**
- **Top accent bar** with store status indicator (green pulsing "Store Online" dot)
- **Gradient logo** with box shadow
- **Active link underline** — orange bar extends below navbar for current page
- **Notification bell** with red dot indicator
- **User dropdown menu** — click avatar/name to access:
  - Profile header with email
  - Quick links to Dashboard & Analytics
  - Sign Out button
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

### Backend Integration Note
When the backend is connected, replace the hardcoded owner check in `Login.jsx` (lines 47-60) with a proper API call. The backend should return a `role` field in the user object:
- `"role": "owner"` → redirects to `/owner/dashboard`
- `"role": "customer"` → redirects to `/` (home)

The `OwnerLayout` auth guard will continue to work as-is.

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
- Owner login: Hardcoded (no backend call)
- Customer login/signup: Calls `http://localhost:5000/api/auth/login` and `/auth/signup`

**API Base URL Configuration:**  
Located in `frontend/src/Config/Config.js`:
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
```

**To Connect to Django Backend:**

1. **Update `.env` file** in `frontend/` folder:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

2. **Backend Endpoints Required:**

   **POST `/api/auth/signup`**  
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
     "message": "Account created successfully"
   }
   ```

   **Validations Required:**
   - Age check: User must be ≥16 years old
   - Email: Must be `@gmail.com` or `.edu.np`
   - Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
   - Passwords must match
   - Email uniqueness check

   **POST `/api/auth/login`**  
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
       "firstName": "John",
       "lastName": "Doe",
       "email": "john@example.com",
       "phone": "9841234567",
       "address": "Kathmandu, Nepal",
       "role": "customer",
       "token": "jwt_token_here"
     }
   }
   ```
   
   Error (401):
   ```json
   {
     "message": "Invalid credentials"
   }
   ```

3. **Frontend Handles Response:**
   ```javascript
   // Login.jsx lines 72-78
   const userData = data.user || data;
   if (!userData.role) userData.role = 'customer';
   login(userData);  // Stores in AuthContext + localStorage
   navigate('/');    // Redirect to home
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

**Current Implementation:**  
Stores entire user object in `localStorage` as `customer_user`.

**Recommended for Production:**

1. **Store JWT separately:**
   ```javascript
   // After successful login
   localStorage.setItem('auth_token', data.token);
   localStorage.setItem('customer_user', JSON.stringify(data.user));
   ```

2. **Update `services/api.js`:**  
   Already configured! JWT is automatically attached to all requests:
   ```javascript
   // frontend/src/services/api.js (lines 11-16)
   api.interceptors.request.use(
     (cfg) => {
       const token = localStorage.getItem('auth_token');
       if (token) cfg.headers.Authorization = `Bearer ${token}`;
       return cfg;
     }
   );
   ```

3. **Handle token expiry:**  
   Already implemented! 401 responses auto-clear tokens:
   ```javascript
   // frontend/src/services/api.js (lines 20-28)
   api.interceptors.response.use(
     (res) => res,
     (error) => {
       if (error.response?.status === 401) {
         localStorage.removeItem('auth_token');
         localStorage.removeItem('customer_user');
         window.location.href = '/login';
       }
       return Promise.reject(error);
     }
   );
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

- [ ] Create `/api/auth/signup` endpoint with all validation rules
- [ ] Create `/api/auth/login` endpoint returning user + JWT token + role field
- [ ] Create `/api/auth/profile` endpoint (authenticated, returns user data)
- [ ] Add `role` field to User model (`'customer'` or `'owner'`)
- [ ] Implement JWT authentication (use `djangorestframework-simplejwt`)
- [ ] Add CORS configuration for `http://localhost:5173`
- [ ] (Optional) Add owner login endpoint returning `role: 'owner'`

**Frontend Developer Tasks:**

- [x] Owner login flow (hardcoded, works offline)
- [x] Owner navbar with navigation
- [x] Owner layout with auth guard
- [x] Customer login/signup form
- [x] Profile page UI
- [ ] Update `API_BASE_URL` in `.env` when backend is ready
- [ ] Test login/signup flow with real backend
- [ ] Add profile data fetching in Profile.jsx
- [ ] Add error handling for network failures
