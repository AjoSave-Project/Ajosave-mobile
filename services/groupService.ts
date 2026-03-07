/**
 * GroupService - Savings group management
 * 
 * Provides group operations:
 * - Create group
 * - Get user's groups
 * - Get group details
 * - Find group by invitation code
 * - Join group
 * - Get group statistics
 */

import { ApiService } from './apiService';
import { StorageService, STORAGE_KEYS } from './storageService';

/**
 * Group data structure
 */
export interface Group {
  _id: string;
  name: string;
  description: string;
  admin: string;
  maxMembers: number;
  members: string[];
  invitationCode: string;
  contributionAmount: number;
  frequency: 'Weekly' | 'Bi-Weekly' | 'Monthly';
  payoutOrder: 'random' | 'firstCome' | 'bidding';
  duration: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  currentTurn: number;
  totalPool: number;
  credibilityScore: number;
  startDate: string;
  nextContribution?: string;
  nextPayout?: string;
  membersList: GroupMember[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Group member structure
 */
export interface GroupMember {
  userId: string;
  name: string;
  joinDate: string;
  role: 'Admin' | 'Member';
  status: 'completed' | 'current' | 'pending' | 'missed';
  turns: number;
  contributionsMade: number;
  missedContributions: number;
}

/**
 * Create group request
 */
export interface CreateGroupRequest {
  name: string;
  description?: string;
  maxMembers: number;
  duration: number;
  contributionAmount: number;
  frequency: 'Weekly' | 'Bi-Weekly' | 'Monthly';
  payoutOrder: 'random' | 'firstCome' | 'bidding';
  emails?: string;
}

/**
 * Group statistics
 */
export interface GroupStats {
  totalMembers: number;
  maxMembers: number;
  totalPool: number;
  totalContributions: number;
  totalMissed: number;
  completedTurns: number;
  currentTurn: number;
  status: string;
  credibilityScore: number;
  progress: number;
}

/**
 * GroupService class
 */
class GroupServiceClass {
  /**
   * Create a new savings group
   * @param data - Group creation data
   * @returns Created group with invitation code
   */
  async createGroup(data: CreateGroupRequest): Promise<{ group: Group; invitationCode: string }> {
    const response = await ApiService.post<{ group: Group; invitationCode: string }>('/groups', data);

    if (response.success && response.data) {
      // Refresh groups cache
      await this.getUserGroups();
      return response.data;
    }

    throw new Error('Failed to create group');
  }

  /**
   * Get all groups user is a member of
   * @returns List of groups
   */
  async getUserGroups(): Promise<{ groups: Group[]; count: number }> {
    const response = await ApiService.get<{ groups: Group[]; count: number }>('/groups');

    if (response.success && response.data) {
      // Cache groups data
      await StorageService.set(STORAGE_KEYS.GROUPS_DATA, response.data.groups);
      return response.data;
    }

    throw new Error('Failed to get groups');
  }

  /**
   * Get detailed information about a specific group
   * @param groupId - Group ID
   * @returns Group details
   */
  async getGroupById(groupId: string): Promise<{ group: Group }> {
    const response = await ApiService.get<{ group: Group }>(`/groups/${groupId}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to get group details');
  }

  /**
   * Find group by invitation code
   * @param code - Invitation code
   * @returns Group details
   */
  async findGroupByCode(code: string): Promise<{ group: Group }> {
    const response = await ApiService.get<{ group: Group }>(`/groups/find/${code.toUpperCase()}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Group not found');
  }

  /**
   * Join an existing group
   * @param groupId - Group ID
   * @returns Updated group
   */
  async joinGroup(groupId: string): Promise<{ group: Group }> {
    const response = await ApiService.post<{ group: Group }>(`/groups/${groupId}/join`, {});

    if (response.success && response.data) {
      // Refresh groups cache
      await this.getUserGroups();
      return response.data;
    }

    throw new Error('Failed to join group');
  }

  /**
   * Get statistics for a specific group
   * @param groupId - Group ID
   * @returns Group statistics
   */
  async getGroupStats(groupId: string): Promise<{ stats: GroupStats }> {
    const response = await ApiService.get<{ stats: GroupStats }>(`/groups/${groupId}/stats`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to get group statistics');
  }

  /**
   * Update group status (admin only)
   * @param groupId - Group ID
   * @param status - New status
   * @returns Updated group
   */
  async updateGroupStatus(
    groupId: string,
    status: 'pending' | 'active' | 'completed' | 'cancelled'
  ): Promise<{ group: Group }> {
    const response = await ApiService.put<{ group: Group }>(`/groups/${groupId}/status`, {
      status,
    });

    if (response.success && response.data) {
      // Refresh groups cache
      await this.getUserGroups();
      return response.data;
    }

    throw new Error('Failed to update group status');
  }
}

// Export singleton instance
export const GroupService = new GroupServiceClass();
