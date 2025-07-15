import React, { useState } from 'react';
import { HangoutLabel } from '../types/index';

interface HangoutLabelsManagerProps {
  labels: HangoutLabel[];
  onAddLabel: (label: Omit<HangoutLabel, 'id'>) => void;
  onDeleteLabel: (labelId: string) => void;
  onUpdateLabel: (labelId: string, label: Omit<HangoutLabel, 'id'>) => void;
}

const HangoutLabelsManager: React.FC<HangoutLabelsManagerProps> = ({
  labels,
  onAddLabel,
  onDeleteLabel,
  onUpdateLabel
}) => {
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3B82F6');
  const [editingLabel, setEditingLabel] = useState<HangoutLabel | null>(null);

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLabelName.trim()) {
      onAddLabel({
        name: newLabelName.trim(),
        color: newLabelColor
      });
      setNewLabelName('');
      setNewLabelColor('#3B82F6');
    }
  };

  const handleUpdateLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLabel) {
      onUpdateLabel(editingLabel.id, {
        name: editingLabel.name,
        color: editingLabel.color
      });
      setEditingLabel(null);
    }
  };

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Hangout Labels</h2>
      
      {/* Add new label form */}
      <form onSubmit={handleAddLabel} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="Enter label name (e.g., Dining, Museums, Bars)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newLabelColor}
              onChange={(e) => setNewLabelColor(e.target.value)}
              className="w-10 h-10 border border-gray-300 rounded-md cursor-pointer"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </form>

      {/* Existing labels */}
      <div className="space-y-2">
        {labels.map((label) => (
          <div key={label.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            {editingLabel?.id === label.id ? (
              <form onSubmit={handleUpdateLabel} className="flex gap-2 flex-1">
                <input
                  type="text"
                  value={editingLabel.name}
                  onChange={(e) => setEditingLabel(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="color"
                  value={editingLabel.color}
                  onChange={(e) => setEditingLabel(prev => prev ? { ...prev, color: e.target.value } : null)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingLabel(null)}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="font-medium">{label.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingLabel(label)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteLabel(label.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {labels.length === 0 && (
        <div className="text-gray-500 text-center py-8">
          No hangout labels yet. Add some to get started!
        </div>
      )}

      {/* Quick add predefined labels */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Add Common Labels:</h3>
        <div className="flex flex-wrap gap-2">
          {['Dining', 'Museums', 'Night Life', 'Bars', 'Neighborhood Walk', 'Coffee', 'Movies', 'Sports', 'Shopping', 'Concerts'].map((commonLabel) => (
            <button
              key={commonLabel}
              onClick={() => {
                if (!labels.find(l => l.name === commonLabel)) {
                  onAddLabel({
                    name: commonLabel,
                    color: predefinedColors[Math.floor(Math.random() * predefinedColors.length)]
                  });
                }
              }}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
              disabled={labels.find(l => l.name === commonLabel) !== undefined}
            >
              {commonLabel}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HangoutLabelsManager;
