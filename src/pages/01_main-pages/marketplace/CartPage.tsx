import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../hooks/useAuth';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartItem {
  id: string;
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  inStock: boolean;
}

const CartPage: React.FC = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const texts = {
    bg: {
      title: 'Моята количка',
      empty: 'Вашата количка е празна',
      continueShopping: 'Продължи пазаруването',
      remove: 'Премахни',
      subtotal: 'Междинна сума',
      shipping: 'Доставка',
      total: 'Общо',
      proceedToCheckout: 'Продължи към плащане',
      outOfStock: 'Няма наличност',
      bgn: 'лв',
    },
    en: {
      title: 'My Cart',
      empty: 'Your cart is empty',
      continueShopping: 'Continue Shopping',
      remove: 'Remove',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      total: 'Total',
      proceedToCheckout: 'Proceed to Checkout',
      outOfStock: 'Out of Stock',
      bgn: 'BGN',
    },
  };

  const t = texts[language] || texts.bg;

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    // TODO: Load from localStorage or API
    setLoading(false);
    // Mock data for demo
    setCartItems([]);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateShipping = () => {
    return cartItems.length > 0 ? 5 : 0; // Flat rate
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/marketplace/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <PageContainer>
        <ContentWrapper>
          <EmptyState>
            <ShoppingBag size={80} color={theme?.colors?.textSecondary || '#999'} />
            <EmptyTitle>{t.empty}</EmptyTitle>
            <ContinueButton onClick={() => navigate('/marketplace')}>
              {t.continueShopping}
            </ContinueButton>
          </EmptyState>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <Title>{t.title}</Title>

        <CartGrid>
          <ItemsSection>
            {cartItems.map(item => (
              <CartItemCard key={item.id}>
                <ItemImage>
                  <img src={item.image} alt={item.title} />
                </ItemImage>
                <ItemInfo>
                  <ItemTitle onClick={() => navigate(`/marketplace/product/${item.productId}`)}>
                    {item.title}
                  </ItemTitle>
                  <ItemPrice>{item.price.toFixed(2)} {t.bgn}</ItemPrice>
                  {!item.inStock && <OutOfStockBadge>{t.outOfStock}</OutOfStockBadge>}
                </ItemInfo>
                <ItemActions>
                  <QuantityControl>
                    <QuantityButton
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={!item.inStock}
                    >
                      <Minus size={16} />
                    </QuantityButton>
                    <QuantityDisplay>{item.quantity}</QuantityDisplay>
                    <QuantityButton
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={!item.inStock}
                    >
                      <Plus size={16} />
                    </QuantityButton>
                  </QuantityControl>
                  <RemoveButton onClick={() => removeItem(item.id)}>
                    <Trash2 size={18} />
                    {t.remove}
                  </RemoveButton>
                </ItemActions>
              </CartItemCard>
            ))}
          </ItemsSection>

          <SummarySection>
            <SummaryCard>
              <SummaryTitle>{t.total}</SummaryTitle>
              <SummaryRow>
                <SummaryLabel>{t.subtotal}:</SummaryLabel>
                <SummaryValue>{calculateSubtotal().toFixed(2)} {t.bgn}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>{t.shipping}:</SummaryLabel>
                <SummaryValue>{calculateShipping().toFixed(2)} {t.bgn}</SummaryValue>
              </SummaryRow>
              <Divider />
              <SummaryRow $bold>
                <SummaryLabel>{t.total}:</SummaryLabel>
                <SummaryValue>{calculateTotal().toFixed(2)} {t.bgn}</SummaryValue>
              </SummaryRow>
              <CheckoutButton onClick={handleCheckout}>
                {t.proceedToCheckout}
                <ArrowRight size={20} />
              </CheckoutButton>
            </SummaryCard>
          </SummarySection>
        </CartGrid>
      </ContentWrapper>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || '#f8f9fa'};
  padding: 2rem 1rem;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme?.colors?.text || '#333'};
  margin-bottom: 2rem;
`;

const CartGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const ItemsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CartItemCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1.5rem;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 80px 1fr;
    gap: 1rem;
  }
`;

const ItemImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemTitle = styled.h3`
  font-size: 1.1rem;
  color: ${props => props.theme?.colors?.text || '#333'};
  margin-bottom: 0.5rem;
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme?.colors?.primary?.main || '#007bff'};
  }
`;

const ItemPrice = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.theme?.colors?.primary?.main || '#007bff'};
`;

const OutOfStockBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #fee;
  color: #c00;
  border-radius: 4px;
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

const ItemActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-end;

  @media (max-width: 768px) {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
  }
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${props => props.theme?.colors?.border || '#ddd'};
  border-radius: 8px;
  overflow: hidden;
`;

const QuantityButton = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #f0f0f0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.div`
  width: 50px;
  text-align: center;
  font-weight: 500;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

const SummarySection = styled.div``;

const SummaryCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  position: sticky;
  top: 2rem;
`;

const SummaryTitle = styled.h2`
  font-size: 1.5rem;
  color: ${props => props.theme?.colors?.text || '#333'};
  margin-bottom: 1.5rem;
`;

const SummaryRow = styled.div<{ $bold?: boolean }>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-weight: ${props => props.$bold ? '600' : '400'};
  font-size: ${props => props.$bold ? '1.2rem' : '1rem'};
`;

const SummaryLabel = styled.span`
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
`;

const SummaryValue = styled.span`
  color: ${props => props.theme?.colors?.text || '#333'};
`;

const Divider = styled.hr`
  border: none;
  border-top: 2px solid ${props => props.theme?.colors?.border || '#eee'};
  margin: 1.5rem 0;
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${props => props.theme?.colors?.primary?.main || '#007bff'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme?.colors?.primary?.dark || '#0056b3'};
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 2rem;
`;

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  color: ${props => props.theme?.colors?.textSecondary || '#999'};
`;

const ContinueButton = styled.button`
  padding: 1rem 2rem;
  background: ${props => props.theme?.colors?.primary?.main || '#007bff'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme?.colors?.primary?.dark || '#0056b3'};
  }
`;

export default CartPage;
