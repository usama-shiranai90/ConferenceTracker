import React from 'react';
import { Share2 } from 'lucide-react';

const Network = () => {
    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1 className="gradient-text">Network Graph</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Visualizing co-authorship and citation networks.
                </p>
            </header>

            <div className="card" style={{
                height: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
            }}>
                <Share2 size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3>Network Visualization Coming Soon</h3>
                <p>Dependencies for graph visualization are being reviewed.</p>
            </div>
        </div>
    );
};

export default Network;
