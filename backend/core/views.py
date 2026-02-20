from .base import BaseViewSet
from rest_framework import viewsets
from page.permissions import *
from core.models import *
from .serializers import *
from rest_framework.permissions import IsAuthenticated
# Create your views here.

class CustomerViewSet(BaseViewSet):
    permission_classes = [IsAdminOrSelfCustomer]
    queryset = Customers.objects.all()
    serializer_class = CustomerSerializer

class CustomerAddressViewSet(BaseViewSet):
    permission_classes = [IsCustomerOrAdmin]
    queryset = CustomerAddress.objects.all()
    serializer_class = CustomerAddressSerializer

class SupplierViewSet(BaseViewSet):
    permission_classes = [IsWarehouseManagerOrAdmin]
    queryset = Suppliers.objects.all()
    serializer_class = SupplierSerializer

class BrandViewSet(BaseViewSet):
    permission_classes = [IsAdmin]
    queryset = Brands.objects.all()
    serializer_class = BrandSerializer

class AuditlogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdmin]
    queryset = Auditlog.objects.all()
    serializer_class = AuditlogSerializer

class OrderViewSet(BaseViewSet):
    permission_classes = [IsCustomerOrAdmin]
    queryset = Orders.objects.all()
    serializer_class = OrderSerializer

class OrderDetailViewSet(BaseViewSet):
    permission_classes = [IsCustomerOrAdmin]
    queryset = Orderdetails.objects.all()
    serializer_class = OrderDetailSerializer

class OrderStatusViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsWarehouseManagerOrAdmin]
    queryset = Orderstatus.objects.all()
    serializer_class = OrderStatusSerializer

class ProductViewSet(BaseViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Products.objects.all()
    serializer_class = ProductSerializer

class PurchaseOrderDetailViewSet(BaseViewSet):
    permission_classes = [IsWarehouseManagerOrAdmin]
    queryset = Purchaseorderdetails.objects.all()
    serializer_class = PurchaseOrderDetailSerializer

class PurchaseOrderViewSet(BaseViewSet):
    permission_classes = [IsWarehouseManagerOrAdmin]
    queryset = Purchaseorders.objects.all()
    serializer_class = PurchaseOrderSerializer

class WhishlistViewSet(BaseViewSet):
    permission_classes = [IsCustomerOrAdmin]
    queryset = Whishlist.objects.all()
    serializer_class = WhishlistSerializer

class CategoryViewSet(BaseViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Categories.objects.all()
    serializer_class = CategorySerializer

class CartViewSet(BaseViewSet):
    permission_classes = [IsCustomer]
    queryset = Cart.objects.all()
    serializer_class = CartSerializer

class PaymentMethodViewSet(BaseViewSet):
    permission_classes = [IsAdmin]
    queryset = Paymentmethods.objects.all()
    serializer_class = PaymentMethodSerializer

class PaymentViewSet(BaseViewSet):
    permission_classes = [IsCustomerOrAdmin]
    queryset = Payments.objects.all()
    serializer_class = PaymentSerializer

class ReviewViewSet(BaseViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Reviews.objects.all()
    serializer_class = ReviewSerializer

#For views 
class ViewActiveCustomerViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdmin]
    queryset = ViewActiveCustomers.objects.all()
    serializer_class = ViewActiveCustomerSerializer

class ViewLowStockProductViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsWarehouseManager]
    queryset = ViewLowStockProducts.objects.all()
    serializer_class = ViewLowStockProductSerializer

class ViewProductInventoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsWarehouseManagerOrAdmin]
    queryset = ViewProductInventory.objects.all()
    serializer_class = ViewProductInventorySerializer


class ViewOrderSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsShopOwnerOrAdmin]
    queryset = ViewOrderSummary.objects.all()
    serializer_class = ViewOrderSummarySerializer

    