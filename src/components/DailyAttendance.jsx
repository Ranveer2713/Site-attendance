import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function DailyAttendance() {
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [overtimeHours, setOvertimeHours] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchWorkersAndAttendance();
  }, [selectedDate]);

  const fetchWorkersAndAttendance = async () => {
    setLoading(true);
    setMessage(null);

    // 1. Fetch active workers
    const { data: workersData, error: workersError } = await supabase
      .from('workers')
      .select('*')
      .order('name');

    if (workersError) {
      setMessage({ type: 'error', text: 'Error fetching workers: ' + workersError.message });
      setLoading(false);
      return;
    }

    const fetchedWorkers = workersData || [];
    setWorkers(fetchedWorkers);

    // 2. Fetch attendance for selected date
    const { data: attData } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', selectedDate);

    const statusMap = {};
    const otMap = {};

    if (attData && attData.length > 0) {
      attData.forEach((rec) => {
        statusMap[rec.worker_id] = rec.status || 'Present';
        otMap[rec.worker_id] = rec.overtime_hours || 0;
      });
    } else {
      // Default: Everyone Present automatically
      fetchedWorkers.forEach((w) => {
        statusMap[w.id] = 'Present';
        otMap[w.id] = 0;
      });
    }

    setAttendance(statusMap);
    setOvertimeHours(otMap);
    setLoading(false);
  };

  const handleStatusChange = (workerId, status) => {
    setAttendance((prev) => ({ ...prev, [workerId]: status }));
  };

  const handleOTChange = (workerId, hours) => {
    setOvertimeHours((prev) => ({ ...prev, [workerId]: parseFloat(hours) || 0 }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setMessage(null);

    const recordsToInsert = workers.map((worker) => ({
      worker_id: worker.id,
      date: selectedDate,
      status: attendance[worker.id] || 'Present',
      overtime_hours: overtimeHours[worker.id] || 0,
    }));

    const { error } = await supabase
      .from('attendance')
      .upsert(recordsToInsert, { onConflict: 'worker_id,date' });

    setSaving(false);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save attendance: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Attendance updated successfully!' });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Daily Attendance</h2>
          <p className="text-xs text-gray-500 font-semibold">8h Shift • Overtime paid @ 2x rate</p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl mb-4 text-sm font-semibold ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 py-6">Loading workers...</p>
      ) : workers.length === 0 ? (
        <p className="text-center text-gray-500 py-6">No workers added yet!</p>
      ) : (
        <div className="space-y-4">
          {workers.map((worker) => {
            const currentStatus = attendance[worker.id] || 'Present';
            const currentOT = overtimeHours[worker.id] || 0;
            const hourlyRate = worker.daily_rate / 8;
            const otHourlyRate = (hourlyRate * 2).toFixed(1);

            return (
              <div
                key={worker.id}
                className="p-3.5 border border-gray-200 rounded-xl bg-gray-50/50 flex flex-col gap-3"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900">{worker.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {worker.role} • ₹{worker.daily_rate}/day (₹{hourlyRate.toFixed(1)}/hr)
                    </p>
                  </div>
                </div>

                {/* Status Options */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Full Day (8h)', val: 'Present', color: 'bg-green-600 text-white' },
                    { label: 'Half Day (4h)', val: 'Half Day', color: 'bg-amber-500 text-white' },
                    { label: 'Absent', val: 'Absent', color: 'bg-red-600 text-white' },
                  ].map((opt) => {
                    const isSelected = currentStatus === opt.val;
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => handleStatusChange(worker.id, opt.val)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          isSelected
                            ? `${opt.color} border-transparent shadow-sm scale-[1.02]`
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Double Overtime Input */}
                {currentStatus !== 'Absent' && (
                  <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                    <div className="text-xs">
                      <span className="font-bold text-gray-700">⏱️ Overtime:</span>
                      <span className="text-purple-600 font-bold text-[11px] ml-1">
                        (₹{otHourlyRate}/hr • 2x)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="12"
                        step="0.5"
                        placeholder="0"
                        value={currentOT === 0 ? '' : currentOT}
                        onChange={(e) => handleOTChange(worker.id, e.target.value)}
                        className="w-20 px-2 py-1 text-center font-bold border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      />
                      <span className="text-xs text-gray-500 font-bold">hrs</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow transition-colors text-base mt-4"
          >
            {saving ? 'Saving...' : 'Save / Update Attendance'}
          </button>
        </div>
      )}
    </div>
  );
}