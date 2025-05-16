import math
import random
from .SolutionsHandler import SolutionsHandler


class SimulatedAnnealing:
    def __init__(self):
        self.__solutions_handler = SolutionsHandler()
        self.__initial_temp = None
        self.__cooling_rate = 0.999
        self.__iterations = 2400

    def __evaluate_initial_temperature(self, initial_solution, initial_solution_score,
                                       samples=800, target_acceptance=0.8):
        """ Evaluate the initial temperature for this run based on the score magnitude"""
        deltas = []
        for _ in range(samples):
            new_solution = self.__solutions_handler.swap_stops(initial_solution)
            new_solution_score, _, _ = self.__solutions_handler.evaluate_solution(new_solution)
            delta = new_solution_score - initial_solution_score
            if delta > 0:
                deltas.append(delta)

        if not deltas:
            return 1000

        avg_delta = sum(deltas) / len(deltas)
        initial_temp = -avg_delta / math.log(target_acceptance)
        return max(initial_temp, 1000)

    def execute_optimization(self, chosen_stops, num_routes, input_solution=None):
        """ Simulated annealing algorithm """
        if num_routes == 0:
            raise Exception("Number of routes should be greater than zero!")

        iteration_times, iteration_distances = [], []

        # Get the initial solution (input or generated one)
        initial_solution = input_solution if input_solution else self.__solutions_handler.generate_initial_routes(
            num_routes, chosen_stops)

        # Set up the initial solution - check for duplicate stops and check important stops presence
        initial_solution = self.__solutions_handler.initial_solution_setup(initial_solution, chosen_stops)

        # Set initial solution as current one and calculate the score for it
        current_solution = initial_solution
        current_score, total_time, total_distance = self.__solutions_handler.evaluate_solution(current_solution)

        # Calculate what the initial temperature should be for the given run
        self.__initial_temp = self.__evaluate_initial_temperature(initial_solution, current_score)
        temperature = self.__initial_temp

        iteration_times.append(round(total_time / 60, 2))
        iteration_distances.append(round(total_distance / 1000, 2))

        window_accepts, window_total = 0, 0
        for i in range(self.__iterations):
            new_solution = self.__solutions_handler.swap_stops(current_solution)
            new_score, total_time, total_distance = self.__solutions_handler.evaluate_solution(new_solution)

            iteration_times.append(round(total_time / 60, 2))
            iteration_distances.append(round(total_distance / 1000, 2))

            if new_score < current_score or random.random() < math.exp((current_score - new_score) / temperature):
                window_accepts += 1
                current_solution, current_score = new_solution, new_score
            window_total += 1

            # Every 200 iterations check the acceptance rate and update the cooling rate if needed
            if i != 0 and i % 200 == 0:
                acceptance_rate = window_accepts / window_total
                if acceptance_rate < 0.2:
                    self.__cooling_rate = 0.9995
                elif acceptance_rate > 0.8:
                    self.__cooling_rate = 0.99
                else:
                    self.__cooling_rate = 0.999
                window_accepts, window_total = 0, 0
                temperature *= self.__cooling_rate
            else:
                temperature *= self.__cooling_rate

        algorithm_parameters = {
            "iterations": self.__iterations,
            "initial_temp": self.__initial_temp,
            "cooling_rate": self.__cooling_rate
        }

        iteration_info = {
            "iteration_times": iteration_times,
            "iteration_distances": iteration_distances
        }

        return initial_solution, current_solution, algorithm_parameters, iteration_info
