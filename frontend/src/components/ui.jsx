import React from 'react';

export const Card = ({ children, className = '', ...props }) => (
    <div className={`glass-panel ${className}`} {...props}>
        {children}
    </div>
);

export const Badge = ({ children, variant = 'primary', className = '' }) => {
    const colors = {
        primary: 'bg-primary/10 text-primary border-primary/20',
        secondary: 'bg-secondary/10 text-secondary border-secondary/20',
        success: 'bg-green-500/10 text-green-400 border-green-500/20',
        danger: 'bg-red-500/10 text-red-400 border-red-500/20',
        warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    };

    // Hand-rolled classes to match index.css variables if tailwind isn't fully configured with vars
    // Or assuming we used CSS modules, but here we use simple inline styles mixed with standard utility concepts
    // Since we rely on index.css, let's just make it consistent with that style.

    const styleMap = {
        primary: { background: 'rgba(0, 240, 255, 0.1)', color: '#00f0ff', border: '1px solid rgba(0, 240, 255, 0.2)' },
        secondary: { background: 'rgba(189, 0, 255, 0.1)', color: '#bd00ff', border: '1px solid rgba(189, 0, 255, 0.2)' },
        success: { background: 'rgba(2, 224, 121, 0.1)', color: '#02e079', border: '1px solid rgba(2, 224, 121, 0.2)' },
        danger: { background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.2)' },
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
            style={styleMap[variant] || styleMap.primary}
        >
            {children}
        </span>
    );
};

export const Button = ({ children, variant = 'primary', onClick, className = '' }) => {
    const baseStyle = {
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textTransform: 'uppercase',
        fontSize: '0.8rem',
        letterSpacing: '0.05em',
        border: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
    };

    const variants = {
        primary: {
            background: 'var(--primary)',
            color: '#000',
            border: 'none'
        },
        outline: {
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-main)'
        },
        ghost: {
            background: 'transparent',
            color: 'var(--text-muted)'
        }
    };

    return (
        <button
            onClick={onClick}
            className={className}
            style={{ ...baseStyle, ...variants[variant] }}
        >
            {children}
        </button>
    );
};
