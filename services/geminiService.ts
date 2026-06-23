

import type { Part } from "@google/genai";

export const fileToGenerativePart = (file: File): Promise<Part> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("File could not be read as a string."));
      }
      const base64EncodedData = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64EncodedData,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
};
