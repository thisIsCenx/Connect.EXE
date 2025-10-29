/**
 * Storage utilities for handling both localStorage and sessionStorage
 */

/**
 * Get item from storage (check both localStorage and sessionStorage)
 */
export const getStorageItem = (key: string): string | null => {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
};

/**
 * Set item to appropriate storage based on remember me preference
 */
export const setStorageItem = (key: string, value: string, remember: boolean = false): void => {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(key, value);
};

/**
 * Remove item from both storages
 */
export const removeStorageItem = (key: string): void => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};

/**
 * Clear both storages
 */
export const clearAllStorage = (): void => {
  localStorage.clear();
  sessionStorage.clear();
};

/**
 * Check if user wants to be remembered
 */
export const isRememberMe = (): boolean => {
  return localStorage.getItem('remember_me') === 'true';
};
