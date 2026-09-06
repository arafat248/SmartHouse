import { useState } from 'react';
import type { ExpenseCategory } from '../../types/expense';

interface ExpenseFiltersProps {
  categories: ExpenseCategory[];
  onFilterChange: (filters: { category: string; search: string; date_range: string }) => void;
}

export const ExpenseFilters = ({ categories, onFilterChange }: ExpenseFiltersProps) => {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('');

  const handleApply = () => {
    onFilterChange({ category, search, date_range: dateRange });
  };

  return (
    <div className="filters-container">
      <div className="filter-group">
        <label>Search:</label>
        <input 
          type="text" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Search title/desc..." 
        />
      </div>
      <div className="filter-group">
        <label>Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Date Range (Start):</label>
        <input 
          type="date" 
          value={dateRange} 
          onChange={(e) => setDateRange(e.target.value)} 
        />
      </div>
      <button onClick={handleApply} className="btn-primary">Apply Filters</button>
    </div>
  );
};
