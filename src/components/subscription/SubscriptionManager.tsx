import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Crown, TrendingUp, Building2, CheckCircle, Zap, Shield, Sparkles, Star, Car, Bot, TrendingUp as ChartUp, Target, Lightbulb, Users, MapPin, Plug, Palette, UserCog, Link2, FileText, Phone, CheckSquare, Camera, MessageSquare, Search, Image, Battery, BadgeCheck, BarChart3, Edit3, Headphones, Calendar, CalendarCheck, Eye, ArrowRight, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import billingService from '../../features/billing/BillingService';
import type { BillingInterval, Plan } from '../../features/billing/types';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
// ✅ استيراد ملف الإعدادات المركزي
import subscriptionTheme, { getPrimaryGradient, getPrimaryGradientWithMiddle, getShadowColor, getBorderColor } from './subscription-theme';
import { logger } from '../../services/logger-service';

// Import modular styles
import {
  Container,
  Header,
  Title,
  Subtitle,
  PlansCarousel,
  PlansViewport,
  CarouselItem,
  ExpandOverlay,
  ExpandSheet,
  ExpandHint,
} from './SubscriptionManager.styles/layout';

import {
  Card,
  Badge,
  IconWrapper,
  PlanName,
  PlanDescription,
  Price,
  FeatureList,
  FeatureItem,
  Button,
  MoneyBackGuarantee,
  PopularityIndicator,
} from './SubscriptionManager.styles/cards';

import {
  IntervalToggle,
  IntervalButton,
  SavingsBadge,
  CarouselArrow,
} from './SubscriptionManager.styles/controls';

