// useSavedSearches Hook
// Premium React Hook for Saved Searches Management

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import savedSearchesService, {
  SavedSearch,
  SavedSearchInput,
  SavedSearchFilters
} from '@globul-cars/services/savedSearchesService';
import { toast } from 'react-toastify';
import { logger } from '@globul-cars/services';

export const useSavedSearches = () => {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved searches
  const loadSearches = useCallback(async () => {
    if (!user?.uid) {
      setSearches([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userSearches = await savedSearchesService.getUserSearches(user.uid);
      setSearches(userSearches);
    } catch (err) {
      logger.error('[useSavedSearches] Error loading searches', err as Error, { userId: user?.uid });
      setError('Failed to load saved searches');
      toast.error('Failed to load saved searches');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Load on mount and user change
  useEffect(() => {
    loadSearches();
  }, [loadSearches]);

  // Save a new search
  const saveSearch = useCallback(async (
    searchData: SavedSearchInput
  ): Promise<boolean> => {
    if (!user?.uid) {
      toast.error('Please login to save searches');
      return false;
    }

    try {
      // Check limit
      const hasReachedLimit = await savedSearchesService.hasReachedLimit(user.uid, 10);
      if (hasReachedLimit) {
        toast.error('Maximum 10 saved searches reached. Please delete some first.');
        return false;
      }

      await savedSearchesService.saveSearch(user.uid, searchData);
      toast.success(`Search "${searchData.name}" saved successfully!`);
      
      // Reload searches
      await loadSearches();
      return true;
    } catch (err) {
      logger.error('[useSavedSearches] Error saving search', err as Error, { userId: user?.uid, name: searchData.name });
      toast.error('Failed to save search');
      return false;
    }
  }, [user?.uid, loadSearches]);

  // Delete a search
  const deleteSearch = useCallback(async (searchId: string): Promise<boolean> => {
    try {
      await savedSearchesService.deleteSearch(searchId);
      toast.success('Search deleted successfully');
      
      // Update local state
      setSearches(prev => prev.filter(s => s.id !== searchId));
      return true;
    } catch (err) {
      logger.error('[useSavedSearches] Error deleting search', err as Error, { searchId });
      toast.error('Failed to delete search');
      return false;
    }
  }, []);

  // Update search
  const updateSearch = useCallback(async (
    searchId: string,
    updates: Partial<SavedSearchInput>
  ): Promise<boolean> => {
    try {
      await savedSearchesService.updateSearch(searchId, updates);
      toast.success('Search updated successfully');
      
      // Reload searches
      await loadSearches();
      return true;
    } catch (err) {
      logger.error('[useSavedSearches] Error updating search', err as Error, { searchId });
      toast.error('Failed to update search');
      return false;
    }
  }, [loadSearches]);

  // Toggle notifications
  const toggleNotifications = useCallback(async (
    searchId: string,
    enabled: boolean
  ): Promise<boolean> => {
    try {
      await savedSearchesService.toggleNotifications(searchId, enabled);
      
      // Update local state
      setSearches(prev => prev.map(s => 
        s.id === searchId ? { ...s, notifyOnNewResults: enabled } : s
      ));
      
      toast.success(enabled ? 'Notifications enabled' : 'Notifications disabled');
      return true;
    } catch (err) {
      logger.error('[useSavedSearches] Error toggling notifications', err as Error, { searchId, enabled });
      toast.error('Failed to update notifications');
      return false;
    }
  }, []);

  // Duplicate search
  const duplicateSearch = useCallback(async (
    searchId: string,
    newName?: string
  ): Promise<boolean> => {
    try {
      await savedSearchesService.duplicateSearch(searchId, newName);
      toast.success('Search duplicated successfully');
      
      // Reload searches
      await loadSearches();
      return true;
    } catch (err) {
      logger.error('[useSavedSearches] Error duplicating search', err as Error, { searchId });
      toast.error('Failed to duplicate search');
      return false;
    }
  }, [loadSearches]);

  // Update results count
  const updateResultsCount = useCallback(async (
    searchId: string,
    count: number
  ): Promise<void> => {
    try {
      await savedSearchesService.updateResultsCount(searchId, count);
      
      // Update local state
      setSearches(prev => prev.map(s => 
        s.id === searchId ? { ...s, resultsCount: count } : s
      ));
    } catch (err) {
      logger.error('[useSavedSearches] Error updating results count', err as Error, { searchId, count });
    }
  }, []);

  // Get search summary
  const getSearchSummary = useCallback((filters: SavedSearchFilters): string => {
    return savedSearchesService.generateSearchSummary(filters);
  }, []);

  return {
    searches,
    loading,
    error,
    saveSearch,
    deleteSearch,
    updateSearch,
    toggleNotifications,
    duplicateSearch,
    updateResultsCount,
    getSearchSummary,
    reload: loadSearches,
    count: searches.length
  };
};

export default useSavedSearches;
