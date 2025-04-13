import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AddStopForm from "./components/AddStopForm";
import EditStopForm from "./components/EditStopForm";
import StopList from "./components/StopList";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-primary text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-semibold">Transport Manager</h1>
            <ul className="flex space-x-4">
              <li><Link to="/" className="btn btn-ghost text-white hover:bg-primary-focus">Home</Link></li>
              <li><Link to="/add-stop" className="btn btn-ghost text-white hover:bg-primary-focus">Add Stop</Link></li>
              <li><Link to="/stops" className="btn btn-ghost text-white hover:bg-primary-focus">All Stops</Link></li>
            </ul>
          </div>
        </nav>

        <main className="container mx-auto py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-stop" element={<AddStopForm />} />
            <Route path="/stops" element={<StopList />} />
            <Route path="/edit-stop/:id" element={<EditStopForm />} />
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
