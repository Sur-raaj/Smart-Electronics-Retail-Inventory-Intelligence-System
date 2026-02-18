from rest_framework.permissions import BasePermission


class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "customer"


class IsOwner(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "owner"


class IsWarehouse(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "warehouse"


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "admin"
