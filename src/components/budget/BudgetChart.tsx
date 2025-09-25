import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetWithCategories } from '@/services/budgetService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BudgetChartProps {
  budget: BudgetWithCategories;
}

export const BudgetChart = ({ budget }: BudgetChartProps) => {
  const chartData = budget.categories.map(category => ({
    name: category.name,
    planned: category.planned_amount,
    committed: category.committed_amount,
    actual: category.actual_amount,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ₪${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Comparison Chart</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `₪${(value / 1000).toFixed(0)}K`}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="planned" 
                fill="#3b82f6" 
                name="Planned"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="committed" 
                fill="#f97316" 
                name="Committed"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="actual" 
                fill="#10b981" 
                name="Actual"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <span>Planned Budget</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
            <span>Committed Amount</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <span>Actual Spent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};