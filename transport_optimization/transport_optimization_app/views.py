from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import City, Stop
from .serializers import CitySerializer, StopSerializer, OptimizationInputSerializer
from .algorithm_handlers.SimulatedAnnealing import SimulatedAnnealing
from .simulation_handlers.SimulationHandler import SimulationHandler


class CityViewSet(viewsets.ModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer


class StopViewSet(viewsets.ModelViewSet):
    queryset = Stop.objects.all()
    serializer_class = StopSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'passenger_flow']


class CityListView(APIView):
    def get(self, request):
        cities = City.objects.all()
        data = [{"id": city.id, "name": city.name} for city in cities]
        return Response(data)


class RouteOptimizationInputView(APIView):
    def post(self, request):
        serializer = OptimizationInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        stop_ids = data['stop_ids']
        num_routes = data['number_of_routes']
        initial_solution = data.get('initial_solution')

        stops = list(Stop.objects.filter(id__in=stop_ids))
        stop_id_to_obj = {stop.id: stop for stop in stops}

        sim_ann = SimulatedAnnealing()
        if initial_solution:
            input_solution = [[stop_id_to_obj[stop_id] for stop_id in route] for route in initial_solution]
            initial_solution, final_solution = sim_ann.execute_optimization(stops, num_routes, input_solution)
            initial_used = True
        else:
            initial_solution, final_solution = sim_ann.execute_optimization(stops, num_routes)
            initial_used = False

        initial_solution_dict = {f"route_{i}": route for i, route in enumerate(initial_solution)}
        final_solution_dict = {f"route_{i}": route for i, route in enumerate(final_solution)}

        sim_handler = SimulationHandler(stops)
        initial_solution_metrics = sim_handler.run_simulation(initial_solution_dict)
        final_solution_metrics = sim_handler.run_simulation(final_solution_dict)

        return Response({
            "initial_solution_used": initial_used,
            "initial_solution": initial_solution,
            "optimized_solution": final_solution,
            "initial_solution_metrics": initial_solution_metrics,
            "final_solution_metrics": final_solution_metrics,
        })
