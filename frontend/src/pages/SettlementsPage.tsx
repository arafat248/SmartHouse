import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetSettlementsQuery, useGenerateSettlementMutation } from '../features/settlements/settlementsApi';
import { useGetHouseholdsQuery } from '../features/households/householdsApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { Calculator, Eye } from 'lucide-react';

export const SettlementsPage = () => {
  const [page, setPage] = useState(1);
  const { data: settlementsData, isLoading } = useGetSettlementsQuery({ page });
  
  const { data: households } = useGetHouseholdsQuery({});
  const [householdId, setHouseholdId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  
  const [generateSettlement, { isLoading: isGenerating }] = useGenerateSettlementMutation();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdId) {
      alert('Please select a household');
      return;
    }
    
    try {
      await generateSettlement({ 
        household: Number(householdId), 
        month: Number(month), 
        year: Number(year) 
      }).unwrap();
      alert('Settlement generated successfully!');
      setPage(1);
    } catch (error) {
      alert((error as { data?: { detail?: string } })?.data?.detail || 'Failed to generate settlement. Make sure you are an admin.');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'warning';
      case 'finalized': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Monthly Settlements</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate Settlement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/3">
              <Select label="Household" value={householdId} onChange={(e) => setHouseholdId(e.target.value)} required>
                <option value="">Select Household</option>
                {households?.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </Select>
            </div>
            
            <div className="w-full md:w-1/4">
              <Select label="Month" value={month} onChange={(e) => setMonth(Number(e.target.value))} required>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </div>
            
            <div className="w-full md:w-1/4">
              <Input label="Year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} required min="2000" />
            </div>
            
            <div className="w-full md:w-auto">
              <Button type="submit" isLoading={isGenerating} leftIcon={<Calculator className="h-4 w-4" />}>
                Generate
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableHead>Month/Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Expense</TableHead>
              <TableHead>Total Meals</TableHead>
              <TableHead>Meal Rate</TableHead>
              <TableHead>Actions</TableHead>
            </TableHeader>
            <TableBody>
              {settlementsData?.results.map((settlement) => (
                <TableRow key={settlement.id}>
                  <TableCell className="font-medium text-slate-900">{settlement.month}/{settlement.year}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(settlement.status)}>
                      {settlement.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-900">${Number(settlement.total_expense).toFixed(2)}</TableCell>
                  <TableCell>{Number(settlement.total_meals).toFixed(2)}</TableCell>
                  <TableCell>${Number(settlement.meal_rate).toFixed(4)}</TableCell>
                  <TableCell>
                    <Link to={`/settlements/${settlement.id}`} className="inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-3 py-1.5 text-sm bg-slate-100 text-slate-900 hover:bg-slate-200">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {(!settlementsData?.results || settlementsData.results.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    No settlements found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing page {page}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                disabled={!settlementsData?.previous} 
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline"
                disabled={!settlementsData?.next} 
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

