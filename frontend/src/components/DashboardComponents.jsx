import React, { useState } from 'react';
import { Card, Badge, Button } from './ui';
import { Search, Filter, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data generator for 5.3.1 (2D Visualization)
const generateLandscapeData = () => {
    const points = [];
    for (let i = 0; i < 50; i++) {
        points.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
            topic: Math.random() > 0.5 ? 'Transformers' : 'CNNs',
            size: Math.random() * 20 + 5
        });
    }
    return points;
};

export const TopicLandscape = () => {
    const points = generateLandscapeData();

    return (
        <div style={{ position: 'relative', width: '100%', height: '400px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', overflow: 'hidden' }}>
            {points.map((p, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        borderRadius: '50%',
                        background: p.topic === 'Transformers' ? 'var(--primary)' : 'var(--secondary)',
                        opacity: 0.6,
                        boxShadow: `0 0 10px ${p.topic === 'Transformers' ? 'var(--primary)' : 'var(--secondary)'}`,
                        transition: 'all 0.5s ease-in-out'
                    }}
                    title={`${p.topic}: Paper ID ${i}`}
                />
            ))}
            <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                <Badge variant="primary">Transformers</Badge>
                <Badge variant="secondary">CNNs</Badge>
            </div>
        </div>
    );
};

export const PaperCard = ({ paper }) => (
    <Card className="hover:border-primary transition-colors cursor-pointer group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
            <Badge variant="secondary">{paper.venue || "ArXiv"}</Badge>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{paper.date}</span>
        </div>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', lineHeight: '1.4' }}>{paper.title}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {paper.abstract}
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {paper.topics.map(t => <span key={t} style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>#{t}</span>)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Cited by <span style={{ color: 'white' }}>{paper.citations}</span>
            </div>
        </div>
    </Card>
);

export const TopicCard = ({ topic, trend }) => (
    <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>{topic}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: trend > 0 ? 'var(--success)' : 'var(--danger)' }}>
                {trend > 0 ? <TrendingUp size={16} /> : <TrendingUp size={16} style={{ transform: 'scaleY(-1)' }} />}
                <span>{Math.abs(trend)}%</span>
            </div>
        </div>
        <div style={{ height: '60px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                    { v: 10 }, { v: 15 }, { v: 12 }, { v: 20 }, { v: 28 }, { v: trend > 0 ? 40 : 10 }
                ]}>
                    <Line type="monotone" dataKey="v" stroke={trend > 0 ? 'var(--success)' : 'var(--danger)'} strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <div className="text-xs text-muted">Growth Score</div>
            <div className="text-sm font-bold">8.4/10</div>
        </div>
    </Card>
);
