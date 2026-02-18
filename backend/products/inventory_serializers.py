from rest_framework import serializers
from .models import Inventory


class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = ["id", "product", "quantity", "last_updated"]


class UpdateStockSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0)
