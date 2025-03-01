from django.db import models


class Stop(models.Model):
    name = models.CharField(max_length=100, unique=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    passenger_flow = models.IntegerField(help_text="Average number of passengers per day")

    def __str__(self):
        return self.name


class Route(models.Model):
    name = models.CharField(max_length=100, unique=True)
    frequency = models.IntegerField(help_text="Buses per hour")

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
