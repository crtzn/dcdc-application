// Type definitions for Electron API
interface Window {
  api: {
    // Resource path functions
    getLogoPath: () => Promise<string>;
    getFontPath: (fontFileName: string) => Promise<string>;
    
    // Other API functions...
    [key: string]: any;
  };
}
