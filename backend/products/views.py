from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction

from accounts.permissions import IsOwner
from .models import Product, Inventory, StockMovement, LowStockAlert
from .serializers import ProductSerializer
from .inventory_serializers import InventorySerializer
from .movement_serializers import (
    StockMovementSerializer,
    CreateMovementSerializer,
)


# =========================
# PRODUCT VIEWSET
# =========================
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer

    def get_permissions(self):
        # Public can view products
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        # Only owner can modify
        return [IsAuthenticated(), IsOwner()]

    # Product-based stock movement endpoint
    @action(detail=True, methods=["post"], url_path="move")
    def move_stock(self, request, pk=None):
        product = self.get_object()
        inventory = product.inventory

        serializer = CreateMovementSerializer(data=request.data)

        if serializer.is_valid():
            movement_type = serializer.validated_data["movement_type"]
            quantity = serializer.validated_data["quantity"]

            with transaction.atomic():

                if movement_type == "IN":
                    inventory.quantity += quantity

                elif movement_type == "OUT":
                    if inventory.quantity < quantity:
                        return Response(
                            {"error": "Insufficient stock"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    inventory.quantity -= quantity

                elif movement_type == "ADJUST":
                    inventory.quantity = quantity

                inventory.save()

                # =========================
                # LOW STOCK ALERT LOGIC
                # =========================
                if inventory.quantity <= inventory.reorder_level:
                    # Create alert if none active
                    if not LowStockAlert.objects.filter(
                        inventory=inventory,
                        resolved=False
                    ).exists():
                        LowStockAlert.objects.create(inventory=inventory)
                else:
                    # Resolve existing alerts if stock restored
                    LowStockAlert.objects.filter(
                        inventory=inventory,
                        resolved=False
                    ).update(resolved=True)

                # Log stock movement
                StockMovement.objects.create(
                    inventory=inventory,
                    movement_type=movement_type,
                    quantity=quantity,
                )

            return Response(
                {"message": "Stock movement recorded successfully"},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================
# INVENTORY VIEWSET
# =========================
class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer

    def get_permissions(self):
        # Anyone can view inventory
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        # Only owner can modify
        return [IsAuthenticated(), IsOwner()]


# =========================
# STOCK MOVEMENT VIEWSET
# =========================
class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer

    def get_permissions(self):
        return [IsAuthenticated(), IsOwner()]

#========================
# Dashboard and Analytics Views 
#========================
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, F
from .models import Product, Inventory
from django.db.models import F, Sum

class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        total_products = Product.objects.filter(is_active=True).count()

        total_inventory_units = Inventory.objects.aggregate(
            total=Sum("quantity")
        )["total"] or 0

        low_stock_count = Inventory.objects.filter(
            quantity__lte=F("reorder_level")
        ).count()

        total_inventory_value = Inventory.objects.aggregate(
            total=Sum(F("quantity") * F("product__price"))
        )["total"] or 0

        return Response({
            "total_products": total_products,
            "total_inventory_units": total_inventory_units,
            "low_stock_count": low_stock_count,
            "total_inventory_value": total_inventory_value
        })

