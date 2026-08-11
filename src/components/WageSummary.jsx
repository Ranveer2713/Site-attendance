import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function WageSummary() {
  const [workers, setWorkers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [expandedWorker, setExpandedWorker] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default: Last 7 days
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);

    const { data: workersData } = await supabase
      .from('workers')
      .select('*')
      .order('name');

    const { data: attData } = await supabase
      .from('attendance')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    setWorkers(workersData || []);
    setAttendanceRecords(attData || []);
    setLoading(false);
  };

  const calculateWorkerTotals = (worker) => {
    const workerAtt = attendanceRecords.filter((rec) => rec.worker_id === worker.id);

    let fullDays = 0;
    let halfDays = 0;
    let absentDays = 0;
    let totalOT = 0;

    workerAtt.forEach((rec) => {
      if (rec.status === 'Present') fullDays += 1;
      else if (rec.status === 'Half Day') halfDays += 1;
      else if (rec.status === 'Absent') absentDays += 1;

      totalOT += parseFloat(rec.overtime_hours || 0);
    });

    const hourlyRate = worker.daily_rate / 8;
    const doubleOTHourlyRate = hourlyRate * 2;

    const baseWage = (fullDays * worker.daily_rate) + (halfDays * (worker.daily_rate / 2));
    const otWage = totalOT * doubleOTHourlyRate;
    const totalWage = baseWage + otWage;

    return { fullDays, halfDays, absentDays, totalOT, totalWage, records: workerAtt };
  };

  const grandTotalPayout = workers.reduce((sum, worker) => {
    return sum + calculateWorkerTotals(worker).totalWage;
  }, 0);

  const toggleWorkerHistory = (workerId) => {
    setExpandedWorker(expandedWorker === workerId ? null : workerId);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">📊 Wage & Payout Summary</h2>
        <p className="text-xs text-gray-500 font-medium">Tap any worker to view date breakdown</p>
      </div>

      {/* Date Filter */}
      <div className="grid grid-cols-2 gap-2 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
        <div>
          <label className="text-[11px] font-bold text-gray-500 block mb-1">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-500 block mb-1">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-6">Calculating totals...</p>
      ) : workers.length === 0 ? (
        <p className="text-center text-gray-500 py-6">No workers added yet!</p>
      ) : (
        <div className="space-y-4">
          {workers.map((worker) => {
            const stats = calculateWorkerTotals(worker);
            const isExpanded = expandedWorker === worker.id;

            return (
              <div
                key={worker.id}
                className="border border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden transition-all"
              >
                {/* Worker Overview Card */}
                <div
                  onClick={() => toggleWorkerHistory(worker.id)}
                  className="p-3.5 cursor-pointer hover:bg-gray-100/60 transition-colors"
                >
                  <div className="flex justify-between items-start border-b border-gray-200/80 pb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-gray-900">{worker.name}</h3>
                        <span className="text-xs text-blue-600 font-bold">
                          {isExpanded ? '▲ Hide' : '▼ History'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        {worker.role} • ₹{worker.daily_rate}/day
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-semibold uppercase">Payout</p>
                      <p className="text-lg font-black text-blue-600">
                        ₹{stats.totalWage.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Summary Totals */}
                  <div className="grid grid-cols-4 gap-1 text-center pt-2">
                    <div className="bg-white p-1 rounded-lg border border-gray-200">
                      <p className="text-[9px] text-gray-500 font-bold">Full Days</p>
                      <p className="text-xs font-bold text-green-700">{stats.fullDays}</p>
                    </div>
                    <div className="bg-white p-1 rounded-lg border border-gray-200">
                      <p className="text-[9px] text-gray-500 font-bold">Half Days</p>
                      <p className="text-xs font-bold text-amber-700">{stats.halfDays}</p>
                    </div>
                    <div className="bg-white p-1 rounded-lg border border-gray-200">
                      <p className="text-[9px] text-gray-500 font-bold">Absent</p>
                      <p className="text-xs font-bold text-red-600">{stats.absentDays}</p>
                    </div>
                    <div className="bg-white p-1 rounded-lg border border-gray-200">
                      <p className="text-[9px] text-purple-700 font-bold">OT Hours</p>
                      <p className="text-xs font-bold text-purple-700">{stats.totalOT}h</p>
                    </div>
                  </div>
                </div>

                {/* Expanded Date-by-Date History */}
                {isExpanded && (
                  <div className="p-3 bg-white border-t border-gray-200 text-xs">
                    <h4 className="font-bold text-gray-700 mb-2">📅 Detailed Date History:</h4>
                    {stats.records.length === 0 ? (
                      <p className="text-gray-400 italic">No attendance marked in this date range.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {stats.records.map((rec) => (
                          <div
                            key={rec.id || rec.date}
                            className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100"
                          >
                            <span className="font-bold text-gray-800">{rec.date}</span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                  rec.status === 'Present'
                                    ? 'bg-green-100 text-green-800'
                                    : rec.status === 'Half Day'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {rec.status === 'Present' ? 'Full Day' : rec.status}
                              </span>
                              {rec.overtime_hours > 0 && (
                                <span className="bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                  +{rec.overtime_hours}h OT
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Grand Total */}
          <div className="bg-blue-600 text-white p-4 rounded-xl flex justify-between items-center shadow-md mt-4">
            <div>
              <p className="text-xs text-blue-100 font-semibold">Total Site Payroll</p>
              <p className="text-[10px] text-blue-200">Selected Date Range</p>
            </div>
            <p className="text-2xl font-black">₹{grandTotalPayout.toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}
    </div>
  );
}