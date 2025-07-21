import React from 'react';
import { HangoutLabel } from '../types/index';
import HangoutLabelsManager from '../components/HangoutLabelsManager.tsx';
import { addHangoutLabel, updateHangoutLabel, deleteHangoutLabel } from '../services/localStorage.ts';
import './LabelsView.css';

interface LabelsViewProps {
  hangoutLabels: HangoutLabel[];
  onLabelsChange: (labels: HangoutLabel[]) => void;
}

const LabelsView: React.FC<LabelsViewProps> = ({
  hangoutLabels,
  onLabelsChange
}) => {
  const handleAddLabel = (labelData: Omit<HangoutLabel, 'id'>) => {
    const newLabel = addHangoutLabel(labelData);
    const updatedLabels = [...hangoutLabels, newLabel];
    onLabelsChange(updatedLabels);
  };

  const handleUpdateLabel = (labelId: string, labelData: Omit<HangoutLabel, 'id'>) => {
    const updatedLabel = updateHangoutLabel(labelId, labelData);
    if (updatedLabel) {
      const updatedLabels = hangoutLabels.map(l => l.id === labelId ? updatedLabel : l);
      onLabelsChange(updatedLabels);
    }
  };

  const handleDeleteLabel = (labelId: string) => {
    deleteHangoutLabel(labelId);
    const updatedLabels = hangoutLabels.filter(l => l.id !== labelId);
    onLabelsChange(updatedLabels);
  };

  return (
    <HangoutLabelsManager
      labels={hangoutLabels}
      onAddLabel={handleAddLabel}
      onUpdateLabel={handleUpdateLabel}
      onDeleteLabel={handleDeleteLabel}
    />
  );
};

export default LabelsView; 