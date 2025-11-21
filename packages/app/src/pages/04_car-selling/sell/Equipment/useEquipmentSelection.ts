import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSellWorkflow from '@globul-cars/coreuseSellWorkflow';

export type EquipmentCategory = 'safety' | 'comfort' | 'infotainment' | 'extras';

type CategorySelections = Record<EquipmentCategory, string[]>;

const categories: EquipmentCategory[] = ['safety', 'comfort', 'infotainment', 'extras'];

const arraysEqual = (a: string[], b: string[]) => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const toArray = (value?: string | string[]): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim().length) {
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [];
};

export const useEquipmentSelection = () => {
  const [searchParams] = useSearchParams();
  const { workflowData, updateWorkflowData } = useSellWorkflow();

  const initialState = useMemo<CategorySelections>(() => {
    const state: CategorySelections = {
      safety: [],
      comfort: [],
      infotainment: [],
      extras: []
    };

    categories.forEach(category => {
      const fromWorkflow = toArray((workflowData as Record<string, any>)[`${category}Equipment`] ?? workflowData[category]);
      const fromParams = toArray(searchParams.get(category) || undefined);
      state[category] = fromParams.length ? fromParams : fromWorkflow;
    });

    return state;
  }, [workflowData, searchParams]);

  const [selected, setSelected] = useState<CategorySelections>(initialState);

  useEffect(() => {
    setSelected(prev => {
      const hasChanges = categories.some(category => !arraysEqual(prev[category], initialState[category]));
      return hasChanges ? initialState : prev;
    });
  }, [initialState]);

  useEffect(() => {
    updateWorkflowData(
      {
        safetyEquipment: selected.safety,
        comfortEquipment: selected.comfort,
        infotainmentEquipment: selected.infotainment,
        extrasEquipment: selected.extras,
        safety: selected.safety.join(','),
        comfort: selected.comfort.join(','),
        infotainment: selected.infotainment.join(','),
        extras: selected.extras.join(',')
      },
      'equipment'
    );
  }, [selected, updateWorkflowData]);

  const toggleFeature = useCallback((category: EquipmentCategory, featureId: string) => {
    setSelected(prev => {
      const exists = prev[category].includes(featureId);
      return {
        ...prev,
        [category]: exists
          ? prev[category].filter(id => id !== featureId)
          : [...prev[category], featureId]
      };
    });
  }, []);

  const setCategoryFeatures = useCallback((category: EquipmentCategory, features: string[]) => {
    setSelected(prev => ({
      ...prev,
      [category]: Array.from(new Set(features))
    }));
  }, []);

  const clearAll = useCallback(() => {
    setSelected({
      safety: [],
      comfort: [],
      infotainment: [],
      extras: []
    });
  }, []);

  const totalSelected = useMemo(
    () => categories.reduce((count, category) => count + selected[category].length, 0),
    [selected]
  );

  const serialize = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    categories.forEach(category => {
      if (selected[category].length) {
        params.set(category, selected[category].join(','));
      } else {
        params.delete(category);
      }
    });
    return params;
  }, [searchParams, selected]);

  return {
    selected,
    toggleFeature,
    setCategoryFeatures,
    clearAll,
    totalSelected,
    serialize
  };
};

export default useEquipmentSelection;

