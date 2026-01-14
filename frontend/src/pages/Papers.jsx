import React, { useState, useEffect } from 'react';
import { PaperCard } from '../components/DashboardComponents';

const Papers = () => {
    const [papers, setPapers] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/papers')
            .then(res => res.json())
            .then(data => setPapers(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h1>All Papers</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '2rem' }}>
                {papers.map((p, i) => (
                    <PaperCard
                        key={i}
                        paper={{
                            title: p.title,
                            venue: p.venue,
                            date: p.published_date,
                            abstract: "Abstract content placeholder...",
                            topics: [p.source],
                            citations: Math.floor(Math.random() * 100)
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
export default Papers;
