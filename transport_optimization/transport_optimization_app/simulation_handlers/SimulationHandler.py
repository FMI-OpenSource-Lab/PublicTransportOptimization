import random
import datetime
from .TransportModel import TransportModel
from .PassengerAgent import PassengerAgent
from ..models import Stop


class SimulationHandler:
    def __init__(self, num_passengers=1000, steps=10):
        self.__num_passengers = num_passengers
        self.__steps = steps
        self.__passengers_info = self.__create_passengers_info()

    def __create_passengers_info(self):
        """Create passengers info by choosing random start and end stops"""
        passengers_info = []
        times = [datetime.time(8, 0), datetime.time(12, 0), datetime.time(18, 0)]
        stops = list(Stop.objects.all())
        for i in range(0, self.__num_passengers * len(times), len(times)):
            start_stop, end_stop = random.sample(stops, 2)
            # For each start and end stop combination we create passengers for three different times of the day
            for j in range(len(times)):
                info = {"index": i + j, "start_stop": start_stop, "end_stop": end_stop, "time": times[j]}
                passengers_info.append(info)

        return passengers_info

    def run_simulation(self, routes_solution):
        """Start the simulation with a given number of passengers"""
        model = TransportModel(self.__num_passengers, routes_solution, self.__passengers_info)

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
        agents_count = len(model.schedule.agents)
        avg_travel_distance = sum(travel_distances) / agents_count
        avg_travel_time = sum(travel_times) / agents_count
        avg_transfers = sum(transfers) / agents_count
        direct_trips_percentage = (sum(1 for t in transfers if t == 0) / agents_count) * 100

        # Lower score means better solution
        score = avg_travel_distance + avg_travel_time + avg_transfers - direct_trips_percentage

        return score, direct_trips_percentage
