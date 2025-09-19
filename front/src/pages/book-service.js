import React, { useEffect, useState } from "react";
import Select from "react-select";
import "../styles/BookAppointmentPage.css";
import Swal from "sweetalert2";

export default function ManageVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    user_id: "",
    license_plate: "",
    model: "",
    id_brand: "",
    id_type: "",
    vehicle_id: "",
  });

  useEffect(() => {
    fetchVehicles();
    fetchBrands();
    fetchTypes();
    fetchCustomers();
  }, []);

  // ===== Fetch Vehicles =====
  const fetchVehicles = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/vehicles");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setVehicles(Array.isArray(data) ? data : data.vehicles || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    }
  };

  // ===== Fetch Brands =====
  const fetchBrands = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/brands");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setBrands(data.brands || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrands([]);
    }
  };

  // ===== Fetch Types =====
  const fetchTypes = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/typecar");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setTypes(data.typecar || []);
    } catch (error) {
      console.error("Error fetching types:", error);
      setTypes([]);
    }
  };

  // ===== Fetch Customers =====
  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/customers");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    }
  };

  // ===== Form Handlers =====
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = form.vehicle_id ? "PUT" : "POST";
    const url = form.vehicle_id
      ? `http://localhost:3000/api/vehicles/${form.vehicle_id}`
      : "http://localhost:3000/api/vehicles";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      await res.json();
      fetchVehicles();
      setForm({
        user_id: "",
        license_plate: "",
        model: "",
        id_brand: "",
        id_type: "",
        vehicle_id: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to save vehicle. Please try again.");
    }
  };

  const handleEdit = (vehicle) => {
    setForm({
      user_id: vehicle.user_id,
      license_plate: vehicle.license_plate,
      model: vehicle.model,
      id_brand: vehicle.id_brand,
      id_type: vehicle.id_type,
      vehicle_id: vehicle.vehicle_id,
    });
  };

  // ✅ ใช้ SweetAlert2
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?ป",
      text: "การลบนี้ไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:3000/api/vehicles/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        fetchVehicles();

        Swal.fire({
          icon: "success",
          title: "ลบเรียบร้อย!",
          text: "ข้อมูลรถถูกลบออกจากระบบแล้ว",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบรถได้ กรุณาลองใหม่", "error");
      }
    }
  };

  // ✅ ป้องกัน customers = undefined
  const customerOptions = (customers || []).map((customer) => ({
    value: customer.user_id,
    label: customer.name,
  }));
  return (
    <div className="page-container">
      <h1 className="page-title">🚘 Vehicle Management</h1>

      {/* ===== Form Section ===== */}
      <form onSubmit={handleSubmit} className="section">
        <h2 className="section-title">
          {form.vehicle_id ? "✏️ Edit Vehicle" : "➕ Add New Vehicle"}
        </h2>

        <div className="form-grid">
          <Select
            options={customerOptions}
            value={customerOptions.find((option) => option.value === form.user_id) || null}
            onChange={(selectedOption) =>
              handleChange("user_id", selectedOption ? selectedOption.value : "")
            }
            placeholder="Select Customer"
            isSearchable
            required
          />
          <input
            type="text"
            placeholder="License Plate"
            value={form.license_plate}
            onChange={(e) => handleChange("license_plate", e.target.value)}
            className="input"
            required
          />
          <input
            type="text"
            placeholder="Model"
            value={form.model}
            onChange={(e) => handleChange("model", e.target.value)}
            className="input"
            required
          />
          <select
            value={form.id_brand}
            onChange={(e) => handleChange("id_brand", e.target.value)}
            className="select"
            required
          >
            <option value="">Select Brand</option>
            {(brands || []).map((b) => (
              <option key={b.id_brand} value={b.id_brand}>
                {b.brandname}
              </option>
            ))}
          </select>
          <select
            value={form.id_type}
            onChange={(e) => handleChange("id_type", e.target.value)}
            className="select"
            required
          >
            <option value="">Select Type</option>
            {(types || []).map((t) => (
              <option key={t.id_type} value={t.id_type}>
                {t.typename}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="submit-btn">
          {form.vehicle_id ? "Update Vehicle" : "Create Vehicle"}
        </button>
      </form>

      {/* ===== Table Section ===== */}
      <div className="section">
        <h2 className="section-title">📋 Vehicle List</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>License Plate</th>
              <th>Model</th>
              <th>Brand</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(vehicles || []).length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  🚫 No vehicles found.
                </td>
              </tr>
            ) : (
              vehicles.map((v, idx) => {
                const brand = brands.find((b) => b.id_brand === v.id_brand);
                const type = types.find((t) => t.id_type === v.id_type);
                return (
                  <tr key={v.vehicle_id} className={idx % 2 === 0 ? "row-even" : "row-odd"}>
                    <td>{v.vehicle_id}</td>
                    <td>{customers.find((c) => c.user_id === v.user_id)?.name || "Unknown"}</td>
                    <td>{v.license_plate}</td>
                    <td>{v.model}</td>
                    <td>{brand ? brand.brandname : "Unknown"}</td>
                    <td>{type ? type.typename : "Unknown"}</td>
                    <td>
                      <button onClick={() => handleEdit(v)} className="action-btn edit-btn">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(v.vehicle_id)}
                        className="action-btn delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
