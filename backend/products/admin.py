from django.contrib import admin
from .models import Category, Brand, Product, Inventory, StockMovement, LowStockAlert




admin.site.register(Category)
admin.site.register(Brand)
admin.site.register(Product)
admin.site.register(Inventory)
admin.site.register(StockMovement)
admin.site.register(LowStockAlert)
