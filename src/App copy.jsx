import React, { useState } from 'react';
import AddWorker from './components/AddWorker';
import DailyAttendance from './components/DailyAttendance';
import WageSummary from './components/WageSummary';

function App() {
  const [activeTab, setActiveTab] = useState('attendance');

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 py-4 px-4 sticky top-0 z-10 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">🏗️ Site Attendance</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-md mx-auto">
        {activeTab === 'attendance' && <DailyAttendance />}
        {activeTab === 'add' && <AddWorker />}
        {activeTab === 'summary' && <WageSummary />}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-3 shadow-lg z-20">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-1">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex flex-col items-center text-xs font-bold py-1.5 rounded-xl transition-all ${
              activeTab === 'attendance'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-base">📋</span>
            <span>Attendance</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex flex-col items-center text-xs font-bold py-1.5 rounded-xl transition-all ${
              activeTab === 'summary'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-base">📊</span>
            <span>Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`flex flex-col items-center text-xs font-bold py-1.5 rounded-xl transition-all ${
              activeTab === 'add'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-base">👤</span>
            <span>Add Worker</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;