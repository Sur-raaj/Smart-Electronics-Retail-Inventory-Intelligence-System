from django.db import models

from .person import Brands

class Products(models.Model):
    productid = models.AutoField(db_column='ProductID', primary_key=True)  # Field name made lowercase.
    sku = models.CharField(db_column='SKU', unique=True, max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    productname = models.CharField(db_column='ProductName', max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    categoryid = models.ForeignKey("Categories", models.DO_NOTHING, db_column='CategoryID')  # Field name made lowercase.
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
