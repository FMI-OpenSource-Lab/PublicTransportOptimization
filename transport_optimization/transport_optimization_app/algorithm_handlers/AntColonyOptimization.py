import random
import numpy as np
from .StopHandler import StopHandler
from .SolutionsHandler import SolutionsHandler


class AntColonyOptimization:
    def __init__(self, chosen_stops, num_routes, iterations=100, num_ants=20, alpha=1, beta=5, evaporation_rate=0.1):
        self.__chosen_stops = chosen_stops
        self.__num_routes = num_routes
        self.__iterations = iterations
        self.__num_ants = num_ants
        self.__alpha = alpha
        self.__beta = beta
        self.__evaporation_rate = evaporation_rate

        # Get number of routes the chosen stops should be included in
        self.__stop_routes_count_map = StopHandler.define_stop_importance(chosen_stops, num_routes)

        # Initialize needed handlers
        self.__solution_handler = SolutionsHandler()

        # Initialize pheromone levels between all pairs of stops.
        self.__pheromone = np.ones((len(chosen_stops), len(chosen_stops)))

    def __heuristic(self, first_stop, second_stop):
        """ Define heuristic desirability: closer stops are better. """
        distance = self.__solution_handler.stop_handler.get_distance(first_stop, second_stop)
        return 1.0 / distance

    def __pick_next_stop(self, current_stop, unvisited):
        """ Choose the next stop based on pheromone and heuristic info. """
        probabilities = []
        current_idx = self.__chosen_stops.index(current_stop)

        for stop in unvisited:
            stop_idx = self.__chosen_stops.index(stop)
            pheromone_influence = self.__pheromone[current_idx][stop_idx] ** self.__alpha
            heuristic_influence = self.__heuristic(current_stop, stop) ** self.__beta
            probabilities.append(pheromone_influence * heuristic_influence)

        # Normalize to get probabilities
        probabilities = np.array(probabilities)
        probabilities /= probabilities.sum()

        # Randomly pick based on calculated probabilities
        return random.choices(unvisited, weights=probabilities, k=1)[0]

    def __construct_solution(self):
        """ Build a complete solution for one ant """
        # Add important stops multiple times so they are included in enough routes
        unvisited_final_stops = {s: 0 for s in self.__chosen_stops if s.is_final_stop}
        unvisited_middle_stops = [s for s in self.__chosen_stops if not s.is_final_stop]
        stops_per_route_count = (len(unvisited_middle_stops) + 2 * self.__num_routes) // self.__num_routes
        routes = [[] for _ in range(self.__num_routes)]
        current_route_idx = 0

        # Start from a random final stop
        min_occurrence = min(unvisited_final_stops.values())
        min_occurrence_final_stops = [stop for stop, count in unvisited_final_stops.items() if count == min_occurrence]
        current_stop = random.choice(min_occurrence_final_stops)
        unvisited_final_stops[current_stop] += 1
        routes[current_route_idx].append(current_stop)

        while unvisited_middle_stops:
            # Pick next stop based on pheromone + heuristic
            next_stop = self.__pick_next_stop(current_stop, unvisited_middle_stops)
            routes[current_route_idx].append(next_stop)
            unvisited_middle_stops.remove(next_stop)
            current_stop = next_stop

            # If we need to only add one more stop to the current route, it needs to be a final one
            is_end_stop_needed_in_middle_route = (len(routes[current_route_idx]) == stops_per_route_count - 1
                                                  and current_route_idx < self.__num_routes - 1)
            is_end_stop_needed_in_last_route = (len(routes[current_route_idx]) >= stops_per_route_count - 1
                                                and current_route_idx == self.__num_routes - 1
                                                and not unvisited_middle_stops)

            if is_end_stop_needed_in_middle_route or is_end_stop_needed_in_last_route:
                min_occurrence = min(unvisited_final_stops.values())
                min_occurrence_final_stops = [stop for stop, count in unvisited_final_stops.items() if
                                              count == min_occurrence]
                next_stop = self.__pick_next_stop(current_stop, min_occurrence_final_stops)
                routes[current_route_idx].append(next_stop)
                unvisited_final_stops[next_stop] += 1

            # If current route has enough stops based on the number of routes, move to next route
            if len(routes[current_route_idx]) >= stops_per_route_count and current_route_idx < self.__num_routes - 1:
                current_route_idx += 1
                if unvisited_middle_stops:
                    min_occurrence = min(unvisited_final_stops.values())
                    min_occurrence_final_stops = [stop for stop, count in unvisited_final_stops.items() if
                                                  count == min_occurrence]
                    current_stop = random.choice(min_occurrence_final_stops)
                    unvisited_final_stops[current_stop] += 1
                    routes[current_route_idx].append(current_stop)

        # Make sure important stops are present in enough routes for the generated solution
        self.__solution_handler.stop_handler.stop_importance_setup(routes, self.__chosen_stops)

        return routes

    def __update_pheromone(self, solutions):
        """ Update the pheromone matrix """
        # Evaporate pheromone globally
        self.__pheromone *= (1 - self.__evaporation_rate)

        for routes, score in solutions:
            for route in routes:
                for i in range(len(route) - 1):
                    a = self.__chosen_stops.index(route[i])
                    b = self.__chosen_stops.index(route[i + 1])

                    # Add pheromone inversely proportional to solution score
                    self.__pheromone[a][b] += 1.0 / score
                    self.__pheromone[b][a] += 1.0 / score

    def execute_ant_colony_optimization(self):
        """ Execute ant colony optimization """
        iteration_times, iteration_distances = [], []
        best_solution = None
        best_score = float('inf')

        for iteration in range(self.__iterations):
            solutions = []
            best_total_time = float('inf')
            best_total_distance = float('inf')

            for _ in range(self.__num_ants):
                # Each ant builds a solution
                routes = self.__construct_solution()
                score, total_time, total_distance = self.__solution_handler.evaluate_solution(routes)
                solutions.append((routes, score))

                # Update best solution found
                if score < best_score:
                    best_score = score
                    best_solution = routes

                # Update the best time for this iteration
                total_time = round(total_time / 60, 2)
                if total_time < best_total_time:
                    best_total_time = total_time

                # Update the best distance for this iteration
                total_distance = round(total_distance / 1000, 2)
                if total_distance < best_total_distance:
                    best_total_distance = total_distance

            if not best_total_time == float('inf') and not best_total_distance == float('inf'):
                iteration_times.append(best_total_time)
                iteration_distances.append(best_total_distance)

            # Update pheromones based on this generation's solutions
            self.__update_pheromone(solutions)

        algorithm_parameters = {
            "iterations": self.__iterations,
            "ants_count": self.__num_ants,
            "pheromone_influence_alpha": self.__alpha,
            "heuristic_influence_beta": self.__beta,
            "evaporation_rate": self.__evaporation_rate
        }

        iteration_info = {
            "iteration_times": iteration_times,
            "iteration_distances": iteration_distances
        }

        return best_solution, algorithm_parameters, iteration_info
