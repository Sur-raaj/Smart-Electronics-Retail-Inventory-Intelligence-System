from django.contrib.auth.models import User,Group
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.models.person import Customers   

class SignupView(APIView):
    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        firstname = request.data.get("firstname")
        lastname = request.data.get("lastname")
        phone = request.data.get("phone")
        gender = request.data.get("gender")
        dateofbirth = request.data.get("dateofbirth")

  
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        customer_group = Group.objects.get_or_create(name="Customer")[0]
        user.groups.add(customer_group)


        customer = Customers.objects.create(
            user=user,
            firstname=firstname,
            lastname=lastname,
            email=email,
            phone=phone,
            gender=gender,
            dateofbirth=dateofbirth
        )

        return Response(
            {
                "message": "Signup successful",
                "status": "success",
                "customer_id": customer.customerid
            },
            status=status.HTTP_201_CREATED
        )