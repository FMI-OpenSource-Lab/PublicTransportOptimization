from rest_framework import serializers
from .models import City, Stop


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name', 'country']


class StopSerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source='city.name', read_only=True)

    class Meta:
        model = Stop
        fields = ['id', 'name', 'latitude', 'longitude', 'passenger_flow', 'city', 'city_name', 'is_final_stop']


class InitialRouteSerializer(serializers.ListField):
    child = serializers.ListField(child=serializers.IntegerField(), allow_empty=False)

    def validate(self, value):
        stop_ids_flat = [stop_id for route in value for stop_id in route]

        # Validate for duplicates in individual routes
        for route in value:
            if len(route) != len(set(route)):
                raise serializers.ValidationError("One of the entered routes contains duplicate stops.")

        # Validate start and end stops are final
        stops = Stop.objects.in_bulk(stop_ids_flat)
        for route in value:
            if not (stops[route[0]].is_final and stops[route[-1]].is_final):
                raise serializers.ValidationError("Route must start and end with a final stop.")

        return value


class OptimizationInputSerializer(serializers.Serializer):
    city_id = serializers.IntegerField()
    stop_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
        min_length=2
    )
    number_of_routes = serializers.IntegerField(min_value=1)
    initial_solution = InitialRouteSerializer(required=False)

    def validate_city_id(self, value):
        if not City.objects.filter(id=value).exists():
            raise serializers.ValidationError("City does not exist.")
        return value

    def validate_stop_ids(self, value):
        if len(set(value)) != len(value):
            raise serializers.ValidationError("Duplicate stops are not allowed.")
        return value
