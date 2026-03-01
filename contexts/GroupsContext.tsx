/**
 * GroupsContext - Groups state management
 * 
 * Provides groups state and actions to the entire app:
 * - Groups state (groups, selectedGroup, isLoading, error)
 * - Groups actions (fetchGroups, fetchGroupDetails, createGroup, joinGroup, leaveGroup, searchGroups, refreshGroups)
 * - Caching in AsyncStorage
 * - Optimistic updates for create/join operations
 * 
 * Validates: Requirements 5.3, 6.3, 6.5, 7.2
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiService } from '../services/apiService';
import { StorageService, STORAGE_KEYS } from '../services/storageService';
import { Group } from '../types/models';

/**
 * Create group request interface
 */
export interface CreateGroupRequest {
  name: string;
  description: string;
  contributionAmount: number;
  contributionFrequency: 'daily' | 'weekly' | 'monthly';
  maxMembers: number;
  startDate: string;
}

/**
 * Groups context value interface
 */
export interface GroupsContextValue {
  // State
  groups: Group[];
  selectedGroup: Group | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchGroups: () => Promise<void>;
  fetchGroupDetails: (groupId: string) => Promise<void>;
  createGroup: (data: CreateGroupRequest) => Promise<Group>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  searchGroups: (query: string) => Promise<Group[]>;
  refreshGroups: () => Promise<void>;
}

/**
 * Groups context
 */
const GroupsContext = createContext<GroupsContextValue | undefined>(undefined);

/**
 * GroupsProvider props
 */
interface GroupsProviderProps {
  children: ReactNode;
}

/**
 * GroupsProvider component
 * 
 * Manages groups state and provides groups actions
 * to the entire application through context.
 */
