from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    InventoryViewSet,
    ProductViewSet,
    StockMovementViewSet,
    DashboardSummaryView
)

router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="product")
router.register(r"inventory", InventoryViewSet, basename="inventory")
router.register(r"movements", StockMovementViewSet, basename="movement")

urlpatterns = router.urls + [
    path("dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
]


