import math
import random
from .SolutionsHandler import SolutionsHandler
from ..models import Route


class SimulatedAnnealing:
    def __init__(self):
        self.solutions_handler = SolutionsHandler()
        self.initial_temp = 1000
        self.cooling_rate = 0.999
        self.iterations = 2000

    def execute_optimization(self, chosen_stops, num_routes=0, input_solution=None):
        """ Simulated annealing algorithm """
        num_routes = num_routes if num_routes != 0 else len(Route.objects.all())
        if num_routes == 0:
            raise Exception("Number of routes should be greater than zero!")

        iteration_times, iteration_distances = [], []

        # Get the initial solution (input or generated one)
        initial_solution = input_solution if input_solution else self.solutions_handler.generate_initial_routes(
            num_routes, chosen_stops)

        # Set up the initial solution - check for duplicate stops and check important stops presence
        initial_solution = self.solutions_handler.initial_solution_setup(initial_solution, chosen_stops)

        current_solution = initial_solution
        current_score, total_time, total_distance = self.solutions_handler.evaluate_solution(current_solution)
        temperature = self.initial_temp

        iteration_times.append(round(total_time / 60, 2))
        iteration_distances.append(round(total_distance / 1000, 2))

        for _ in range(self.iterations):
            new_solution = self.solutions_handler.swap_stops(current_solution)
            new_score, total_time, total_distance = self.solutions_handler.evaluate_solution(new_solution)

            iteration_times.append(round(total_time / 60, 2))
            iteration_distances.append(round(total_distance / 1000, 2))

            if new_score < current_score or random.random() < math.exp((current_score - new_score) / temperature):
                current_solution, current_score = new_solution, new_score

            temperature *= self.cooling_rate

        algorithm_parameters = {
            "iterations": self.iterations,
            "initial_temp": self.initial_temp,
            "cooling_rate": self.cooling_rate
        }

        iteration_info = {
            "iteration_times": iteration_times,
            "iteration_distances": iteration_distances
        }

        return initial_solution, current_solution, algorithm_parameters, iteration_info
