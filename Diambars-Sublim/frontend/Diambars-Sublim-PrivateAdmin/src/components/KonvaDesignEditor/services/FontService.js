// services/FontService.js
import WebFont from 'webfontloader';

export class FontService {
  constructor() {
    this.loadedFonts = new Set(['Arial', 'Helvetica', 'Times New Roman', 'Courier New']);
    this.googleFonts = new Set();
  }

  async loadGoogleFonts(fontNames) {
    if (!Array.isArray(fontNames) || fontNames.length === 0) {
      throw new Error('Font names array is required');
    }

    const fontsToLoad = fontNames.filter(font => !this.googleFonts.has(font));
    if (fontsToLoad.length === 0) return;

    return new Promise((resolve, reject) => {
      WebFont.load({
        google: {
          families: fontsToLoad.map(font => `${font}:wght@300;400;500;600;700`)
        },
        active: () => {
          fontsToLoad.forEach(font => {
            this.googleFonts.add(font);
            this.loadedFonts.add(font);
          });
          resolve(fontsToLoad);
        },
        inactive: () => {
          reject(new Error('Failed to load Google Fonts'));
        },
        timeout: 10000
      });
    });
  }

  getAvailableFonts() {
    return Array.from(this.loadedFonts);
  }

  getGoogleFonts() {
    return Array.from(this.googleFonts);
  }

  isLoaded(fontFamily) {
    return this.loadedFonts.has(fontFamily);
  }

  getPopularGoogleFonts() {
    return [
      'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
      'Source Sans Pro', 'Oswald', 'Raleway', 'Poppins', 'Nunito',
      'Playfair Display', 'Merriweather', 'Ubuntu', 'Dosis', 'Crimson Text',
      'Fira Sans', 'Work Sans', 'PT Sans', 'Noto Sans', 'Libre Franklin'
    ];
  }
}
