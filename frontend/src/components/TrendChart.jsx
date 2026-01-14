import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 15, 30, 0.9)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#fff' }}>{label}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ margin: '4px 0', color: pld.color, fontSize: '0.9rem' }}>
            {pld.name}: {pld.value} papers
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const TrendChart = ({ data }) => {
  if (!data || data.length === 0) return <div>Loading data...</div>;

  // Process data for Recharts (group by year)
  // Incoming data: [{year: 2020, topic: 'A', frequency: 10}, ...]
  // Target: [{year: 2020, 'A': 10, 'B': 20}, ...]
  
  const processedData = [];
  const topics = [...new Set(data.map(d => d.topic))];
  const years = [...new Set(data.map(d => d.year))].sort();

  years.forEach(year => {
    const yearEntry = { year };
    topics.forEach(topic => {
      const record = data.find(d => d.year === year && d.topic === topic);
      yearEntry[topic] = record ? record.frequency : 0;
    });
    processedData.push(yearEntry);
  });

  const colors = ['#00f0ff', '#bd00ff', '#2de2e6', '#f700ff', '#ffffff'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={processedData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis 
          dataKey="year" 
          stroke="#6b7280" 
          tick={{ fill: '#6b7280', fontSize: 12 }} 
          axisLine={false}
          tickLine={false}
        />
        <YAxis 
          stroke="#6b7280" 
          tick={{ fill: '#6b7280', fontSize: 12 }} 
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {topics.map((topic, index) => (
          <Line
            key={topic}
            type="monotone"
            dataKey={topic}
            stroke={colors[index % colors.length]}
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 0, fill: colors[index % colors.length] }}
            activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
            animationDuration={1500}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;
