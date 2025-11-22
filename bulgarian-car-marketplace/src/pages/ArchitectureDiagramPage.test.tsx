import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ArchitectureDiagramPage from './ArchitectureDiagramPage';

// Basic route render smoke test for /diagram

test('renders architecture diagram page title', () => {
  render(
    <MemoryRouter initialEntries={['/diagram']}>
      <Routes>
        <Route path="/diagram" element={<ArchitectureDiagramPage />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/System Architecture Diagram/i)).toBeInTheDocument();
});
