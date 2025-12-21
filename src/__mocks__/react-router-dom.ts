// src/__mocks__/react-router-dom.ts
// Mock for react-router-dom

import React from 'react';

export const BrowserRouter = ({ children }: any) => children;
export const Routes = ({ children }: any) => children;
export const Route = ({ element }: any) => element;
export const Link = ({ children, to }: any) => React.createElement('a', { href: to }, children);
export const useNavigate = () => jest.fn();
export const useLocation = () => ({ pathname: '/', search: '', hash: '', state: null });
export const useParams = () => ({});

export default {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  useParams,
};