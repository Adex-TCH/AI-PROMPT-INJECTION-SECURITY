export type ScenarioType = 'direct' | 'indirect' | 'benign' | 'sensitive' | 'tools';

export interface Scenario {
  id: ScenarioType;
  name: string;
  description: string;
  prompt: string;
  document?: string;
}

export interface AssistantResponse {
  response: string;
  disclosedSecret: boolean;
  unauthorizedAccess: boolean;
  blockedReason?: string;
}

export interface DemonstrationResult {
  id: string;
  timestamp: number;
  scenario: ScenarioType;
  userPrompt: string;
  insecureResponse: AssistantResponse;
  secureResponse: AssistantResponse;
  classification: string;
}

export interface TestResult {
  id: string;
  name: string;
  scenario: ScenarioType;
  description: string;
  expected: string;
  actual: string;
  passed: boolean;
}
