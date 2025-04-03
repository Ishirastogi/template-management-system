import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";
import { ArrowDownToLine } from "lucide-react";
import { Search } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_API_URL;

function SlidingGrid() {
  const [formData, setFormData] = useState({
    serialNumber: "", // Keeping the correct field name
    dept: "",
    dateFrom: "",
    dateTo: "",
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modification, setModification] = useState("");
  const [processingAction, setProcessingAction] = useState(null); // Track which button is processing
  const [processedActions, setProcessedActions] = useState({}); // Tracks permanently disabled buttons
  const { user } = useAuth(); // Get the logged-in user role

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/forms`, {
        params: formData,
      });
      setData(response.data);
    } catch (error) {
      console.error(
        "Error fetching data:",
        error?.response?.data || error.message
      );
      alert("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, item) => {
    const actionKey = item._id + action;
    setProcessingAction(actionKey); // Temporarily disable button

    try {
      // Update the status in the database
      const updatedStatus = { status: action };
      await axios.post(`${API_URL}/forms/${item._id}/status`, updatedStatus);
      alert(`Successfully processed the ${action.toLowerCase()} action.`);

      // Permanently disable button after success
      setProcessedActions((prevState) => ({
        ...prevState,
        [actionKey]: true,
      }));
    } catch (error) {
      console.error(`Error processing action: ${action}`, error.message);
      alert(`Failed to process the ${action.toLowerCase()} action.`);
    }

    setProcessingAction(null); // Allow retries if failed
  };

  const handleModifySubmit = async (e) => {
    e.preventDefault();
    const actionKey = selectedItem._id + "modify";
    setProcessingAction(actionKey);

    try {
      const updatedData = { status: "Modified", modification }; // ✅ Correct payload

      console.log("📢 Sending modification request:", updatedData); // Debugging log

      await axios.post(
        `${API_URL}/forms/${selectedItem._id}/status`,
        updatedData
      ); // ✅ Changed to PUT

      alert("Successfully updated the item.");
      setIsModalOpen(false);
      setModification(""); // ✅ Clear input after submission

      // Permanently disable modify button after success
      setProcessedActions((prevState) => ({
        ...prevState,
        [actionKey]: true,
      }));
    } catch (error) {
      console.error(
        "❌ Error updating item:",
        error.response?.data || error.message
      );
      alert("Failed to update item.");
    }

    setProcessingAction(null);
  };

  const renderFilePreview = (filePath) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
    const extension = filePath.split(".").pop().toLowerCase();

    if (imageExtensions.includes(extension)) {
      return (
        <img
          src={`${API_URL}/${filePath}`}
          alt="Preview"
          className="w-20 h-20 object-cover rounded-md cursor-pointer"
          onClick={() => window.open(`${API_URL}/${filePath}`, "_blank")}
        />
      );
    }

    if (extension === "pdf") {
      return (
        <iframe
          src={`${API_URL}/${filePath}`}
          className="w-32 h-32 border rounded-md"
          title="PDF Preview"
          onClick={() => window.open(`${API_URL}/${filePath}`, "_blank")}
        />
      );
    }

    return (
      <a
        href={`${API_URL}/${filePath}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600"
      >
        Preview File
      </a>
    );
  };

  const exportToExcel = () => {
    if (data.length === 0) {
      alert("No data available to export!");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        "Temp ID": item.serialNumber || "N/A",
        Department: item.dept,
        For: item.for,
        From: item.from,
        "From Card No.": item.fromcardno,
        Purpose: item.purpose,
        Unit: item.unit,
        "Created At": new Date(item.createdAt).toLocaleString(),
        Status: item.status,
        ...(item.status === "Modified"
          ? { Modification: item.modification || "No details provided" }
          : {}),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FilteredData");
    XLSX.writeFile(workbook, "FilteredData.xlsx");
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold text-blue-600 mb-4">Filtered Data</h2>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Temp ID</label>
          <input
            type="text"
            name="serialNumber" // Updated to match formData key
            value={formData.serialNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="Enter your Temp ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <input
            type="text"
            name="dept"
            value={formData.dept}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="Enter Department"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date From</label>
          <input
            type="date"
            name="dateFrom"
            value={formData.dateFrom}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date To</label>
          <input
            type="date"
            name="dateTo"
            value={formData.dateTo}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
        <div>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-md"
          >
            <Search size={20} /> {/* Search Icon */}
            {loading ? "Loading..." : "Search"}
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={exportToExcel}
            className="px-4 py-2 flex items-center gap-2 bg-blue-500 text-white rounded-md"
          >
            <ArrowDownToLine className="w-5 h-5" /> Export to Excel
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="mt-6 overflow-auto max-h-[500px] border border-gray-300">
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <table className="min-w-full text-sm text-gray-600 border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-md">
              <tr>
                <th className="px-4 py-2 border">Temp ID</th>
                <th className="px-4 py-2 border">Department</th>
                <th className="px-4 py-2 border">For</th>
                <th className="px-4 py-2 border">From</th>
                <th className="px-4 py-2 border">From Card no.</th>
                <th className="px-4 py-2 border">Purpose</th>
                <th className="px-4 py-2 border">Unit</th>
                <th className="px-4 py-2 border">File</th>
                <th className="px-4 py-2 border">Created At</th>
                {/* Show Actions column only for Admins and Managers */}
                {/* Show Actions column only if the logged-in user is NOT user123 */}
                {user.username !== "user123" && (
                  <th className="px-4 py-2 border">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.length ? (
                data.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border">
                      {item.serialNumber || "N/A"}
                    </td>
                    {/* Display Temp ID */}
                    <td className="px-4 py-2 border">{item.dept}</td>
                    <td className="px-4 py-2 border">{item.for}</td>
                    <td className="px-4 py-2 border">{item.from}</td>
                    <td className="px-4 py-2 border">{item.fromcardno}</td>
                    <td className="px-4 py-2 border">{item.purpose}</td>
                    <td className="px-4 py-2 border">{item.unit}</td>
                    <td className="px-4 py-2 border">
                      {item.uploadedFile ? (
                        <>
                          {/\.(jpg|jpeg|png|gif)$/i.test(item.uploadedFile) ? (
                            // Render images directly
                            <img
                              src={item.uploadedFile} // No need to add API_URL here, it's already included in the backend
                              alt="Preview"
                              className="w-20 h-20 object-cover rounded-md cursor-pointer"
                              onClick={
                                () => window.open(item.uploadedFile, "_blank") // Correct URL handling here too
                              }
                            />
                          ) : /\.(pdf)$/i.test(item.uploadedFile) ? (
                            // Embed PDFs directly
                            <iframe
                              src={item.uploadedFile} // Same here
                              className="w-32 h-32 border rounded-md"
                              title="PDF Preview"
                              onClick={() =>
                                window.open(item.uploadedFile, "_blank")
                              }
                            />
                          ) : (
                            // Handle other file types
                            <div
                              className="p-2 border rounded-md bg-gray-100 cursor-pointer"
                              onClick={() =>
                                window.open(item.uploadedFile, "_blank")
                              }
                            >
                              <p className="text-sm text-gray-500">
                                <a
                                  href={item.uploadedFile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Preview File
                                </a>
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        "No File"
                      )}
                    </td>
                    <td className="px-4 py-2 border">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    {/* Show Approve, Reject, Modify buttons only for Admins and Managers */}
                    {user.username !== "user123" &&
                    item.status === "Pending" ? (
                      <td className="px-4 py-2 border text-center">
                        <div className="flex justify-around">
                          {["Approved", "Rejected"].map((action) => {
                            const actionKey = item._id + action;
                            return (
                              <button
                                key={action}
                                onClick={() => handleAction(action, item)}
                                disabled={
                                  processingAction === actionKey ||
                                  processedActions[actionKey]
                                }
                                className={`px-2 py-1 rounded-md text-white ${
                                  processingAction === actionKey ||
                                  processedActions[actionKey]
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : action === "Approved"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              >
                                {processingAction === actionKey
                                  ? "Processing..."
                                  : action.charAt(0).toUpperCase() +
                                    action.slice(1)}
                              </button>
                            );
                          })}

                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setIsModalOpen(true);
                            }}
                            disabled={
                              processingAction === item._id + "modify" ||
                              processedActions[item._id + "modify"]
                            }
                            className={`px-2 py-1 rounded-md text-white ${
                              processingAction === item._id + "modify" ||
                              processedActions[item._id + "modify"]
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-yellow-500"
                            }`}
                          >
                            {processingAction === item._id + "modify"
                              ? "Processing..."
                              : "Modify"}
                          </button>
                        </div>
                      </td>
                    ) : (
                      <td className="px-4 py-2 border text-center">
                        {item.status}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modify Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4 z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-full max-w-lg">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-blue-600">
              Modify Template
            </h2>
            <form onSubmit={handleModifySubmit}>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Modification
                </label>
                <textarea
                  name="modification"
                  value={modification}
                  onChange={(e) => setModification(e.target.value)}
                  placeholder="Write your modification here..."
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>
              <div className="mt-4 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SlidingGrid;
