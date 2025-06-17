import React, { useState } from 'react';

/**
 * Simple CalendarSync Component for testing
 */
const CalendarSyncSimple = ({ selectedDate }) => {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    console.log('🔄 Test sync button clicked');
    setTimeout(() => {
      setSyncing(false);
      alert('Test sync completed!');
    }, 2000);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📅</span>
          <h3 className="font-medium text-gray-900">Google Calendar Sync (Test)</h3>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : 'Test Sync'}
        </button>
      </div>

      {/* Info */}
      <div className="text-sm text-gray-600">
        <p>Selected Date: {selectedDate}</p>
        <p>This is a test version of Calendar Sync component</p>
      </div>
    </div>
  );
};

export default CalendarSyncSimple; 