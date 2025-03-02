from django.contrib import admin
from .models import Stop, Route, RouteStop, TravelTime


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

@admin.register(TravelTime)
class TravelTimeAdmin(admin.ModelAdmin):
    list_display = ('start_stop', 'end_stop', 'travel_time_seconds', 'distance_meters', 'time_of_day')
    ordering = ('start_stop', 'end_stop')
