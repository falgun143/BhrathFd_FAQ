import React from "react";
import { Route, Routes } from "react-router-dom";
import FAQ from "./components/FAQ";
import Login from "./components/Login";
import Register from "./components/Register";
import "./App.css";
import Home from "./components/Home";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />
      <Route path="/faq" element={<FAQ />} />
    </Routes>
  );
};

export default App;
