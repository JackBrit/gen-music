import * as Tone from 'tone';
import { getRandomBetween, scheduleRandomRepeat } from './utils';

export interface ExternalTrack {
  playFunction: () => Promise<Tone.Analyser>;
  colour?: string;
  name?: string;
}

export class ExternalTrackLoader {
  private sdCardPath = this.getSDCardPath();

  private getSDCardPath(): string {
    // Will be determined by the server - this is just for server-side fallback
    const paths = ['/media/jack/track', '/Volumes/track'];
    for (const path of paths) {
      try {
        if (typeof window === 'undefined') {
          const fs = require('fs');
          if (fs.existsSync(path)) {
            return path;
          }
        }
      } catch (e) {
        // Ignore errors
      }
    }
    return '/media/jack/track'; // Default to Raspberry Pi path
  }

  async loadTrackFromFile(filename: string): Promise<ExternalTrack | null> {
    try {
      if (typeof window !== 'undefined') {
        // Browser environment - fetch from our server endpoint
        const response = await fetch(`/sdcard/${filename}`);
        if (response.ok) {
          const trackCode = await response.text();

          // Execute the track code to get the functions
          const trackFunction = this.executeTrackCode(trackCode, filename);

          return {
            playFunction: trackFunction,
            colour: this.extractColorFromCode(trackCode),
            name: filename
          };
        } else {
          console.error(`Could not fetch SD card track: ${filename}`);
          return null;
        }
      } else {
        // Server-side (Node.js) - can read files directly
        const fs = await import('fs');
        const trackPath = `${this.sdCardPath}/${filename}`;

        if (fs.existsSync(trackPath)) {
          // Dynamic import of the TypeScript file
          const trackModule = await import(trackPath);

          return {
            playFunction: trackModule.playEnoPiece || trackModule.default,
            colour: trackModule.colour,
            name: filename
          };
        }
      }

      return null;
    } catch (error) {
      console.error(`Failed to load track from ${filename}:`, error);
      return null;
    }
  }

  private executeTrackCode(code: string, filename: string): () => Promise<Tone.Analyser> {
    try {
      // The server should have already cleaned the problematic imports,
      // but let's be extra safe and ensure only the utils import is removed
      let cleanedCode = code.replace(/import\s*{\s*([^}]+)\s*}\s*from\s*['"][^'"]*utils['"];\s*/g, '');

      // Remove any remaining relative path imports (but keep Tone import)
      cleanedCode = cleanedCode.replace(/import\s*.*from\s*['"][.\/][^'"]*['"];\s*/g, '');

      // Create a function that provides the track environment
      const trackFunction = new Function(
        'Tone',
        'getRandomBetween',
        'scheduleRandomRepeat',
        `
        ${cleanedCode}
        
        // Return the main play function
        if (typeof playTrack !== 'undefined') {
          return playTrack;
        } else {
          throw new Error('playTrack function not found in track');
        }
      `
      );

      // Execute with our utility functions
      return trackFunction(Tone, getRandomBetween, scheduleRandomRepeat);
    } catch (error) {
      console.error('Failed to execute track code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to load track ${filename}: ${errorMessage}`);
    }
  }

  private extractColorFromCode(code: string): string | undefined {
    // Match both export and non-export const declarations since server cleans exports
    const colorMatch = code.match(/(?:export\s+)?const\s+colour\s*=\s*['"]([^'"]+)['"]/);
    return colorMatch ? colorMatch[1] : undefined;
  }

  async listAvailableTracks(): Promise<string[]> {
    try {
      if (typeof window === 'undefined') {
        const fs = await import('fs');
        const files = fs.readdirSync(this.sdCardPath);
        return files.filter(file => file.endsWith('.ts'));
      } else {
        // In browser, fetch the list from server
        try {
          const response = await fetch('/sdcard/');
          if (response.ok) {
            const trackList = await response.json();
            return trackList;
          }
        } catch (e) {
          console.warn('Could not fetch track list from server');
        }
        return [];
      }
    } catch (error) {
      console.error('Failed to list tracks:', error);
      return [];
    }
  }
}
