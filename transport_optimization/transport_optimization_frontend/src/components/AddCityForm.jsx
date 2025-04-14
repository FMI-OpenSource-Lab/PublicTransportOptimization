import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddCityForm() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await axios.post("http://localhost:8000/api/cities/", {
        name,
        country,
      });
      if (response.status === 201) {
        navigate("/cities");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add city.");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-xl mt-10">
      <h2 className="text-3xl font-semibold text-gray-800 mb-4">Add a New City</h2>
      {message && <p className="text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="input input-bordered w-full"
          type="text"
          placeholder="City Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="input input-bordered w-full"
          type="text"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
        />
        <button className="btn btn-primary w-full" type="submit">
          Add City
        </button>
      </form>
    </div>
  );
}

export default AddCityForm;
