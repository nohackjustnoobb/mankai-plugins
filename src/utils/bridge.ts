declare global {
  /**
   * Get the configurations.
   * @returns The configurations.
   */
  // deno-lint-ignore no-explicit-any
  const getConfigs: () => Record<string, any>[];

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
}
