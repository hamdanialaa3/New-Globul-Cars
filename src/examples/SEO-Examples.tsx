/**
 * SEO-Examples.tsx
 * 🎓 أمثلة عملية لاستخدام أدوات SEO في Koli One
 * 
 * نسخ والصق هذه الأمثلة في صفحاتك!
 */

import React from 'react';
import SEOHelmet from '@/utils/seo/SEOHelmet';
import LazyImage from '@/components/SEO/LazyImage';
import { sanitizeHTML } from '@/utils/sanitize';
import {
    generateCarProductSchema,
    generateArticleSchema,
    generateFAQSchema,
    generateBreadcrumbSchema,
    generateOrganizationSchema,
    generateWebSiteSchema,
    combineSchemas
} from '@/utils/seo/schemas';

// ============================================================================
// مثال 1: صفحة رئيسية (Homepage)
// ============================================================================

export const HomePageExample: React.FC = () => {
    const schemas = combineSchemas(
        generateOrganizationSchema(),
        generateWebSiteSchema()
    );

    return (
        <>
            <SEOHelmet
                title="Koli One - أفضل موقع لشراء وبيع السيارات في بلغاريا"
                description="اكتشف آلاف السيارات الجديدة والمستعملة بأفضل الأسعار. منصة موثوقة للتداول في السيارات في بلغاريا."
                keywords={['سيارات', 'بلغاريا', 'شراء سيارة', 'بيع سيارة', 'سيارات مستعملة', 'سيارات جديدة']}
                ogType="website"
                ogImage="https://koli.one/images/og-home.jpg"
                schema={schemas}
            />

            {/* Hero Image - Above the fold */}
            <LazyImage
                src="/images/hero.jpg"
                alt="Koli One - Bulgarian Car Marketplace"
                width={1920}
                height={1080}
                priority={true} // ⚠️ Above the fold = priority
            />

            {/* بقية محتوى الصفحة */}
        </>
    );
};

// ============================================================================
// مثال 2: صفحة تفاصيل السيارة (Car Details)
// ============================================================================

interface CarDetailsExampleProps {
    car: {
        id: string;
        brand: string;
        model: string;
        year: number;
        price: number;
        description: string;
        images: string[];
        mileage: number;
        fuelType: string;
        transmission: string;
        sellerId: string;
        seller: {
            name: string;
        };
    };
}

export const CarDetailsPageExample: React.FC<CarDetailsExampleProps> = ({ car }) => {
    const carSchema = generateCarProductSchema({
        id: car.id,
        name: `${car.brand} ${car.model} ${car.year}`,
        description: car.description,
        price: car.price,
        currency: 'BGN',
        image: car.images,
        brand: car.brand,
        model: car.model,
        year: car.year,
        mileage: car.mileage,
        fuelType: car.fuelType,
        transmission: car.transmission,
        condition: 'used',
        availability: 'in stock',
        seller: {
            name: car.seller?.name || 'Koli One',
            url: `/dealer/${car.sellerId}`
        }
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'الرئيسية', url: 'https://koli.one/' },
        { name: 'السيارات', url: 'https://koli.one/cars' },
        { name: car.brand, url: `https://koli.one/cars?brand=${car.brand}` },
        { name: `${car.model} ${car.year}`, url: `https://koli.one/car/${car.id}` }
    ]);

    const schemas = combineSchemas(carSchema, breadcrumbSchema);

    return (
        <>
            <SEOHelmet
                title={`${car.brand} ${car.model} ${car.year} - ${car.price.toLocaleString()} BGN`}
                description={`${car.description.substring(0, 150)}... مسافة مقطوعة: ${car.mileage.toLocaleString()} كم | ${car.fuelType} | ${car.transmission}`}
                keywords={[
                    car.brand,
                    car.model,
                    car.year.toString(),
                    'شراء',
                    'سيارة',
                    car.fuelType,
                    car.transmission
                ]}
                ogType="product"
                ogImage={car.images[0]}
                ogImageAlt={`${car.brand} ${car.model} ${car.year}`}
                schema={schemas}
                product={{
                    price: car.price,
                    currency: 'BGN',
                    availability: 'in stock'
                }}
                canonical={`https://koli.one/car/${car.id}`}
            />

            {/* Main Image - Above the fold */}
            <LazyImage
                src={car.images[0]}
                alt={`${car.brand} ${car.model} ${car.year}`}
                width={800}
                height={600}
                priority={true}
            />

            {/* Gallery Images - Below the fold */}
            {car.images.slice(1).map((image, index) => (
                <LazyImage
                    key={index}
                    src={image}
                    alt={`${car.brand} ${car.model} - صورة ${index + 2}`}
                    width={400}
                    height={300}
                    priority={false} // ✅ Lazy load
                />
            ))}
        </>
    );
};

