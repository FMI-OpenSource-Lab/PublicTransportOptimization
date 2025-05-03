import random
from .StopHandler import StopHandler


class SolutionsHandler:
    def __init__(self):
        self.stop_handler = StopHandler()

    def initial_solution_setup(self, routes, chosen_stops):
        """ Initial solution setup - remove duplicates and set stop importance """
        # Remove duplicate stops from routes (if any)
        routes = [list(dict.fromkeys(route)) for route in routes]
        # Execute stop importance setup
        self.stop_handler.stop_importance_setup(routes, chosen_stops)
        return routes

    @staticmethod
    def generate_initial_routes(num_routes, chosen_stops):
        """ Generate initial routes / solution"""
        final_stops = [stop for stop in chosen_stops if stop.is_final_stop]
        middle_stops = [stop for stop in chosen_stops if not stop.is_final_stop]

        # Add the final stops for each route
        routes = []
        for i in range(0, num_routes*2, 2):
            routes.append([final_stops[i % len(final_stops)], final_stops[(i+1) % len(final_stops)]])

        # Distribute the middle stops between the routes
        random.shuffle(middle_stops)
        for i in range(num_routes):
            routes[i][1:1] = middle_stops[i::num_routes]

        return routes

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
        total_distance = 0
        coverage_score = 0
        for route in solution:
            for i in range(len(route) - 1):
                travel_time = self.stop_handler.get_travel_time(route[i], route[i + 1])
                travel_distance = self.stop_handler.get_distance(route[i], route[i + 1])
                total_time += travel_time
                total_distance += travel_distance
            unique_stops = set(route)
            coverage_score += len(unique_stops)

        score = total_time + total_distance - coverage_score * 10

        return score, total_time, total_distance
