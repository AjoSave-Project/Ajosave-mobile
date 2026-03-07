/**
 * GroupsContext - Groups state management
 * 
 * Provides groups state and actions to the entire app:
 * - Groups state (groups, selectedGroup, isLoading, error)
 * - Groups actions (fetchGroups, fetchGroupDetails, createGroup, joinGroup, findGroupByCode, refreshGroups)
 * - Caching in AsyncStorage
 * - Optimistic updates for create/join operations
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GroupService, Group, CreateGroupRequest } from '../services/groupService';
import { StorageService, STORAGE_KEYS } from '../services/storageService';

/**
 * Create group response type
 */
export type CreateGroupResponse = {
  group: Group;
  invitationCode: string;
};

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
  createGroup: (data: CreateGroupRequest) => Promise<CreateGroupResponse>;
  joinGroup: (groupId: string) => Promise<void>;
  findGroupByCode: (code: string) => Promise<Group>;
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
        // Load cached groups data for immediate display
        const cachedGroups = await StorageService.get<Group[]>(STORAGE_KEYS.GROUPS_DATA);
        if (cachedGroups) {
          setGroups(cachedGroups);
        }
        // NOTE: Live fetch is triggered by each screen on mount, not here,
        // to avoid unauthenticated requests during app startup.
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

      // Call GroupService to get groups data
      const response = await GroupService.getUserGroups();
      setGroups(response.groups);
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

      // Call GroupService to get group details
      const response = await GroupService.getGroupById(groupId);
      setSelectedGroup(response.group);
      
      // Cache group details
      await StorageService.set(`@group_${groupId}`, response.group);
      
      // Update the group in the groups list if it exists
      setGroups(prevGroups => 
        prevGroups.map(g => g._id === groupId ? response.group : g)
      );
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
   * @returns Created group with invitation code
   */
  const createGroup = async (data: CreateGroupRequest): Promise<CreateGroupResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      // Call GroupService to create group
      const response = await GroupService.createGroup(data);
      
      // Add new group to list
      setGroups(prevGroups => [response.group, ...prevGroups]);
      
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create group';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Join an existing group
   * 
   * @param groupId - ID of the group to join
   */
  const joinGroup = async (groupId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Call GroupService to join group
      await GroupService.joinGroup(groupId);
      
      // Refresh groups to get updated data
      await fetchGroups();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to join group';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Find group by invitation code
   * 
   * @param code - Invitation code
   * @returns Group details
   */
  const findGroupByCode = async (code: string): Promise<Group> => {
    try {
      setIsLoading(true);
      setError(null);

      // Call GroupService to find group by code
      const response = await GroupService.findGroupByCode(code);
      return response.group;
    } catch (err: any) {
      const errorMessage = err.message || 'Group not found';
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
    findGroupByCode,
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
