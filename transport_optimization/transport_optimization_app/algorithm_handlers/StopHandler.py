import datetime
from ..models import TravelTime, Stop, Route


class StopHandler:
    def __init__(self):
        self.travel_time_dict = self.__get_travel_time_dict()
        self.db_stops = list(Stop.objects.all())
        self.db_routes = list(Route.objects.all())

    @staticmethod
    def __get_travel_time_dict():
        """ Preload data into a dictionary for fast lookups """
        travel_time_dict = {
            (start_stop, end_stop, time_of_day): (travel_time_seconds, distance_meters)
            for start_stop, end_stop, time_of_day, travel_time_seconds, distance_meters in
            TravelTime.objects.values_list('start_stop__name', 'end_stop__name', 'time_of_day', 'travel_time_seconds',
                                           'distance_meters')
        }

        return travel_time_dict

    def __define_stop_importance(self):
        """ Get number of routes each stop should be included in based on the passenger flow """
        # Get stops sorted by passenger flow
        sorted_stops = sorted(self.db_stops, key=lambda s: s.passenger_flow, reverse=True)

        # Separate stops in groups depending on the passenger flow
        top_20_pct = int(0.2 * len(sorted_stops))  # First 20% of stops
        middle_50_pct = int(0.5 * len(sorted_stops))  # Next 50% of stops

        stop_groups_map = {
            "top": sorted_stops[:top_20_pct],
            "middle": sorted_stops[top_20_pct:top_20_pct + middle_50_pct],
            "bottom": sorted_stops[top_20_pct + middle_50_pct:]
        }

        # Define how many routes each group of stops should be in
        routes_count_map = {
            "top": max(2, int(0.3 * len(self.db_routes))),  # 30% of routes or at least 2
            "middle": max(1, int(0.2 * len(self.db_routes))),  # 20% of routes or at least 1
            "bottom": max(1, int(0.1 * len(self.db_routes)))  # 10% of routes or at least 1
        }

        # Create stop to routes count map
        stop_routes_count_map = {}
        for group, group_stops in stop_groups_map.items():
            for stop in group_stops:
                stop_routes_count_map[stop] = routes_count_map[group]

        return stop_routes_count_map

    @staticmethod
    def __get_best_route_for_stop(routes, stop):
        """ Get the shortest route to add a stop to that does not already include it """
        routes_to_check = [r for r in routes if stop not in r]
        sorted_routes = sorted(routes_to_check, key=lambda r: len(r))
        return sorted_routes[0]

    def insert_stop_in_route(self, route, stop):
        """ Insert a middle stop in the best position in the route that minimizes the distance """
        min_total_distance = float('inf')
        best_position = 0

        for i in range(1, len(route)):
            new_route = route[:i] + [stop] + route[i:]
            total_distance = 0
            for j in range(len(new_route) - 1):
                total_distance += self.get_distance(new_route[j], new_route[j + 1])

            if total_distance < min_total_distance:
                min_total_distance = total_distance
                best_position = i

        route.insert(best_position, stop)

    def stop_importance_setup(self, routes):
        """ Make sure each stop is in a given number of routes depending on its importance(passenger_flow) """
        stop_to_routes_count_map = self.__define_stop_importance()

        for stop in self.db_stops:
            # Skip final stops - they are already distributed between the routes
            if stop.is_final_stop:
                continue

            needed_routes_count = stop_to_routes_count_map[stop]
            routes_count = 0

            # Make sure a stop is not present in more routes than needed
            for route in routes:
                routes_count += 1 if stop in route else 0
                if routes_count > needed_routes_count:
                    route.remove(stop)
                    routes_count -= 1

            # Make sure a stop is present in needed_routes_count routes
            while routes_count < needed_routes_count:
                best_route = self.__get_best_route_for_stop(routes, stop)
                self.insert_stop_in_route(best_route, stop)
                routes_count += 1

        return routes

    def get_travel_time(self, stop1, stop2):
        """ Get the travel time between two stops from the DB """
        time_of_day = datetime.time(8, 0)
        tt_data = self.travel_time_dict.get((str(stop1), str(stop2), time_of_day))
        travel_time, distance = tt_data
        return travel_time

    def get_distance(self, stop1, stop2):
        """ Get the distance between two stops from the DB """
        time_of_day = datetime.time(8, 0)
        tt_data = self.travel_time_dict[(str(stop1), str(stop2), time_of_day)]
        travel_time, distance = tt_data
        return distance
