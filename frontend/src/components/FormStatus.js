import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react"; // Import the icon
import { TrashIcon } from "@heroicons/react/24/solid";


const API_URL = process.env.REACT_APP_BACKEND_API_URL;

const FormStatus = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("Approved");
  const { user } = useAuth(); // Get the logged-in user role

  useEffect(() => {
    fetchStatusData();
  }, [selectedStatus]);

  const fetchStatusData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/forms/status/${selectedStatus}`
      );

      console.log("Response Data:", response.data); // Debugging logs

      if (response.data.length === 0) {
        console.warn("⚠️ No data returned for this status.");
      }

      // Get deleted form IDs from localStorage
      const deletedForms =
        JSON.parse(localStorage.getItem("deletedForms")) || [];

      // Filter out deleted forms
      const filteredData = response.data.filter(
        (item) => !deletedForms.includes(item._id)
      );

      setData(filteredData);
    } catch (error) {
      console.error("❌ Error fetching status data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to remove this form?")) return;

    // Store the deleted ID in localStorage
    const deletedForms = JSON.parse(localStorage.getItem("deletedForms")) || [];
    localStorage.setItem("deletedForms", JSON.stringify([...deletedForms, id]));

    // Remove it from state (frontend only)
    setData((prevData) => prevData.filter((item) => item._id !== id));
  };
  const exportToExcel = () => {
    if (data.length === 0) {
      alert("No data available to export!");
      return;
    }

    // Format data for Excel export
    const formattedData = data.map((item) => ({
      "Temp ID": item.serialNumber || "N/A",
      Department: item.dept,
      For: item.for,
      From: item.from,
      "From Card No.": item.fromcardno,
      Purpose: item.purpose,
      Unit: item.unit,
      "Created At": new Date(item.createdAt).toLocaleString(),
      Status: item.status,
      ...(selectedStatus === "Modified"
        ? { Modification: item.modification || "No details provided" }
        : {}),
    }));

    // Create a worksheet and apply styling
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Apply bold styling to headers
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = { font: { bold: true } };
    }

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedStatus);

    // Save the file
    XLSX.writeFile(workbook, `TemplateStatus_${selectedStatus}.xlsx`);
  };

  const renderFilePreview = (filePath) => {
    if (!filePath) return "No File";
  
    // Fix: Don't use API_URL if it includes /api, just get the base URL
    const baseUrl = API_URL.replace("/api", ""); // e.g., http://localhost:5000
  
    const fileUrl = `${baseUrl}/${filePath}`; // Correct path: /uploads/filename
  
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
        Open File
      </a>
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Template Status</h2>

      {/* Status Filter Buttons */}
      <div className="mb-4 flex gap-4">
        {["Approved", "Rejected", "Modified"].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded ${
              selectedStatus === status
                ? `bg-${
                    status === "Approved"
                      ? "green"
                      : status === "Rejected"
                      ? "red"
                      : "yellow"
                  }-500 text-white`
                : "bg-gray-200"
            }`}
          >
            {status}
          </button>
        ))}
        {/* Export Button */}
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <Download size={18} /> Export to Excel
        </button>
      </div>

      {/* Table to Display Data */}
      <div className="overflow-auto max-h-[500px] border border-gray-300">
        {loading ? (
          <p>Loading data...</p>
        ) : data.length > 0 ? (
          <table className="min-w-full text-sm text-gray-600 border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-md">
              <tr>
                <th className="px-4 py-2 border">Temp ID</th>
                <th className="px-4 py-2 border">Department</th>
                <th className="px-4 py-2 border">For</th>
                <th className="px-4 py-2 border">From</th>
                <th className="px-4 py-2 border">From Card No.</th>
                <th className="px-4 py-2 border">Purpose</th>
                <th className="px-4 py-2 border">Unit</th>
                <th className="px-4 py-2 border">File</th>
                <th className="px-4 py-2 border">Created At</th>
                <th className="px-4 py-2 border">Status</th>
                {selectedStatus === "Modified" && (
                  <th className="px-4 py-2 border">Modification</th>
                )}
                <th className="px-4 py-2 border">Actions</th>{" "}
                {/* Delete Column */}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border">
                    {item.serialNumber || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">{item.dept}</td>
                  <td className="px-4 py-2 border">{item.for}</td>
                  <td className="px-4 py-2 border">{item.from}</td>
                  <td className="px-4 py-2 border">{item.fromcardno}</td>
                  <td className="px-4 py-2 border">{item.purpose}</td>
                  <td className="px-4 py-2 border">{item.unit}</td>
                  <td className="px-4 py-2 border">
                    {item.uploadedFile
                      ? renderFilePreview(item.uploadedFile)
                      : "No File"}
                  </td>

                  <td className="px-4 py-2 border">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td
                    className={`px-4 py-2 border font-bold ${
                      item.status === "Approved"
                        ? "text-green-600"
                        : item.status === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-500"
                    }`}
                  >
                    {item.status}
                  </td>
                  {selectedStatus === "Modified" && (
                    <td className="px-4 py-2 border">
                      {item.modification || "No details provided"}
                    </td>
                  )}
                  <td className="px-4 py-2 border">
                    {/* Delete Button */}
                    {user.username !== "user123" && ( // Hide delete button for "user123"
                      <button
                      onClick={() => handleDelete(item._id)}
                      className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300"
                    >
                      <TrashIcon className="w-5 h-5" />
                      
                    </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center py-4">No data available</p>
        )}
      </div>
    </div>
  );
};

export default FormStatus;
