import { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const API_URL = process.env.REACT_APP_BACKEND_API_URL;

const Home = () => {
  const [counts, setCounts] = useState({ approved: 0, rejected: 0, modified: 0 });

  useEffect(() => {
    fetch(`${API_URL}/forms/counts`)
      .then((res) => res.json())
      .then((data) => {
        console.log("📊 Form Counts Data:", data);
        setCounts(data);
      })
      .catch((error) => console.error("❌ Error fetching counts:", error));
  }, []);

  const doughnutData = {
    labels: ["Approved", "Rejected", "Modified"],
    datasets: [
      {
        label: "Forms",
        data: [counts.approved, counts.rejected, counts.modified],
        backgroundColor: ["#008000", "#EF4444", "#F59E0B"], // Green, Red, Yellow
        borderWidth: 2,
        hoverOffset: 12,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    cutout: "60%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#374151",
          font: {
            size: 14,
            family: "Inter, sans-serif",
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}`,
        },
      },
    },
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100 flex flex-col items-center">
      <h2 className="text-3xl font-semibold text-gray-800 mb-8">📈 Dashboard Overview</h2>

      {/* Stats Cards */}
      <div className="flex flex-col md:flex-row gap-6 mb-12 w-full max-w-4xl">
        <Card title="Approved" value={counts.approved} bg="bg-green-500" hover="hover:bg-green-600" />
        <Card title="Rejected" value={counts.rejected} bg="bg-red-500" hover="hover:bg-red-600" />
        <Card title="Modified" value={counts.modified} bg="bg-yellow-500" hover="hover:bg-yellow-600" />
      </div>

      {/* Doughnut Chart */}
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-center text-xl font-medium text-gray-700 mb-4">Forms Distribution</h3>
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </div>
    </div>
  );
};

// Card Component
const Card = ({ title, value, bg, hover }) => (
  <div
    className={`flex-1 text-white p-6 rounded-xl shadow-md transition duration-300 ease-in-out ${bg} ${hover}`}
  >
    <h3 className="text-lg font-medium mb-2">{title} Forms</h3>
    <p className="text-4xl font-bold">{value}</p>
  </div>
);

export default Home;