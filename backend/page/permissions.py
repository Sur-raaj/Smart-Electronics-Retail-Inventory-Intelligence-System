from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name="Admin").exists()
    
class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name="Customer").exists()
    
class IsShopOwner(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and  request.user.groups.filter(name="Shop_Owner").exists()
    
class IsWarehouseManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name="Warehouse_Manager").exists()
    
class IsShopOwnerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and (
                request.user.groups.filter(name="Shop_Owner").exists() or
                request.user.groups.filter(name="Admin").exists()
            )
        )

class IsCustomerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.groups.filter(name="Customer").exists() or
            request.user.groups.filter(name="Admin").exists()
        )

class IsWarehouseManagerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and (
                request.user.groups.filter(name="Warehouse_Manager").exists() or
                request.user.groups.filter(name="Admin").exists()
            )
        )

class IsAdminOrSelfCustomer(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.groups.filter(name="Admin").exists():
            return True
        if request.user.groups.filter(name="Customer").exists():
            return obj.user == request.user
        return False

class IsAdminOrSelfShopOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.groups.filter(name="Admin").exists():
            return True
        if request.user.groups.filter(name="Shop_Owner").exists():
            return obj.user == request.user
        return False
    
