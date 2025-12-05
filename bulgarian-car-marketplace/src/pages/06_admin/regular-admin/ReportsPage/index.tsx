import { logger } from '../../../../services/logger-service';
// src/pages/06_admin/regular-admin/ReportsPage/index.tsx
// صفحة التقارير للمسؤولين

import React, { useState } from 'react';
import styled from 'styled-components';
import { Download, Users, Car, FileText, Filter, BarChart3 } from 'lucide-react';
import { usersReportService, UserReportData } from '../../../../services/reports/users-report-service';
import { carsReportService, CarReportData } from '../../../../services/reports/cars-report-service';

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<'users' | 'cars'>('users');
  const [users, setUsers] = useState<UserReportData[]>([]);
  const [cars, setCars] = useState<CarReportData[]>([]);
  
  // فلاتر المستخدمين
  const [userFilters, setUserFilters] = useState({
    profileType: '' as '' | 'private' | 'dealer' | 'company',
    city: '',
    verifiedOnly: false,
  });

  // فلاتر السيارات
  const [carFilters, setCarFilters] = useState({
    city: 'София',
    status: 'active' as 'active' | 'sold' | 'inactive' | '',
    make: '',
    yearFrom: '',
    yearTo: '',
  });

  // جلب البيانات
  const fetchData = async () => {
    setLoading(true);
    try {
      if (selectedReport === 'users') {
        const data = await usersReportService.getAllUsers({
          profileType: userFilters.profileType || undefined,
          city: userFilters.city || undefined,
          verifiedOnly: userFilters.verifiedOnly,
        });
        setUsers(data);
      } else {
        const data = await carsReportService.getAllCars({
          city: carFilters.city || undefined,
          status: carFilters.status || undefined,
          make: carFilters.make || undefined,
          yearFrom: carFilters.yearFrom ? parseInt(carFilters.yearFrom) : undefined,
          yearTo: carFilters.yearTo ? parseInt(carFilters.yearTo) : undefined,
        });
        setCars(data);
      }
    } catch (error) {
      logger.error('Error fetching data:', error);
      alert('خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  // تصدير
  const handleExport = async (format: 'csv' | 'json' | 'xls') => {
    setLoading(true);
    try {
      if (selectedReport === 'users') {
        let content = '';
        const filename = `users-report-${new Date().toISOString().split('T')[0]}`;
        
        if (format === 'csv') {
          content = await usersReportService.exportToCSV(users);
        } else if (format === 'json') {
          content = await usersReportService.exportToJSON(users);
        } else {
          content = await usersReportService.exportToExcel(users);
        }
        
        usersReportService.downloadReport(content, filename, format);
      } else {
        let content = '';
        const filename = `cars-report-${carFilters.city || 'all'}-${new Date().toISOString().split('T')[0]}`;
        
        if (format === 'csv') {
          content = await carsReportService.exportToCSV(cars);
        } else if (format === 'json') {
          content = await carsReportService.exportToJSON(cars);
        } else {
          content = await carsReportService.exportToExcel(cars);
        }
        
        carsReportService.downloadReport(content, filename, format);
      }
      
      alert(`✅ تم تحميل التقرير بنجاح!`);
    } catch (error) {
      logger.error('Error exporting:', error);
      alert('خطأ في التصدير');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <h1>📊 التقارير والإحصائيات</h1>
        <p>تصدير بيانات المستخدمين والسيارات</p>
      </Header>

      <TabsContainer>
        <Tab
          active={selectedReport === 'users'}
          onClick={() => setSelectedReport('users')}
        >
          <Users size={20} />
          <span>تقرير المستخدمين</span>
        </Tab>
        <Tab
          active={selectedReport === 'cars'}
          onClick={() => setSelectedReport('cars')}
        >
          <Car size={20} />
          <span>تقرير السيارات</span>
        </Tab>
      </TabsContainer>

      {selectedReport === 'users' ? (
        <FiltersCard>
          <FilterTitle>
            <Filter size={18} />
            <span>فلاتر المستخدمين</span>
          </FilterTitle>
          <FiltersGrid>
            <FilterGroup>
              <label>نوع الحساب:</label>
              <select
                value={userFilters.profileType}
                onChange={(e) => setUserFilters({ ...userFilters, profileType: e.target.value as any })}
              >
                <option value="">الكل</option>
                <option value="private">خاص</option>
                <option value="dealer">معرض</option>
                <option value="company">شركة</option>
              </select>
            </FilterGroup>
            <FilterGroup>
              <label>المدينة:</label>
              <input
                type="text"
                placeholder="София, Пловдив..."
                value={userFilters.city}
                onChange={(e) => setUserFilters({ ...userFilters, city: e.target.value })}
              />
            </FilterGroup>
            <FilterGroup>
              <label>
                <input
                  type="checkbox"
                  checked={userFilters.verifiedOnly}
                  onChange={(e) => setUserFilters({ ...userFilters, verifiedOnly: e.target.checked })}
                />
                متحققون فقط
              </label>
            </FilterGroup>
          </FiltersGrid>
        </FiltersCard>
      ) : (
        <FiltersCard>
          <FilterTitle>
            <Filter size={18} />
            <span>فلاتر السيارات</span>
          </FilterTitle>
          <FiltersGrid>
            <FilterGroup>
              <label>المدينة:</label>
              <input
                type="text"
                placeholder="София"
                value={carFilters.city}
                onChange={(e) => setCarFilters({ ...carFilters, city: e.target.value })}
              />
            </FilterGroup>
            <FilterGroup>
              <label>الحالة:</label>
              <select
                value={carFilters.status}
                onChange={(e) => setCarFilters({ ...carFilters, status: e.target.value as any })}
              >
                <option value="">الكل</option>
                <option value="active">نشط</option>
                <option value="sold">مباع</option>
                <option value="inactive">غير نشط</option>
              </select>
            </FilterGroup>
            <FilterGroup>
              <label>الماركة:</label>
              <input
                type="text"
                placeholder="BMW, Mercedes..."
                value={carFilters.make}
                onChange={(e) => setCarFilters({ ...carFilters, make: e.target.value })}
              />
            </FilterGroup>
            <FilterGroup>
              <label>من سنة:</label>
              <input
                type="number"
                placeholder="2015"
                value={carFilters.yearFrom}
                onChange={(e) => setCarFilters({ ...carFilters, yearFrom: e.target.value })}
              />
            </FilterGroup>
            <FilterGroup>
              <label>إلى سنة:</label>
              <input
                type="number"
                placeholder="2024"
                value={carFilters.yearTo}
                onChange={(e) => setCarFilters({ ...carFilters, yearTo: e.target.value })}
              />
            </FilterGroup>
          </FiltersGrid>
        </FiltersCard>
      )}

      <ActionsCard>
        <FetchButton onClick={fetchData} disabled={loading}>
          <BarChart3 size={20} />
          <span>{loading ? 'جاري الجلب...' : 'جلب البيانات'}</span>
        </FetchButton>

        {(users.length > 0 || cars.length > 0) && (
          <ExportButtons>
            <ExportButton onClick={() => handleExport('csv')} disabled={loading}>
              <Download size={18} />
              <span>تصدير CSV</span>
            </ExportButton>
            <ExportButton onClick={() => handleExport('xls')} disabled={loading}>
              <FileText size={18} />
              <span>تصدير Excel</span>
            </ExportButton>
            <ExportButton onClick={() => handleExport('json')} disabled={loading}>
              <FileText size={18} />
              <span>تصدير JSON</span>
            </ExportButton>
          </ExportButtons>
        )}
      </ActionsCard>

      {selectedReport === 'users' && users.length > 0 && (
        <ResultsCard>
          <h3>النتائج: {users.length} مستخدم</h3>
          <ResultsTable>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد</th>
                <th>نوع الحساب</th>
                <th>المدينة</th>
                <th>الإعلانات</th>
                <th>تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 10).map(user => (
                <tr key={user.uid}>
                  <td>{user.displayName}</td>
                  <td>{user.email}</td>
                  <td>{user.profileType}</td>
                  <td>{user.city || '-'}</td>
                  <td>{user.activeListings}</td>
                  <td>{user.createdAt.toLocaleDateString('bg-BG')}</td>
                </tr>
              ))}
            </tbody>
          </ResultsTable>
          {users.length > 10 && (
            <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
              ... و {users.length - 10} آخرين (صدّر للحصول على القائمة الكاملة)
            </p>
          )}
        </ResultsCard>
      )}

      {selectedReport === 'cars' && cars.length > 0 && (
        <ResultsCard>
          <h3>النتائج: {cars.length} سيارة</h3>
          <ResultsTable>
            <thead>
              <tr>
                <th>الماركة</th>
                <th>الموديل</th>
                <th>السنة</th>
                <th>السعر</th>
                <th>الموقع</th>
                <th>البائع</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {cars.slice(0, 10).map(car => (
                <tr key={car.id}>
                  <td>{car.make}</td>
                  <td>{car.model}</td>
                  <td>{car.year}</td>
                  <td>{car.price.toLocaleString()} €</td>
                  <td>{car.location}</td>
                  <td>{car.sellerName}</td>
                  <td>{car.status}</td>
                </tr>
              ))}
            </tbody>
          </ResultsTable>
          {cars.length > 10 && (
            <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
              ... و {cars.length - 10} سيارة أخرى (صدّر للحصول على القائمة الكاملة)
            </p>
          )}
        </ResultsCard>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #666;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #eee;
`;

const Tab = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: ${props => props.active ? '#FF6B35' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border: none;
  border-bottom: 3px solid ${props => props.active ? '#FF6B35' : 'transparent'};
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  transition: all 0.3s;
  
  &:hover {
    background: ${props => props.active ? '#FF6B35' : '#f5f5f5'};
  }
`;

const FiltersCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const FilterTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
  }
  
  input, select {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: #FF6B35;
    }
  }
`;

const ActionsCard = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FetchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ExportButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResultsCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  h3 {
    margin-bottom: 1rem;
    color: #333;
  }
`;

const ResultsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem;
    text-align: right;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background: #f5f5f5;
    font-weight: 600;
    color: #333;
  }
  
  tr:hover {
    background: #f9f9f9;
  }
`;

export default ReportsPage;

