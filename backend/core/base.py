from rest_framework import viewsets,status
from rest_framework.response import Response

class BaseViewSet(viewsets.ModelViewSet):
    def create(self,request,*args, **kwargs):
        response = super().create(request,*args,**kwargs)
        return Response({
            "message":"Data sent successfully",
            "data":response.data
        },status=status.HTTP_201_CREATED)