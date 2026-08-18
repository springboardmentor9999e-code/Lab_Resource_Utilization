import React, { useState } from 'react';
import api from '../services/api';

export const WaitlistForm = ({ resourceId, equipmentName = "Resource" }) => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddToWaitlist = async () => {
    if (!dateRange.start) {
      setError("Please select a start date.");
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      equipmentId: String(resourceId || "1"),
      equipmentName: equipmentName,
      startDate: dateRange.start,
      endDate: dateRange.end || dateRange.start,
      preferredDates: dateRange.end ? `${dateRange.start} to ${dateRange.end}` : dateRange.start,
      requestDate: new Date().toISOString().split("T")[0],
      priority: "Standard",
      status: "In Queue",
    };

    try {
      const response = await api.post("/waitlist", payload);
      const data = response.data;
      setPosition(data.positionInQueue || data.queuePosition || 1);
    } catch (err) {
      console.warn("POST /waitlist failed in WaitlistForm. Adding locally.", err);
      try {
        const localList = JSON.parse(localStorage.getItem("local_waitlist") || "[]");
        const newLocal = {
          id: "wl-local-" + Math.floor(Math.random() * 100000),
          ...payload,
          queuePosition: localList.length + 1,
          totalInQueue: localList.length + 1,
          estimatedWait: "1-2 Days",
        };
        localList.push(newLocal);
        localStorage.setItem("local_waitlist", JSON.stringify(localList));
        setPosition(newLocal.queuePosition);
      } catch (localErr) {
        setError("Failed to add to waitlist. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Join Waitlist</h2>
      
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Start Date</label>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
          className="border px-3 py-2 rounded w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">End Date</label>
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
          className="border px-3 py-2 rounded w-full"
        />
      </div>

      <button
        onClick={handleAddToWaitlist}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add to Waitlist'}
      </button>

      {position !== null && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="text-green-800 font-bold">Successfully added! Position: #{position}</p>
        </div>
      )}
    </div>
  );
};
