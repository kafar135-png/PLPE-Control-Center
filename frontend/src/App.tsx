import "./App.css";

import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";

import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import About from "./pages/About";
import HolderProfile from "./pages/HolderProfile";

function App() {
  return (
    <div className="app">
      <Sidebar />

      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/analytics" element={<Analytics />} />

          <Route path="/holder" element={<HolderProfile />} />

          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;