import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function WageSummary() {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    // Fetch workers and their attendance records
    const { data: workers } = await supabase.from('workers').select('*');
    const { data: attendance } = await supabase.from('attendance').select('*');

    if (workers) {
      const summary = workers.map((worker) => {
        const records = attendance?.filter((a) => a.worker_id === worker.id) || [];
        
        let presentCount = 0;
        let halfDayCount = 0;
        let absentCount = 0;
        let sundayCount = 0;

        records.forEach((rec) => {
          const dateObj = new Date(rec.date);
          const isSunday = dateObj.getDay() === 0;

          if (isSunday) sundayCount++;
          if (rec.status === 'present') presentCount++;
          else if (rec.status === 'half-day') halfDayCount++;
          else if (rec.status === 'absent') absentCount++;
        });

        const totalDaysWorked = presentCount + halfDayCount * 0.5;
        const totalWages = totalDaysWorked * (worker.daily_rate || 0);

        return {
          id: worker.id,
          name: worker.name,
          dailyRate: worker.daily_rate,
          presentDays: presentCount,
          halfDays: halfDayCount,
          absentDays: absentCount,
          sundays: sundayCount,
          totalEarned: totalWages,
        };
      });

      setSummaryData(summary);
    }
    setLoading(false);
  };

  const handleDeleteWorker = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      await supabase.from('workers').delete().eq('id', id);
      fetchSummary();
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Loading summary...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800">📊 Attendance & Wage Summary</h2>

      {/* Summary Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-xs border border-gray-200">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-100 text-gray-800 uppercase text-[10px] tracking-wider border-b border-gray-200">
            <tr>
              <th className="p-3">Worker</th>
              <th className="p-3 text-center">Present</th>
              <th className="p-3 text-center">Half Day</th>
              <th className="p-3 text-center">Sundays</th>
              <th className="p-3 text-right">Total Pay</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {summaryData.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-400">
                  No records found.
                </td>
              </tr>
            ) : (
              summaryData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-900">{row.name}</td>
                  <td className="p-3 text-center font-bold text-green-600">{row.presentDays}</td>
                  <td className="p-3 text-center font-bold text-amber-600">{row.halfDays}</td>
                  <td className="p-3 text-center text-purple-600 font-medium">{row.sundays}</td>
                  <td className="p-3 text-right font-black text-gray-900">₹{row.totalEarned}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDeleteWorker(row.id, row.name)}
                      className="text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-red-50 rounded"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}