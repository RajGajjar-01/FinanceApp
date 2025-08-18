# stock/serializers.py
from rest_framework import serializers

class StockSerializer(serializers.Serializer):
    symbol = serializers.CharField(max_length=10)
    name = serializers.CharField(max_length=100)
