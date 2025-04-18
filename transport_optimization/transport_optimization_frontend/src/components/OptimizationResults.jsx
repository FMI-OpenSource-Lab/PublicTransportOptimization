import { useLocation, useNavigate } from "react-router-dom";

function OptimizationResults() {
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

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Optimization Results</h2>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
        {JSON.stringify(results, null, 2)}
      </pre>
      <button className="btn btn-primary mt-6" onClick={() => navigate("/optimize")}>
        Run Another Optimization
      </button>
    </div>
  );
}

export default OptimizationResults;
