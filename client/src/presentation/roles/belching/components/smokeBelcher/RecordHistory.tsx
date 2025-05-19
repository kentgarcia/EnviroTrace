import React, { useEffect, useState } from "react";
import { fetchBelchingRecordHistories } from "@/lib/api/belching-api";

interface RecordHistoryProps {
  recordId: number;
}

const RecordHistory: React.FC<RecordHistoryProps> = ({ recordId }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchBelchingRecordHistories(recordId)
      .then(setHistory)
      .catch((err) => setError("Failed to load record history."))
      .finally(() => setLoading(false));
  }, [recordId]);

  return (
    <div className="bg-white border border-gray-200 p-4">
      <div className="font-bold text-lg mb-2 text-gray-800">Record History</div>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <ul className="divide-y divide-gray-200">
          {history.length === 0 && (
            <li className="py-2 text-gray-500">No history found.</li>
          )}
          {history.map((item, idx) => (
            <li key={item.id || idx} className="py-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">{item.date}</span>
                <span className="text-xs text-gray-500">{item.status}</span>
              </div>
              <div className="text-sm text-gray-900">
                {item.type} - {item.details}
              </div>
              <div className="text-xs text-gray-500">OR No: {item.orNo}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecordHistory;
