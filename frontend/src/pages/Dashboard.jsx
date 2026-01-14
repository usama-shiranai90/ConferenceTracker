import React, { useState, useEffect } from 'react';
import { TopicLandscape, TopicCard, PaperCard } from '../components/DashboardComponents';
import { Search } from 'lucide-react';
import TrendChart from '../components/TrendChart';

const Dashboard = () => {
    const [trends, setTrends] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/trends')
            .then(res => res.json())
            .then(data => setTrends(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* 5.1.1 Hero Section */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 className="header-title">Research Intelligence</h1>
                    <p className="header-subtitle">Tracking <span style={{ color: 'var(--primary)' }}>12,890</span> papers across AI & BioMed</p>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                    <input
                        type="text"
                        placeholder="Ask a natural language question..."
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)',
                            borderRadius: '24px',
                            color: 'white',
                            outline: 'none'
                        }}
                    />
                </div>
            </header>

            {/* Hero Metrics / Emerging Topics */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <TopicCard topic="Diffusion Models" trend={124} />
                <TopicCard topic="State Space Models" trend={85} />
                <TopicCard topic="RAG Systems" trend={62} />
                <TopicCard topic="CNNs" trend={-15} />
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', height: '500px' }}>
                {/* Main Chart */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3>Global Trends</h3>
                    <div style={{ flex: 1 }}>
                        <TrendChart data={trends} />
                    </div>
                </div>

                {/* What's Trending Feed */}
                <div className="glass-panel" style={{ overflowY: 'auto' }}>
                    <h3>Trending Papers</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Scalable Diffusion Models with Transformers</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CVPR 2024 • Cited by 45</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 5.3.1 Topic Landscape */}
            <section>
                <h3>Research Landscape Map</h3>
                <TopicLandscape />
            </section>
        </div>
    );
};

export default Dashboard;
