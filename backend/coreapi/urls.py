from .views import health, owner_test
from django.urls import path

urlpatterns = [
    path("health/", health),
    path("owner-test/", owner_test),
]

