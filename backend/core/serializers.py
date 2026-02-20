from rest_framework import serializers
from .models.person import Customers,CustomerAddress,Suppliers,Brands
from .models.log import Auditlog
from .models.orders import Orderdetails,Orders,Orderstatus,Purchaseorderdetails,Purchaseorders, Whishlist,Categories, Cart
from .models.payments import Paymentmethods,Payments
from .models.products import Products
from .models.reviews import Reviews
from .models.analytics import ViewActiveCustomers,ViewOrderSummary,ViewLowStockProducts,ViewProductInventory


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customers
        fields = '__all__'
        read_only_fields = ['registrationdate','isactive']

class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suppliers
        fields = '__all__'
        read_only_fields = ['createdat','isactive']

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brands
        fields = '__all__'
        read_only_fields = ['createdat',]

class AuditlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Auditlog
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Orders
        fields = '__all__'
        read_only_fields = ['createdat','updatedat']

class OrderDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Orderdetails
        fields = '__all__'

class OrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Orderstatus
        fields = '__all__'
        

class PurchaseOrderDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchaseorderdetails
        fields = '__all__'

class PurchaseOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchaseorders
        fields = '__all__'
        read_only_fields = ['createdat']

class WhishlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Whishlist
        fields = '__all__'
        read_only_fields = ['createdat']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = '__all__'

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = '__all__'
        read_only_fields = ['createdat']

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paymentmethods
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payments
        fields = '__all__'
        read_only_fields = ['paidat']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Products
        fields = '__all__'
        read_only_fields = ['createdat','updatedat']

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reviews
        fields = '__all__'
        read_only_fields = ['reviewdate']

class ViewActiveCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewActiveCustomers
        fields= '__all__'

class ViewOrderSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewOrderSummary
        fields= '__all__'


class ViewLowStockProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewLowStockProducts
        fields= '__all__'


class ViewProductInventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewProductInventory
        fields= '__all__'
