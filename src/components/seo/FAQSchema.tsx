/**
 * FAQSchema.tsx
 * Injects FAQ structured data (JSON-LD) for Google rich results
 * Renders visible FAQ accordion + invisible schema for SEO
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
  /** If true, also renders visible HTML for users */
  visible?: boolean;
}

const FAQSchema: React.FC<FAQSchemaProps> = ({ faqs, visible = false }) => {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      </Helmet>
      {visible && (
        <section itemScope itemType="https://schema.org/FAQPage">
          {faqs.map((faq, index) => (
            <details
              key={index}
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <summary itemProp="name">{faq.question}</summary>
              <div
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <p itemProp="text">{faq.answer}</p>
              </div>
            </details>
          ))}
        </section>
      )}
    </>
  );
};

export default FAQSchema;

/**
 * Pre-built Bulgarian car marketplace FAQs for homepage
 */
export const HOMEPAGE_FAQS: FAQItem[] = [
  {
    question: 'Как да продам колата си в Koli One?',
    answer: 'Регистрирайте се безплатно, натиснете "Продай кола", попълнете данните за автомобила, добавете снимки и публикувайте обявата. Обявата ви ще бъде видима за хиляди потенциални купувачи в цяла България.',
  },
  {
    question: 'Безплатно ли е да публикувам обява за кола?',
    answer: 'Да, публикуването на обяви в Koli One е напълно безплатно. Можете да добавите до 20 снимки и подробно описание на вашия автомобил без никакви такси.',
  },
  {
    question: 'Какви видове автомобили мога да намеря?',
    answer: 'В Koli One ще намерите леки автомобили, SUV/джипове, бусове и миниванове, мотоциклети, камиони и автобуси. Предлагаме нови и употребявани превозни средства от частни лица, автосалони и компании.',
  },
  {
    question: 'В кои градове в България мога да търся коли?',
    answer: 'Koli One покрива цяла България - София, Пловдив, Варна, Бургас, Стара Загора, Русе, Плевен, Добрич, Шумен, Хасково, Велико Търново и още 20+ града.',
  },
  {
    question: 'Как да се свържа с продавач?',
    answer: 'Можете да изпратите съобщение директно през платформата или да се обадите на посочения телефонен номер. Koli One осигурява сигурна комуникация между купувачи и продавачи.',
  },
  {
    question: 'Мога ли да търся коли по марка и модел?',
    answer: 'Да, Koli One предлага разширено търсене по марка, модел, година, цена, гориво, тип скоростна кутия, местоположение и много други филтри. Поддържаме над 50 автомобилни марки.',
  },
];
