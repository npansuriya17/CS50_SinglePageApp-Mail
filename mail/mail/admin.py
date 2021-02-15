from django.contrib import admin
from mail.models import User
from mail.models import Email

# Register your models here.
admin.site.register(User)
admin.site.register(Email)