
import { GoogleGenAI, Type } from "@google/genai";
import { CompoundInterestConfig } from "../types";

/**
 * Generates an image using gemini-3-pro-image-preview.
 */
export async function generateAiImage(prompt: string, size: "1K" | "2K" | "4K"): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size,
        },
      },
    });

    for (const part of response.candidates?.[0].content.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data received");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

/**
 * Edits an image using gemini-2.5-flash-image.
 */
export async function editAiImage(base64Image: string, prompt: string, mimeType: string = 'image/jpeg'): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = base64Image.split(',')[1] || base64Image;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
    });

    for (const part of response.candidates?.[0].content.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image data received");
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
}

/**
 * Validates a Scrabble word using Gemini Flash-Lite.
 */
export async function validateScrabbleWord(word: string): Promise<{ isValid: boolean; reason?: string }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: `¿Es la palabra "${word}" válida en el Scrabble oficial en español? Responde solo en JSON con este esquema: {"isValid": boolean, "reason": string}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          },
          required: ["isValid"]
        }
      }
    });

    return JSON.parse(response.text || '{"isValid": false}');
  } catch (error) {
    console.error("Error validating word:", error);
    return { isValid: true };
  }
}

export async function getGameStrategy(gameName: string, gameState: any): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analiza este estado de juego para ${gameName} y dame un consejo estratégico breve: ${JSON.stringify(gameState)}`,
      config: {
        systemInstruction: "Eres un estratega experto en juegos de mesa. Tu objetivo es dar consejos tácticos, muy breves y ganadores en español.",
      },
    });
    return response.text || "No se pudo obtener una estrategia.";
  } catch (error) {
    return "Error al consultar estrategia.";
  }
}

export async function getProductivityAdvice(config: CompoundInterestConfig): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Config: $${config.principal}, ${config.rate}%, ${config.years} años. Dame un consejo financiero corto.`,
      config: {
        systemInstruction: "Asesor financiero experto. Consejos breves y motivadores en español.",
      },
    });
    return response.text || "No se pudo obtener el consejo.";
  } catch (error) {
    return "Error al generar consejo.";
  }
}

/**
 * Generates a travel itinerary using Google Maps grounding.
 */
export async function getTravelPlanning(destination: string, days: number): Promise<{ text: string, sources: any[] }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Planifica un viaje de ${days} días a ${destination}. 
      REQUISITO CRÍTICO: Divide tu respuesta EXACTAMENTE en estas 3 secciones usando estos encabezados de nivel 2:
      ## ITINERARIO
      (Plan día por día)
      
      ## ATRACTIVOS
      (Sitios históricos o culturales con una breve descripción)
      
      ## GASTRONOMÍA
      (REQUISITO: Incluye platos típicos AND una lista de RESTAURANTES RECOMENDADOS con su especialidad)
      
      Estructura la gastronomía así: 
      - Plato Típico: descripción
      - Restaurante [Nombre]: especialidad y por qué ir.
      
      Sé conciso y usa puntos de viñeta.`,
      config: {
        tools: [{ googleMaps: {} }],
        systemInstruction: "Eres una guía de viajes experta. Proporciona itinerarios basados en lugares reales y verificables. Es vital incluir nombres específicos de restaurantes reales.",
      },
    });

    const text = response.text || "No se pudo generar el plan.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, sources };
  } catch (error) {
    console.error("Travel Service Error:", error);
    throw error;
  }
}
