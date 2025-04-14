import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CityList() {
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  const pageSize = 10;

  const fetchCities = async () => {
    try {
      const params = {
        search,
        ordering,
        page: currentPage,
      };
      const response = await axios.get("http://localhost:8000/api/cities/", { params });
      setCities(response.data.results);
      setCount(response.data.count);
    } catch (err) {
      console.error("Failed to load cities:", err);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [search, ordering, currentPage]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete city "${name}"?`)) return;
    try {
      await axios.delete(`http://localhost:8000/api/cities/${id}/`);
      fetchCities();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4">Cities</h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Search Bar */}
        <input
          className="input input-bordered w-full md:max-w-xs"
          type="text"
          placeholder="🔍 Search by name or country..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        {/* Sorting Dropdown */}
        <select
          className="select select-bordered w-full md:max-w-xs"
          value={ordering}
          onChange={(e) => setOrdering(e.target.value)}>
          <option value="">Sort by</option>
          <option value="name">Name (A-Z)</option>
          <option value="-name">Name (Z-A)</option>
          <option value="country">Country (A-Z)</option>
          <option value="-country">Country (Z-A)</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full table-zebra">
          <thead>
            <tr>
              <th>Name</th>
              <th>Country</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city) => (
              <tr key={city.id}>
                <td>{city.name}</td>
                <td>{city.country}</td>
                <td>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => navigate(`/edit-city/${city.id}`)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleDelete(city.id, city.name)}>
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

export default CityList;
