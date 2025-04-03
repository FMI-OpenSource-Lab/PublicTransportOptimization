from mesa import Model
from mesa.time import RandomActivation
from ..models import Stop, TravelTime
from .PassengerAgent import PassengerAgent
import random
import datetime
import networkx as nx


class TransportModel(Model):
    """Transport network simulation model"""

    def __init__(self, num_passengers, routes_solution):
        self.__num_passengers = num_passengers
        self.__routes_solution = routes_solution

        self.schedule = RandomActivation(self)
        self.__times = [datetime.time(8, 0), datetime.time(12, 0), datetime.time(18, 0)]
        self.__travel_time_dict = None
        self.__graph = nx.DiGraph()
        self.__time_to_graph_attr_map = {}

        self.__create_passengers()
        self.__create_travel_time_dict()
        self.__fill_routes_to_graph()

    def __create_passengers(self):
        """Create passengers by choosing random start and end stops"""
        stops = list(Stop.objects.all())
        for i in range(0, self.__num_passengers * len(self.__times), len(self.__times)):
            start_stop, end_stop = random.sample(stops, 2)
            # For each start and end stop combination we create passengers for three different times of the day
            for j in range(len(self.__times)):
                passenger = PassengerAgent(i + j, self, start_stop, end_stop, self.__times[j])
                self.schedule.add(passenger)

    def __create_travel_time_dict(self):
        """Preload DB data into a dictionary for fast lookups"""
        self.__travel_time_dict = {
            (start_stop, end_stop, time_of_day): (travel_time_seconds, distance_meters)
            for start_stop, end_stop, time_of_day, travel_time_seconds, distance_meters in
            TravelTime.objects.values_list('start_stop__name', 'end_stop__name', 'time_of_day', 'travel_time_seconds',
                                           'distance_meters')
        }

    def __fill_routes_to_graph(self):
        """Built a graph for the given routes solution"""
        # Add graph score labels to dictionary
        attr_name = "score_{}"
        for t in range(len(self.__times)):
            self.__time_to_graph_attr_map[str(self.__times[t])] = attr_name.format(t)

        # Fill the graph with all the routes from the given solution
        for route, stops in self.__routes_solution.items():
            for i in range(len(stops) - 1):
                stop1, stop2 = stops[i], stops[i + 1]
                for j in range(len(self.__times)):
                    travel_time, distance = self.__travel_time_dict.get((str(stop1), str(stop2), self.__times[j]),
                                                                        (None, None))
                    if travel_time and distance:
                        self.__graph.add_edge(stop1, stop2, {attr_name.format(j): travel_time + distance})

    def step(self):
        """Execute one step of the simulation"""
        self.schedule.step()

    def __get_travel_time_and_distance(self, route, start_stop, end_stop, time_of_the_day):
        """Get route travel time and distance for the given start and end stop"""
        start_index = route.index(start_stop)
        end_index = route.index(end_stop)
        time, dist = 0, 0

        for i in range(start_index, end_index):
            tt_data = self.__travel_time_dict.get((str(route[i]), str(route[i + 1]), time_of_the_day))
            time += tt_data[0]
            dist += tt_data[1]

        return time, dist

    def __find_shortest_path(self, start_stop, end_stop, time_of_the_day):
        """Find the shortest path between two stops in the solution graph"""
        try:
            path = nx.shortest_path(self.__graph,
                                    source=start_stop,
                                    target=end_stop,
                                    weight=self.__time_to_graph_attr_map[str(time_of_the_day)])
            return path
        except nx.NetworkXNoPath:
            return None

    def __get_transfers_recursive(self, path, routes_to_check, current_stop):
        """Recursive method to get the number of transfers in a path"""
        min_transfers = float('inf')
        for route in routes_to_check:
            transfers = 0
            current_route = route
            current_stop_index = path.index(current_stop)
            for i in range(current_stop_index + 1, len(path)):
                next_stop = path[i]
                current_route_stops = self.__routes_solution[current_route]

                # If the current route includes also the next stop in the path we continue
                if next_stop in current_route_stops \
                        and abs(current_route_stops.index(current_stop) - current_route_stops.index(next_stop)) == 1:
                    current_stop = next_stop
                    continue

                # If the current route does not include the next stop a transfer will be needed
                # and we need to check recursively all the possible routes we could take
                transfers += 1
                possible_next_routes = [r for r in self.__routes_solution.keys()
                                        if current_stop in self.__routes_solution[r]
                                        and next_stop in self.__routes_solution[r]
                                        and abs(self.__routes_solution[r].index(current_stop)
                                                - self.__routes_solution[r].index(next_stop)) == 1]
                transfers += self.__get_transfers_recursive(path, possible_next_routes, next_stop)
                break
            if transfers < min_transfers:
                min_transfers = transfers
        return min_transfers

    def __get_transfers_count_in_route(self, path):
        """Get the number of transfers in a path"""
        possible_start_routes = [r for r in self.__routes_solution.keys()
                                 if path[0] in self.__routes_solution[r]
                                 and path[1] in self.__routes_solution[r]
                                 and abs(self.__routes_solution[r].index(path[0])
                                         - self.__routes_solution[r].index(path[1])) == 1]

        return self.__get_transfers_recursive(path, possible_start_routes, path[1])

    def find_best_route(self, start_stop, end_stop, time_of_the_day):
        """Find best route (direct or with transfer)"""
        # First we check if there is a direct route for the two stops and if there is we return it
        routes = list(self.__routes_solution.keys())
        direct_routes = [r for r in routes if start_stop in self.__routes_solution[r]
                         and end_stop in self.__routes_solution[r]]

        if direct_routes:
            best_route = min(direct_routes,
                             key=lambda r: sum(self.__get_travel_time_and_distance(r, start_stop,
                                                                                   end_stop, time_of_the_day)))
            return 0, *self.__get_travel_time_and_distance(best_route, start_stop, end_stop, time_of_the_day)

        # If there is no direct route find the shortest one in the graph
        best_route = self.__find_shortest_path(start_stop, end_stop, time_of_the_day)

        # Calculate the number of transfers in the best route
        transfers_count = self.__get_transfers_count_in_route(best_route)

        return transfers_count, *self.__get_travel_time_and_distance(best_route, start_stop, end_stop, time_of_the_day)
