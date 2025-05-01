import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function RunOptimization() {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [stops, setStops] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [numberOfRoutes, setNumberOfRoutes] = useState(1);
  const [initialSolutionRoutes, setInitialSolutionRoutes] = useState([]);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("simulated_annealing");
  const navigate = useNavigate();

  const isFinal = (val) => val === true || val === "true" || val === 1;
  const isFinalLabel = (val) => (isFinal(val) ? "(Final)" : "(Not Final)");

  useEffect(() => {
    axios.get("http://localhost:8000/api/cities/").then((res) => {
      setCities(res.data.results || res.data);
    });
  }, []);

  useEffect(() => {
    if (selectedCity) {
      const fetchAllStops = async () => {
        let allStops = [];
        let nextPageUrl = `http://localhost:8000/api/stops/?city=${selectedCity.value}`;

        while (nextPageUrl) {
          const res = await axios.get(nextPageUrl);
          const stopData = res.data.results || res.data;
          allStops = [...allStops, ...stopData];
          nextPageUrl = res.data.next;
        }

        setStops(allStops);
        const defaultStopIds = allStops.map((s) => s.id);
        setSelectedStops(defaultStopIds);
        setInitialSolutionRoutes([]);
      };

      fetchAllStops();
    }
  }, [selectedCity]);

  useEffect(() => {
    const cleanedRoutes = initialSolutionRoutes.map((route) =>
      route.filter((stopId) => selectedStops.includes(stopId))
    );
    setInitialSolutionRoutes(cleanedRoutes);
  }, [selectedStops]);

  const handleAddRoute = () => {
    setInitialSolutionRoutes([...initialSolutionRoutes, []]);
  };

  const handleRemoveRoute = (index) => {
    const newRoutes = [...initialSolutionRoutes];
    newRoutes.splice(index, 1);
    setInitialSolutionRoutes(newRoutes);
  };

  const handleDragEnd = (result, routeIndex) => {
    if (!result.destination) return;

    const newRoutes = [...initialSolutionRoutes];
    const items = Array.from(newRoutes[routeIndex]);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    newRoutes[routeIndex] = items;
    setInitialSolutionRoutes(newRoutes);
  };

  const handleStopAdd = (stopId, routeIndex) => {
    const newRoutes = [...initialSolutionRoutes];
    if (!newRoutes[routeIndex].includes(stopId)) {
      newRoutes[routeIndex].push(stopId);
      setInitialSolutionRoutes(newRoutes);
    }
  };

  const handleStopRemove = (stopId, routeIndex) => {
    const newRoutes = [...initialSolutionRoutes];
    newRoutes[routeIndex] = newRoutes[routeIndex].filter((id) => id !== stopId);
    setInitialSolutionRoutes(newRoutes);
  };

  const validateInitialSolution = () => {
    const allStopsInSolution = initialSolutionRoutes.flat();
    const allSelectedInSolution = selectedStops.every((id) =>
      allStopsInSolution.includes(id)
    );

    if (!allSelectedInSolution) {
      setMessage("❌ All selected stops must be included in the initial solution.");
      return false;
    }

    for (let i = 0; i < initialSolutionRoutes.length; i++) {
      const route = initialSolutionRoutes[i];
      if (route.length < 2) continue;
      const start = stops.find((s) => s.id === route[0]);
      const end = stops.find((s) => s.id === route[route.length - 1]);
      if (!isFinal(start?.is_final_stop) || !isFinal(end?.is_final_stop)) {
        setMessage(`❌ Route ${i + 1} must start and end with a final stop.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setResults(null);

    const usingInitialSolution =
      selectedAlgorithm === "simulated_annealing" &&
      initialSolutionRoutes.some((r) => r.length > 0);

    if (usingInitialSolution && !validateInitialSolution()) return;

    try {
      const payload = {
        algorithm: selectedAlgorithm,
        city_id: selectedCity?.value,
        stop_ids: selectedStops,
        number_of_routes: usingInitialSolution
          ? initialSolutionRoutes.length
          : numberOfRoutes,
      };

      if (usingInitialSolution) {
        payload.initial_solution = initialSolutionRoutes;
      }

      const endpoint = "http://localhost:8000/api/optimize/";

      const response = await axios.post(endpoint, payload);

      setResults(response.data);
      setMessage("✅ Optimization completed.");
      navigate("/results", { state: { results: response.data } });
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to run optimization.");
    }
  };

  const stopOptions = stops
    .filter((stop) => selectedStops.includes(stop.id))
    .map((stop) => ({
      value: stop.id,
      label: `${stop.name} ${isFinalLabel(stop.is_final_stop)}`,
    }));

  const getStopLabel = (id) => {
    const stop = stops.find((s) => s.id === id);
    if (!stop) return "Loading...";
    return `${stop.name} ${isFinalLabel(stop.is_final_stop)}`;
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-xl mt-10">
      <h2 className="text-3xl font-semibold text-gray-800 mb-4">Run Route Optimization</h2>

      {message && <p className="mb-4 text-center text-sm text-red-500">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="label">Select Algorithm</label>
          <Select
            options={[
              { value: "simulated_annealing", label: "Simulated Annealing" },
              { value: "aco", label: "Ant Colony Optimization" },
            ]}
            value={{
              value: selectedAlgorithm,
              label:
                selectedAlgorithm === "aco"
                  ? "Ant Colony Optimization"
                  : "Simulated Annealing",
            }}
            onChange={(val) => {
              setSelectedAlgorithm(val.value);
              setInitialSolutionRoutes([]);
            }}
          />
        </div>

        <div>
          <label className="label">Select City</label>
          <Select
            options={cities.map((c) => ({ value: c.id, label: `${c.name}, ${c.country}` }))}
            value={selectedCity}
            onChange={(val) => {
              setSelectedCity(val);
              setInitialSolutionRoutes([]);
            }}
            placeholder="Choose a city..."
          />
        </div>

        <div>
          <label className="label">Stops (all selected by default)</label>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border p-2 rounded">
            {stops.length === 0 ? (
              <p className="text-gray-500 col-span-2 text-center">
                {selectedCity
                  ? "No stops available for this city."
                  : "Please select a city to view stops."}
              </p>
            ) : (
              stops.map((stop) => (
                <label key={stop.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedStops.includes(stop.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStops([...selectedStops, stop.id]);
                      } else {
                        setSelectedStops(selectedStops.filter((id) => id !== stop.id));
                      }
                    }}
                  />
                  <span>
                    {stop.name}{" "}
                    <span className={isFinal(stop.is_final_stop) ? "text-green-600" : "text-yellow-600"}>
                      ({isFinal(stop.is_final_stop) ? "Final" : "Not Final"})
                    </span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <div>
          <label className="label">Number of Routes</label>
          <input
            className="input input-bordered w-full"
            type="number"
            value={numberOfRoutes}
            onChange={(e) => setNumberOfRoutes(parseInt(e.target.value))}
            min="1"
            required
            disabled={
              selectedAlgorithm === "simulated_annealing" &&
              initialSolutionRoutes.some((r) => r.length > 0)
            }
          />
        </div>

        {selectedAlgorithm === "simulated_annealing" && (
          <div>
            <label className="label">Initial Solution (optional)</label>
            {initialSolutionRoutes.map((route, index) => (
              <div key={index} className="mb-4 border p-3 rounded shadow-sm bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Route {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveRoute(index)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <DragDropContext onDragEnd={(result) => handleDragEnd(result, index)}>
                  <Droppable droppableId={`route-${index}`}>
                    {(provided) => (
                      <ul
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="bg-white border rounded p-2 mb-2 min-h-[40px]"
                      >
                        {route.map((stopId, idx) => (
                          <Draggable key={stopId} draggableId={`${stopId}`} index={idx}>
                            {(provided) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-gray-100 px-3 py-1 mb-1 rounded flex justify-between items-center"
                              >
                                <span>{getStopLabel(stopId)}</span>
                                <button
                                  type="button"
                                  onClick={() => handleStopRemove(stopId, index)}
                                  className="text-xs text-red-500 ml-2"
                                >
                                  ✕
                                </button>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>

                <Select
                  options={stopOptions.filter((opt) => !route.includes(opt.value))}
                  onChange={(selected) => {
                    if (selected) handleStopAdd(selected.value, index);
                  }}
                  placeholder="Add stop..."
                />
              </div>
            ))}

            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddRoute}
                className="btn btn-outline btn-primary mt-2"
                disabled={selectedStops.length === 0}
              >
                + Add Route
              </button>
            </div>
          </div>
        )}

        <div>
          <button type="submit" className="btn btn-primary w-full">
            Run Optimization
          </button>
        </div>
      </form>

      {results && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Results</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default RunOptimization;
