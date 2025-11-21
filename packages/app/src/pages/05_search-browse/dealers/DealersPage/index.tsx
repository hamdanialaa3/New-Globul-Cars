import React from 'react';
import styled from 'styled-components';

const DealersContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: #333;
  text-align: center;
  margin-bottom: 3rem;
`;

const DealersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const DealerCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const DealerName = styled.h3`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const DealerInfo = styled.div`
  color: #666;
  margin-bottom: 0.5rem;
`;

const ContactButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 1rem;
  
  &:hover {
    opacity: 0.9;
  }
`;

const DealersPage: React.FC = () => {

  const dealers = [
    {
      id: 1,
      name: 'المؤسسة الذهبية للسيارات',
      location: 'صوفيا، بلغاريا',
      phone: '+359 2 123 4567',
      speciality: 'سيارات فاخرة'
    },
    {
      id: 2,
      name: 'مركز البلقان للسيارات',
      location: 'بلوفديف، بلغاريا',
      phone: '+359 32 987 6543',
      speciality: 'سيارات اقتصادية'
    },
    {
      id: 3,
      name: 'وكالة الأناضول',
      location: 'فارنا، بلغاريا',
      phone: '+359 52 456 7890',
      speciality: 'سيارات رياضية'
    },
    {
      id: 4,
      name: 'مجموعة النجمة الشرقية',
      location: 'بورغاس، بلغاريا',
      phone: '+359 56 321 0987',
      speciality: 'سيارات تجارية'
    }
  ];

  return (
    <DealersContainer>
      <PageTitle>شبكة الوكلاء المعتمدين</PageTitle>
      
      <DealersGrid>
        {dealers.map(dealer => (
          <DealerCard key={dealer.id}>
            <DealerName>{dealer.name}</DealerName>
            <DealerInfo>📍 الموقع: {dealer.location}</DealerInfo>
            <DealerInfo>📞 الهاتف: {dealer.phone}</DealerInfo>
            <DealerInfo>🎯 التخصص: {dealer.speciality}</DealerInfo>
            <ContactButton>
              تواصل معنا
            </ContactButton>
          </DealerCard>
        ))}
      </DealersGrid>
      
      <div style={{ textAlign: 'center', color: '#666' }}>
        <p>تريد أن تصبح وكيلاً معتمداً؟</p>
        <ContactButton>
          انضم إلى شبكتنا
        </ContactButton>
      </div>
    </DealersContainer>
  );
};

export default DealersPage;