/**
 * Font loader utility to ensure fonts are properly loaded
 * before rendering the application
 */

// Font loading status
let fontsLoaded = false;

// Font face observer class
class FontFaceObserver {
  private fontFamily: string;
  private fontWeight: string | number;
  private fontStyle: string;

  constructor(
    fontFamily: string,
    options: { weight?: string | number; style?: string } = {}
  ) {
    this.fontFamily = fontFamily;
    this.fontWeight = options.weight || "normal";
    this.fontStyle = options.style || "normal";
  }

  // Check if font is loaded
  load(text = "BESbswy", timeout = 3000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkFont = () => {
        // Create test elements
        const testDiv = document.createElement("div");
        testDiv.style.position = "absolute";
        testDiv.style.left = "-10000px";
        testDiv.style.top = "-10000px";
        testDiv.style.fontSize = "48px";
        testDiv.style.fontWeight = String(this.fontWeight);
        testDiv.style.fontStyle = this.fontStyle;
        testDiv.textContent = text;

        // Create reference element with fallback font
        const referenceDiv = testDiv.cloneNode(true) as HTMLDivElement;
        testDiv.style.fontFamily = this.fontFamily + ", monospace";
        referenceDiv.style.fontFamily = "monospace";

        document.body.appendChild(testDiv);
        document.body.appendChild(referenceDiv);

        // Check if widths are different (indicating custom font is loaded)
        if (testDiv.offsetWidth !== referenceDiv.offsetWidth) {
          document.body.removeChild(testDiv);
          document.body.removeChild(referenceDiv);
          resolve();
          return;
        }

        // Check timeout
        if (Date.now() - startTime > timeout) {
          document.body.removeChild(testDiv);
          document.body.removeChild(referenceDiv);
          reject(new Error(`Font load timeout: ${this.fontFamily}`));
          return;
        }

        // Try again
        document.body.removeChild(testDiv);
        document.body.removeChild(referenceDiv);
        setTimeout(checkFont, 50);
      };

      checkFont();
    });
  }
}

// Preload font files to ensure they're available offline
const preloadFontFiles = async () => {
  const fontFiles = [
    "Poppins-Regular.ttf",
    "Poppins-Medium.ttf",
    "Poppins-Bold.ttf",
    "Poppins-Light.ttf",
    "Poppins-SemiBold.ttf",
  ];

  try {
    // Get font paths from Electron
    const fontPaths = await Promise.all(
      fontFiles.map(async (fontFile) => {
        // Use the Electron API to get the correct font path in both dev and production
        if (window.api && window.api.getFontPath) {
          return await window.api.getFontPath(fontFile);
        }
        // Fallback if API is not available
        return `./fonts/${fontFile}`;
      })
    );

    // Create link elements for each font to preload them
    fontPaths.forEach((fontPath) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = fontPath;
      link.as = "font";
      link.type = "font/ttf";
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });
  } catch (error) {
    console.warn("Font preloading error:", error);
  }
};

// Load all required font weights
export const loadFonts = async (): Promise<void> => {
  if (fontsLoaded) return;

  try {
    // Preload font files
    await preloadFontFiles();

    // Load regular weight first (most important)
    await new FontFaceObserver("Poppins", { weight: 400 }).load();

    // Load other weights in parallel
    await Promise.all([
      new FontFaceObserver("Poppins", { weight: 300 }).load(),
      new FontFaceObserver("Poppins", { weight: 500 }).load(),
      new FontFaceObserver("Poppins", { weight: 600 }).load(),
      new FontFaceObserver("Poppins", { weight: 700 }).load(),
    ]);

    fontsLoaded = true;
    document.documentElement.classList.add("fonts-loaded");
    console.log("All fonts loaded successfully");
  } catch (error) {
    console.warn("Font loading failed, using fallback fonts:", error);
    // Mark as loaded anyway to prevent repeated attempts
    fontsLoaded = true;
    document.documentElement.classList.add("fonts-failed");
  }
};

// Check if fonts are loaded
export const areFontsLoaded = (): boolean => fontsLoaded;
