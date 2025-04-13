import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditStopForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stop, setStop] = useState(null);
  const [cities, setCities] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch the specific stop details
    axios
      .get(`http://localhost:8000/api/stops/${id}/`)
      .then((res) => setStop(res.data))
      .catch((err) => console.error("Fetch stop error", err));

    // Fetch the list of cities
    axios
      .get("http://localhost:8000/api/cities/")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCities(res.data); // Expected array response format
        } else if (Array.isArray(res.data.results)) {
          setCities(res.data.results); // Some APIs return a `results` key
        } else {
          console.warn("Unexpected city response format:", res.data);
          setCities([]);
        }
      })
      .catch((err) => {
        console.error("Fetch cities error", err);
        setCities([]);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.put(`http://localhost:8000/api/stops/${id}/`, stop);
      setMessage("✅ Stop updated!");
      setTimeout(() => navigate("/stops"), 1000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Update failed");
    }
  };

  if (!stop) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-md mx-auto bg-base-100 p-6 rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-semibold text-primary mb-4">Edit Stop</h2>
      {message && <p className="mb-4 text-sm text-center text-green-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="input input-bordered w-full"
          type="text"
          placeholder="Stop Name"
          value={stop.name}
          onChange={(e) => setStop({ ...stop, name: e.target.value })}
          required
        />
        <input
          className="input input-bordered w-full"
          type="number"
          placeholder="Latitude"
          value={stop.latitude}
          onChange={(e) => setStop({ ...stop, latitude: e.target.value })}
          required
        />
        <input
          className="input input-bordered w-full"
          type="number"
          placeholder="Longitude"
          value={stop.longitude}
          onChange={(e) => setStop({ ...stop, longitude: e.target.value })}
          required
        />
        <input
          className="input input-bordered w-full"
          type="number"
          placeholder="Passenger Flow"
          value={stop.passenger_flow}
          onChange={(e) => setStop({ ...stop, passenger_flow: e.target.value })}
          required
        />
        <select
          className="select select-bordered w-full"
          value={stop.city}
          onChange={(e) => setStop({ ...stop, city: e.target.value })}
          required
        >
          <option value="">Select a city</option>
          {Array.isArray(cities) &&
            cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
        </select>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="checkbox"
            checked={stop.is_final_stop}
            onChange={(e) => setStop({ ...stop, is_final_stop: e.target.checked })}
          />
          <span>Is Final Stop?</span>
        </label>
        <button className="btn btn-primary w-full">Save Changes</button>
      </form>
    </div>
  );
}

export default EditStopForm;
