from django.db import models


class City(models.Model):
    name = models.CharField(max_length=100, unique=True)
    country = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Cities"

    def __str__(self):
        return f"{self.name}, {self.country}"


class Stop(models.Model):
    name = models.CharField(max_length=100, unique=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    passenger_flow = models.IntegerField(help_text="Average number of passengers per day")
    is_final_stop = models.BooleanField()
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name="stops")

    def __str__(self):
        return self.name


class Route(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class RouteStop(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(help_text="Position in route")

    class Meta:
        unique_together = ('route', 'stop', 'order')
        ordering = ['route', 'order']

    def __str__(self):
        return f"{self.route.name} - {self.stop.name} ({self.order})"


class TravelTime(models.Model):
    start_stop = models.ForeignKey(Stop, related_name='start_stop', on_delete=models.CASCADE)
    end_stop = models.ForeignKey(Stop, related_name='end_stop', on_delete=models.CASCADE)
    travel_time_seconds = models.IntegerField(help_text="Time to travel between start and end stop in seconds")
    distance_meters = models.IntegerField(help_text="Distance between start and end stop in meters")
    time_of_day = models.TimeField(help_text="Time of day for this travel time")

    class Meta:
        unique_together = ('start_stop', 'end_stop', 'time_of_day')

    def __str__(self):
        return f"{self.start_stop} to {self.end_stop} at {self.time_of_day} - {self.travel_time_seconds}s"
