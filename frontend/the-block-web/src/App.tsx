import { Routes, Route } from "react-router-dom";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import InventoryPage from "./pages/InventoryPage";
import Header from "./components/Header";

export default function App() {
  return (
  <>
  <Header />
  <Routes>
    <Route path="/" element={<InventoryPage />} />
    <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
    </Routes>
    </>
  )
}