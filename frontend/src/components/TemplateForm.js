import React, { useEffect, useState } from "react";
import {
  fetchDepartments,
  fetchApprovalAuthorities,
  submitForm,
} from "../api/formApi";
import axios from "axios";
// import "./TemplateForm.css"; // Import the CSS file
const API_URL = process.env.REACT_APP_BACKEND_API_URL; // Adjust for production if needed
console.log(API_URL, "Here check the url");

const TemplateForm = () => {
  const [departments, setDepartments] = useState([]); // State for departments
  const [authorities, setAuthorities] = useState([]); // State for authorities
  const [error, setError] = useState(null); // State for error handling
  const [units, setUnits] = useState([]); // State for units
  // const [cardno, setCardno] = useState([]); // State for card no
  const [employees, setEmployees] = useState([]); // State for employees
  const [file, setFile] = useState(null); // State for file upload
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    from: "",
    dept: "",
    fromcardno: "",
    for: "",
    purpose: "",
    unit: "",
    approvalNeededFrom: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Show loader

    const form = new FormData(); // Create a FormData object for multipart form data
    Object.keys(formData).forEach((key) => form.append(key, formData[key]));
    console.log(file);
    if (file) {
      form.append("file", file); // Append the file if selected
    }

    try {
      const response = await axios.post(`${API_URL}/form/submit`, form, {
        headers: {
          "Content-Type": "multipart/form-data", // Ensure correct content type
        },
      });

      console.log(response);
      alert("Form submitted successfully!");
      setFormData({
        from: "",
        dept: "",
        fromcardno: "",
        for: "",
        purpose: "",
        unit: "",
        approvalNeededFrom: "",
      });
      setFile(null); // Reset file state explicitly
      // Reset the file input value by forcing it to re-render
      document.getElementById("file-input").value = null;
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form.");
    } finally {
      setIsSubmitting(false); // Hide loader
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deptData = await fetchDepartments();
        const authData = await fetchApprovalAuthorities();
        setDepartments(deptData);
        setAuthorities(authData.sort((a, b) => a.name.localeCompare(b.name)));

        const unitsData = await axios.get(`${API_URL}/units`);
        setUnits(unitsData.data);

        // const cardnoData = await axios.get(`${API_URL}/cardno`);
        // setCardno(cardnoData.data);

        const empData = await axios.get(`${API_URL}/employees`);
        setEmployees(empData.data);
      } catch (err) {
        setError("Failed to fetch data");
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto p-8 bg-white shadow-xl rounded-lg"
    >
      <div className="text-center mb-8">
        <h1 className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
          Template Form
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* From and Card Number Section */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            From
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={formData.from}
            onChange={(e) => setFormData({ ...formData, from: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            {" "}
            From Card No.
          </label>
          <input
            type="text"
            placeholder="Enter your card number"
            value={formData.fromcardno}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); // Allow digits only
              setFormData({ ...formData, fromcardno: value });
            }}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          />
        </div>

        {/* Department and For Section */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Department
          </label>
          <select
            id="dept"
            name="dept"
            value={formData.dept}
            onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            <option value="">Your Department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            For
          </label>
          <input
            type="text"
            placeholder="Recipient name"
            value={formData.for}
            onChange={(e) => setFormData({ ...formData, for: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          />
        </div>

        {/* Purpose and Unit Section */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Purpose
          </label>
          <input
            type="text"
            placeholder="Enter your purpose"
            value={formData.purpose}
            onChange={(e) =>
              setFormData({ ...formData, purpose: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Unit
          </label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            <option value="">Select Unit</option>
            {units.map((u) => (
              <option key={u._id} value={u._id}>
                {u.unit}
              </option>
            ))}
          </select>
        </div>

        {/* Approval Needed From and Upload File Section */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Approval Needed From
          </label>
          <select
            id="approvalNeededFrom"
            name="approvalNeededFrom"
            value={formData.approvalNeededFrom}
            onChange={(e) =>
              setFormData({
                ...formData,
                approvalNeededFrom: e.target.value,
              })
            }
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            <option value="">Select Authority</option>
            {authorities.map((auth) => (
              <option key={auth._id} value={auth._id}>
                {auth.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Upload File
          </label>
          <input
            type="file"
            accept="*/*"
            onChange={(e) => setFile(e.target.files[0])}
            id="file-input" // Add an ID for referencing
            className="w-full px-4 py-2 border rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center mt-8">
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          {isSubmitting ? (
            <span className="loader animate-spin"></span>
          ) : (
            "Submit"
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-center mt-4 font-medium">{error}</p>
      )}
    </form>
  );
};

export default TemplateForm;
