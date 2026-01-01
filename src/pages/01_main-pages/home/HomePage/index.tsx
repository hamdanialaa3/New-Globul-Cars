/**
 * src/pages/HomePage/index.tsx
 * 
 * Началната страница - Главна входна точка
 * HomePage - Main Entry Point
 * 
 * ✅ New version (v2.0) / Нова версия (v2.0):
 * - Uses HomePageComposer to arrange sections / Използва HomePageComposer за подреждане на секциите
 * - Simple and clean file (< 50 lines) / Прост и чист файл (< 50 реда)
 * - Easy to maintain and develop / Лесен за поддръжка и разработка
 * - Clear separation of responsibilities / Ясно разделение на отговорности
 * 
 * Single Responsibility / Единствена отговорност:
 * - Import and display HomePageComposer / Импортиране и показване на HomePageComposer
 * - Does not contain section arrangement logic / Не съдържа логика за подреждане на секции
 * 
 * @see HomePageComposer.tsx - Section arrangement and organization
 * @architecture Clean Architecture
 * @maintainability Very high / Много висока
 */

import React from 'react';
import HomePageComposer from './HomePageComposer';

/**
 * HomePage - Началната страница
 * 
 * Simple component that displays HomePageComposer / Прост компонент който пkazва HomePageComposer
 * All sections and ordering are in HomePageComposer / Всички секции и подредба са в HomePageComposer
 */
const HomePage: React.FC = React.memo(() => {
  return <HomePageComposer />;
});

HomePage.displayName = 'HomePage';

export default HomePage;
