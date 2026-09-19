import { useState } from 'react';
import type { ExpenseCategory } from '../../types/expense';
import { Card, CardContent } from '../ui/Card';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Filter, X } from 'lucide-react';

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

  const handleClear = () => {
    setCategory('');
    setSearch('');
    setDateRange('');
    onFilterChange({ category: '', search: '', date_range: '' });
  };

  return (
    <Card className="mb-6">
      <CardContent className="py-5">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/4">
            <Input 
              label="Search"
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search title/desc..." 
            />
          </div>
          <div className="w-full md:w-1/4">
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div className="w-full md:w-1/4">
            <Input 
              label="Date Range (Start)"
              type="date" 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)} 
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="primary" onClick={handleApply} leftIcon={<Filter className="h-4 w-4" />}>
              Filter
            </Button>
            <Button variant="outline" onClick={handleClear} leftIcon={<X className="h-4 w-4" />}>
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

