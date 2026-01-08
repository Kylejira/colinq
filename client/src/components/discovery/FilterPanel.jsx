import { useState } from 'react';
import './FilterPanel.css';

const NICHES = [
  'gaming', 'tech', 'beauty', 'fashion', 'fitness', 'food', 'travel',
  'music', 'comedy', 'education', 'lifestyle', 'vlog', 'entertainment',
];

const FilterPanel = ({ filters, onFilterChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      niche: '',
      minFollowers: '',
      maxFollowers: '',
      minEngagement: '',
      location: '',
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="filter-panel-overlay" onClick={onClose}>
      <div className="filter-panel" onClick={e => e.stopPropagation()}>
        <div className="filter-header">
          <h3>Filters</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="filter-body">
          <div className="filter-group">
            <label>Niche</label>
            <select 
              value={localFilters.niche || ''} 
              onChange={e => handleChange('niche', e.target.value)}
            >
              <option value="">All Niches</option>
              {NICHES.map(niche => (
                <option key={niche} value={niche}>
                  {niche.charAt(0).toUpperCase() + niche.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Subscribers</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.minFollowers || ''}
                onChange={e => handleChange('minFollowers', e.target.value)}
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={localFilters.maxFollowers || ''}
                onChange={e => handleChange('maxFollowers', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Min Engagement Rate (%)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 2.5"
              value={localFilters.minEngagement || ''}
              onChange={e => handleChange('minEngagement', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Location</label>
            <input
              type="text"
              placeholder="e.g., Los Angeles"
              value={localFilters.location || ''}
              onChange={e => handleChange('location', e.target.value)}
            />
          </div>
        </div>

        <div className="filter-footer">
          <button className="reset-btn" onClick={handleReset}>
            Reset
          </button>
          <button className="apply-btn" onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;

