declare global {
  interface ConfigValue {
    key: string;
    value: unknown;
  }

  /**
   * Get the configurations.
   * @returns The configurations.
   */
  const getConfigs: () => ConfigValue[];

  /**
   * Convert Traditional Chinese to Simplified Chinese.
   * @param text The text to convert.
   * @returns The converted text.
   */
  const t2s: (text: string) => Promise<string>;

  /**
   * Convert Simplified Chinese to Traditional Chinese.
   * @param text The text to convert.
   * @returns The converted text.
   */
  const s2t: (text: string) => Promise<string>;

  /**
   * Set a value in the storage.
   * @param key The key to set.
   * @param value The value to set.
   */
  const setValue: (key: string, value: string) => Promise<void>;

  /**
   * Get a value from the storage.
   * @param key The key to get.
   * @returns The value, or null when it does not exist.
   */
  const getValue: (key: string) => Promise<string | null>;

  /**
   * Remove a value from the storage.
   * @param key The key to remove.
   * @returns Whether a value was removed.
   */
  const removeValue: (key: string) => Promise<boolean>;
}

export {};
