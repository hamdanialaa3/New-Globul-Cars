// src/components/seo/FAQSchema.tsx
// FAQ Structured Data Component — Rich Results Enhancement
// Adds FAQPage schema to earn expanded search result snippets

import React from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSchemaProps {
    items: FAQItem[];
}

/**
 * FAQSchema Component
 * Injects FAQPage JSON-LD structured data for Google Rich Results
 * 
 * @example
 * <FAQSchema items={[
 *   { question: "What is Koli One?", answer: "Koli One is Bulgaria's AI-powered car marketplace." }
 * ]} />
 */
export const FAQSchema: React.FC<FAQSchemaProps> = ({ items }) => {
    if (!items || items.length === 0) return null;

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

export default FAQSchema;