// ============================================================================
// مثال 3: صفحة المدونة (Blog Post)
// ============================================================================

interface BlogPostExampleProps {
    post: {
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        coverImage: string;
        author: string;
        createdAt: string;
        updatedAt: string;
        tags: string[];
    };
}

export const BlogPostPageExample: React.FC<BlogPostExampleProps> = ({ post }) => {
    const articleSchema = generateArticleSchema({
        title: post.title,
        description: post.excerpt,
        image: post.coverImage,
        author: post.author,
        datePublished: post.createdAt,
        dateModified: post.updatedAt,
        url: `https://koli.one/blog/${post.slug}`
    });

    return (
        <>
            <SEOHelmet
                title={`${post.title} | Koli One Blog`}
                description={post.excerpt}
                keywords={post.tags}
                ogType="article"
                ogImage={post.coverImage}
                schema={articleSchema}
                article={{
                    publishedTime: post.createdAt,
                    modifiedTime: post.updatedAt,
                    author: post.author
                }}
                canonical={`https://koli.one/blog/${post.slug}`}
            />

            {/* Cover Image */}
            <LazyImage
                src={post.coverImage}
                alt={post.title}
                width={1200}
                height={630}
                priority={true}
            />

            {/* Content */}
            <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(post.content) }} />
        </>
    );
};

// ============================================================================
// مثال 4: صفحة الأسئلة الشائعة (FAQ)
// ============================================================================

export const FAQPageExample: React.FC = () => {
    const faqSchema = generateFAQSchema([
        {
            question: 'كم تكلفة نشر إعلان؟',
            answer: 'الإعلانات مجانية للأفراد. للدلرز، تبدأ الباقات من 10 BGN شهرياً.'
        },
        {
            question: 'كيف يمكنني شراء سيارة؟',
            answer: 'ابحث عن السيارة المناسبة، تواصل مع البائع عبر الرسائل أو الهاتف، واتفقا على السعر والمعاينة.'
        },
        {
            question: 'هل يمكنني تجربة السيارة قبل الشراء؟',
            answer: 'نعم، نوصي دائماً بمعاينة وتجربة السيارة قبل اتخاذ القرار النهائي.'
        },
        {
            question: 'ما هي طرق الدفع المتاحة؟',
            answer: 'يمكنك الدفع نقداً، تحويل بنكي، أو عبر منصات الدفع الإلكتروني حسب اتفاقك مع البائع.'
        }
    ]);

    return (
        <>
            <SEOHelmet
                title="الأسئلة الشائعة - Koli One"
                description="إجابات على جميع أسئلتك حول شراء وبيع السيارات على منصة Koli One"
                keywords={['أسئلة', 'مساعدة', 'دعم', 'كيفية', 'شراء', 'بيع']}
                schema={faqSchema}
            />

            <h1>الأسئلة الشائعة</h1>

            <div>
                <h3>كم تكلفة نشر إعلان؟</h3>
                <p>الإعلانات مجانية للأفراد. للدلرز، تبدأ الباقات من 10 BGN شهرياً.</p>
            </div>

            {/* باقي الأسئلة */}
        </>
    );
};

// ============================================================================
// مثال 5: صفحة البحث (Search Results)
// ============================================================================

interface SearchResultsExampleProps {
    searchQuery: string;
    results: any[];
    brand?: string;
    location?: string;
}

