import React, { useState, useEffect } from 'react';
import { Save, Sparkles, BookOpen, GraduationCap, User } from 'lucide-react';

const Profile = () => {
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        proposal: ''
    });
    const [analysis, setAnalysis] = useState({
        trajectory: '',
        suggested_conferences: [],
        suggested_papers: []
    });
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch('http://localhost:8000/api/profile')
            .then(res => res.json())
            .then(data => {
                setFormData({
                    name: data.name || '',
                    title: data.title || '',
                    proposal: data.proposal || ''
                });
                setAnalysis({
                    trajectory: data.trajectory,
                    suggested_conferences: data.suggested_conferences,
                    suggested_papers: data.suggested_papers
                });
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = () => {
        fetch('http://localhost:8000/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then(res => res.json())
            .then(() => alert('Profile saved!'))
            .catch(err => console.error(err));
    };

    const handleAnalyze = () => {
        setAnalyzing(true);

        // First save, then analyze
        fetch('http://localhost:8000/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then(() => fetch('http://localhost:8000/api/profile/analyze', { method: 'POST' }))
            .then(res => res.json())
            .then(data => {
                setAnalysis({
                    trajectory: data.trajectory,
                    suggested_conferences: data.suggested_conferences,
                    suggested_papers: data.suggested_papers
                });
            })
            .catch(err => console.error(err))
            .finally(() => setAnalyzing(false));
    };

    if (loading) return <div className="p-8 text-white">Loading profile...</div>;

    return (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', height: '100%' }}>

            {/* Left Column: Input */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <header>
                    <h2 className="gradient-text" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Researcher Profile</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Define your research identity to get AI-powered recommendations.</p>
                </header>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="glass-input"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Dr. Jane Doe"
                            style={{ width: '100%', paddingLeft: '2.5rem' }}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Research Title / Topic</label>
                    <div style={{ position: 'relative' }}>
                        <BookOpen size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="glass-input"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Efficient Transformers for Healthcare"
                            style={{ width: '100%', paddingLeft: '2.5rem' }}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Research Proposal / Abstract</label>
                    <textarea
                        className="glass-input"
                        value={formData.proposal}
                        onChange={e => setFormData({ ...formData, proposal: e.target.value })}
                        placeholder="Paste your research abstract, proposal, or rough ideas here..."
                        style={{ flex: 1, resize: 'none', lineHeight: '1.6' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleSave} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Save size={18} /> Save Draft
                    </button>
                    <button onClick={handleAnalyze} className="btn-primary" disabled={analyzing} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        {analyzing ? <span className="spinner"></span> : <Sparkles size={18} />}
                        {analyzing ? 'Analyzing...' : 'Analyze Research'}
                    </button>
                </div>
            </div>

            {/* Right Column: Analysis Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Trajectory */}
                <div className="glass-panel">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Sparkles size={20} color="var(--primary)" />
                        Research Trajectory
                    </h3>
                    <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        padding: '1rem',
                        borderRadius: '8px',
                        lineHeight: '1.6',
                        color: analysis.trajectory ? 'var(--text-main)' : 'var(--text-muted)',
                        fontStyle: analysis.trajectory ? 'normal' : 'italic'
                    }}>
                        {analysis.trajectory || "Run analysis to generate your research trajectory."}
                    </div>
                </div>

                {/* Conferences */}
                <div className="glass-panel">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <GraduationCap size={20} color="var(--secondary)" />
                        Recommended Conferences
                    </h3>
                    {analysis.suggested_conferences && analysis.suggested_conferences.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {analysis.suggested_conferences.map((conf, idx) => (
                                <span key={idx} style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border)',
                                    fontSize: '0.9rem'
                                }}>
                                    {conf}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No recommendations yet.</p>
                    )}
                </div>

                {/* Papers */}
                <div className="glass-panel" style={{ flex: 1, overflowY: 'auto' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <BookOpen size={20} color="#10b981" />
                        Relevant Papers
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {analysis.suggested_papers && analysis.suggested_papers.length > 0 ? (
                            analysis.suggested_papers.map((paper, idx) => (
                                <div key={idx} style={{
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{paper.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{paper.venue}</span>
                                        <span>{paper.year}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No papers found matching your topic keywords yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
