import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Lightbulb, BookOpen, Target, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';

const Topics = () => {
    const [insights, setInsights] = useState(null);
    const [topics, setTopics] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [refreshingInsights, setRefreshingInsights] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [insightsRes, topicsRes, recommendedRes] = await Promise.all([
                fetch('http://localhost:8000/api/research/insights'),
                fetch('http://localhost:8000/api/topics/clusters'),
                fetch('http://localhost:8000/api/research/recommended')
            ]);

            const insightsData = await insightsRes.json();
            const topicsData = await topicsRes.json();
            const recommendedData = await recommendedRes.json();

            setInsights(insightsData);
            setTopics(topicsData.topics || []);
            setRecommended(recommendedData.papers || []);
        } catch (err) {
            console.error("Failed to load research data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const res = await fetch('http://localhost:8000/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery, limit: 15 })
            });
            const data = await res.json();
            setSearchResults(data.results || []);
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setSearching(false);
        }
    };

    const refreshInsights = async () => {
        setRefreshingInsights(true);
        try {
            const res = await fetch('http://localhost:8000/api/research/insights');
            const data = await res.json();
            setInsights(data);
        } catch (err) {
            console.error("Failed to refresh insights:", err);
        } finally {
            setRefreshingInsights(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-muted)'
            }}>
                <RefreshCw className="spin" size={24} style={{ marginRight: '0.5rem' }} />
                Loading Research Intelligence...
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Header with Search */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="gradient-text">Research Discovery</h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        AI-powered insights tailored to your research focus.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', minWidth: '350px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="glass-input"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder="Search papers... (e.g., prescription LLM)"
                            style={{ width: '100%', paddingLeft: '2.5rem' }}
                        />
                    </div>
                    <button onClick={handleSearch} className="btn-primary" disabled={searching}>
                        {searching ? '...' : 'Search'}
                    </button>
                </div>
            </header>

            {/* Search Results (if any) */}
            {searchResults.length > 0 && (
                <div className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Search Results ({searchResults.length})</h3>
                        <button onClick={() => setSearchResults([])} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            Clear
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {searchResults.map((paper, idx) => (
                            <div key={idx} style={{
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '8px',
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{paper.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    {paper.venue} • {paper.date}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                    {paper.abstract}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>

                {/* Left Column: AI Insights */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Research Summary */}
                    <div className="glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <Sparkles size={20} color="var(--primary)" />
                                AI Research Summary
                            </h3>
                            <button
                                onClick={refreshInsights}
                                disabled={refreshingInsights}
                                style={{
                                    background: 'none',
                                    border: '1px solid var(--border)',
                                    borderRadius: '4px',
                                    padding: '0.25rem 0.5rem',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}
                            >
                                <RefreshCw size={14} className={refreshingInsights ? 'spin' : ''} />
                                Refresh
                            </button>
                        </div>
                        <div style={{
                            background: 'rgba(0,240,255,0.05)',
                            padding: '1rem',
                            borderRadius: '8px',
                            borderLeft: '3px solid var(--primary)',
                            lineHeight: 1.7
                        }}>
                            {insights?.summary || "No insights available yet. Add papers to your database."}
                        </div>
                    </div>

                    {/* Emerging Trends & Research Gaps */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="glass-panel">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <TrendingUp size={20} color="#10b981" />
                                Emerging Trends
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)' }}>
                                {insights?.emerging_trends?.length > 0 ? (
                                    insights.emerging_trends.map((trend, idx) => (
                                        <li key={idx} style={{ marginBottom: '0.5rem' }}>{trend}</li>
                                    ))
                                ) : (
                                    <li>No trends detected yet</li>
                                )}
                            </ul>
                        </div>

                        <div className="glass-panel">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Target size={20} color="#f59e0b" />
                                Research Gaps
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)' }}>
                                {insights?.research_gaps?.length > 0 ? (
                                    insights.research_gaps.map((gap, idx) => (
                                        <li key={idx} style={{ marginBottom: '0.5rem' }}>{gap}</li>
                                    ))
                                ) : (
                                    <li>No gaps identified yet</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Recommended Directions */}
                    <div className="glass-panel">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Lightbulb size={20} color="#a855f7" />
                            Recommended Research Directions
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {insights?.recommended_directions?.length > 0 ? (
                                insights.recommended_directions.map((dir, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem',
                                        background: 'rgba(168, 85, 247, 0.05)',
                                        borderRadius: '8px'
                                    }}>
                                        <ChevronRight size={16} color="#a855f7" />
                                        <span>{dir}</span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>No recommendations available yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Topics & Papers */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Topic Clusters */}
                    <div className="glass-panel">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BookOpen size={20} color="var(--secondary)" />
                            Topic Clusters
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {topics.length > 0 ? (
                                topics.slice(0, 6).map((topic, idx) => (
                                    <div key={idx} style={{
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600 }}>{topic.name}</span>
                                            <span style={{
                                                background: 'var(--primary)',
                                                padding: '0.125rem 0.5rem',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                color: 'black'
                                            }}>
                                                {topic.count} papers
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>No topics found. Trigger data collection first.</p>
                            )}
                        </div>
                    </div>

                    {/* Recommended Papers */}
                    <div className="glass-panel" style={{ flex: 1, overflowY: 'auto' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={20} color="#22c55e" />
                            Recommended for You
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {recommended.length > 0 ? (
                                recommended.slice(0, 6).map((paper, idx) => (
                                    <div key={idx} style={{
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)'
                                    }}>
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                            {paper.title?.slice(0, 80)}{paper.title?.length > 80 ? '...' : ''}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{paper.venue}</span>
                                            <span style={{ color: paper.relevance === 'High' ? '#22c55e' : 'var(--text-muted)' }}>
                                                {paper.relevance}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>No recommendations yet. Update your profile and collect papers.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Topics;
