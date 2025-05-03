import { useLocation, useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import React from "react";
import SolutionMap from './SolutionMap';

function SAResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results;

  if (!results) {
    return (
      <div className="p-4">
        <p>No results found. Please run optimization first.</p>
        <button className="btn btn-primary mt-4" onClick={() => navigate("/optimize")}>
          Back to Optimization
        </button>
      </div>
    );
  }

  const {
    initial_solution_metrics,
    final_solution_metrics,
    initial_solution,
    optimized_solution,
    initial_solution_used,
    algorithm_parameters,
    iteration_info
  } = results;

  const chartData = [
    { metric: "Score", Initial: initial_solution_metrics.score, Optimized: final_solution_metrics.score },
    { metric: "Avg Distance (km)", Initial: initial_solution_metrics.average_distance, Optimized: final_solution_metrics.average_distance },
    { metric: "Avg Time (min)", Initial: initial_solution_metrics.average_time, Optimized: final_solution_metrics.average_time },
    { metric: "Avg Number of Transfers", Initial: initial_solution_metrics.average_transfers, Optimized: final_solution_metrics.average_transfers },
    { metric: "Direct Trips %", Initial: initial_solution_metrics.direct_trips_percentage, Optimized: final_solution_metrics.direct_trips_percentage },
  ];

  const timeData = iteration_info?.iteration_times?.map((time, idx) => ({
    iteration: idx + 1,
    time
  })) || [];

  const distanceData = iteration_info?.iteration_distances?.map((distance, idx) => ({
    iteration: idx + 1,
    distance
  })) || [];

  const improvements = [
    {
      label: "Average Distance",
      value: final_solution_metrics.average_distance - initial_solution_metrics.average_distance,
      positiveIsGood: false,
    },
    {
      label: "Average Time",
      value: final_solution_metrics.average_time - initial_solution_metrics.average_time,
      positiveIsGood: false,
    },
    {
      label: "Average Transfers",
      value: final_solution_metrics.average_transfers - initial_solution_metrics.average_transfers,
      positiveIsGood: false,
    },
    {
      label: "Direct Trips %",
      value: final_solution_metrics.direct_trips_percentage - initial_solution_metrics.direct_trips_percentage,
      positiveIsGood: true,
    },
  ];

  const renderRoute = (route) => (
    <div className="flex flex-wrap items-center gap-2">
      {route.map((stop, idx) => (
        <React.Fragment key={idx}>
          <span className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-sm font-semibold">
            {stop.name}
          </span>
          {idx !== route.length - 1 && <span className="text-gray-500">→</span>}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded shadow space-y-8">
      <h2 className="text-3xl font-bold mb-6">Results</h2>

      {/* General information */}
      <div className="space-y-4 bg-gray-100 p-4 rounded">
        <p>
          <strong>Initial Solution Provided:</strong> {initial_solution_used ? "Yes, by user" : "No, generated automatically"}
        </p>

        {initial_solution_used && (
          <p className="text-sm text-gray-700">
            Note: Your provided solution was slightly adjusted before optimization.
            Important stops with higher passenger flow were ensured to appear in multiple routes if necessary.
          </p>
        )}
      </div>

      {/* Algorithm Parameters */}
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="text-l font-semibold mb-4">Simulated annealing parameters</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-800">
          <li><strong>Iterations:</strong> {algorithm_parameters.iterations}</li>
          <li><strong>Initial temperature:</strong> {algorithm_parameters.initial_temp}</li>
          <li><strong>Cooling rate:</strong> {algorithm_parameters.cooling_rate}</li>
        </ul>
      </div>

      {/* Metrics Comparison Table */}
      <h3 className="text-2xl font-semibold mb-6">Optimization Results</h3>
      <p className="text-sm text-gray-700">
        Metrics were calculated based on a simulation of passengers randomly selecting start and end stops for their trip.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Metric</th>
              <th className="px-4 py-2 border">Initial</th>
              <th className="px-4 py-2 border">Optimized</th>
              <th className="px-4 py-2 border">Difference</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-2 border">{item.metric}</td>
                <td className="px-4 py-2 border">{item.Initial.toFixed(2)}</td>
                <td className="px-4 py-2 border">{item.Optimized.toFixed(2)}</td>
                <td className="px-4 py-2 border">{(item.Optimized - item.Initial).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Initial" fill="#8884d8" />
            <Bar dataKey="Optimized" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Iteration Time Progress */}
      {timeData.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold mb-4">Total Travel Time Over Iterations</h3>
          <p className="text-sm text-gray-700">
            Total travel time for all routes over the executed iterations.
          </p>
          <div className="h-80 bg-white p-4 rounded shadow">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <XAxis dataKey="iteration" label={{ value: "Iteration", position: "insideBottomRight", offset: -5 }} />
                <YAxis label={{ value: "Time (min)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Line type="monotone" dataKey="time" stroke="#82ca9d" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Iteration Distance Progress */}
      {distanceData.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold mt-10 mb-4">Total Travel Distance Over Iterations</h3>
          <p className="text-sm text-gray-700">
            Total travel distance for all routes over the executed iterations.
          </p>
          <div className="h-80 bg-white p-4 rounded shadow">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={distanceData}>
                <XAxis dataKey="iteration" label={{ value: "Iteration", position: "insideBottomRight", offset: -5 }} />
                <YAxis label={{ value: "Distance (km)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Line type="monotone" dataKey="distance" stroke="#8884d8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Routes List and Maps */}
      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-semibold mb-4">Initial Solution</h3>
          {/* List of routes */}
          <div className="space-y-2 mb-6">
            {initial_solution.map((route, idx) => (
              <div key={idx}>
                <strong>Route {idx + 1}:</strong> {renderRoute(route)}
              </div>
            ))}
          </div>
          {/* Map */}
          <SolutionMap solution={initial_solution} />
        </div>
        <br />
        <div>
          <h3 className="text-2xl font-semibold mb-4">Optimized Solution</h3>
          {/* List of routes */}
          <div className="space-y-2 mb-6">
            {optimized_solution.map((route, idx) => (
              <div key={idx}>
                <strong>Route {idx + 1}:</strong> {renderRoute(route)}
              </div>
            ))}
          </div>

          {/* Map */}
          <SolutionMap solution={optimized_solution} />
        </div>
      </div>
      <br />

      {/* Improvements Summary */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Summary</h2>
        {improvements.map((imp, idx) => (
          <div key={idx} className={`p-2 rounded ${imp.value * (imp.positiveIsGood ? 1 : -1) > 0 ? "bg-green-100" : "bg-red-100"}`}>
            {imp.label}: {imp.value > 0 ? "+" : ""}{imp.value.toFixed(2)}
          </div>
        ))}
      </div>

      {/* Navigation Button */}
      <div className="flex justify-center mt-8">
        <button className="btn btn-primary" onClick={() => navigate("/optimize")}>
          Run Another Optimization
        </button>
      </div>
    </div>
  );
}

export default SAResults;
