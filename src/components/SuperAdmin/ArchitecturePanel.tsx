import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Network, Info, Zap, Database, Cloud, Cpu, Globe, Lock } from 'lucide-react';

const ArchitectureSection = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  border: 2px solid rgba(102, 126, 234, 0.3);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.3);
`;

const Title = styled.h2<{ language: string }>`
  color: #ffd700;
  font-size: 1.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 1rem;
  direction: ${props => props.language === 'bg' ? 'ltr' : 'rtl'};
`;

const ViewButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  }
`;

const Description = styled.div<{ language: string }>`
  color: #b0b0b0;
  font-size: 1rem;
  line-height: 1.8;
  margin-bottom: 2rem;
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    border-color: rgba(102, 126, 234, 0.4);
    transform: translateY(-4px);
  }
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: white;
`;

const FeatureTitle = styled.h3<{ language: string }>`
  color: #ffd700;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  direction: ${props => props.language === 'bg' ? 'ltr' : 'rtl'};
  text-align: ${props => props.language === 'bg' ? 'left' : 'right'};
`;

const FeatureDesc = styled.p<{ language: string }>`
  color: #b0b0b0;
  font-size: 0.9rem;
  line-height: 1.6;
  direction: ${props => props.language === 'bg' ? 'ltr' : 'rtl'};
  text-align: ${props => props.language === 'bg' ? 'left' : 'right'};
`;

const DetailedExplanation = styled.div<{ language: string }>`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
  border-left: 4px solid #667eea;
  direction: ${props => props.language === 'bg' ? 'ltr' : 'rtl'};
`;

const ExplanationTitle = styled.h3<{ language: string }>`
  color: #667eea;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  direction: ${props => props.language === 'bg' ? 'ltr' : 'rtl'};
`;

const ExplanationList = styled.ul<{ language: string }>`
  color: #e0e0e0;
  font-size: 0.95rem;
  line-height: 1.8;
  list-style-position: inside;
  direction: ${props => props.language === 'bg' ? 'ltr' : 'rtl'};
  text-align: ${props => props.language === 'bg' ? 'left' : 'right'};
  
  li {
    margin-bottom: 0.8rem;
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
                        <li key={index} dangerouslySetInnerHTML={{ __html: point }} />
                    ))}
                </ExplanationList>
            </DetailedExplanation>
        </ArchitectureSection>
    );
};

export default ArchitecturePanel;
