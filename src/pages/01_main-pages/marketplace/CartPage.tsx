import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../hooks/useAuth';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader } from 'lucide-react';
import { cartService, CartItem } from '../../../services/marketplace/cart.service';
import { logger } from '../../../services/logger-service';

const CartPage: React.FC = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  const texts = {
    bg: {
      title: 'Моята количка',
      empty: 'Вашата количка е празна',
      continueShopping: 'Продължи пазаруването',
      remove: 'Премахни',
      subtotal: 'Междинна сума',
      shipping: 'Доставка',
      tax: 'ДДС (20%)',
      total: 'Общо',
      proceedToCheckout: 'Продължи към плащане',
      outOfStock: 'Няма наличност',
      bgn: 'лв',
      freeShipping: 'Безплатна',
      loadError: 'Грешка при зареждане на количката',
      updateError: 'Грешка при обновяване',
      loginToCheckout: 'Влезте за да продължите',
    },
    en: {
      title: 'My Cart',
      empty: 'Your cart is empty',
      continueShopping: 'Continue Shopping',
      remove: 'Remove',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'VAT (20%)',
      total: 'Total',
      proceedToCheckout: 'Proceed to Checkout',
      outOfStock: 'Out of Stock',
      bgn: 'BGN',
      freeShipping: 'Free',
      loadError: 'Error loading cart',
      updateError: 'Error updating cart',
      loginToCheckout: 'Login to checkout',
    },
  };

  const t = texts[language] || texts.bg;

  // Load cart on mount and subscribe to changes
  useEffect(() => {
    loadCart();
    
    // Subscribe to cart changes
    const unsubscribe = cartService.subscribe(() => {
      if (!isInitialLoad.current) {
        setCartItems(cartService.getItems());
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Sync cart with Firestore when user logs in
  useEffect(() => {
    if (user) {
      cartService.syncWithFirestore(user.uid).catch((err) => {
        logger.error('Failed to sync cart with Firestore', err);
      });
    }
  }, [user]);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize cart service
      await cartService.loadCart();
      
      // If user is logged in, sync with Firestore
      if (user) {
        await cartService.syncWithFirestore(user.uid);
      }
      
      setCartItems(cartService.getItems());
      isInitialLoad.current = false;
    } catch (err) {
      logger.error('Failed to load cart', err as Error);
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }, [user, t.loadError]);

  const updateQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(itemId);
      await cartService.updateItemQuantity(itemId, newQuantity);
      setCartItems(cartService.getItems());
    } catch (err) {
      logger.error('Failed to update quantity', err as Error);
      setError(t.updateError);
    } finally {
      setUpdating(null);
    }
  }, [t.updateError]);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      setUpdating(itemId);
      await cartService.removeItem(itemId);
      setCartItems(cartService.getItems());
    } catch (err) {
      logger.error('Failed to remove item', err as Error);
      setError(t.updateError);
    } finally {
      setUpdating(null);
    }
  }, [t.updateError]);

  const getSummary = useCallback(() => {
    return cartService.getCartSummary();
  }, []);

  const handleCheckout = useCallback(() => {
    if (!user) {
      navigate('/login', { state: { from: '/marketplace/checkout' } });
      return;
    }
    
    const validation = cartService.validateForCheckout();
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }
    
    navigate('/marketplace/checkout');
  }, [user, navigate]);

  // Loading state
  if (loading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <LoadingState>
            <Loader size={48} className="spinner" />
          </LoadingState>
        </ContentWrapper>
      </PageContainer>
    );
  }

  // Error message component
  const ErrorMessage = error ? (
    <ErrorBanner onClick={() => setError(null)}>
      {error}
    </ErrorBanner>
  ) : null;

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <PageContainer>
        <ContentWrapper>
          {ErrorMessage}
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

  const summary = getSummary();

  return (
    <PageContainer>
      <ContentWrapper>
        {ErrorMessage}
        <Title>{t.title}</Title>

        <CartGrid>
          <ItemsSection>
            {cartItems.map(item => (
              <CartItemCard key={item.id} $disabled={updating === item.id}>
                <ItemImage>
                  <img src={item.image} alt={item.title} loading="lazy" width={100} height={100} />
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
                      disabled={!item.inStock || updating === item.id}
                    >
                      <Minus size={16} />
                    </QuantityButton>
                    <QuantityDisplay>
                      {updating === item.id ? <Loader size={14} className="spinner" /> : item.quantity}
                    </QuantityDisplay>
                    <QuantityButton
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={!item.inStock || updating === item.id}
                    >
                      <Plus size={16} />
                    </QuantityButton>
                  </QuantityControl>
                  <RemoveButton 
                    onClick={() => removeItem(item.id)}
                    disabled={updating === item.id}
                  >
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
                <SummaryValue>{summary.subtotal.toFixed(2)} {t.bgn}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>{t.shipping}:</SummaryLabel>
                <SummaryValue>
                  {summary.shipping === 0 ? t.freeShipping : `${summary.shipping.toFixed(2)} ${t.bgn}`}
                </SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>{t.tax}:</SummaryLabel>
                <SummaryValue>{summary.tax.toFixed(2)} {t.bgn}</SummaryValue>
              </SummaryRow>
              <Divider />
              <SummaryRow $bold>
                <SummaryLabel>{t.total}:</SummaryLabel>
                <SummaryValue>{summary.total.toFixed(2)} {t.bgn}</SummaryValue>
              </SummaryRow>
              <CheckoutButton 
                onClick={handleCheckout}
                disabled={!!updating}
              >
                {!user ? t.loginToCheckout : t.proceedToCheckout}
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

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorBanner = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  cursor: pointer;
  text-align: center;
  
  &:hover {
    background: #fecaca;
  }
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

const CartItemCard = styled.div<{ $disabled?: boolean }>`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1.5rem;
  align-items: center;
  opacity: ${props => props.$disabled ? 0.6 : 1};
  pointer-events: ${props => props.$disabled ? 'none' : 'auto'};
  transition: opacity 0.2s;

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
