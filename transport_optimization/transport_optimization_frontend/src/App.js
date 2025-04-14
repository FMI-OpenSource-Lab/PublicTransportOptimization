import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AddStopForm from "./components/AddStopForm";
import EditStopForm from "./components/EditStopForm";
import StopList from "./components/StopList";
import AddCityForm from "./components/AddCityForm";
import EditCityForm from "./components/EditCityForm";
import CityList from "./components/CityList";

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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-4xl font-bold text-primary mb-4">Welcome to the Public transport optimisation app</h2>
      <div className="card w-96 bg-white shadow-xl mx-auto">
        <div className="card-body">
          <h2 className="card-title justify-center">Get Started</h2>
          <p>Use the navigation bar to add new stops, manage cities, and more.</p>
          <div className="card-actions justify-center">
            <Link to="/add-stop" className="btn btn-primary">Add a New Stop</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
