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
