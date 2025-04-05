import random
from ..models import Stop, Route, RouteStop
from .StopHandler import StopHandler


class SolutionsHandler:
    def __init__(self):
        self.stop_handler = StopHandler()

    def __initial_solution_setup(self, routes):
        """ Initial solution setup - remove duplicates and set stop importance """
        # Remove duplicate stops from routes (if any)
        routes = [list(dict.fromkeys(route)) for route in routes]
        # Execute stop importance setup
        routes = self.stop_handler.stop_importance_setup(routes)
        return routes

    @staticmethod
    def __generate_initial_routes(num_routes):
        """ Generate initial routes / solution"""
        final_stops = list(Stop.objects.filter(is_final_stop=True))
        middle_stops = list(Stop.objects.filter(is_final_stop=False))

        # Add the final stops for each route
        routes = []
        for i in range(0, num_routes*2, 2):
            routes.append([final_stops[i % len(final_stops)], final_stops[(i+1) % len(final_stops)]])

        # Distribute the middle stops between the routes
        random.shuffle(middle_stops)
        for i in range(num_routes):
            routes[i][1:1] = middle_stops[i::num_routes]

        return routes

    @staticmethod
    def __get_existing_routes():
        """ Get existing routes if any """
        db_routes = Route.objects.all()
        routes = []
        for r in db_routes:
            routes.append([route_stop.stop for route_stop in RouteStop.objects.filter(route=r).order_by('order')])
        return routes

    def get_initial_routes(self, num_routes):
        """ Get initial routes if any in the DB or generate an initial solution """
        existing_routes = self.__get_existing_routes()
        initial_solution = existing_routes if existing_routes else self.__generate_initial_routes(num_routes)
        return self.__initial_solution_setup(initial_solution)

    def swap_stops(self, solution):
        """ Swap two random stops in two randomly selected routes of a given solution """
        solution_as_lists = [list(route) for route in solution]
        route1, route2 = random.sample(solution_as_lists, 2)
        if route1 and route2:
            stop1 = random.choice(route1)
            while stop1 in route2:
                stop1 = random.choice(route1)

            if stop1.is_final_stop:
                stop2_options = [route2[0], route2[len(route2) - 1]]
                for stop2 in stop2_options:
                    if stop2 in route1 or stop2 == stop1:
                        continue
                    s1_idx = route1.index(stop1)
                    s2_idx = route2.index(stop2)
                    route1[s1_idx], route2[s2_idx] = route2[s2_idx], route1[s1_idx]
                    break
            else:
                stop2 = random.choice(route2[1:-1])
                while stop2 in route1:
                    stop2 = random.choice(route2[1:-1])
                route1.remove(stop1)
                route2.remove(stop2)
                self.stop_handler.insert_stop_in_route(route1, stop2)
                self.stop_handler.insert_stop_in_route(route2, stop1)

        return solution_as_lists

    def evaluate_solution(self, solution):
        """ Calculate efficiency of the routes """
        total_time = 0
        coverage_score = 0
        for route in solution:
            for i in range(len(route) - 1):
                travel_time = self.stop_handler.get_travel_time(route[i], route[i + 1])
                total_time += travel_time
            unique_stops = set(route)
            coverage_score += len(unique_stops)

        return total_time - coverage_score * 10
