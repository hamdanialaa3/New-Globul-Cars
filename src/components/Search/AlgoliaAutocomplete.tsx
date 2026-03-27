// AlgoliaAutocomplete.tsx
// Autocomplete search for header

import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useNavigate } from 'react-router-dom';
import { autocomplete } from '@algolia/autocomplete-js';
import { carsIndex } from '../../services/algolia/algolia-client';
import styled from 'styled-components';
import { Car, TrendingUp } from 'lucide-react';
import '@algolia/autocomplete-theme-classic';

const AutocompleteWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;

  .aa-Autocomplete {
    width: 100%;
  }

  .aa-Form {
    background: var(--bg-card);
    border: 2px solid var(--border-primary);
    border-radius: 50px;
    padding: 0.5rem 1rem;
    transition: all 0.3s ease;

    &:focus-within {
      border-color: #3B82F6;
      box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
    }
  }

  .aa-Input {
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 1rem;
    outline: none;
    width: 100%;
    padding: 0.5rem;

    &::placeholder {
      color: var(--text-secondary);
    }
  }

  .aa-Panel {
    background: var(--bg-card);
    border: 2px solid var(--border-primary);
    border-radius: 12px;
    box-shadow: var(--shadow-xl);
    margin-top: 0.5rem;
    overflow: hidden;
  }

  .aa-Item {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-primary);

    &[aria-selected="true"] {
      background: rgba(139, 92, 246, 0.1);
    }

    &:hover {
      background: var(--bg-hover);
    }
  }
`;

const HitContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const HitImage = styled.img`
  width: 60px;
  height: 45px;
  object-fit: cover;
  border-radius: 6px;
  background: var(--bg-hover);
`;

const HitContent = styled.div`
  flex: 1;

  .hit-title {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.2rem;
  }

  .hit-specs {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
`;

const HitPrice = styled.div`
  font-weight: 700;
  color: #3B82F6;
  font-size: 1.1rem;
`;

interface AlgoliaAutocompleteProps {
  placeholder?: string;
  onSelect?: (objectID: string) => void;
}

const AlgoliaAutocomplete: React.FC<AlgoliaAutocompleteProps> = ({
  placeholder = 'Search cars...',
  onSelect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!containerRef.current) return;

    const search = autocomplete({
      container: containerRef.current,
      placeholder,
      openOnFocus: true,
      getSources: ({ query }) => [
        {
          sourceId: 'cars',
          getItems: () => {
            if (!query) {
              return carsIndex.search('', {
                hitsPerPage: 5,
                filters: 'status:active'
              }).then(({ hits }) => hits);
            }
            
            return carsIndex.search(query, {
              hitsPerPage: 8,
              filters: 'status:active',
              attributesToRetrieve: [
                'objectID',
                'make',
                'model',
                'year',
                'price',
                'images',
                'fuel',
                'mileage'
              ]
            }).then(({ hits }) => hits);
          },
          templates: {
            item: ({ item, components, html }) => {
              return html`
                <div style="display: flex; gap: 12px; align-items: center; width: 100%;">
                  ${item.images?.[0] 
                    ? html`<img 
                        src="${item.images[0]}" 
                        style="width: 60px; height: 45px; object-fit: cover; border-radius: 6px; background: #f5f5f5;" 
                        alt="${item.make} ${item.model}"
                      />`
                    : html`<div style="width: 60px; height: 45px; background: #f5f5f5; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2"/>
                          <path d="M19 7h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
                          <circle cx="7" cy="17" r="2"/>
                          <circle cx="17" cy="17" r="2"/>
                          <path d="M5 9h14v6H5z"/>
                        </svg>
                      </div>`
                  }
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">
                      ${components.Highlight({ hit: item, attribute: 'make' })} 
                      ${components.Highlight({ hit: item, attribute: 'model' })}
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">
                      ${item.year} • ${item.fuel} • ${item.mileage?.toLocaleString()} km
                    </div>
                  </div>
                  <div style="font-weight: 700; color: #3B82F6; font-size: 1.1rem;">
                    €${item.price?.toLocaleString()}
                  </div>
                </div>
              `;
            },
            noResults: () => {
              return html`
                <div style="padding: 1rem; text-align: center; color: var(--text-secondary);">
                  No cars found. Try different keywords.
                </div>
              `;
            }
          },
          onSelect: ({ item }) => {
            if (onSelect) {
              onSelect(item.objectID);
            } else {
              // ✅ CONSTITUTION: Use numeric URL pattern
              const sellerNumericId = item.sellerNumericId || item.ownerNumericId;
              const carNumericId = item.carNumericId || item.userCarSequenceId || item.numericId;
              
              if (sellerNumericId && carNumericId) {
                navigate(`/car/${sellerNumericId}/${carNumericId}`);
              } else {
                navigate('/cars');
              }
            }
          }
        }
      ]
    });

    return () => {
      search.destroy();
    };
  }, [placeholder, navigate, onSelect]);

  return <AutocompleteWrapper ref={containerRef} />;
};

export default AlgoliaAutocomplete;



