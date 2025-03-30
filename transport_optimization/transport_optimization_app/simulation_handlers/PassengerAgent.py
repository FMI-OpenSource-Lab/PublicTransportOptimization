from mesa import Agent


class PassengerAgent(Agent):
    """Passenger agent who chooses a route to test"""

    def __init__(self, unique_id, model, start_stop, end_stop, time_of_the_day):
        super().__init__(unique_id, model)
        self.start_stop = start_stop
        self.end_stop = end_stop
        self.time_of_the_day = time_of_the_day
        self.travel_distance = 0
        self.travel_time = 0
        self.transfer_count = 0

    def step(self):
        """Find the best route for the given start and end stops"""
        self.transfer_count, self.travel_time, self.travel_distance = self.model.find_best_route(self.start_stop,
                                                                                                 self.end_stop,
                                                                                                 self.time_of_the_day)
