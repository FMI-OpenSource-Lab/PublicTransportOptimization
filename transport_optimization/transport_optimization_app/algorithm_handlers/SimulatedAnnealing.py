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

    def execute_optimization(self, chosen_stops, num_routes=0, input_solution=None):
        """ Simulated annealing algorithm """
        num_routes = num_routes if num_routes != 0 else len(Route.objects.all())
        if num_routes == 0:
            raise Exception("Number of routes should be greater than zero!")

        # Get the initial solution (input or generated one)
        initial_solution = input_solution if input_solution else self.solutions_handler.generate_initial_routes(
            num_routes, chosen_stops)

        # Set up the initial solution - check for duplicate stops and check important stops presence
        initial_solution = self.solutions_handler.initial_solution_setup(initial_solution, chosen_stops)

        current_solution = initial_solution
        current_score = self.solutions_handler.evaluate_solution(current_solution)
        temperature = self.initial_temp

        for _ in range(self.iterations):
            new_solution = self.solutions_handler.swap_stops(current_solution)
            new_score = self.solutions_handler.evaluate_solution(new_solution)

            if new_score < current_score or random.random() < math.exp((current_score - new_score) / temperature):
                current_solution, current_score = new_solution, new_score

            temperature *= self.cooling_rate

        return initial_solution, current_solution
