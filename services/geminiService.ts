
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { NULLU_SYSTEM_PROMPT } from "../constants";
import { FXPair, SMCConfirmation } from "../types";

export interface MultiChartInput {
  base64: string;
  mimeType: string;
  label: string;
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
  }

  async generateBriefing(type: 'MORNING' | 'MIDDAY' | 'EOD' | 'WEEKLY' | 'COMMAND') {
    let prompt = "";
    
    switch (type) {
      case 'MORNING':
        prompt = "Nullu: Generate MONDAY–FRIDAY 07:00 — MORNING BRIEF. Search for latest macro news and upcoming calendar events for USD, EUR, GBP, JPY, AUD.";
        break;
      case 'MIDDAY':
        prompt = "Nullu: Generate MONDAY–FRIDAY 12:00 — MIDDAY BRIEF. Search for market reactions since the NY open.";
        break;
      case 'EOD':
        prompt = "Nullu: Generate MONDAY–FRIDAY 18:00 — END-OF-DAY REPORT. Recap major drivers and liquidity sweeps of the day.";
        break;
      case 'WEEKLY':
        prompt = "Nullu: Generate SUNDAY — 18:00 WEEKLY TRANSITION BRIEF. Focus on Asia open and next week's key catalysts.";
        break;
      default:
        prompt = "Nullu: Standard Market Scan.";
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: NULLU_SYSTEM_PROMPT,
          tools: [{ googleSearch: {} }],
        },
      });

      return {
        text: response.text || "Failed to generate briefing.",
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          title: chunk.web?.title || 'Source',
          uri: chunk.web?.uri || '',
        })).filter((s: any) => s.uri) || [],
      };
    } catch (error) {
      console.error("Gemini Error:", error);
      return { text: "System Error: Connection to intelligence node lost.", sources: [] };
    }
  }

  async analyzeSMC(pair: FXPair): Promise<SMCConfirmation | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Nullu: Perform a tactical SMC technical scan for ${pair}. 
        Check for: 
        1) Recent liquidity grabs (sweeps of high/low).
        2) Immediate displacement (energetic move).
        3) Structural confirmation (BOS or CHoCH).
        Return findings in clinical institutional language.`,
        config: {
          systemInstruction: NULLU_SYSTEM_PROMPT,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['LIQUIDITY_GRAB', 'DISPLACEMENT', 'BOS', 'CHOCH'] },
              details: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              detected: { type: Type.BOOLEAN }
            },
            required: ['type', 'details', 'confidence', 'detected']
          }
        },
      });

      const result = JSON.parse(response.text || '{}');
      if (!result.detected) return null;

      return {
        pair,
        timestamp: new Date(),
        type: result.type,
        details: result.details,
        confidence: result.confidence
      };
    } catch (error) {
      console.error("SMC Scan Error:", error);
      return null;
    }
  }

  async analyzeMultiTimeframeCharts(charts: MultiChartInput[]) {
    try {
      const parts: any[] = charts.map(chart => ({
        inlineData: {
          data: chart.base64,
          mimeType: chart.mimeType,
        },
      }));

      const chartLabels = charts.map(c => c.label).join(", ");
      
      parts.push({
        text: `Nullu: TOP-DOWN Institutional Chart Analysis. 
        Inputs: Three charts labeled ${chartLabels}.
        
        Task:
        1. Perform a multi-timeframe analysis:
           - Use the 4H chart for High-Timeframe Bias and major liquidity zones.
           - Use the 1H chart for mid-term structural shifts (BOS).
           - Use the 15M chart for precise entry confirmation (CHoCH, FVG).
        2. Visually annotate the charts to mark:
           - Liquidity sweeps, manipulation zones, BOS, and CHoCH.
           - Mark one high-confluence trade setup projection with entry, SL, and TP clearly labeled.
        3. Provide a clinical text recap of the top-down logic.
        4. Return the annotated images and the analysis text.
        
        Style: Clinical, institutional, direct. End with 'Not financial advice.'`,
      });

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
          systemInstruction: NULLU_SYSTEM_PROMPT,
        },
      });

      let textContent = "";
      let annotatedImages: string[] = [];

      const responseParts = response.candidates?.[0]?.content?.parts || [];
      for (const part of responseParts) {
        if (part.text) {
          textContent += part.text;
        } else if (part.inlineData) {
          annotatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        }
      }

      return {
        text: textContent || "Analysis completed.",
        images: annotatedImages
      };
    } catch (error) {
      console.error("Multi-Image Analysis Error:", error);
      return { text: "Critical failure in top-down vision sub-system.", images: [] };
    }
  }

  async executeCommand(command: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: command.startsWith("Nullu:") ? command : `Nullu: ${command}`,
        config: {
          systemInstruction: NULLU_SYSTEM_PROMPT,
          tools: [{ googleSearch: {} }],
        },
      });

      return {
        text: response.text || "Command processed with no output.",
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          title: chunk.web?.title || 'Source',
          uri: chunk.web?.uri || '',
        })).filter((s: any) => s.uri) || [],
      };
    } catch (error) {
      console.error("Command Error:", error);
      return { text: "Command failed.", sources: [] };
    }
  }

  async checkExtremeAlert() {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Nullu: EXTREME ALERT MODE. Check for major breaking news or volatility that invalidates current FX biases for our 4 pairs. If nothing extreme, respond exactly: No alert.",
        config: {
          systemInstruction: NULLU_SYSTEM_PROMPT,
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text?.trim();
      if (text === "No alert.") return null;

      return {
        text: text || "Alert detected but content empty.",
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          title: chunk.web?.title || 'Source',
          uri: chunk.web?.uri || '',
        })).filter((s: any) => s.uri) || [],
      };
    } catch (error) {
      return null;
    }
  }
}
