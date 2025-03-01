from django.contrib import admin
from .models import Stop, Route, RouteStop


@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude', 'passenger_flow')
    search_fields = ('name',)


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('name', 'frequency')
    search_fields = ('name',)


@admin.register(RouteStop)
class RouteStopAdmin(admin.ModelAdmin):
    list_display = ('route', 'stop', 'order')
    ordering = ('route', 'order')