// ==================== COMPONENT ====================
const SubscriptionManagerEnhanced: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();

  const isBg = language === 'bg';
  const plans = useMemo(() => billingService.getAvailablePlans(), []);

  // ✅ Carousel state (mobile/tablet): keep cards horizontal + arrows
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // ✅ Tap-to-expand state (mobile)
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const isCoarsePointer = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(pointer: coarse)').matches ?? false;
  }, []);

  const updateScrollState = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 4);
  }, []);

  const scrollByOneCard = useCallback((direction: 'left' | 'right') => {
    const el = viewportRef.current;
    if (!el) return;
    // ✅ Scroll by "one page" on mobile (full viewport), otherwise by one card
    const isMobile = window.matchMedia?.('(max-width: 600px)').matches ?? false;
    const delta = isMobile
      ? el.clientWidth * (direction === 'left' ? -1 : 1)
      : (360 + 32) * (direction === 'left' ? -1 : 1); // card + gap
    el.scrollBy({ left: delta, behavior: 'smooth' });
  }, []);

  const closeExpanded = useCallback(() => setExpandedPlanId(null), []);
  const getFeaturesList = (planId: string) => {
    switch (planId) {
      case 'private':
        return [
          { icon: <Car size={18} />, text: isBg ? 'До 3 безплатни обяви/месец' : 'Up to 3 listings/month' },
          { icon: <Edit3 size={18} />, text: isBg ? 'Без редакция на Марка/Модел' : 'No Make/Model editing' },
          { icon: <Check size={18} />, text: isBg ? 'Стандартна видимост' : 'Standard visibility' },
          { icon: <Check size={18} />, text: isBg ? 'Чат с купувачи' : 'Chat with buyers' },
        ];
      case 'dealer':
        return [
          { icon: <Car size={18} />, text: isBg ? 'До 25 обяви/месец' : 'Up to 25 listings/month' },
          { icon: <Edit3 size={18} />, text: isBg ? 'Редакция на 10 обяви (Марка/Модел)' : 'Edit Make/Model (10 listings)' },
          { icon: <Check size={18} />, text: isBg ? 'Значка "Проверен търговец"' : 'Verified Dealer Badge' },
          { icon: <Check size={18} />, text: isBg ? 'Приоритетна поддръжка' : 'Priority Support' },
          { icon: <Check size={18} />, text: isBg ? 'Разширени статистики' : 'Advanced Analytics' },
        ];
      case 'company':
        return [
          { icon: <Car size={18} />, text: isBg ? 'До 200 обяви/месец' : 'Up to 200 listings/month' },
          { icon: <Edit3 size={18} />, text: isBg ? 'Неограничена редакция (Марка/Модел)' : 'Unlimited Make/Model editing' },
          { icon: <Check size={18} />, text: isBg ? 'Всички екстри на Търговец' : 'All Dealer features' },
          { icon: <Check size={18} />, text: isBg ? 'Премиум видимост' : 'Premium Visibility' },
          { icon: <Check size={18} />, text: isBg ? 'API достъп (по заявка)' : 'API Access (on request)' },
        ];
      default:
        return [];
    }
  };

  const onOverlayTouchStart = useCallback((e: React.TouchEvent) => {
    const t0 = e.touches?.[0];
    if (!t0) return;
    touchStartRef.current = { x: t0.clientX, y: t0.clientY };
  }, []);

  const onOverlayTouchMove = useCallback((e: React.TouchEvent) => {
    // ✅ Any small movement closes (as requested)
    const t0 = e.touches?.[0];
    const start = touchStartRef.current;
    if (!t0 || !start) return;
    const dx = Math.abs(t0.clientX - start.x);
    const dy = Math.abs(t0.clientY - start.y);
    if (dx > 6 || dy > 6) {
      closeExpanded();
    }
  }, [closeExpanded]);

  // Load current subscription
  useEffect(() => {
    const loadSubscription = async () => {
      if (currentUser) {
        const subscription = await billingService.getCurrentSubscription(currentUser.uid);
        if (subscription) {
          setCurrentPlan(subscription.planId);
        }
      }
    };
    loadSubscription();
  }, [currentUser]);

  // Keep carousel arrow state in sync with scroll/resize/interval changes
  useEffect(() => {
    updateScrollState();
    const el = viewportRef.current;
    if (!el) return;

    const onScroll = () => updateScrollState();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, interval]);

  // Close expanded on Escape (desktop/dev convenience)
  useEffect(() => {
    if (!expandedPlanId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeExpanded();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [expandedPlanId, closeExpanded]);

  const handleSubscribe = async (plan: Plan) => {
    if (!currentUser) {
      alert(isBg ? 'Моля, влезте в профила си' : 'Please log in first');
      return;
    }

    if (plan.id === 'free') {
      alert(isBg ? 'Това е безплатният план' : 'This is the free plan');
      return;
    }

    setLoading(true);
    try {
      const { url } = await billingService.createCheckoutSession(
        currentUser.uid,
        plan.id as any,
        interval
      );

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error: unknown) {
      logger.error('Subscription error:', error as Error);
      alert(isBg
        ? 'Грешка при създаване на сесия. Опитайте отново.'
        : 'Error creating checkout session. Please try again.'
      );
      setLoading(false);
    }
  };





  const getPlanIcon = (planId: string) => {
    if (planId === 'free') return Crown;
    if (planId === 'dealer') return TrendingUp;
    return Building2;
  };

  const getPlanColor = (planId: string) => {
    if (planId === 'free') return 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)';
    if (planId === 'dealer') return `linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)`;
    return 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)';
  };

  const getOriginalPrice = (planId: string, interval: BillingInterval) => {
    if (planId === 'free') return null;
    if (interval === 'monthly') return null;

    if (planId === 'dealer') {
      return '€348'; // 29 * 12 = 348, now 300 (save 48)
    }
    if (planId === 'company') {
      return '€2,388'; // 199 * 12 = 2388, now 1600 (save 788)
    }
    return null;
  };

  return (
    <Container>
      {/* Header */}
      <Header>
        <Title>
          {isBg ? 'Изберете вашия план' : 'Choose Your Plan'}
        </Title>
        <Subtitle>
          {isBg
            ? 'Продавайте повече автомобили с нашите професионални инструменти и AI анализи'
            : 'Sell more cars with our professional tools and AI analytics'
          }
        </Subtitle>
      </Header>

      {/* Interval Toggle */}
      <IntervalToggle>
        <IntervalButton
          $active={interval === 'monthly'}
          onClick={() => setInterval('monthly')}
        >
          <Calendar size={18} />
          {isBg ? 'Месечно' : 'Monthly'}
        </IntervalButton>
        <IntervalButton
          $active={interval === 'annual'}
          onClick={() => setInterval('annual')}
        >
          <CalendarCheck size={18} />
          {isBg ? 'Годишно' : 'Annual'}
          {interval === 'annual' && (
            <SavingsBadge>
              {isBg ? 'Спести до 33%' : 'Save up to 33%'}
            </SavingsBadge>
          )}
        </IntervalButton>
      </IntervalToggle>

      {/* Plans (always horizontal; carousel + arrows on small widths) */}
      <PlansCarousel>
        {/* ✅ Expanded mobile view */}
        <ExpandOverlay
          $open={!!expandedPlanId}
          onClick={closeExpanded}
          onTouchStart={onOverlayTouchStart}
          onTouchMove={onOverlayTouchMove}
          role="dialog"
          aria-modal="true"
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ExpandSheet>
              {expandedPlanId && (() => {
                const plan = plans.find(p => p.id === expandedPlanId);
                if (!plan) return null;
                const isCurrent = currentPlan === plan.id;
                const price = interval === 'monthly' ? plan.pricing.monthly : plan.pricing.annual;
                const features = getFeaturesList(plan.id);
                const Icon = getPlanIcon(plan.id);
                const originalPrice = getOriginalPrice(plan.id, interval);

                return (
                  <Card $highlight={plan.popular} $free={plan.id === 'free'} style={{ animationDelay: '0s' }}>
                    {plan.popular && (
                      <>
                        <Badge>
                          <Zap fill="white" />
                          {isBg ? 'Най-популярен' : 'Most Popular'}
                        </Badge>
                        <PopularityIndicator>
                          <Star fill="#fbbf24" />
                          <Star fill="#fbbf24" />
                          <Star fill="#fbbf24" />
                          <Star fill="#fbbf24" />
                          <Star fill="#fbbf24" />
                        </PopularityIndicator>
                      </>
                    )}

                    <IconWrapper $color={getPlanColor(plan.id)}>
                      <Icon />
                    </IconWrapper>

                    <PlanName>
                      {isBg ? plan.name.bg : plan.name.en}
                    </PlanName>

                    <PlanDescription>
                      {isBg ? plan.description.bg : plan.description.en}
                    </PlanDescription>

                    <Price $free={plan.id === 'free'}>
                      {plan.id === 'free' ? (
                        <div className="amount">
                          {isBg ? 'Безплатно' : 'Free'}
                        </div>
                      ) : (
                        <>
                          <div className="amount">
                            <span className="currency">€</span>
                            {price}
                          </div>
                          <div className="period">
                            {isBg
                              ? (interval === 'monthly' ? 'на месец' : 'на година')
                              : (interval === 'monthly' ? 'per month' : 'per year')
                            }
                          </div>
                          {originalPrice && interval === 'annual' && (
                            <div className="original-price">
                              {isBg ? `Обикновено ${originalPrice}` : `Usually ${originalPrice}`}
                            </div>
                          )}
                        </>
                      )}
                    </Price>

                    <FeatureList>
                      {features.map((feature, idx) => (
                        <FeatureItem key={idx}>
                          {feature.icon}
                          <span>{feature.text}</span>
                        </FeatureItem>
                      ))}
                    </FeatureList>



                    <Button
                      $selected={isCurrent}
                      $free={plan.id === 'free'}
                      onClick={() => !isCurrent && handleSubscribe(plan)}
                      disabled={loading || isCurrent || plan.id === 'free'}
                    >
                      {isCurrent ? (
                        <>
                          <CheckCircle size={20} />
                          {isBg ? 'Текущ план' : 'Current Plan'}
                        </>
                      ) : plan.id === 'free' ? (
                        <>
                          <Eye size={20} />
                          {isBg ? 'Започнете безплатно' : 'Start Free'}
                        </>
                      ) : loading ? (
                        <>
                          <Zap size={20} className="animate-spin" />
                          {isBg ? 'Зареждане...' : 'Loading...'}
                        </>
                      ) : (
                        <>
                          <Eye size={20} />
                          {isBg ? 'Избери план' : 'Select Plan'}
                          <ArrowRight size={18} />
                        </>
                      )}
                    </Button>

                    {plan.id !== 'free' && (
                      <MoneyBackGuarantee>
                        <Shield />
                        <span>{isBg ? '30-дневна гаранция за връщане на пари' : '30-Day Money-Back Guarantee'}</span>
                      </MoneyBackGuarantee>
                    )}
                  </Card>
                );
              })()}
            </ExpandSheet>
            <ExpandHint>
              {isBg ? 'Докоснете извън картата أو حرّك قليلاً للإغلاق' : 'Tap outside or move slightly to close'}
            </ExpandHint>
          </div>
        </ExpandOverlay>

        <CarouselArrow
          $side="left"
          onClick={() => scrollByOneCard('left')}
          disabled={!canScrollLeft}
          aria-label="Previous plan"
          type="button"
        >
          <ChevronLeft size={22} />
        </CarouselArrow>

        <CarouselArrow
          $side="right"
          onClick={() => scrollByOneCard('right')}
          disabled={!canScrollRight}
          aria-label="Next plan"
          type="button"
        >
          <ChevronRight size={22} />
        </CarouselArrow>

        <PlansViewport ref={viewportRef}>
          {plans.map((plan, index) => {
            const isCurrent = currentPlan === plan.id;
            const price = interval === 'monthly' ? plan.pricing.monthly : plan.pricing.annual;
            const features = getFeaturesList(plan);
            const Icon = getPlanIcon(plan.id);
            const originalPrice = getOriginalPrice(plan.id, interval);

            return (
              <CarouselItem key={plan.id}>
                <Card
                  $highlight={plan.popular}
                  $free={plan.id === 'free'}
                  style={{ animationDelay: `${index * 0.15}s` }}
                  onClick={() => {
                    if (isCoarsePointer) setExpandedPlanId(plan.id);
                  }}
                >
                  {plan.popular && (
                    <>
                      <Badge>
                        <Zap fill="white" />
                        {isBg ? 'Най-популярен' : 'Most Popular'}
                      </Badge>
                      <PopularityIndicator>
                        <Star fill="#fbbf24" />
                        <Star fill="#fbbf24" />
                        <Star fill="#fbbf24" />
                        <Star fill="#fbbf24" />
                        <Star fill="#fbbf24" />
                      </PopularityIndicator>
                    </>
                  )}

                  <IconWrapper $color={getPlanColor(plan.id)}>
                    <Icon />
                  </IconWrapper>

                  <PlanName>
                    {isBg ? plan.name.bg : plan.name.en}
                  </PlanName>

                  <PlanDescription>
                    {isBg ? plan.description.bg : plan.description.en}
                  </PlanDescription>

                  <Price $free={plan.id === 'free'}>
                    {plan.id === 'free' ? (
                      <div className="amount">
                        {isBg ? 'Безплатно' : 'Free'}
                      </div>
                    ) : (
                      <>
                        <div className="amount">
                          <span className="currency">€</span>
                          {price}
                        </div>
                        <div className="period">
                          {isBg
                            ? (interval === 'monthly' ? 'на месец' : 'на година')
                            : (interval === 'monthly' ? 'per month' : 'per year')
                          }
                        </div>
                        {originalPrice && interval === 'annual' && (
                          <div className="original-price">
                            {isBg ? `Обикновено ${originalPrice}` : `Usually ${originalPrice}`}
                          </div>
                        )}
                      </>
                    )}
                  </Price>

                  <FeatureList>
                    {features.map((feature, idx) => (
                      <FeatureItem key={idx} $highlight={feature.highlight}>
                        {feature.highlight ? <Sparkles /> : <CheckCircle />}
                        <span>{feature.text}</span>
                      </FeatureItem>
                    ))}
                  </FeatureList>

                  <Button
                    $selected={isCurrent}
                    $free={plan.id === 'free'}
                    onClick={() => !isCurrent && handleSubscribe(plan)}
                    disabled={loading || isCurrent || plan.id === 'free'}
                  >
                    {isCurrent ? (
                      <>
                        <CheckCircle size={20} />
                        {isBg ? 'Текущ план' : 'Current Plan'}
                      </>
                    ) : plan.id === 'free' ? (
                      <>
                        <Eye size={20} />
                        {isBg ? 'Започнете безплатно' : 'Start Free'}
                      </>
                    ) : loading ? (
                      <>
                        <Zap size={20} className="animate-spin" />
                        {isBg ? 'Зареждане...' : 'Loading...'}
                      </>
                    ) : (
                      <>
                        <Eye size={20} />
                        {isBg ? 'Избери план' : 'Select Plan'}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </Button>

                  {plan.id !== 'free' && (
                    <MoneyBackGuarantee>
                      <Shield />
                      <span>{isBg ? '30-дневна гаранция за връщане на пари' : '30-Day Money-Back Guarantee'}</span>
                    </MoneyBackGuarantee>
                  )}
                </Card>
              </CarouselItem>
            );
          })}
        </PlansViewport>
      </PlansCarousel>
    </Container>
  );
};

export default SubscriptionManagerEnhanced;
