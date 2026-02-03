import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Home, Car, User, Settings, Shield, BarChart3,
  MessageSquare, Heart, Search, Bell, Bookmark,
  TrendingUp, Users, Package, DollarSign, FileText,
  Lock, Eye, Database, Activity, Zap,
  ShoppingCart, CreditCard, Award, Flag, HelpCircle,
  Mail, Phone, MapPin, Info, Cookie, Layout,
  Github, Facebook, Instagram, Send, Share2,
  PlusCircle, Edit, Trash2, Upload, Download,
  RefreshCw, Save, X, Check, AlertCircle,
  Menu, Grid, List, Filter, SortAsc, Tag,
  Calendar, Clock, TrendingDown, BarChart2,
  PieChart, LineChart, Target, Briefcase, Megaphone
} from 'lucide-react';

// Styled Components
const NavigationContainer = styled.div`
  background: #0a0d14;
  border: 2px solid #ff8c61;
  border-radius: 12px;
  margin: 20px;
  margin-top: 40px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 140, 97, 0.1);
`;

const Title = styled.h2`
  color: #ff8c61;
  text-align: center;
  margin-bottom: 24px;
  font-size: 20px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const CategoryContainer = styled.div`
  margin-bottom: 15px;
`;

const CategoryHeader = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.$isOpen ? '#1e2432' : '#141a21'};
  padding: 14px 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.$isOpen ? '#ff8c61' : '#2d3748'};

  &:hover {
    background: #1e2432;
    border-color: #ff8c61;
  }
`;

const CategoryTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #f8fafc;
  font-size: 15px;
  font-weight: 600;

  svg {
    width: 20px;
    height: 20px;
    color: #ff8c61;
  }
`;

const CategoryBadge = styled.span`
  background: #ff8c61;
  color: #0f1419;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
`;

const LinksGrid = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'grid' : 'none'};
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 10px;
  padding: 10px 0;
`;

const LinkButton = styled.button<{ $protected?: boolean; $admin?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #1e2432;
  color: #cbd5e1;
  border: 1px solid #2d3748;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 500;
  text-align: left;
  position: relative;

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    color: #ff8c61;
  }

  &:hover {
    border-color: #ff8c61;
    color: #f8fafc;
    background: #252b3a;
    transform: translateX(4px);
  }
`;

const ProtectionBadge = styled.span<{ $type: 'protected' | 'admin' | 'public' }>`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props =>
    props.$type === 'admin' ? '#ff0000' :
      props.$type === 'protected' ? '#00ff00' :
        '#888'
  };
