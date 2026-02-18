from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from accounts.permissions import IsOwner


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok", "service": "backend"})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsOwner])
def owner_test(request):
    return Response({"message": "Welcome Owner!"})


