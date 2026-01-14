import React, { useState, useEffect } from 'react';
import { User, BookOpen, Award } from 'lucide-react';

const AuthorCard = ({ author }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(0, 240, 255, 0.1)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <User size={24} />
            </div>
            <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{author.name}</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Influence: {author.influence_score?.toFixed(2) || 'N/A'}
                </p>
            </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <BookOpen size={14} /> Papers
                </div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{author.paper_count}</div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Award size={14} /> Citations
                </div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{author.citations || 0}</div>
            </div>
        </div>
    </div>
);

const Authors = () => {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/authors')
            .then(res => res.json())
            .then(data => {
                setAuthors(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch authors:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div style={{ padding: '2rem' }}>Loading authors...</div>;

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1 className="gradient-text">Top Researchers</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Influential authors in collected research papers.
                </p>
            </header>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {authors.length > 0 ? (
                    authors.map(author => (
                        <AuthorCard key={author.id} author={author} />
                    ))
                ) : (
                    <div className="card">No authors found yet. triggering data collection might help.</div>
                )}
            </div>
        </div>
    );
};

export default Authors;
