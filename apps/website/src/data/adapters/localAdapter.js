/**
 * Local adapter for importing JSON data from extension exports
 */

export class LocalAdapter {
  constructor() {
    this.data = null;
  }

  /**
   * Import data from JSON file
   * @param {File} file - JSON file to import
   * @returns {Promise<Object>} Parsed summary data
   */
  async importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          this.data = data;
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Import data from pasted JSON text
   * @param {string} jsonText - JSON string to parse
   * @returns {Promise<Object>} Parsed summary data
   */
  async importFromText(jsonText) {
    try {
      const data = JSON.parse(jsonText);
      this.data = data;
      return data;
    } catch (error) {
      throw new Error('Invalid JSON text');
    }
  }

  /**
   * Get current data
   * @returns {Object|null} Current summary data
   */
  getData() {
    return this.data;
  }

  /**
   * Clear current data
   */
  clearData() {
    this.data = null;
  }
}
