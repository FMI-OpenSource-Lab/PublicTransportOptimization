from .TransportModel import TransportModel
from .PassengerAgent import PassengerAgent


class SimulationHandler:
    def __init__(self, routes_solution, num_passengers=1000, steps=10):
        self.__routes_solution = routes_solution
        self.__num_passengers = num_passengers
        self.__steps = steps

    def run_simulation(self):
        """Start the simulation with a given number of passengers"""
        model = TransportModel(self.__num_passengers, self.__routes_solution)

        # Execute the simulation with different passengers
        for _ in range(self.__steps):
            model.step()

        # Collect the results from all the passengers
        travel_distances = []
        travel_times = []
        transfers = []

        for agent in model.schedule.agents:
            if isinstance(agent, PassengerAgent):
                travel_distances.append(agent.travel_distance)
                travel_times.append(agent.travel_time)
                transfers.append(agent.transfer_count)

        # Calculate the score of the solution based on the average values for travel time, distance,
        # transfers count and direct trips percentage
        avg_travel_distance = sum(travel_distances) / self.__num_passengers
        avg_travel_time = sum(travel_times) / self.__num_passengers
        avg_transfers = sum(transfers) / self.__num_passengers
        direct_trips_percentage = sum(1 for t in transfers if t == 0) / self.__num_passengers * 100

        # Higher score means better solution
        score = (
                (1 / avg_travel_distance) +
                (1 / avg_travel_time) +
                (1 / (1 + avg_transfers)) +
                (direct_trips_percentage / 100)
        )

        return score