`;

const SearchContainer = styled.div`
  margin-bottom: 20px;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 45px 14px 18px;
  background: #141a21;
  border: 1px solid #2d3748;
  border-radius: 8px;
  color: #f8fafc;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: #64748b;
  }

  &:focus {
    border-color: #ff8c61;
    background: #1e2432;
    box-shadow: 0 0 15px rgba(255, 140, 97, 0.15);
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #ff8c61;
  width: 18px;
  height: 18px;
`;

const Legend = styled.div`
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #2d3748;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const LegendDot = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.$color};
`;

interface PageLink {
  name: string;
  path: string;
  icon: React.ElementType;
  protected?: boolean;
  admin?: boolean;
}

interface Category {
  name: string;
  icon: React.ElementType;
  links: PageLink[];
}

const QuickLinksNavigation: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState<string[]>(['main', 'user', 'admin']);

  const categories: Category[] = [
    {
      name: 'الصفحات الرئيسية',
      icon: Home,
      links: [
        { name: 'الرئيسية', path: '/', icon: Home },
        { name: 'السيارات', path: '/cars', icon: Car },
        { name: 'عن الموقع', path: '/about', icon: Info },
        { name: 'اتصل بنا', path: '/contact', icon: Mail },
        { name: 'المساعدة', path: '/help', icon: HelpCircle },
        { name: 'خريطة الموقع', path: '/sitemap', icon: Layout },
      ]
    },
    {
      name: 'المصادقة',
      icon: Lock,
      links: [
        { name: 'تسجيل الدخول', path: '/login', icon: Lock },
        { name: 'إنشاء حساب', path: '/register', icon: User },
        { name: 'التحقق', path: '/verification', icon: Check },
      ]
    },
    {
      name: 'صفحات المستخدم',
      icon: User,
      links: [
        { name: 'البروفايل', path: '/profile', icon: User, protected: true },
        { name: 'سياراتي', path: '/my-listings', icon: Car, protected: true },
        { name: 'الرسائل', path: '/messages', icon: MessageSquare, protected: true },
        { name: 'المفضلة', path: '/favorites', icon: Heart, protected: true },
        { name: 'الإشعارات', path: '/notifications', icon: Bell, protected: true },
        { name: 'البحث المحفوظ', path: '/saved-searches', icon: Bookmark, protected: true },
        { name: 'لوحة التحكم', path: '/dashboard', icon: BarChart3, protected: true },
      ]
    },
    {
      name: 'بيع السيارات',
      icon: ShoppingCart,
      links: [
        { name: 'بيع سيارة (Modal)', path: '/sell/auto', icon: PlusCircle, protected: true },
        { name: 'صفحة البداية (Hero)', path: '/sell', icon: Car, protected: true },
        // ⚠️ Routes القديمة - تُعيد التوجيه تلقائياً للـ Modal
        { name: 'بيانات المركبة (Step 1)', path: '/sell/inserat/car/data', icon: Database, protected: true },
        { name: 'التجهيزات (Step 2)', path: '/sell/inserat/car/equipment', icon: Package, protected: true },
        { name: 'الصور (Step 3)', path: '/sell/inserat/car/images', icon: Upload, protected: true },
        { name: 'السعر (Step 4)', path: '/sell/inserat/car/pricing', icon: DollarSign, protected: true },
        { name: 'بيانات الاتصال (Step 5)', path: '/sell/inserat/car/contact', icon: Phone, protected: true },
      ]
    },
    {
      name: 'البحث والتصفح',
      icon: Search,
      links: [
        { name: 'البحث المتقدم', path: '/advanced-search', icon: Search, protected: true },
        { name: 'العلامات الرائجة', path: '/top-brands', icon: TrendingUp },
        { name: 'معرض العلامات', path: '/brand-gallery', icon: Grid, protected: true },
        { name: 'التجار', path: '/dealers', icon: Briefcase, protected: true },
        { name: 'التمويل', path: '/finance', icon: CreditCard, protected: true },
      ]
    },
    {
      name: 'الإدارة',
      icon: Shield,
      links: [
        { name: 'تسجيل دخول الإدارة', path: '/admin-login', icon: Lock },
        { name: 'لوحة الإدارة', path: '/admin', icon: Shield, admin: true },
        { name: 'تسجيل دخول السوبر أدمن', path: '/super-admin-login', icon: Lock },
        { name: 'لوحة السوبر أدمن', path: '/super-admin', icon: Shield, admin: true },
        { name: 'إدارة الإعلانات', path: '/super-admin?tab=ads', icon: Target, admin: true },
        { name: 'صفحة اختبار الإعلانات', path: '/debug/ads', icon: Activity, admin: true },
      ]
    },
    {
      name: 'الصفحات المتقدمة',
      icon: Activity,
      links: [
        { name: 'تحليلات B2B', path: '/analytics', icon: BarChart2, protected: true },
        { name: 'التوأم الرقمي', path: '/digital-twin', icon: Zap, protected: true },
        { name: 'الاشتراكات', path: '/subscription', icon: Award, protected: true },
      ]
    },
    {
      name: 'الصفحات القانونية',
      icon: FileText,
      links: [
        { name: 'سياسة الخصوصية', path: '/privacy-policy', icon: Eye },
        { name: 'شروط الخدمة', path: '/terms-of-service', icon: FileText },
        { name: 'حذف البيانات', path: '/data-deletion', icon: Trash2 },
        { name: 'سياسة الكوكيز', path: '/cookie-policy', icon: Cookie },
      ]
    },
    {
      name: 'صفحات الاختبار',
      icon: Activity,
      links: [
        { name: 'اختبار الثيم', path: '/theme-test', icon: Activity },
        { name: 'اختبار الخلفية', path: '/background-test', icon: Layout },
        { name: 'عرض شامل', path: '/full-demo', icon: Grid },
        { name: 'اختبار التأثيرات', path: '/effects-test', icon: Zap },
      ]
    },
  ];

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleNavigate = (path: string) => {
    window.open(path, '_blank');
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    links: category.links.filter(link =>
      link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.path.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.links.length > 0);

  return (
    <NavigationContainer>
      <Title>🚀 جميع صفحات المشروع</Title>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="ابحث عن صفحة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon />
      </SearchContainer>

      {filteredCategories.map((category) => (
        <CategoryContainer key={category.name}>
          <CategoryHeader
            $isOpen={openCategories.includes(category.name)}
            onClick={() => toggleCategory(category.name)}
          >
            <CategoryTitle>
              <category.icon />
              <span>{category.name}</span>
            </CategoryTitle>
            <CategoryBadge>{category.links.length}</CategoryBadge>
          </CategoryHeader>

          <LinksGrid $isOpen={openCategories.includes(category.name)}>
            {category.links.map((link) => (
              <LinkButton
                key={link.path}
                onClick={() => handleNavigate(link.path)}
                $protected={link.protected}
                $admin={link.admin}
                title={`${link.name} - ${link.path}`}
              >
                <link.icon />
                <span>{link.name}</span>
                <ProtectionBadge
                  $type={link.admin ? 'admin' : link.protected ? 'protected' : 'public'}
                />
              </LinkButton>
            ))}
          </LinksGrid>
        </CategoryContainer>
      ))}

      <Legend>
        <LegendItem>
          <LegendDot $color="#888" />
          <span>صفحات عامة</span>
        </LegendItem>
        <LegendItem>
          <LegendDot $color="#00ff00" />
          <span>صفحات محمية</span>
        </LegendItem>
        <LegendItem>
          <LegendDot $color="#ff0000" />
          <span>صفحات إدارية</span>
        </LegendItem>
      </Legend>
    </NavigationContainer>
  );
};

export default QuickLinksNavigation;

