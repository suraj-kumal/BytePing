from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator

# Create your models here.


class WebService(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    webservice_name = models.CharField(max_length=100)
    webservice_url = models.URLField(max_length=200)
    is_active = models.BooleanField(default=True)
    email_alert = models.BooleanField(default=False)
    monitor_interval = models.IntegerField(
        default=10, validators=[MinValueValidator(10)]
    )
    expect_status_code = models.IntegerField(default=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.webservice_name


class Webstatus(models.Model):
    id = models.AutoField(primary_key=True)
    webservice = models.ForeignKey(WebService, on_delete=models.CASCADE)
    ping = models.IntegerField(null=False, blank=False)
    status = models.BooleanField(null=False, blank=False)
    status_code = models.IntegerField(null=False, blank=False)
    date_and_time = models.DateTimeField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.webservice.webservice_name} - status: {'up' if self.status else 'down'} at {self.date_and_time}"
