from .base import BaseViewSet
from rest_framework import viewsets

from core.models import *
from .serializers import *

# Create your views here.

class CustomerViewSet(BaseViewSet):
    queryset = Customers.objects.all()
    serializer_class = CustomerSerializer

class CustomerAddressViewSet(BaseViewSet):
    queryset = CustomerAddress.objects.all()
    serializer_class = CustomerAddressSerializer

class SupplierViewSet(BaseViewSet):
    queryset = Suppliers.objects.all()
    serializer_class = SupplierSerializer

class BrandViewSet(BaseViewSet):
    queryset = Brands.objects.all()
    serializer_class = BrandSerializer

class AuditlogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Auditlog.objects.all()
    serializer_class = AuditlogSerializer

class OrderViewSet(BaseViewSet):
    queryset = Orders.objects.all()
    serializer_class = OrderSerializer

class OrderDetailViewSet(BaseViewSet):
    queryset = Orderdetails.objects.all()
    serializer_class = OrderDetailSerializer

class OrderStatusViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Orderstatus.objects.all()
    serializer_class = OrderStatusSerializer

class ProductViewSet(BaseViewSet):
    queryset = Products.objects.all()
    serializer_class = ProductSerializer

class PurchaseOrderDetailViewSet(BaseViewSet):
    queryset = Purchaseorderdetails.objects.all()
    serializer_class = PurchaseOrderDetailSerializer

class PurchaseOrderViewSet(BaseViewSet):
    queryset = Purchaseorders.objects.all()
    serializer_class = PurchaseOrderSerializer

class WhishlistViewSet(BaseViewSet):
    queryset = Whishlist.objects.all()
    serializer_class = WhishlistSerializer

class CategoryViewSet(BaseViewSet):
    queryset = Categories.objects.all()
    serializer_class = CategorySerializer

class CartViewSet(BaseViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer

class PaymentMethodViewSet(BaseViewSet):
    queryset = Paymentmethods.objects.all()
    serializer_class = PaymentMethodSerializer

class PaymentViewSet(BaseViewSet):
    queryset = Payments.objects.all()
    serializer_class = PaymentSerializer

class ReviewViewSet(BaseViewSet):
    queryset = Reviews.objects.all()
    serializer_class = ReviewSerializer

#For views 
class ViewActiveCustomerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ViewActiveCustomers.objects.all()
    serializer_class = ViewActiveCustomerSerializer

class ViewLowStockProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ViewLowStockProducts.objects.all()
    serializer_class = ViewLowStockProductSerializer

class ViewProductInventoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ViewProductInventory.objects.all()
    serializer_class = ViewProductInventorySerializer


class ViewOrderSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ViewOrderSummary.objects.all()
    serializer_class = ViewOrderSummarySerializer

    