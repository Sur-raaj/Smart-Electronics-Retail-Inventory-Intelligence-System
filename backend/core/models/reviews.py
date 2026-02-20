from django.db import models
from .products import Products
from .person import Customers

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
