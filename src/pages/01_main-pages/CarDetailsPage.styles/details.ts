import defaultStyled from 'styled-components';

const styled = defaultStyled;

// ==================== Details Section Components ====================

export const DetailsSection = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: var(--shadow-card);
  transition: background-color 0.3s ease, border-color 0.3s ease;
`;

export const DetailRow = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-light);
  gap: 0.375rem;
  transition: border-color 0.3s ease;

  &:last-child {
    border-bottom: none;
  }
`;

export const DetailLabel = styled.label`
  font-weight: 500;
  color: var(--text-tertiary);
  font-size: 0.688rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0;
  display: block;
  transition: color 0.3s ease;
`;

export const DetailValue = styled.div`
  color: var(--text-secondary);
  font-size: 0.813rem;
  font-weight: 500;
  padding: 0.4rem 0.625rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 5px;
  min-height: 34px;
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
`;

// ==================== Form Input Components ====================

export const EditableInput = styled.input`
  width: 100%;
  padding: 0.4rem 0.625rem;
  border: 1px solid var(--border-primary);
  border-radius: 5px;
  font-size: 0.813rem;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
  color: var(--text-primary);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px var(--bg-accent);
  }

  &::placeholder {
    color: var(--text-muted);
    font-size: 0.75rem;
  }
`;

export const EditableSelect = styled.select`
  width: 100%;
  padding: 0.4rem 0.625rem;
  border: 1px solid var(--border-primary);
  border-radius: 5px;
  font-size: 0.813rem;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
  cursor: pointer;
  color: var(--text-primary);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px var(--bg-accent);
  }

  option {
    font-size: 0.813rem;
    padding: 0.5rem;
  }

  option.other-option {
    font-weight: 700;
    color: var(--text-primary);
    background: var(--bg-accent);
  }
`;

// ==================== Price Components ====================

export const PriceSection = styled.div`
  background: var(--accent-primary);
  color: var(--btn-primary-text);
  padding: 0.625rem 1rem;
  border-radius: 8px;
  display: inline-block;
  margin: 0.5rem 0 1rem 0;
  box-shadow: var(--shadow-button);
  border: 1px solid var(--accent-secondary);
  transition: background-color 0.3s ease, color 0.3s ease;
  
  h3, label, input[type="number"] {
    color: var(--btn-primary-text) !important;
  }
  
  input[type="number"] {
    background: rgba(255, 255, 255, 0.2) !important;
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
  }
`;

export const Price = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  display: inline;
  letter-spacing: -0.3px;
`;

export const PriceLabel = styled.span`
  font-size: 0.75rem;
  opacity: 0.9;
  font-weight: 500;
  margin-left: 0.5rem;
`;

// ==================== Equipment Section Components ====================

export const EquipmentSection = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-card);
  transition: background-color 0.3s ease, border-color 0.3s ease;
`;