export const SearchResultsPageExample: React.FC<SearchResultsExampleProps> = ({
    searchQuery,
    results,
    brand,
    location
}) => {
    const title = brand
        ? `${brand} - نتائج البحث في ${location || 'بلغاريا'}`
        : `نتائج البحث: ${searchQuery}`;

    const description = `عثرنا على ${results.length} سيارة ${brand ? `من ${brand}` : ''} ${location ? `في ${location}` : 'في بلغاريا'}. تصفح الآن!`;

    return (
        <>
            <SEOHelmet
                title={title}
                description={description}
                keywords={[searchQuery, brand, location, 'سيارات', 'بحث'].filter(Boolean) as string[]}
                noindex={results.length === 0} // لا تفهرس صفحات النتائج الفارغة
            />

            <h1>{title}</h1>
            <p>عثرنا على {results.length} نتيجة</p>

            {/* Grid of results */}
            {results.map((car) => (
                <div key={car.id}>
                    <LazyImage
                        src={car.images[0]}
                        alt={`${car.brand} ${car.model}`}
                        width={400}
                        height={300}
                        priority={false} // ✅ Lazy load all search results
                    />
                    <h3>{car.brand} {car.model}</h3>
                    <p>{car.price} BGN</p>
                </div>
            ))}
        </>
    );
};

// ============================================================================
// مثال 6: صفحة معلومات ثابتة (About/Contact)
// ============================================================================

export const AboutPageExample: React.FC = () => {
    return (
        <>
            <SEOHelmet
                title="عن Koli One - قصتنا ورؤيتنا"
                description="Koli One هي أكبر منصة لشراء وبيع السيارات في بلغاريا. تعرف على قصتنا وفريقنا ورؤيتنا."
                keywords={['عن', 'من نحن', 'رؤية', 'مهمة', 'فريق']}
                ogType="website"
            />

            <h1>من نحن</h1>
            <p>نحن منصة موثوقة...</p>
        </>
    );
};

// ============================================================================
// مثال 7: صفحة مع صور متعددة (Gallery/Listing Grid)
// ============================================================================

export const CarListingGridExample: React.FC<{ cars: any[] }> = ({ cars }) => {
    return (
        <div>
            {cars.map((car, index) => (
                <div key={car.id}>
                    <LazyImage
                        src={car.images[0]}
                        alt={`${car.brand} ${car.model} ${car.year}`}
                        width={400}
                        height={300}
                        priority={index < 6} // ⚠️ First 6 cars are priority (above fold)
                    />
                    <h3>{car.brand} {car.model}</h3>
                    <p>{car.price.toLocaleString()} BGN</p>
                </div>
            ))}
        </div>
    );
};

// ============================================================================
// مثال 8: صفحة مع placeholder blur (تأثير ضبابي)
// ============================================================================

export const LazyImageWithPlaceholderExample: React.FC = () => {
    // Generate a tiny base64 blurred version of your image
    // You can use: https://blurha.sh/ or similar tools
    const placeholder = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...'; // Tiny blurred version

    return (
        <LazyImage
            src="/images/high-res-car.jpg"
            alt="BMW X5"
            width={1200}
            height={800}
            priority={false}
            placeholder={placeholder} // ✨ Shows blur while loading
        />
    );
};

// ============================================================================
// خلاصة الأمثلة
// ============================================================================

/**
 * 📋 Checklist لكل صفحة:
 * 
 * ✅ 1. إضافة <SEOHelmet> في أول المكون
 * ✅ 2. title: واضح ومختصر (50-60 حرف)
 * ✅ 3. description: مفيد وجذاب (150-160 حرف)
 * ✅ 4. keywords: ذات صلة بالمحتوى
 * ✅ 5. schema: نوع مناسب (Product, Article, FAQ, etc.)
 * ✅ 6. ogImage: صورة واضحة 1200x630px
 * ✅ 7. canonical: URL الأساسي للصفحة
 * ✅ 8. استخدام LazyImage بدلاً من <img>
 * ✅ 9. priority={true} للصور فوق الطية فقط
 * ✅ 10. width & height محددة لمنع CLS
 */

export default {
    HomePageExample,
    CarDetailsPageExample,
    BlogPostPageExample,
    FAQPageExample,
    SearchResultsPageExample,
    AboutPageExample,
    CarListingGridExample,
    LazyImageWithPlaceholderExample
};
