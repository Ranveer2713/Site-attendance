import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function DailyAttendance() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);

  // Check if selected date is Sunday (0 = Sunday)
  const isSunday = new Date(selectedDate + 'T00:00:00').getDay() === 0;

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch workers
    const { data: workerData } = await supabase.from('workers').select('*');
    setWorkers(workerData || []);

    // Fetch existing attendance for selected date
    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', selectedDate);

    const attendanceMap = {};
    if (attendanceData) {
      attendanceData.forEach((item) => {
        attendanceMap[item.worker_id] = item.status;
      });
    }
    setAttendance(attendanceMap);
    setLoading(false);
  };

  const handleStatusChange = async (workerId, status) => {
    const updated = { ...attendance, [workerId]: status };
    setAttendance(updated);

    // Save or update in Supabase
    await supabase.from('attendance').upsert(
      { worker_id: workerId, date: selectedDate, status: status },
      { onConflict: 'worker_id,date' }
    );
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Loading attendance...</div>;

  return (
    <div className="space-y-4">
      {/* Date Picker Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col gap-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Select Date
        </label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-semibold bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isSunday && (
            <span className="shrink-0 bg-purple-100 text-purple-700 text-xs font-black px-3 py-2 rounded-lg border border-purple-200">
              ☀️ SUNDAY
            </span>
          )}
        </div>
      </div>

      {/* Sunday Notification Banner */}
      {isSunday && (
        <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl text-xs text-purple-800 font-medium flex items-center gap-2">
          <span>ℹ️</span>
          <span>Selected date is a Sunday. Check your site policy for holiday/overtime rates.</span>
        </div>
      )}

      {/* Workers Attendance List */}
      <div className="space-y-3">
        {workers.length === 0 ? (
          <div className="text-center p-6 text-gray-400 bg-white rounded-xl border border-gray-200">
            No workers added yet. Go to the "Add Worker" tab first!
          </div>
        ) : (
          workers.map((worker) => {
            const currentStatus = attendance[worker.id] || 'absent';
            return (
              <div
                key={worker.id}
                className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between gap-2"
              >
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{worker.name}</h3>
                  <p className="text-xs text-gray-500">₹{worker.daily_rate}/day</p>
                </div>

                {/* Quick Action Status Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStatusChange(worker.id, 'present')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentStatus === 'present'
                        ? 'bg-green-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    Present
                  </button>

                  <button
                    onClick={() => handleStatusChange(worker.id, 'half-day')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentStatus === 'half-day'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                    }`}
                  >
                    Half
                  </button>

                  <button
                    onClick={() => handleStatusChange(worker.id, 'absent')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentStatus === 'absent'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}