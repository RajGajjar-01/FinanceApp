

# Create your models here.
from django.db import models
from django.utils.timezone import now

class StockData(models.Model):
    symbol = models.CharField(max_length=50)
    price = models.FloatField(null=True, blank=True)
    open_price = models.FloatField(null=True, blank=True)   # ✅ renamed
    high = models.FloatField(null=True, blank=True)
    low = models.FloatField(null=True, blank=True)
    volume = models.BigIntegerField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    prev_close = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.symbol} - {self.price}"

