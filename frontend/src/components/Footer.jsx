import React from 'react';

const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div className="container text-center">
                <p style={{ color: 'var(--text-muted)' }}>&copy; {new Date().getFullYear()} LearnHub. All rights reserved.</p>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        padding: '3rem 0',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        marginTop: 'auto'
    }
};

export default Footer;
