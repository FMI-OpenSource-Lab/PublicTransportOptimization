import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function StopList() {
  const [stops, setStops] = useState([]);
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  const pageSize = 10;

  const fetchStops = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/stops/", {
        params: {
          search,
          ordering,
          page: currentPage,
        },
      });
      setStops(response.data.results);
      setCount(response.data.count);
    } catch (err) {
      console.error("Error fetching stops:", err);
    }
  }, [search, ordering, currentPage]);

  useEffect(() => {
    fetchStops();
  }, [fetchStops]);

  const totalPages = Math.ceil(count / pageSize);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete stop "${name}"?`)) return;
    try {
      await axios.delete(`http://localhost:8000/api/stops/${id}/`);
      fetchStops();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Stops List</h2>

      {/* Search and Sort Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by stop name"
          className="input input-bordered w-full md:max-w-xs"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          className="select select-bordered w-full md:max-w-xs"
          value={ordering}
          onChange={(e) => setOrdering(e.target.value)}>
          <option value="">Sort by</option>
          <option value="name">Name (A-Z)</option>
          <option value="-name">Name (Z-A)</option>
          <option value="passenger_flow">Passenger Flow (Low → High)</option>
          <option value="-passenger_flow">Passenger Flow (High → Low)</option>
        </select>
      </div>

      {/* Stops Table */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Flow</th>
              <th>Final</th>
              <th>City</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stops.map((stop) => (
              <tr key={stop.id}>
                <td>{stop.name}</td>
                <td>{stop.latitude}</td>
                <td>{stop.longitude}</td>
                <td>{stop.passenger_flow}</td>
                <td>{stop.is_final_stop ? "✅" : "❌"}</td>
                <td>{stop.city_name || stop.city}</td>
                <td>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => navigate(`/edit-stop/${stop.id}`)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleDelete(stop.id, stop.name)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="join mt-6 flex justify-center">
        <button
          className="join-item btn"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}>
          «
        </button>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            className={`join-item btn ${currentPage === idx + 1 ? "btn-active" : ""}`}
            onClick={() => setCurrentPage(idx + 1)}>
            {idx + 1}
          </button>
        ))}
        <button
          className="join-item btn"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}>
          »
        </button>
      </div>
    </div>
  );
}

export default StopList;
