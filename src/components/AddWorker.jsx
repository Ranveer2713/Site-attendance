import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

export default function AddWorker({ onWorkerAdded }) {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('Mason');
  const [dailyRate, setDailyRate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !dailyRate) {
      setMessage({ type: 'error', text: 'Please enter worker name and daily rate!' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase
      .from('workers')
      .insert([
        {
          name: name.trim(),
          phone_number: phoneNumber.trim() || null,
          role: role,
          daily_rate: parseFloat(dailyRate),
        },
      ])
      .select();

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to add worker: ' + error.message });
    } else {
      setMessage({ type: 'success', text: `Added ${name} successfully!` });
      setName('');
      setPhoneNumber('');
      setDailyRate('');
      if (onWorkerAdded) onWorkerAdded(data[0]);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Worker</h2>

      {message && (
        <div
          className={`p-3 rounded-lg mb-4 text-sm font-semibold ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Worker Name */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Worker Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Ramesh Kumar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            required
          />
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Worker Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white"
          >
            <option value="Mason">Mistri (Mason)</option>
            <option value="Helper">Labour / Helper</option>
            <option value="Carpenter">Carpenter</option>
            <option value="Electrician">Electrician</option>
            <option value="Plumber">Plumber</option>
          </select>
        </div>

        {/* Daily Wage Rate */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Daily Wage Rate (₹) *
          </label>
          <input
            type="number"
            placeholder="e.g. 750"
            value={dailyRate}
            onChange={(e) => setDailyRate(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            required
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            placeholder="e.g. 9876543210"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow transition-colors text-base mt-2"
        >
          {loading ? 'Saving Worker...' : 'Save Worker'}
        </button>
      </form>
    </div>
  );
}