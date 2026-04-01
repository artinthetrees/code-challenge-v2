from django.contrib import admin
from .models import CommunityArea,RestaurantPermit

@admin.register(CommunityArea)
class CommunityAreaAdmin(admin.ModelAdmin):
    pass

@admin.register(RestaurantPermit)
class RestaurantPermitAdmin(admin.ModelAdmin):
    pass


