import React from 'react';
import styled from 'styled-components';
import { FileSpreadsheet, FileJson } from 'lucide-react';
import GlobulCarLogo from '../../icons/GlobulCarLogo';
import { usersReportService } from '../../../services/reports/users-report-service';
import { carsReportService } from '../../../services/reports/cars-report-service';

const ReportsLinks: React.FC = () => {
    return (
        <Section>
            <SectionTitle>📊 Export Reports</SectionTitle>
            <ReportsGrid>
                {/* All Users Report */}
                <ReportCard>
                    <ReportIcon>👥</ReportIcon>
                    <ReportName>All Users</ReportName>
                    <ReportButtons>
                        <ExportBtn onClick={async () => {
                            const users = await usersReportService.getAllUsers();
                            const csv = await usersReportService.exportToCSV(users);
                            usersReportService.downloadReport(csv, 'all-users', 'csv');
                        }}>
                            <FileSpreadsheet size={16} />
                            CSV
                        </ExportBtn>
                        <ExportBtn onClick={async () => {
                            const users = await usersReportService.getAllUsers();
                            const excel = await usersReportService.exportToExcel(users);
                            usersReportService.downloadReport(excel, 'all-users', 'xls');
                        }}>
                            <FileSpreadsheet size={16} />
                            Excel
                        </ExportBtn>
                        <ExportBtn onClick={async () => {
                            const users = await usersReportService.getAllUsers();
                            const json = await usersReportService.exportToJSON(users);
                            usersReportService.downloadReport(json, 'all-users', 'json');
                        }}>
                            <FileJson size={16} />
                            JSON
                        </ExportBtn>
                    </ReportButtons>
                </ReportCard>

                {/* Dealers Report */}
                <ReportCard>
                    <ReportIcon>🏢</ReportIcon>
                    <ReportName>Dealers</ReportName>
                    <ReportButtons>
                        <ExportBtn onClick={async () => {
                            const dealers = await usersReportService.getAllUsers({ profileType: 'dealer' });
                            const csv = await usersReportService.exportToCSV(dealers);
                            usersReportService.downloadReport(csv, 'dealers', 'csv');
                        }}>
                            <FileSpreadsheet size={16} />
                            CSV
                        </ExportBtn>
                        <ExportBtn onClick={async () => {
                            const dealers = await usersReportService.getAllUsers({ profileType: 'dealer' });
                            const excel = await usersReportService.exportToExcel(dealers);
                            usersReportService.downloadReport(excel, 'dealers', 'xls');
                        }}>
                            <FileSpreadsheet size={16} />
                            Excel
                        </ExportBtn>
                    </ReportButtons>
                </ReportCard>

                {/* All Cars Report */}
                <ReportCard>
                    <ReportIcon>
                        <GlobulCarLogo size={32} />
                    </ReportIcon>
                    <ReportName>All Cars</ReportName>
                    <ReportButtons>
                        <ExportBtn onClick={async () => {
                            const cars = await carsReportService.getAllCars();
                            const csv = await carsReportService.exportToCSV(cars);
                            carsReportService.downloadReport(csv, 'all-cars', 'csv');
                        }}>
                            <FileSpreadsheet size={16} />
                            CSV
                        </ExportBtn>
                        <ExportBtn onClick={async () => {
                            const cars = await carsReportService.getAllCars();
                            const excel = await carsReportService.exportToExcel(cars);
                            carsReportService.downloadReport(excel, 'all-cars', 'xls');
                        }}>
                            <FileSpreadsheet size={16} />
                            Excel
                        </ExportBtn>
                        <ExportBtn onClick={async () => {
                            const cars = await carsReportService.getAllCars();
                            const json = await carsReportService.exportToJSON(cars);
                            carsReportService.downloadReport(json, 'all-cars', 'json');
                        }}>
                            <FileJson size={16} />
                            JSON
                        </ExportBtn>
                    </ReportButtons>
                </ReportCard>

                {/* Sofia Cars Report */}
                <ReportCard>
                    <ReportIcon>🏙️</ReportIcon>
                    <ReportName>Sofia Cars</ReportName>
                    <ReportButtons>
                        <ExportBtn onClick={async () => {
                            const cars = await carsReportService.getAllCars({ city: 'София' });
                            const csv = await carsReportService.exportToCSV(cars);
                            carsReportService.downloadReport(csv, 'sofia-cars', 'csv');
                        }}>
                            <FileSpreadsheet size={16} />
                            CSV
                        </ExportBtn>
                        <ExportBtn onClick={async () => {
                            const cars = await carsReportService.getAllCars({ city: 'София' });
                            const excel = await carsReportService.exportToExcel(cars);
                            carsReportService.downloadReport(excel, 'sofia-cars', 'xls');
                        }}>
                            <FileSpreadsheet size={16} />
                            Excel
                        </ExportBtn>
                    </ReportButtons>
                </ReportCard>

                {/* Active Cars Report */}
                <ReportCard>
                    <ReportIcon>✅</ReportIcon>
                    <ReportName>Active Cars</ReportName>
                    <ReportButtons>
                        <ExportBtn onClick={async () => {
                            const cars = await carsReportService.getAllCars({ status: 'active' });
                            const csv = await carsReportService.exportToCSV(cars);
                            carsReportService.downloadReport(csv, 'active-cars', 'csv');
                        }}>
                            <FileSpreadsheet size={16} />
                            CSV
                        </ExportBtn>
                        <ExportBtn onClick={async () => {
                            const cars = await carsReportService.getAllCars({ status: 'active' });
                            const excel = await carsReportService.exportToExcel(cars);
                            carsReportService.downloadReport(excel, 'active-cars', 'xls');
                        }}>
                            <FileSpreadsheet size={16} />
                            Excel
                        </ExportBtn>
                    </ReportButtons>
                </ReportCard>

                {/* Verified Users Report */}
                <ReportCard>
                    <ReportIcon>✓</ReportIcon>
                    <ReportName>Verified Users</ReportName>
                    <ReportButtons>
                        <ExportBtn onClick={async () => {
                            const users = await usersReportService.getAllUsers({ verifiedOnly: true });
                            const csv = await usersReportService.exportToCSV(users);
                            usersReportService.downloadReport(csv, 'verified-users', 'csv');
                        }}>
                            <FileSpreadsheet size={16} />
                            CSV
                        </ExportBtn>
                        <ExportBtn onClick={async () => {
                            const users = await usersReportService.getAllUsers({ verifiedOnly: true });
                            const excel = await usersReportService.exportToExcel(users);
                            usersReportService.downloadReport(excel, 'verified-users', 'xls');
                        }}>
                            <FileSpreadsheet size={16} />
                            Excel
                        </ExportBtn>
                    </ReportButtons>
                </ReportCard>

                {/* AI Quotas Report */}
                <ReportCard>
                    <ReportIcon>🤖</ReportIcon>
                    <ReportName>AI Quotas</ReportName>
                    <ReportButtons>
                        <ExportBtn onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/firestore/databases/-default-/data/~2Fai_quotas', '_blank')}>
                            <FileSpreadsheet size={16} />
                            View
                        </ExportBtn>
                    </ReportButtons>
                </ReportCard>

                {/* AI Usage Logs Report */}
                <ReportCard>
                    <ReportIcon>📊</ReportIcon>
                    <ReportName>AI Usage Logs</ReportName>
                    <ReportButtons>
                        <ExportBtn onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/firestore/databases/-default-/data/~2Fai_usage_logs', '_blank')}>
                            <FileSpreadsheet size={16} />
                            View
                        </ExportBtn>
                    </ReportButtons>
                </ReportCard>

            </ReportsGrid>
        </Section>
    );
};

const Section = styled.div`
  padding: 24px 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid #2d3748;
  background: #0f1419;
  border-radius: 8px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  color: #f8fafc;
  text-align: center;
  margin-bottom: 16px;
  font-weight: 600;
`;

const ReportsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ReportCard = styled.div`
  background: #1e2432;
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 24px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff8c61;
    background: #252b3a;
  }
`;

const ReportIcon = styled.div`
  font-size: 24px;
  text-align: center;
  margin-bottom: 8px;
`;

const ReportName = styled.div`
  font-size: 13px;
  color: #f8fafc;
  text-align: center;
  margin-bottom: 16px;
  font-weight: 600;
`;

const ReportButtons = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ExportBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #ff8c61;
  color: #0f1419;
  border: 1px solid #ff8c61;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #ffa885;
    box-shadow: 0 4px 10px rgba(255, 140, 97, 0.4);
  }
`;

export default ReportsLinks;
