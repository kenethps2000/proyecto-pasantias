from django.db import models

class Venta(models.Model):
    order_id = models.CharField(max_length=50)
    customer_name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    sub_category = models.CharField(max_length=50)
    city = models.CharField(max_length=50)
    region = models.CharField(max_length=50)
    sales = models.FloatField()
    order_date = models.DateField()
    discount = models.FloatField()
    profit = models.FloatField()
