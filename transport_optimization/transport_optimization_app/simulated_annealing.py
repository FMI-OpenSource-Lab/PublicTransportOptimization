import random
import datetime
import math
from .models import Stop, Route, RouteStop, TravelTime

# Preload data into a dictionary for fast lookups
travel_time_dict = {
    (start_stop, end_stop, time_of_day): (travel_time_seconds, distance_meters)
    for start_stop, end_stop, time_of_day, travel_time_seconds, distance_meters in
    TravelTime.objects.values_list('start_stop__name', 'end_stop__name', 'time_of_day', 'travel_time_seconds',
                                   'distance_meters')
}


# -------------------------------- Stop importance --------------------------------------------
def define_stop_importance():
    """ Get number of routes each stop should be included in based on the passenger flow """
    stops = list(Stop.objects.all())
    routes_count = len(Route.objects.all())

    # Get stops sorted by passenger flow
    sorted_stops = sorted(stops, key=lambda s: s.passenger_flow, reverse=True)

    # Separate stops in groups depending on the passenger flow
    top_20_pct = int(0.2 * len(sorted_stops))  # First 20% of stops
    middle_50_pct = int(0.5 * len(sorted_stops))  # Next 50% of stops

    stop_groups_map = {
        "top": sorted_stops[:top_20_pct],
        "middle": sorted_stops[top_20_pct:top_20_pct + middle_50_pct],
        "bottom": sorted_stops[top_20_pct + middle_50_pct:]
    }

    # Define how many routes each group of stops should be in
    routes_count_map = {
        "top": max(2, int(0.3 * routes_count)),  # 30% of routes or at least 2
        "middle": max(1, int(0.2 * routes_count)),  # 20% of routes or at least 1
        "bottom": max(1, int(0.1 * routes_count))  # 10% of routes or at least 1
    }

    # Create stop to routes count map
    stop_routes_count_map = {}
    for group, group_stops in stop_groups_map.items():
        for stop in group_stops:
            stop_routes_count_map[stop] = routes_count_map[group]

    return stop_routes_count_map


# --------------------------- Initial solution setup ----------------------------------------
def get_best_route_for_stop(routes, stop):
    """ Get the shortest route to add a stop to that does not already include it """
    routes_to_check = [r for r in routes if stop not in r]
    sorted_routes = sorted(routes_to_check, key=lambda r: len(r))
    return sorted_routes[0]


def insert_stop_in_route(route, stop):
    """ Insert the stop in the best position in the route that minimizes the distance """
    min_total_distance = float('inf')
    best_position = 0

    for i in range(len(route) + 1):
        new_route = route[:i] + [stop] + route[i:]
        total_distance = 0
        for j in range(len(new_route) - 1):
            total_distance += get_distance(new_route[j], new_route[j + 1])

        if total_distance < min_total_distance:
            min_total_distance = total_distance
            best_position = i

    route.insert(best_position, stop)


def stop_importance_setup(routes):
    """ Make sure each stop is in a given number of routes depending on its importance(passenger_flow) """
    stops = list(Stop.objects.all())
    stop_to_routes_count_map = define_stop_importance()

    for stop in stops:
        needed_routes_count = stop_to_routes_count_map[stop]
        routes_count = 0

        # Make sure a stop is not present in more routes than needed
        for route in routes:
            routes_count += 1 if stop in route else 0
            if routes_count > needed_routes_count:
                route.remove(stop)
                routes_count -= 1

        # Make sure a stop is present in needed_routes_count routes
        while routes_count < needed_routes_count:
            best_route = get_best_route_for_stop(routes, stop)
            insert_stop_in_route(best_route, stop)
            routes_count += 1

    return routes


def initial_solution_setup(routes):
    """ Initial solution setup - remove duplicates and set stop importance """
    # Remove duplicate stops from routes (if any)
    routes = [list(dict.fromkeys(route)) for route in routes]
    # Execute stop importance setup
    routes = stop_importance_setup(routes)
    return routes


def generate_initial_routes(num_routes):
    """ Generate initial routes / solution"""
    stops = list(Stop.objects.all())
    random.shuffle(stops)
    routes = [stops[i::num_routes] for i in range(num_routes)]
    return routes


def get_existing_routes():
    """ Get existing routes if any """
    db_routes = Route.objects.all()
    routes = []
    for r in db_routes:
        routes.append([route_stop.stop for route_stop in RouteStop.objects.filter(route=r).order_by('order')])
    return routes


def get_initial_routes(num_routes):
    """ Get initial routes if any in the DB or generate an initial solution """
    existing_routes = get_existing_routes()
    initial_solution = existing_routes if existing_routes else generate_initial_routes(num_routes)
    return initial_solution_setup(initial_solution)


# -------------------------------- Routes evaluation ----------------------------
def evaluate_routes(routes):
    """ Calculate efficiency of the routes """
    total_time = 0
    coverage_score = 0
    for route in routes:
        for i in range(len(route) - 1):
            travel_time = get_travel_time(route[i], route[i + 1])
            total_time += travel_time
        unique_stops = set(route)
        coverage_score += len(unique_stops)

    return total_time - coverage_score * 10


def get_travel_time(stop1, stop2):
    """ Get the travel time between two stops from the DB """
    time_of_day = datetime.time(8, 0)
    tt_data = travel_time_dict.get((str(stop1), str(stop2), time_of_day))
    travel_time, distance = tt_data
    return travel_time


def get_distance(stop1, stop2):
    """ Get the distance between two stops from the DB """
    time_of_day = datetime.time(8, 0)
    tt_data = travel_time_dict[(str(stop1), str(stop2), time_of_day)]
    travel_time, distance = tt_data
    return distance


# ----------------------------- Simulated annealing -----------------------------
def swap_stops(solution):
    """ Swap two random stops in two randomly selected routes of a given solution """
    solution_as_lists = [list(route) for route in solution]
    route1, route2 = random.sample(solution_as_lists, 2)
    if route1 and route2:
        stop1, stop2 = random.choice(route1), random.choice(route2)
        while stop1 in route2 or stop2 in route1:
            stop1, stop2 = random.choice(route1), random.choice(route2)
        route1.remove(stop1)
        route2.remove(stop2)
        insert_stop_in_route(route1, stop2)
        insert_stop_in_route(route2, stop1)
    return solution_as_lists


def simulated_annealing(initial_temp=100, cooling_rate=0.99, iterations=1000):
    """ Simulated annealing algorithm """
    num_routes = len(
        Route.objects.all())  # Or to be updated with user input if no routes in the DB (should depend on stops count)
    current_solution = get_initial_routes(num_routes)
    print("Initial solution:")
    print(current_solution)
    current_score = evaluate_routes(current_solution)
    temperature = initial_temp

    for _ in range(iterations):
        new_solution = swap_stops(current_solution)
        new_score = evaluate_routes(new_solution)

        if new_score < current_score or random.random() < math.exp((current_score - new_score) / temperature):
            current_solution, current_score = new_solution, new_score

        temperature *= cooling_rate

    print(current_score)
    return current_solution
