from django.db import models


class Cart(models.Model):
    """Cart Model - One cart per user"""
    user_id = models.IntegerField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Cart for user {self.user_id}"


class CartItem(models.Model):
    """CartItem Model - Items in a cart"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product_id = models.IntegerField()
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['cart', 'product_id']

    def __str__(self):
        return f"Product {self.product_id} x {self.quantity}"

    @property
    def total(self):
        return self.price * self.quantity
