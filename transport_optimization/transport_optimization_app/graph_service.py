import networkx as nx
from .models import Stop, TravelTime


def build_graph():
    """ Build a directed graph representing the stops and the travel time between them """
    # Directed graph - different travel time/distance in the two directions
    stops_graph = nx.DiGraph()

    # Add the stops as nodes
    stops = Stop.objects.all()
    for stop in stops:
        stops_graph.add_node(stop.id, name=stop.name, pos=(stop.latitude, stop.longitude))

    # Add the edges in the graph - travel time
    travel_times = TravelTime.objects.all()
    for travel in travel_times:
        stops_graph.add_edge(travel.start_stop.id, travel.end_stop.id, weight=travel.travel_time_seconds)

    return stops_graph


def find_shortest_route(start_stop_name, end_stop_name):
    """ Find the shortest route between two stops """
    graph = build_graph()
    stops = {data["name"]: node for node, data in graph.nodes(data=True)}

    if start_stop_name not in stops or end_stop_name not in stops:
        return {"error": "Error: stop with this name does not exist!"}

    start_id = stops[start_stop_name]
    end_id = stops[end_stop_name]

    shortest_path = nx.shortest_path(graph, source=start_id, target=end_id, weight="weight")
    shortest_time = nx.shortest_path_length(graph, source=start_id, target=end_id, weight="weight")

    route_names = [graph.nodes[n]["name"] for n in shortest_path]

    return {
        "route": route_names,
        "time_seconds": shortest_time
    }