export function GroupsProvider({ children }: GroupsProviderProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load cached data on mount
   */
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        // Load cached groups data
        const cachedGroups = await StorageService.get<Group[]>(STORAGE_KEYS.GROUPS_DATA);
        if (cachedGroups) {
          setGroups(cachedGroups);
        }

        // Fetch fresh data in the background - suppress errors if API unavailable
        try {
          await fetchGroups();
        } catch (err) {
          // Silently suppress API errors when backend isn't running
        }
      } catch (err) {
        // Silently suppress error
      }
    };

    loadCachedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is intentional - only run on mount

  /**
   * Fetch groups data from API
   * Caches the result in AsyncStorage
   */
  const fetchGroups = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Call API to get groups data
      const response = await ApiService.get<Group[]>('/groups');

      if (response.success && response.data) {
        setGroups(response.data);
        
        // Cache groups data
        await StorageService.set(STORAGE_KEYS.GROUPS_DATA, response.data);
      } else {
        throw new Error('Failed to fetch groups data');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load groups';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch group details from API
   * Caches the result in AsyncStorage with key @group_${groupId}
   * 
   * @param groupId - ID of the group to fetch
   */
  const fetchGroupDetails = async (groupId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Call API to get group details
      const response = await ApiService.get<Group>(`/groups/${groupId}`);

      if (response.success && response.data) {
        setSelectedGroup(response.data);
        
        // Cache group details
        await StorageService.set(`@group_${groupId}`, response.data);
        
        // Update the group in the groups list if it exists
        setGroups(prevGroups => 
          prevGroups.map(g => g.id === groupId ? response.data : g)
        );
      } else {
        throw new Error('Failed to fetch group details');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load group details';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create a new group
   * Implements optimistic update - adds group to list immediately
   * 
   * @param data - Group creation data
   * @returns Created group
   */
  const createGroup = async (data: CreateGroupRequest): Promise<Group> => {
    // Generate temporary ID for optimistic update
    const tempId = `temp_${Date.now()}`;
    const optimisticGroup: Group = {
      id: tempId,
      name: data.name,
      description: data.description,
      contributionAmount: data.contributionAmount,
      contributionFrequency: data.contributionFrequency,
      maxMembers: data.maxMembers,
      currentMembers: 1,
      startDate: data.startDate,
      status: 'active',
      createdBy: '', // Will be filled by backend
      createdAt: new Date().toISOString(),
    };

    try {
      setIsLoading(true);
      setError(null);

      // Optimistic update - add group to list immediately
      setGroups(prevGroups => [optimisticGroup, ...prevGroups]);

      // Call API to create group
      const response = await ApiService.post<Group>('/groups/create', data);

      if (response.success && response.data) {
        // Replace optimistic group with real group from API
        setGroups(prevGroups => 
          prevGroups.map(g => g.id === tempId ? response.data : g)
        );
        
        // Update cache
        const updatedGroups = groups.map(g => g.id === tempId ? response.data : g);
        await StorageService.set(STORAGE_KEYS.GROUPS_DATA, updatedGroups);
        
        return response.data;
      } else {
        throw new Error('Failed to create group');
      }
    } catch (err: any) {
      // Revert optimistic update on error
      setGroups(prevGroups => prevGroups.filter(g => g.id !== tempId));
      
      const errorMessage = err.message || 'Failed to create group';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Join an existing group
   * Implements optimistic update - adds group to list immediately
   * 
   * @param groupId - ID of the group to join
   */
  const joinGroup = async (groupId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch group details for optimistic update
      let groupToJoin: Group | null = null;
      try {
        const groupResponse = await ApiService.get<Group>(`/groups/${groupId}`);
        if (groupResponse.success && groupResponse.data) {
          groupToJoin = groupResponse.data;
        }
      } catch (err) {
        // Silently suppress error
      }

      // Optimistic update - add group to list if we have the data
      if (groupToJoin && !groups.find(g => g.id === groupId)) {
        setGroups(prevGroups => [groupToJoin!, ...prevGroups]);
      }

      // Call API to join group
      const response = await ApiService.post<void>(`/groups/${groupId}/join`);

      if (response.success) {
        // Refresh groups to get updated data
        await fetchGroups();
      } else {
        throw new Error('Failed to join group');
      }
    } catch (err: any) {
      // Revert optimistic update on error
      setGroups(prevGroups => prevGroups.filter(g => g.id !== groupId));
      
      const errorMessage = err.message || 'Failed to join group';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Leave a group
   * Removes group from list
   * 
   * @param groupId - ID of the group to leave
   */
  const leaveGroup = async (groupId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Call API to leave group
      const response = await ApiService.post<void>(`/groups/${groupId}/leave`);

      if (response.success) {
        // Remove group from list
        setGroups(prevGroups => prevGroups.filter(g => g.id !== groupId));
        
        // Clear selected group if it's the one being left
        if (selectedGroup?.id === groupId) {
          setSelectedGroup(null);
        }
        
        // Update cache
        const updatedGroups = groups.filter(g => g.id !== groupId);
        await StorageService.set(STORAGE_KEYS.GROUPS_DATA, updatedGroups);
        
        // Remove cached group details
        await StorageService.remove(`@group_${groupId}`);
      } else {
        throw new Error('Failed to leave group');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to leave group';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Search for groups by query
   * 
   * @param query - Search query (group code or name)
   * @returns Array of matching groups
   */
  const searchGroups = async (query: string): Promise<Group[]> => {
    try {
      setIsLoading(true);
      setError(null);

      // Call API to search groups
      const response = await ApiService.get<Group[]>('/groups/search', { query });

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Failed to search groups');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to search groups';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh groups data
   * Used for pull-to-refresh functionality
   */
  const refreshGroups = async (): Promise<void> => {
    try {
      setError(null);
      await fetchGroups();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to refresh groups';
      setError(errorMessage);
      throw err;
    }
  };

  const value: GroupsContextValue = {
    // State
    groups,
    selectedGroup,
    isLoading,
    error,
    
    // Actions
    fetchGroups,
    fetchGroupDetails,
    createGroup,
    joinGroup,
    leaveGroup,
    searchGroups,
    refreshGroups,
  };

  return <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>;
}

/**
 * useGroups hook
 * 
 * Custom hook to access groups context
 * @returns Groups context value
 * @throws Error if used outside GroupsProvider
 */
export function useGroups(): GroupsContextValue {
  const context = useContext(GroupsContext);
  
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupsProvider');
  }
  
  return context;
}
