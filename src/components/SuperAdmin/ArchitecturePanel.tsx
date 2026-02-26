import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Network, Info, Zap, Database, Cloud, Cpu, Globe, Lock } from 'lucide-react';
import { sanitizeHTML } from '../../utils/sanitize';

const ArchitectureSection = styled.div`
  background: #0f1419;
  border-radius: 12px;
  padding: 32px;
  margin: 0 20px 32px 20px;
  border: 1px solid #2d3748;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #2d3748;
`;

const Title = styled.h2<{ language: string }>`
  color: #ff8c61;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  direction: ${props => props.language === 'bg' ? 'ltr' : 'rtl'};
`;

const ViewButton = styled.button`
  background: #ff8c61;
  color: #0f1419;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    background: #ffa885;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 140, 97, 0.3);
  }
`;

const Description = styled.div<{ language: string }>`
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
  direction: ${props => props.language === 'bg' ? 'ltr' : 'rtl'};
  text-align: ${props => props.language === 'bg' ? 'left' : 'right'};
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const FeatureCard = styled.div`
  background: #1e2432;
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease;

  &:hover {
    background: #252b3a;
    border-color: #ff8c61;
    transform: translateY(-4px);
  }
`;

const FeatureIcon = styled.div`
  width: 44px;
  height: 44px;
  background: #252b3a;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #ff8c61;
  border: 1px solid #2d3748;
`;

const FeatureTitle = styled.h3<{ language: string }>`
  color: #f8fafc;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
  direction: ${props => props.language === 'bg' ? 'ltr' : 'rtl'};
  text-align: ${props => props.language === 'bg' ? 'left' : 'right'};
`;

const FeatureDesc = styled.p<{ language: string }>`
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
  direction: ${props => props.language === 'bg' ? 'ltr' : 'rtl'};
  text-align: ${props => props.language === 'bg' ? 'left' : 'right'};
`;

const DetailedExplanation = styled.div<{ language: string }>`
  background: #141a21;
  border-radius: 12px;
  padding: 24px;
  margin-top: 32px;
  border-left: 4px solid #ff8c61;
  direction: ${props => props.language === 'bg' ? 'ltr' : 'rtl'};
`;

const ExplanationTitle = styled.h3<{ language: string }>`
  color: #ff8c61;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  direction: ${props => props.language === 'bg' ? 'ltr' : 'rtl'};
`;

const ExplanationList = styled.ul<{ language: string }>`
  color: #cbd5e1;
  font-size: 13px;
  line-height: 1.8;
  list-style-position: inside;
  direction: ${props => props.language === 'bg' ? 'ltr' : 'rtl'};
  text-align: ${props => props.language === 'bg' ? 'left' : 'right'};
  
  li {
    margin-bottom: 12px;
    padding-left: ${props => props.language === 'bg' ? '0' : '1rem'};
    padding-right: ${props => props.language === 'bg' ? '1rem' : '0'};
  }
