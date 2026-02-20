
from django.db import models
from .person import Customers
from .products import Products


class Categories(models.Model):
    categoryid = models.AutoField(db_column='CategoryID', primary_key=True)  # Field name made lowercase.
    categoryname = models.CharField(db_column='CategoryName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.

    class Meta:
        managed =False
        db_table = 'Categories'


class Orderstatus(models.Model):
    orderstatusid = models.AutoField(db_column='OrderStatusID', primary_key=True)  # Field name made lowercase.
    statusname = models.CharField(db_column='StatusName', unique=True, max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.

    class Meta:
        managed =False
        db_table = 'OrderStatus'


class Orders(models.Model):
    orderid = models.AutoField(db_column='OrderID', primary_key=True)  # Field name made lowercase.
    ordernumber = models.CharField(db_column='OrderNumber', unique=True, max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    customerid = models.ForeignKey(Customers, models.DO_NOTHING, db_column='CustomerID')  # Field name made lowercase.
    orderstatusid = models.ForeignKey(Orderstatus, models.DO_NOTHING, db_column='OrderStatusID', blank=True, null=True)  # Field name made lowercase.
    orderdate = models.DateTimeField(db_column='OrderDate')  # Field name made lowercase.
    totalamount = models.DecimalField(db_column='TotalAmount', max_digits=10, decimal_places=2)  # Field name made lowercase.
    estimateddeliverydate = models.DateTimeField(db_column='EstimatedDeliveryDate', blank=True, null=True)  # Field name made lowercase.
    trackingnumber = models.CharField(db_column='TrackingNumber', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='CreatedAt',auto_now_add=True)  # Field name made lowercase.
    updatedat = models.DateTimeField(db_column='UpdatedAt',auto_now=True)  # Field name made lowercase.

    class Meta:
        managed =False
        db_table = 'Orders'


class Orderdetails(models.Model):
    orderdetailid = models.AutoField(db_column='OrderDetailID', primary_key=True)  # Field name made lowercase.
    orderid = models.ForeignKey('Orders', models.DO_NOTHING, db_column='OrderID')  # Field name made lowercase.
    productid = models.ForeignKey('Products', models.DO_NOTHING, db_column='ProductID')  # Field name made lowercase.
    quantity = models.IntegerField(db_column='Quantity')  # Field name made lowercase.
    unitprice = models.DecimalField(db_column='UnitPrice', max_digits=10, decimal_places=2)  # Field name made lowercase.
    totalprice = models.DecimalField(db_column='TotalPrice', max_digits=21, decimal_places=2, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed =False
        db_table = 'OrderDetails'   



class Whishlist(models.Model):
    wishlistid = models.AutoField(db_column='WishlistID', primary_key=True)  # Field name made lowercase.
    customerid = models.ForeignKey(Customers, models.DO_NOTHING, db_column='CustomerID')  # Field name made lowercase.
    productid = models.ForeignKey('Products', models.DO_NOTHING, db_column='ProductID')  # Field name made lowercase.
    addedat = models.DateTimeField(db_column='AddedAt',auto_now_add=True)  # Field name made lowercase.

    class Meta:
        managed =False
        db_table = 'Whishlist'

class Cart(models.Model):
    cartid = models.AutoField(db_column='CartID', primary_key=True)  # Field name made lowercase.
    customerid = models.ForeignKey('Customers', models.DO_NOTHING, db_column='CustomerID')  # Field name made lowercase.
    productid = models.ForeignKey('Products', models.DO_NOTHING, db_column='ProductID')  # Field name made lowercase.
    ordercount = models.IntegerField(db_column='OrderCount')  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='CreatedAt',auto_now_add=True)  # Field name made lowercase.

    class Meta:
        managed =False
        db_table = 'Cart'

class Purchaseorders(models.Model):
    purchaseorderid = models.AutoField(db_column='PurchaseOrderID', primary_key=True)  # Field name made lowercase.
    supplierid = models.ForeignKey('Suppliers', models.DO_NOTHING, db_column='SupplierID')  # Field name made lowercase.
    orderdate = models.DateTimeField(db_column='OrderDate')  # Field name made lowercase.
    totalamount = models.DecimalField(db_column='TotalAmount', max_digits=10, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    expecteddeliverydate = models.DateTimeField(db_column='ExpectedDeliveryDate', blank=True, null=True)  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='CreatedAt',auto_now_add=True)  # Field name made lowercase.
    orderstatusid = models.ForeignKey(Orderstatus, models.DO_NOTHING, db_column='OrderStatusID', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed =False
        db_table = 'PurchaseOrders'

class Purchaseorderdetails(models.Model):
    purchaseorderdetailid = models.AutoField(db_column='PurchaseOrderDetailID', primary_key=True)  # Field name made lowercase.
    purchaseorderid = models.ForeignKey('Purchaseorders', models.DO_NOTHING, db_column='PurchaseOrderID')  # Field name made lowercase.
    productid = models.ForeignKey('Products', models.DO_NOTHING, db_column='ProductID')  # Field name made lowercase.
    quantity = models.IntegerField(db_column='Quantity')  # Field name made lowercase.
    unitcost = models.DecimalField(db_column='UnitCost', max_digits=10, decimal_places=2)  # Field name made lowercase.
    totalcost = models.DecimalField(db_column='TotalCost', max_digits=21, decimal_places=2, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed =False
        db_table = 'PurchaseOrderDetails'
