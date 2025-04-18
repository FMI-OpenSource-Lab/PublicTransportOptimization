import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditCityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [city, setCity] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/cities/${id}/`)
      .then((res) => setCity(res.data))
      .catch((err) => console.error("Fetch error:", err));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.put(`http://localhost:8000/api/cities/${id}/`, city);
      setMessage("✅ City updated!");
      setTimeout(() => navigate("/cities"), 1000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Update failed");
    }
  };

  if (!city) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-xl mt-10">
      <h2 className="text-3xl font-semibold mb-4">Edit City</h2>
      {message && <p className="text-green-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="input input-bordered w-full"
          type="text"
          value={city.name}
          onChange={(e) => setCity({ ...city, name: e.target.value })}
          required
        />
        <input
          className="input input-bordered w-full"
          type="text"
          value={city.country}
          onChange={(e) => setCity({ ...city, country: e.target.value })}
          required
        />
        <button className="btn btn-primary w-full" type="submit">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditCityForm;
