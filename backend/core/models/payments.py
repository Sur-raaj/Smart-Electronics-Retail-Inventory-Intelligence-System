from django.db import models
from .orders import Orders

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
    paidat = models.DateTimeField(db_column='PaidAt')
    class Meta:
        managed = False
        db_table = 'Payments'

