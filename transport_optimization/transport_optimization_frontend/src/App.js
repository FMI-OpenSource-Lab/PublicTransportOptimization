import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect } from "react";
import AddStopForm from "./components/AddStopForm";
import EditStopForm from "./components/EditStopForm";
import StopList from "./components/StopList";
import AddCityForm from "./components/AddCityForm";
import EditCityForm from "./components/EditCityForm";
import CityList from "./components/CityList";
import RunOptimization from "./components/RunOptimization";
import OptimizationResults from "./components/OptimizationResults";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">Transport Manager</h1>

            <ul className="flex space-x-6 items-center text-base">
              <li>
                <Link to="/" className="text-gray-700 hover:text-primary font-medium transition-colors">
                  Home
                </Link>
              </li>

              <li className="relative group">
                <div className="flex flex-col group">
                  <button
                    className="flex items-center gap-1 text-gray-700 hover:text-primary font-medium transition-colors focus:outline-none">
                    Stops
                    <svg
                      className="w-4 h-4 transition-transform transform group-hover:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <ul className="absolute top-full left-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-10">
                    <li>
                      <Link to="/add-stop" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                        Add Stop
                      </Link>
                    </li>
                    <li>
                      <Link to="/stops" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                        All Stops
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>

              <li className="relative group">
                <div className="flex flex-col group">
                  <button className="flex items-center gap-1 text-gray-700 hover:text-primary font-medium transition-colors focus:outline-none">
                    Cities
                    <svg
                      className="w-4 h-4 transition-transform transform group-hover:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <ul className="absolute top-full left-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-10">
                    <li>
                      <Link to="/add-city" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                        Add City
                      </Link>
                    </li>
                    <li>
                      <Link to="/cities" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                        All Cities
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>

              <li>
                <Link to="/optimize" className="text-gray-700 hover:text-primary font-medium transition-colors">
                  Run Optimization
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="container mx-auto py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-stop" element={<AddStopForm />} />
            <Route path="/stops" element={<StopList />} />
            <Route path="/edit-stop/:id" element={<EditStopForm />} />
            <Route path="/add-city" element={<AddCityForm />} />
            <Route path="/cities" element={<CityList />} />
            <Route path="/edit-city/:id" element={<EditCityForm />} />
            <Route path="/optimize" element={<RunOptimization />} />
            <Route path="/results" element={<OptimizationResults />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}


function Home() {
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-in");
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add("opacity-100");
      }, index * 200);
    });
  }, []);

  return (
    <div className="text-center space-y-16 min-h-screen px-4 py-12">
      <h2 className="text-5xl font-extrabold text-primary mb-4 fade-in opacity-0 transition-all duration-1000">
        Welcome to the Public Transport Optimization App
      </h2>

      <p className="max-w-3xl mx-auto text-lg text-gray-600 fade-in opacity-0 transition-all duration-1000 delay-200">
        This app helps you design efficient public transport networks by letting you manage cities, create stops,
        and run optimization algorithms to generate the best possible routes. Whether you're managing a small
        town or a metropolitan area, this tool provides everything you need to streamline your transport planning.
      </p>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 fade-in opacity-0 transition-all duration-1000 delay-400">
        <div className="bg-white shadow-xl hover:shadow-2xl rounded-xl p-8 transform hover:scale-105 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 10l5 5 5-5H5z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Manage Stops</h3>
          <p className="text-gray-600">Easily add, edit, and manage your transport stops within the app.</p>
        </div>

        <div className="bg-white shadow-xl hover:shadow-2xl rounded-xl p-8 transform hover:scale-105 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 10l5 5 5-5H5z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Manage Cities</h3>
          <p className="text-gray-600">Add and update cities to ensure your transport routes are optimized for the right locations.</p>
        </div>

        <div className="bg-white shadow-xl hover:shadow-2xl rounded-xl p-8 transform hover:scale-105 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 10l5 5 5-5H5z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Optimization</h3>
          <p className="text-gray-600">Run optimization tasks to find the best routes for your transport network.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
