import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddStopForm() {
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [passengerFlow, setPassengerFlow] = useState("");
  const [isFinalStop, setIsFinalStop] = useState(false);
  const [cityId, setCityId] = useState("");
  const [cities, setCities] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/cities/")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCities(res.data);
        } else if (Array.isArray(res.data.results)) {
          setCities(res.data.results);
        } else {
          console.warn("Unexpected city response format:", res.data);
          setCities([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch cities", err);
        setCities([]);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await axios.post("http://localhost:8000/api/stops/", {
        name,
        latitude,
        longitude,
        passenger_flow: passengerFlow,
        is_final_stop: isFinalStop,
        city: cityId,
      });

      if (response.status === 201) {
        navigate("/stops");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add stop.");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-xl mt-10">
      <h2 className="text-3xl font-semibold text-gray-800 mb-4">Add a New Stop</h2>
      {message && <p className="mb-4 text-sm text-center text-green-500">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Stop Name</label>
          <input
            className="input input-bordered w-full"
            type="text"
            placeholder="Enter stop name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Latitude</label>
          <input
            className="input input-bordered w-full"
            type="number"
            placeholder="Enter latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Longitude</label>
          <input
            className="input input-bordered w-full"
            type="number"
            placeholder="Enter longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Passenger Flow</label>
          <input
            className="input input-bordered w-full"
            type="number"
            placeholder="Enter passenger flow"
            value={passengerFlow}
            onChange={(e) => setPassengerFlow(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Select City</label>
          <select
            className="select select-bordered w-full"
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            required
          >
            <option value="">Select a city</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isFinalStop}
            onChange={(e) => setIsFinalStop(e.target.checked)}
            className="checkbox checkbox-primary"
          />
          <span>Is Final Stop?</span>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="btn btn-primary w-full mt-4"
          >
            Add Stop
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddStopForm;
