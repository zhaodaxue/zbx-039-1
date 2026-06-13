import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import CreateBatch from "@/pages/CreateBatch";
import BatchDetail from "@/pages/BatchDetail";
import BatchCompare from "@/pages/BatchCompare";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateBatch />} />
        <Route path="/batch/:id" element={<BatchDetail />} />
        <Route path="/compare" element={<BatchCompare />} />
      </Routes>
    </Router>
  );
}
