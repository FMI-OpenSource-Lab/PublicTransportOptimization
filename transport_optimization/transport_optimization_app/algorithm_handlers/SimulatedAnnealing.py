import math
import random
from .SolutionsHandler import SolutionsHandler
from ..models import Route


class SimulatedAnnealing:
    def __init__(self):
        self.solutions_handler = SolutionsHandler()
        self.initial_temp = 100
        self.cooling_rate = 0.99
        self.iterations = 1000

    def execute_optimization(self):
        """ Simulated annealing algorithm """
        num_routes = len(
            Route.objects.all())  # Or to be updated with user input if no routes in the DB (should depend on stops
        # count)
        current_solution = self.solutions_handler.get_initial_routes(num_routes)
        print("Initial solution:")
        print(current_solution)
        current_score = self.solutions_handler.evaluate_solution(current_solution)
        temperature = self.initial_temp

        for _ in range(self.iterations):
            new_solution = self.solutions_handler.swap_stops(current_solution)
            new_score = self.solutions_handler.evaluate_solution(new_solution)

            if new_score < current_score or random.random() < math.exp((current_score - new_score) / temperature):
                current_solution, current_score = new_solution, new_score

            temperature *= self.cooling_rate

        print(current_score)
        return current_solution
