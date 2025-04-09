from django.contrib import admin
from .models import Stop, Route, RouteStop, TravelTime, City


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'country')
    search_fields = ('name',)


@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'latitude', 'longitude', 'passenger_flow', 'is_final_stop', 'city')
    search_fields = ('name',)


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(RouteStop)
class RouteStopAdmin(admin.ModelAdmin):
    list_display = ('route', 'stop', 'order')
    ordering = ('route', 'order')


@admin.register(TravelTime)
class TravelTimeAdmin(admin.ModelAdmin):
    list_display = ('start_stop', 'end_stop', 'travel_time_seconds', 'distance_meters', 'time_of_day')
    ordering = ('start_stop', 'end_stop')
