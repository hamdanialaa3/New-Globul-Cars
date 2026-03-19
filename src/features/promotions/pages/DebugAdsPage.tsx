import React from 'react';
import styled from 'styled-components';
import { AdSlot } from '../components/AdSlot';
import { StickyAd, AdContainer } from '../components/LayoutAds';

const Page = styled.div`
  padding: 40px 24px;
  background: #0f1419;
  min-height: 100vh;
  padding-bottom: 200px;
  color: #f8fafc;
`;

const Section = styled.section`
  background: #1e2432;
  padding: 32px;
  margin-bottom: 32px;
  border-radius: 12px;
  border: 1px solid #2d3748;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);

  h2 { 
    margin-top: 0; 
    margin-bottom: 24px; 
    border-bottom: 1px solid #2d3748; 
    padding-bottom: 12px; 
    color: #ff8c61;
    text-transform: uppercase;
    font-size: 18px;
    letter-spacing: 1px;
    font-weight: 700;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const Label = styled.div`
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 12px;
  color: #94a3b8;
  font-size: 12px;
  background: #0f1419;
  padding: 4px 12px;
  border-radius: 4px;
  display: inline-block;
  border: 1px solid #2d3748;
`;

export const DebugAdsPage = () => {
    return (
        <Page>
            <h1 style={{ color: '#ff8c61', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '28px', marginBottom: '8px' }}>
                Ads System Debugger
            </h1>
            <p style={{ color: '#cbd5e1', marginBottom: '40px', fontSize: '14px' }}>
                Verify ad rendering, placement logic, and responsiveness in a premium dark environment.
            </p>

            {/* 1. Global Placements */}
            <Section>
                <h2>Global Banners</h2>
                <Label>global_top_banner</Label>
                <AdSlot placementId="global_top_banner" debug />

                <div style={{ height: '1rem' }} />

                <Label>global_footer_banner</Label>
                <AdSlot placementId="global_footer_banner" debug />
                <AdSlot placementId="global_footer_banner" debug />
            </Section>

            {/* 1.5 Google Smart Unit Test */}
            <Section>
                <h2>Google Smart Unit (Simulated)</h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
                    This slot forces a `google_smart` ad type to test the new component.
                </p>
                <div style={{ border: '1px dashed #ff8c61', padding: '10px' }}>
                    <AdRenderer
                        ad={{
                            id: 'debug-smart-1',
                            name: 'Debug Smart Ad',
                            type: 'google_smart',
                            isActive: true,
                            placementIds: ['debug_smart'],
                            targetDevices: 'both',
                            startDate: new Date().toISOString(),
                            weight: 100,
                            scriptCode: '1234567890' // Test Slot ID
                        }}
                        placementId="debug_smart"
                        hasConsent={true}
                    />
                </div>
            </Section>

            {/* 2. Listing In-Feed */}
            <Section>
                <h2>Listing Integration (In-Feed)</h2>
                <Grid>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{
                            border: '1px solid #2d3748',
                            padding: '1rem',
                            height: '150px',
                            background: '#0f1419',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4a5568',
                            fontSize: '12px',
                            fontWeight: '700'
                        }}>
                            CAR CARD {i}
                        </div>
                    ))}
                    <div style={{ gridColumn: '1 / -1', margin: '12px 0' }}>
                        <Label>listing_infeed (Simulated)</Label>
                        <AdSlot placementId="listing_infeed" debug className="my-class" style={{ border: '2px dashed #ff8c61' }} />
                    </div>
                    {[6, 7].map(i => (
                        <div key={i} style={{
                            border: '1px solid #2d3748',
                            padding: '1rem',
                            height: '150px',
                            background: '#0f1419',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4a5568',
                            fontSize: '12px',
                            fontWeight: '700'
                        }}>
                            CAR CARD {i}
                        </div>
                    ))}
                </Grid>
            </Section>

            {/* 3. Article Integration */}
            <Section>
                <h2>Article Context</h2>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <p style={{ color: '#cbd5e1' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    <Label style={{ margin: '16px 0' }}>article_middle</Label>
                    <AdSlot placementId="article_middle" debug />
                    <p style={{ color: '#cbd5e1', marginTop: '16px' }}>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                </div>
            </Section>

            {/* 4. Contextual Targeting Test */}
            <Section>
                <h2>Contextual Targeting (BMW Test)</h2>
                <Label>Placement: listing_sidebar + {'{brand: "BMW" }'}</Label>
                <AdSlot
                    placementId="listing_sidebar"
                    context={{ brand: 'BMW' }}
                    debug
                />
            </Section>

            {/* Sticky Ads Test */}
            <StickyAd placementId="global_left_sticky" position="left" />
            <StickyAd placementId="global_right_sticky" position="right" />

        </Page>
    );
};
