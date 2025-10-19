"use client";

import { useAdminStore } from "@/store/adminStore";

interface AdminDashboardProps {
  name: string;
}

export default function AdminDashboard({ name }: AdminDashboardProps) {
  const logout = useAdminStore((s) => s.logout);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-lg mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {name}</h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition duration-300"
        >
          Logout
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 transform hover:scale-105 cursor-pointer">
          <h2 className="text-2xl font-semibold mb-2">Manage Courses</h2>
          <p>
            Add, edit, or delete courses. Update course details and content.
          </p>
        </div>
        <div className="p-6 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300 transform hover:scale-105 cursor-pointer">
          <h2 className="text-2xl font-semibold mb-2">Manage Chapters</h2>
          <p>Organize chapters, add new sections, and arrange content order.</p>
        </div>
      </div>
    </div>
  );
}
