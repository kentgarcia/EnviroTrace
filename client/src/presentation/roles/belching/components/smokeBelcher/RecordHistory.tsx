import React from "react";

interface RecordHistoryItem {
  date: string;
  action: string;
  user: string;
}

interface RecordHistoryProps {
  history: RecordHistoryItem[];
}

const RecordHistory: React.FC<RecordHistoryProps> = ({ history }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-2">
      <div className="font-bold text-lg">Record History</div>
      <ul className="divide-y divide-gray-200">
        {history.map((item, idx) => (
          <li key={idx} className="py-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">{item.date}</span>
              <span className="text-xs text-gray-500">{item.user}</span>
            </div>
            <div className="text-sm">{item.action}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecordHistory;
