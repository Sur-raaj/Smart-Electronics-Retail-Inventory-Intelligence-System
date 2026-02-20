from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'customers',CustomerViewSet)
router.register(r'customer-addresses',CustomerAddressViewSet)
router.register(r'suppliers',SupplierViewSet)
router.register(r'brands',BrandViewSet)
router.register(r'audit-log',AuditlogViewSet)
router.register(r'order-details',OrderDetailViewSet)
router.register(r'orders',OrderViewSet)
router.register(r'order-status',OrderStatusViewSet)
router.register(r'purchase-order-details',PurchaseOrderDetailViewSet)
router.register(r'purchase-orders',PurchaseOrderViewSet)
router.register(r'whishlist',WhishlistViewSet)
router.register(r'categories',CategoryViewSet)
router.register(r'cart',CartViewSet)
router.register(r'payment-methods',PaymentMethodViewSet)
router.register(r'payments',PaymentViewSet)
router.register(r'products',ProductViewSet)
router.register(r'reviews',ReviewViewSet)

analytics_router = DefaultRouter()
analytics_router.register(r'active-customers', ViewActiveCustomerViewSet)
analytics_router.register(r'order-summary', ViewOrderSummaryViewSet)
analytics_router.register(r'product-inventory', ViewProductInventoryViewSet)
analytics_router.register(r'low-stock-products', ViewLowStockProductViewSet)


urlpatterns = [
     path('',include(router.urls)),
     path('analytics/',include(analytics_router.urls))
]
