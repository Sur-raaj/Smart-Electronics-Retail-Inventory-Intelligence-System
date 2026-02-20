# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Auditlog(models.Model):
    logid = models.AutoField(db_column='LogID', primary_key=True)  # Field name made lowercase.
    action = models.CharField(db_column='Action', max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    tablename = models.CharField(db_column='TableName', max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    recordid = models.IntegerField(db_column='RecordID')  # Field name made lowercase.
    userid = models.IntegerField(db_column='UserID')  # Field name made lowercase.
    timestamp = models.DateTimeField(db_column='Timestamp')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'AuditLog'


class Brands(models.Model):
    brandid = models.AutoField(db_column='BrandID', primary_key=True)  # Field name made lowercase.
    brandname = models.CharField(db_column='BrandName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    branddescription = models.CharField(db_column='BrandDescription', max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    logourl = models.CharField(db_column='logoURL', max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='CreatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Brands'


class Cart(models.Model):
    cartid = models.AutoField(db_column='CartID', primary_key=True)  # Field name made lowercase.
    customerid = models.ForeignKey('Customers', models.DO_NOTHING, db_column='CustomerID')  # Field name made lowercase.
    productid = models.ForeignKey('Products', models.DO_NOTHING, db_column='ProductID')  # Field name made lowercase.
    ordercount = models.IntegerField(db_column='OrderCount')  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='CreatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Cart'


class Categories(models.Model):
    categoryid = models.AutoField(db_column='CategoryID', primary_key=True)  # Field name made lowercase.
    categoryname = models.CharField(db_column='CategoryName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Categories'


class CustomerAddress(models.Model):
    addressid = models.AutoField(db_column='AddressID', primary_key=True)  # Field name made lowercase.
    customerid = models.ForeignKey('Customers', models.DO_NOTHING, db_column='CustomerID')  # Field name made lowercase.
    street = models.CharField(db_column='Street', max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    city = models.CharField(db_column='City', max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    province = models.CharField(db_column='Province', max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    postalcode = models.CharField(db_column='PostalCode', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    country = models.CharField(db_column='Country', max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    addresstype = models.CharField(db_column='AddressType', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Customer_Address'


class Customers(models.Model):
    customerid = models.AutoField(db_column='CustomerID', primary_key=True)  # Field name made lowercase.
    firstname = models.CharField(db_column='FirstName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    lastname = models.CharField(db_column='LastName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    email = models.CharField(db_column='Email', unique=True, max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    phone = models.CharField(db_column='Phone', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    gender = models.CharField(db_column='Gender', max_length=10, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    dateofbirth = models.DateField(db_column='DateOfBirth', blank=True, null=True)  # Field name made lowercase.
    registrationdate = models.DateTimeField(db_column='RegistrationDate')  # Field name made lowercase.
    isactive = models.BooleanField(db_column='isActive')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Customers'


class Orderdetails(models.Model):
    orderdetailid = models.AutoField(db_column='OrderDetailID', primary_key=True)  # Field name made lowercase.
    orderid = models.ForeignKey('Orders', models.DO_NOTHING, db_column='OrderID')  # Field name made lowercase.
    productid = models.ForeignKey('Products', models.DO_NOTHING, db_column='ProductID')  # Field name made lowercase.
    quantity = models.IntegerField(db_column='Quantity')  # Field name made lowercase.
    unitprice = models.DecimalField(db_column='UnitPrice', max_digits=10, decimal_places=2)  # Field name made lowercase.
    totalprice = models.DecimalField(db_column='TotalPrice', max_digits=21, decimal_places=2, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'OrderDetails'


class Orderstatus(models.Model):
    orderstatusid = models.AutoField(db_column='OrderStatusID', primary_key=True)  # Field name made lowercase.
    statusname = models.CharField(db_column='StatusName', unique=True, max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.

    class Meta:
        managed = False
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
    createdat = models.DateTimeField(db_column='CreatedAt')  # Field name made lowercase.
    updatedat = models.DateTimeField(db_column='UpdatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Orders'


class Paymentmethods(models.Model):
    methodid = models.AutoField(db_column='MethodID', primary_key=True)  # Field name made lowercase.
    methodname = models.CharField(db_column='MethodName', unique=True, max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PaymentMethods'


class Payments(models.Model):
    paymentid = models.AutoField(db_column='PaymentID', primary_key=True)  # Field name made lowercase.
    orderid = models.ForeignKey(Orders, models.DO_NOTHING, db_column='OrderID', blank=True, null=True)  # Field name made lowercase.
    methodid = models.ForeignKey(Paymentmethods, models.DO_NOTHING, db_column='MethodID')  # Field name made lowercase.
    discountpercent = models.DecimalField(db_column='DiscountPercent', max_digits=5, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    payableamount = models.DecimalField(db_column='PayableAmount', max_digits=10, decimal_places=2, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Payments'


class Products(models.Model):
    productid = models.AutoField(db_column='ProductID', primary_key=True)  # Field name made lowercase.
    sku = models.CharField(db_column='SKU', unique=True, max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    productname = models.CharField(db_column='ProductName', max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    categoryid = models.ForeignKey(Categories, models.DO_NOTHING, db_column='CategoryID')  # Field name made lowercase.
    brandid = models.ForeignKey(Brands, models.DO_NOTHING, db_column='BrandID')  # Field name made lowercase.
    supplierid = models.ForeignKey('Suppliers', models.DO_NOTHING, db_column='SupplierID', blank=True, null=True)  # Field name made lowercase.
    sellingprice = models.DecimalField(db_column='SellingPrice', max_digits=10, decimal_places=2)  # Field name made lowercase.
    costprice = models.DecimalField(db_column='CostPrice', max_digits=10, decimal_places=2)  # Field name made lowercase.
    stock = models.IntegerField(db_column='Stock')  # Field name made lowercase.
    reorderlevel = models.IntegerField(db_column='ReorderLevel', blank=True, null=True)  # Field name made lowercase.
    productdescription = models.CharField(db_column='ProductDescription', max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    productimageurl = models.CharField(db_column='ProductImageURL', max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    productspecifications = models.CharField(db_column='ProductSpecifications', max_length=3000, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    unitssold = models.IntegerField(db_column='UnitsSold')  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.
    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Products'


class Purchaseorderdetails(models.Model):
    purchaseorderdetailid = models.AutoField(db_column='PurchaseOrderDetailID', primary_key=True)  # Field name made lowercase.
    purchaseorderid = models.ForeignKey('Purchaseorders', models.DO_NOTHING, db_column='PurchaseOrderID')  # Field name made lowercase.
    productid = models.ForeignKey(Products, models.DO_NOTHING, db_column='ProductID')  # Field name made lowercase.
    quantity = models.IntegerField(db_column='Quantity')  # Field name made lowercase.
    unitcost = models.DecimalField(db_column='UnitCost', max_digits=10, decimal_places=2)  # Field name made lowercase.
    totalcost = models.DecimalField(db_column='TotalCost', max_digits=21, decimal_places=2, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PurchaseOrderDetails'


class Purchaseorders(models.Model):
    purchaseorderid = models.AutoField(db_column='PurchaseOrderID', primary_key=True)  # Field name made lowercase.
    supplierid = models.ForeignKey('Suppliers', models.DO_NOTHING, db_column='SupplierID')  # Field name made lowercase.
    orderdate = models.DateTimeField(db_column='OrderDate')  # Field name made lowercase.
    totalamount = models.DecimalField(db_column='TotalAmount', max_digits=10, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    expecteddeliverydate = models.DateTimeField(db_column='ExpectedDeliveryDate', blank=True, null=True)  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='CreatedAt')  # Field name made lowercase.
    orderstatusid = models.ForeignKey(Orderstatus, models.DO_NOTHING, db_column='OrderStatusID', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PurchaseOrders'


class Reviews(models.Model):
    reviewid = models.AutoField(db_column='ReviewID', primary_key=True)  # Field name made lowercase.
    productid = models.ForeignKey(Products, models.DO_NOTHING, db_column='ProductID')  # Field name made lowercase.
    customerid = models.ForeignKey(Customers, models.DO_NOTHING, db_column='CustomerID')  # Field name made lowercase.
    rating = models.DecimalField(db_column='Rating', max_digits=1, decimal_places=1, blank=True, null=True)  # Field name made lowercase.
    comment = models.CharField(db_column='Comment', max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    reviewdate = models.DateTimeField(db_column='ReviewDate')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Reviews'


class Suppliers(models.Model):
    supplierid = models.AutoField(db_column='SupplierID', primary_key=True)  # Field name made lowercase.
    suppliername = models.CharField(db_column='SupplierName', max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    contactpersonname = models.CharField(db_column='ContactPersonName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    contactemail = models.CharField(db_column='ContactEmail', max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    phone = models.CharField(db_column='Phone', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    city = models.CharField(db_column='City', max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    country = models.CharField(db_column='Country', max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    isactive = models.BooleanField(db_column='isActive')  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='CreatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Suppliers'


class Whishlist(models.Model):
    wishlistid = models.AutoField(db_column='WishlistID', primary_key=True)  # Field name made lowercase.
    customerid = models.ForeignKey(Customers, models.DO_NOTHING, db_column='CustomerID')  # Field name made lowercase.
    productid = models.ForeignKey(Products, models.DO_NOTHING, db_column='ProductID')  # Field name made lowercase.
    addedat = models.DateTimeField(db_column='AddedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Whishlist'
