import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function CarDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/search', { replace: true });
  }, [id, navigate]);

  return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <h2>Redirecting...</h2>
      <p>This page has been moved.</p>
    </div>
  );
}

export default CarDetailsPage;