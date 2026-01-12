
export type FXPair = 'USD/JPY' | 'GBP/JPY' | 'EUR/USD' | 'AUD/USD';

export interface Briefing {
  id: string;
  type: 'MORNING' | 'MIDDAY' | 'EOD' | 'WEEKLY' | 'COMMAND' | 'ALERT' | 'CHART_ANALYSIS';
  timestamp: Date;
  content: string;
  images?: string[]; // Array of Base64 data URLs for annotated charts
  sources?: Array<{ title: string; uri: string }>;
}

export interface SMCConfirmation {
  pair: FXPair;
  timestamp: Date;
  type: 'LIQUIDITY_GRAB' | 'DISPLACEMENT' | 'BOS' | 'CHOCH';
  details: string;
  confidence: number; // 0-100
}

export interface ChartAnalysisResult {
  id: string;
  timestamp: Date;
  imageUrl: string;
  analysis: string;
}

export interface AppState {
  briefings: Briefing[];
  isThinking: boolean;
  activeCommand: string;
  selectedPair: FXPair | null;
  confirmations: SMCConfirmation[];
}
