import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../hooks/useAuth';
import { marketplaceProductService } from '../../../services/marketplace/marketplace-product.service';
import { Product, ProductReview } from '../../../types/marketplace.types';
import { serviceLogger } from '../../../services/logger-service';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Star, ShoppingCart, Heart, Share2, MapPin, Truck, Shield, Package } from 'lucide-react';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);

  const texts = {
    bg: {
      loading: 'Зареждане...',
      notFound: 'Продуктът не е намерен',
      backToMarketplace: 'Обратно към Marketplace',
      addToCart: 'Добави в количката',
      buyNow: 'Купи сега',
      addToWishlist: 'Добави към желани',
      removeFromWishlist: 'Премахни от желани',
      shareProduct: 'Сподели продукт',
      inStock: 'В наличност',
      outOfStock: 'Изчерпан',
      lowStock: 'Ограничена наличност',
      quantity: 'Количество',
      price: 'Цена',
      condition: 'Състояние',
      new: 'Ново',
      used: 'Употребявано',
      refurbished: 'Реновирано',
      category: 'Категория',
      brand: 'Марка',
      compatibility: 'Съвместимост',
      description: 'Описание',
      specifications: 'Спецификации',
      shipping: 'Доставка',
      freeShipping: 'Безплатна доставка',
      shippingCost: 'Цена на доставка',
      estimatedDelivery: 'Очаквана доставка',
      sellerInfo: 'Информация за продавача',
      views: 'Прегледи',
      sales: 'Продажби',
      rating: 'Оценка',
      reviews: 'Отзиви',
      dropshipping: 'Дропшипинг продукт',
      writeReview: 'Напиши отзив',
    },
    en: {
      loading: 'Loading...',
      notFound: 'Product not found',
      backToMarketplace: 'Back to Marketplace',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      addToWishlist: 'Add to Wishlist',
      removeFromWishlist: 'Remove from Wishlist',
      shareProduct: 'Share Product',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      lowStock: 'Limited Stock',
      quantity: 'Quantity',
      price: 'Price',
      condition: 'Condition',
      new: 'New',
      used: 'Used',
      refurbished: 'Refurbished',
      category: 'Category',
      brand: 'Brand',
      compatibility: 'Compatibility',
      description: 'Description',
      specifications: 'Specifications',
      shipping: 'Shipping',
      freeShipping: 'Free Shipping',
      shippingCost: 'Shipping Cost',
      estimatedDelivery: 'Estimated Delivery',
      sellerInfo: 'Seller Information',
      views: 'Views',
      sales: 'Sales',
      rating: 'Rating',
      reviews: 'Reviews',
      dropshipping: 'Dropshipping Product',
      writeReview: 'Write a Review',
    },
  };

  const t = texts[language] || texts.bg;

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await marketplaceProductService.getProduct(productId);
      setProduct(data);
    } catch (error) {
      serviceLogger.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // TODO: Implement cart service integration
    alert('Cart functionality coming soon!');
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // TODO: Navigate to checkout with this product
    navigate('/marketplace/checkout', { state: { productId, quantity } });
  };

  const toggleWishlist = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // TODO: Implement wishlist service
    setInWishlist(!inWishlist);
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.title,
          text: product.shortDescription,
          url: window.location.href,
        });
      } catch (error) {
        serviceLogger.error('Error sharing:', error);
      }
    } else {
      // Fallback: Copy link
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'new':
        return t.new;
      case 'used':
        return t.used;
      case 'refurbished':
        return t.refurbished;
      default:
        return condition;
    }
  };

  const getStockStatus = () => {
    if (!product) return null;
    if (product.inventory.quantity === 0) {
      return <StockBadge $color="#e74c3c">{t.outOfStock}</StockBadge>;
    }
    if (product.inventory.quantity < 5) {
      return <StockBadge $color="#f39c12">{t.lowStock} ({product.inventory.quantity})</StockBadge>;
    }
    return <StockBadge $color="#27ae60">{t.inStock}</StockBadge>;
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <p>{t.loading}</p>
      </LoadingContainer>
    );
  }

  if (!product) {
    return (
      <NotFoundContainer>
        <h2>{t.notFound}</h2>
        <BackButton onClick={() => navigate('/marketplace')}>{t.backToMarketplace}</BackButton>
      </NotFoundContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <ProductGrid>
          {/* Image Gallery */}
          <ImageSection>
            <MainImage>
              <img
                src={product.images[selectedImage] || '/placeholder-product.jpg'}
                alt={product.title}
              />
            </MainImage>
            <ThumbnailGrid>
              {product.images.map((img, idx) => (
                <Thumbnail
                  key={idx}
                  $active={selectedImage === idx}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={img} alt={`${product.title} ${idx + 1}`} />
                </Thumbnail>
              ))}
            </ThumbnailGrid>
          </ImageSection>

          {/* Product Info */}
          <InfoSection>
            <Header>
              <Title>{product.title}</Title>
              <ActionButtons>
                <IconButton onClick={toggleWishlist} $active={inWishlist}>
                  <Heart fill={inWishlist ? '#e74c3c' : 'none'} color={inWishlist ? '#e74c3c' : theme?.colors?.text || '#333'} />
                </IconButton>
                <IconButton onClick={handleShare}>
                  <Share2 />
                </IconButton>
              </ActionButtons>
            </Header>

            <MetaInfo>
              <Rating>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < Math.round(product.rating?.average || 0) ? '#f39c12' : 'none'}
                    color="#f39c12"
                  />
                ))}
                <span>
                  {product.rating?.average?.toFixed(1) || '0.0'} ({product.rating?.count || 0} {t.reviews})
                </span>
              </Rating>
              <MetaItem>
                <Package size={16} />
                {product.views} {t.views} • {product.sales} {t.sales}
              </MetaItem>
            </MetaInfo>

            <PriceSection>
              <Price>{product.pricing.price.toFixed(2)} BGN</Price>
              {getStockStatus()}
            </PriceSection>

            {product.shortDescription && (
              <ShortDesc>{product.shortDescription}</ShortDesc>
            )}

            <InfoGrid>
              <InfoItem>
                <Label>{t.condition}:</Label>
                <Value>{getConditionText(product.condition)}</Value>
              </InfoItem>
              {product.brand && (
                <InfoItem>
                  <Label>{t.brand}:</Label>
                  <Value>{product.brand}</Value>
                </InfoItem>
              )}
              {product.compatibility && product.compatibility.length > 0 && (
                <InfoItem>
                  <Label>{t.compatibility}:</Label>
                  <Value>{product.compatibility.join(', ')}</Value>
                </InfoItem>
              )}
            </InfoGrid>

            <ShippingInfo>
              <Truck size={20} />
              <div>
                {product.shipping.isFreeShipping ? (
                  <strong>{t.freeShipping}</strong>
                ) : (
                  <span>
                    {t.shippingCost}: {product.shipping.cost.toFixed(2)} BGN
                  </span>
                )}
                {product.shipping.estimatedDays && (
                  <SmallText>
                    {t.estimatedDelivery}: {product.shipping.estimatedDays} {language === 'bg' ? 'дни' : 'days'}
                  </SmallText>
                )}
              </div>
            </ShippingInfo>

            {product.inventory.quantity > 0 && (
              <QuantitySection>
                <Label>{t.quantity}:</Label>
                <QuantityControl>
                  <QuantityButton
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </QuantityButton>
                  <QuantityDisplay>{quantity}</QuantityDisplay>
                  <QuantityButton
                    onClick={() => setQuantity(Math.min(product.inventory.quantity, quantity + 1))}
                  >
                    +
                  </QuantityButton>
                </QuantityControl>
              </QuantitySection>
            )}

            <ActionSection>
              <PrimaryButton onClick={handleBuyNow} disabled={product.inventory.quantity === 0}>
                {t.buyNow}
              </PrimaryButton>
              <SecondaryButton onClick={handleAddToCart} disabled={product.inventory.quantity === 0}>
                <ShoppingCart size={20} />
                {t.addToCart}
              </SecondaryButton>
            </ActionSection>

            {product.isDropship && (
              <DropshipBadge>
                <Shield size={16} />
                {t.dropshipping}
              </DropshipBadge>
            )}
          </InfoSection>
        </ProductGrid>

        {/* Tabs Section */}
        <TabsSection>
          <Tab $active={true}>{t.description}</Tab>
          <Tab $active={false}>{t.specifications}</Tab>
          <Tab $active={false}>{t.reviews} ({product.rating?.count || 0})</Tab>
        </TabsSection>

        <TabContent>
          <Section>
            <SectionTitle>{t.description}</SectionTitle>
            <Description>{product.description}</Description>
          </Section>

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <Section>
              <SectionTitle>{t.specifications}</SectionTitle>
              <SpecTable>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <SpecRow key={key}>
                    <SpecKey>{key}</SpecKey>
                    <SpecValue>{value}</SpecValue>
                  </SpecRow>
                ))}
              </SpecTable>
            </Section>
          )}
        </TabContent>
      </ContentWrapper>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${(props) => props.theme?.colors?.background || '#f8f9fa'};
  padding: 2rem 1rem;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ImageSection = styled.div``;

const MainImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
`;

const Thumbnail = styled.div<{ $active: boolean }>`
  aspect-ratio: 1;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${(props) => (props.$active ? props.theme?.colors?.primary?.main || '#007bff' : 'transparent')};
  transition: all 0.2s;

  &:hover {
    border-color: ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const InfoSection = styled.div``;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  color: ${(props) => props.theme?.colors?.text || '#333'};
  margin: 0;
  flex: 1;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button<{ $active?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid ${(props) => props.theme?.colors?.border || '#ddd'};
  background: ${(props) => (props.$active ? 'rgba(231, 76, 60, 0.1)' : 'white')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme?.colors?.hover || '#f0f0f0'};
  }
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span {
    font-size: 0.9rem;
    color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
`;

const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
`;

const Price = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
`;

const StockBadge = styled.span<{ $color: string }>`
  padding: 0.5rem 1rem;
  background: ${(props) => props.$color}15;
  color: ${(props) => props.$color};
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ShortDesc = styled.p`
  color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
  line-height: 1.6;
  margin: 1rem 0;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 0.75rem;
  margin: 1.5rem 0;
`;

const InfoItem = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
`;

const Label = styled.span`
  font-weight: 500;
  color: ${(props) => props.theme?.colors?.text || '#333'};
`;

const Value = styled.span`
  color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
`;

const ShippingInfo = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 8px;
  margin: 1.5rem 0;
  color: #27ae60;
`;

const SmallText = styled.div`
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

const QuantitySection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${(props) => props.theme?.colors?.border || '#ddd'};
  border-radius: 8px;
  overflow: hidden;
`;

const QuantityButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: white;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.2s;

  &:hover {
    background: ${(props) => props.theme?.colors?.hover || '#f0f0f0'};
  }
`;

const QuantityDisplay = styled.div`
  width: 60px;
  text-align: center;
  font-weight: 500;
`;

const ActionSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 2rem 0;
`;

const PrimaryButton = styled.button`
  padding: 1rem 2rem;
  background: ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${(props) => props.theme?.colors?.primary?.dark || '#0056b3'};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  padding: 1rem 2rem;
  background: white;
  color: ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
  border: 2px solid ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DropshipBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-top: 1rem;
`;

const TabsSection = styled.div`
  display: flex;
  gap: 2rem;
  border-bottom: 2px solid ${(props) => props.theme?.colors?.border || '#ddd'};
  margin-bottom: 2rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 1rem 0;
  background: none;
  border: none;
  border-bottom: 2px solid ${(props) => (props.$active ? props.theme?.colors?.primary?.main || '#007bff' : 'transparent')};
  color: ${(props) => (props.$active ? props.theme?.colors?.primary?.main || '#007bff' : props.theme?.colors?.textSecondary || '#666')};
  font-weight: ${(props) => (props.$active ? '600' : '400')};
  cursor: pointer;
  margin-bottom: -2px;
`;

const TabContent = styled.div``;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: ${(props) => props.theme?.colors?.text || '#333'};
  margin-bottom: 1rem;
`;

const Description = styled.div`
  color: ${(props) => props.theme?.colors?.text || '#333'};
  line-height: 1.8;
  white-space: pre-wrap;
`;

const SpecTable = styled.div`
  border: 1px solid ${(props) => props.theme?.colors?.border || '#ddd'};
  border-radius: 8px;
  overflow: hidden;
`;

const SpecRow = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  border-bottom: 1px solid ${(props) => props.theme?.colors?.border || '#ddd'};

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SpecKey = styled.div`
  padding: 1rem;
  background: ${(props) => props.theme?.colors?.hover || '#f8f9fa'};
  font-weight: 500;
  color: ${(props) => props.theme?.colors?.text || '#333'};
`;

const SpecValue = styled.div`
  padding: 1rem;
  color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
`;

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 2rem;

  h2 {
    color: ${(props) => props.theme?.colors?.text || '#333'};
  }
`;

const BackButton = styled.button`
  padding: 1rem 2rem;
  background: ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme?.colors?.primary?.dark || '#0056b3'};
  }
`;

export default ProductDetailPage;
