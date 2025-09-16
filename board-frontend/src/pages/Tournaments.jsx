import React, { useState, useEffect } from 'react';
import { getTournaments } from '../api/api';
import '../styles/Tournaments.css';

const Tournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await getTournaments();
                setTournaments(response.data);
            } catch (err) {
                setError('Failed to fetch tournaments.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTournaments();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="tournaments-container">
            <h1>BWF World Tour Calendar</h1>
            <div className="tournaments-grid">
                {tournaments.map(t => (
                    <div key={t.id} className="tournament-card">
                        <img src={t.logo_url} alt={`${t.name} logo`} />
                        <h3>{t.name}</h3>
                        <p><strong>Location:</strong> {t.location}</p>
                        <p><strong>Series:</strong> {t.series}</p>
                        <p><strong>Prize:</strong> {t.prize}</p>
                        <p><strong>Date:</strong> {new Date(t.start_date).toLocaleDateString()} - {new Date(t.end_date).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tournaments;
