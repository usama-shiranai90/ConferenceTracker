import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Topics = () => {
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/trends')
            .then(res => res.json())
            .then(data => {
                setTrends(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch trends:", err);
                setLoading(false);
            });
    }, []);

    // Transform data for chart if needed, or use as is
    // Assuming backend returns list of { year, topic, frequency }

    // We need to pivot data for Recharts if we want multiple lines, 
    // or just show one topic for now. 
    // Let's assume we want to show a stacked area chart or multiple lines.

    // Group by topic to get unique topics
    const uniqueTopics = [...new Set(trends.map(d => d.topic))];
    const colors = ['#00f0ff', '#7000ff', '#ff003c', '#f0ff00', '#00ff9d'];

    // Pivot data: Array of { year, topic1: freq, topic2: freq... }
    const chartData = [];
    const years = [...new Set(trends.map(d => d.year))].sort();

    years.forEach(year => {
        const point = { name: year };
        uniqueTopics.forEach(topic => {
            const entry = trends.find(d => d.year === year && d.topic === topic);
            point[topic] = entry ? entry.frequency : 0;
        });
        chartData.push(point);
    });

    if (loading) return <div style={{ padding: '2rem' }}>Loading trends...</div>;

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1 className="gradient-text">Topic Trends</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Evolution of research topics over time (CS.LG & BioMedical).
                </p>
            </header>

            <div className="card" style={{ height: '500px', padding: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            {uniqueTopics.map((topic, i) => (
                                <linearGradient key={topic} id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <XAxis dataKey="name" stroke="var(--text-muted)" />
                        <YAxis stroke="var(--text-muted)" />
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                            itemStyle={{ color: 'var(--text)' }}
                        />
                        {uniqueTopics.map((topic, i) => (
                            <Area
                                key={topic}
                                type="monotone"
                                dataKey={topic}
                                stackId="1"
                                stroke={colors[i % colors.length]}
                                fill={`url(#color${i})`}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {uniqueTopics.map((topic, i) => (
                    <div key={topic} className="card" style={{ borderLeft: `4px solid ${colors[i % colors.length]}` }}>
                        <h3 style={{ margin: 0 }}>{topic}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Topics;
