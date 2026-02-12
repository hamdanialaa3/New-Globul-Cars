// Test to ensure provider order remains intact
// اختبار يضمن ترتيب مزودات التطبيق

import { describe, it, expect } from '@jest/globals';
import React from 'react';
import { render } from '@testing-library/react';
import AppProviders from '../AppProviders';

function Dummy() { return <div data-testid="dummy">OK</div>; }

describe('AppProviders order', () => {
  it('renders children inside providers stack', () => {
    const { getByTestId } = render(
      <AppProviders>
        <Dummy />
      </AppProviders>
    );
    expect(getByTestId('dummy').textContent).toBe('OK');
  });
});
