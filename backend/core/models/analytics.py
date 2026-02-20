from django.db import models

class ViewActiveCustomers(models.Model):
    customerid = models.IntegerField(db_column='CustomerID',primary_key=True)
    firstname = models.CharField(db_column='FirstName',max_length=50)
    lastname = models.CharField(db_column='LastName',max_length=50)
    email = models.EmailField(db_column='Email')
    phone = models.CharField(db_column='Phone',max_length=20)

    class Meta:
        managed =False
        db_table = 'vw_ActiveCustomers'

class ViewOrderSummary(models.Model):
    orderid = models.IntegerField(db_column='OrderID', primary_key=True)
    customername = models.CharField(db_column='CustomerName', max_length=100)
    statusname = models.CharField(db_column='StatusName', max_length=50)
    orderdate = models.DateTimeField(db_column='OrderDate')
    totalamount = models.DecimalField(db_column='TotalAmount', max_digits=10, decimal_places=2)

    class Meta:
        managed =False
        db_table = 'vw_OrderSummary'


class ViewProductInventory(models.Model):
    productid = models.IntegerField(db_column='ProductID', primary_key=True)
    productname = models.CharField(db_column='ProductName', max_length=100)
    categoryname = models.CharField(db_column='CategoryName', max_length=50)
    brandname = models.CharField(db_column='BrandName', max_length=50)
    suppliername = models.CharField(db_column='SupplierName', max_length=50)
    sellingprice = models.DecimalField(db_column='SellingPrice', max_digits=10, decimal_places=2)
    costprice = models.DecimalField(db_column='CostPrice', max_digits=10, decimal_places=2)
    stock = models.IntegerField(db_column='Stock')
    reorderlevel = models.IntegerField(db_column='ReorderLevel')

    class Meta:
        managed =False
        db_table = 'vw_ProductInventory'


class ViewLowStockProducts(models.Model):
    productid = models.IntegerField(db_column='ProductID', primary_key=True)
    productname = models.CharField(db_column='ProductName', max_length=100)
    stock = models.IntegerField(db_column='Stock')
    reorderlevel = models.IntegerField(db_column='ReorderLevel')

    class Meta:
        managed =False
        db_table = 'vw_LowStockProducts'