`;

interface ArchitecturePanelProps {
    language: 'en' | 'bg';
}

const ArchitecturePanel: React.FC<ArchitecturePanelProps> = ({ language }) => {
    const navigate = useNavigate();

    const content = {
        en: {
            title: 'Project Architecture Diagram',
            viewButton: 'View Interactive Diagram',
            description: 'Explore the complete technical architecture of the New Globul Cars platform. This interactive diagram shows all system components, their connections, and real-time data flow.',
            explanationTitle: 'Understanding the Architecture',
            features: [
                {
                    icon: <Network size={24} />,
                    title: 'Interactive Nodes',
                    desc: 'Each colored rectangle represents a system component. Click on any node to see detailed information about that module.'
                },
                {
                    icon: <Zap size={24} />,
                    title: 'Live Data Flow',
                    desc: 'Animated particles moving along connections show real-time data flow between components. Different colors indicate different types of data.'
                },
                {
                    icon: <Database size={24} />,
                    title: 'Backend Infrastructure',
                    desc: 'Gray nodes on the left represent backend services: Firebase, Database, Storage, Cloud Functions, AI Engine, and External APIs.'
                },
                {
                    icon: <Cpu size={24} />,
                    title: 'Core & Services',
                    desc: 'Red and cyan nodes represent the Core system and Service layer - the foundation of all business logic.'
                },
                {
                    icon: <Globe size={24} />,
                    title: 'UI & Features',
                    desc: 'Yellow and blue nodes show UI components and feature modules like Auth, Cars, Profile, Social, Messaging, Payments, IoT, and Admin.'
                },
                {
                    icon: <Lock size={24} />,
                    title: 'App Root',
                    desc: 'Purple node on the right is the main application shell that orchestrates all features and routes.'
                }
            ],
            explanationPoints: [
                '🎨 **Colored Rectangles**: Each component has a unique color based on its type (Infrastructure, Core, Services, UI, Features, App Root)',
                '⚡ **Animated Lines**: Connections between nodes show dependencies. Particles move to indicate data flow direction',
                '🔄 **Bidirectional Flow**: You\'ll see particles moving in both directions - representing requests and responses',
                '💫 **Pulsing Effect**: Particles grow and shrink as they move, creating a "breathing" effect to show the system is alive',
                '🎯 **Click Interaction**: Click any node to see detailed information in the left panel, including navigation to that section',
                '🌓 **Theme Support**: The entire diagram adapts to dark/light mode - try switching themes to see the difference',
                '📊 **Geometric Layout**: Components are arranged in 6 columns from left (Infrastructure) to right (App Root)',
                '🔗 **Real Dependencies**: All connections are based on actual code dependencies in the project'
            ]
        },
        bg: {
            title: 'Диаграма на архитектурата на проекта',
            viewButton: 'Виж интерактивна диаграма',
            description: 'Разгледайте пълната техническа архитектура на платформата New Globul Cars. Тази интерактивна диаграма показва всички системни компоненти, техните връзки и потока от данни в реално време.',
            explanationTitle: 'Разбиране на архитектурата',
            features: [
                {
                    icon: <Network size={24} />,
                    title: 'Интерактивни възли',
                    desc: 'Всеки цветен правоъгълник представлява системен компонент. Кликнете върху всеки възел, за да видите подробна информация за този модул.'
                },
                {
                    icon: <Zap size={24} />,
                    title: 'Поток от данни на живо',
                    desc: 'Анимирани частици, движещи се по връзките, показват потока от данни в реално време между компонентите. Различните цветове показват различни типове данни.'
                },
                {
                    icon: <Database size={24} />,
                    title: 'Бекенд инфраструктура',
                    desc: 'Сивите възли вляво представляват бекенд услуги: Firebase, База данни, Съхранение, Cloud Functions, AI Engine и външни API.'
                },
                {
                    icon: <Cpu size={24} />,
                    title: 'Ядро и услуги',
                    desc: 'Червените и циановите възли представляват основната система и слоя на услугите - основата на цялата бизнес логика.'
                },
                {
                    icon: <Globe size={24} />,
                    title: 'UI и функции',
                    desc: 'Жълтите и сините възли показват UI компоненти и модули с функции като Auth, Cars, Profile, Social, Messaging, Payments, IoT и Admin.'
                },
                {
                    icon: <Lock size={24} />,
                    title: 'App Root',
                    desc: 'Лилавият възел вдясно е основната обвивка на приложението, която управлява всички функции и маршрути.'
                }
            ],
            explanationPoints: [
                '🎨 **Цветни правоъгълници**: Всеки компонент има уникален цвят въз основа на типа си (Инфраструктура, Ядро, Услуги, UI, Функции, App Root)',
                '⚡ **Анимирани линии**: Връзките между възлите показват зависимости. Частиците се движат, за да покажат посоката на потока от данни',
                '🔄 **Двупосочен поток**: Ще видите частици, движещи се в двете посоки - представляващи заявки и отговори',
                '💫 **Пулсиращ ефект**: Частиците растат и се свиват, докато се движат, създавайки ефект на "дишане", за да покажат, че системата е жива',
                '🎯 **Клик взаимодействие**: Кликнете върху всеки възел, за да видите подробна информация в левия панел, включително навигация до този раздел',
                '🌓 **Поддръжка на тема**: Цялата диаграма се адаптира към тъмен/светъл режим - опитайте да превключите темите, за да видите разликата',
                '📊 **Геометрично оформление**: Компонентите са подредени в 6 колони отляво (Инфраструктура) надясно (App Root)',
                '🔗 **Реални зависимости**: Всички връзки се основават на действителни кодови зависимости в проекта'
            ]
        }
    };

    const t = content[language];

    return (
        <ArchitectureSection>
            <SectionHeader>
                <Title language={language}>
                    <Network size={32} />
                    {t.title}
                </Title>
                <ViewButton onClick={() => navigate('/diagram')}>
                    <Network size={20} />
                    {t.viewButton}
                </ViewButton>
            </SectionHeader>

            <Description language={language}>
                {t.description}
            </Description>

            <FeaturesGrid>
                {t.features.map((feature, index) => (
                    <FeatureCard key={index}>
                        <FeatureIcon>{feature.icon}</FeatureIcon>
                        <FeatureTitle language={language}>{feature.title}</FeatureTitle>
                        <FeatureDesc language={language}>{feature.desc}</FeatureDesc>
                    </FeatureCard>
                ))}
            </FeaturesGrid>

            <DetailedExplanation language={language}>
                <ExplanationTitle language={language}>
                    <Info size={24} />
                    {t.explanationTitle}
                </ExplanationTitle>
                <ExplanationList language={language}>
                    {t.explanationPoints.map((point, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: sanitizeHTML(point) }} />
                    ))}
                </ExplanationList>
            </DetailedExplanation>
        </ArchitectureSection>
    );
};

export default ArchitecturePanel;
