from rest_framework import serializers
from .models import StockMovement


class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = ["id", "inventory", "movement_type", "quantity", "timestamp"]
        read_only_fields = ["timestamp"]


class CreateMovementSerializer(serializers.Serializer):
    movement_type = serializers.ChoiceField(choices=["IN", "OUT", "ADJUST"])
    quantity = serializers.IntegerField(min_value=1)
