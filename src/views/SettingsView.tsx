import React from 'react';
import { AppSettings, Friend, HangoutRecommendation } from '../types/index';
import { updateSettings, exportData, importData, loadFriends, loadHangoutLabels, loadSettings, createAutoBackup } from '../services/localStorage.ts';
import './SettingsView.css';

interface SettingsViewProps {
  settings: AppSettings;
  friends: Friend[];
  recommendations: HangoutRecommendation[];
  onSettingsChange: (settings: AppSettings) => void;
  onDataChange: (friends: Friend[], labels: any[], settings: AppSettings) => void;
  importStatus: string;
  onImportStatusChange: (status: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  friends,
  recommendations,
  onSettingsChange,
  onDataChange,
  importStatus,
  onImportStatusChange
}) => {
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = updateSettings(newSettings);
    onSettingsChange(updatedSettings);
    createAutoBackup(); // Auto-backup after settings change
  };

  const handleExportData = () => {
    exportData();
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    onImportStatusChange('Importing...');
    
    try {
      await importData(file);
      
      // Reload data after successful import
      const loadedFriends = loadFriends();
      const loadedLabels = loadHangoutLabels();
      const loadedSettings = loadSettings();
      
      onDataChange(loadedFriends, loadedLabels, loadedSettings);
      
      onImportStatusChange('✅ Import successful!');
      
      // Clear status after 3 seconds
      setTimeout(() => onImportStatusChange(''), 3000);
    } catch (error) {
      console.error('Import failed:', error);
      onImportStatusChange('❌ Import failed. Please check the file format.');
      setTimeout(() => onImportStatusChange(''), 5000);
    }
    
    // Clear file input
    event.target.value = '';
  };

  return (
    <div className="settings-container">
      <h3 className="settings-title">Hangout Scheduling Settings</h3>
      
      <div className="settings-section">
        {/* Weekly Hangout Target */}
        <div className="setting-item">
          <label>
            Weekly Hangout Target
          </label>
          <div className="setting-range-container">
            <input
              type="range"
              min="1"
              max="10"
              value={settings.weeklyHangoutTarget}
              onChange={(e) => handleUpdateSettings({ weeklyHangoutTarget: parseInt(e.target.value) })}
              className="setting-range-input"
            />
            <span className="setting-range-value">
              {settings.weeklyHangoutTarget}
            </span>
          </div>
          <p className="setting-description">
            The recommendation engine will suggest up to {settings.weeklyHangoutTarget} hangout{settings.weeklyHangoutTarget !== 1 ? 's' : ''} per week
          </p>
        </div>

        {/* Preferred Days */}
        <div className="setting-item">
          <label>
            Preferred Days for Hangouts
          </label>
          <div className="preferred-days-grid">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              <label key={day} className="day-checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.preferredDays.includes(day)}
                  onChange={(e) => {
                    const newDays = e.target.checked
                      ? [...settings.preferredDays, day]
                      : settings.preferredDays.filter(d => d !== day);
                    handleUpdateSettings({ preferredDays: newDays });
                  }}
                  className="day-checkbox"
                />
                <span className="day-text">{day}</span>
              </label>
            ))}
          </div>
          <p className="setting-description">
            Recommendations will be scheduled on your preferred days when possible
          </p>
        </div>

        {/* Data Backup & Restore */}
        <div className="backup-section">
          <h4 className="backup-title">Data Backup & Restore</h4>
          <div className="backup-actions-container">
            <div className="backup-buttons">
              <button
                onClick={handleExportData}
                className="export-button"
              >
                <svg className="backup-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Data
              </button>
              
              <div className="import-container">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="import-file-input"
                  id="import-file"
                />
                <label
                  htmlFor="import-file"
                  className="import-button"
                >
                  <svg className="backup-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Import Data
                </label>
              </div>
            </div>
            
            {importStatus && (
              <div className={`import-status ${importStatus.includes('successful') ? 'success' : importStatus.includes('failed') ? 'error' : 'info'}`}>
                {importStatus}
              </div>
            )}
            
            <div className="backup-info">
              <p>• <strong>Export:</strong> Download all your data as a JSON backup file</p>
              <p>• <strong>Import:</strong> Restore data from a previous backup file</p>
              <p>• <strong>Auto-backup:</strong> Your data is automatically backed up when you make changes</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-section">
          <h4 className="stats-title">Current Stats</h4>
          <div className="stats-grid">
            <div className="stat-card purple">
              <div className="stat-value purple">{friends.length}</div>
              <div className="stat-label">Total Friends</div>
            </div>
            <div className="stat-card blue">
              <div className="stat-value blue">{recommendations.length}</div>
              <div className="stat-label">Current Recommendations</div>
            </div>
            <div className="stat-card green">
              <div className="stat-value green">{settings.weeklyHangoutTarget}</div>
              <div className="stat-label">Weekly Target</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView; 