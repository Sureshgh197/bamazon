from django.db import models
import uuid

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    user_id = models.IntegerField()
    order_number = models.CharField(max_length=50, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Delivery Address Fields
    delivery_name = models.CharField(max_length=255, default='')
    delivery_phone = models.CharField(max_length=20, default='')
    delivery_address = models.TextField(default='')
    delivery_city = models.CharField(max_length=100, default='')
    delivery_state = models.CharField(max_length=100, default='')
    delivery_postal_code = models.CharField(max_length=20, default='')
    delivery_country = models.CharField(max_length=100, default='India')
    delivery_latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    delivery_longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    
    payment_method = models.CharField(max_length=50, default='COD')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f'ORD-{uuid.uuid4().hex[:12].upper()}'
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.order_number} - {self.status}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_id = models.IntegerField()
    product_name = models.CharField(max_length=255)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    
    def save(self, *args, **kwargs):
        self.subtotal = self.quantity * self.price
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f'{self.product_name} x {self.quantity}'
