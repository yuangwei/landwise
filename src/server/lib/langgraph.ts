/**
 * LangGraph-based AI Service for Landing Page Generation
 * Uses OpenRouter API with Meta Llama 3.1 8B Instruct (Free)
 */

import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, END, type StateDefinition } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { env } from "~/env";
import {
  generateLandingPagePrompt,
  generateStyleAdjustmentPrompt,
  VALIDATION_PROMPT,
  type GenerationContext
} from "./prompts";

// State interface for the LangGraph workflow
interface LandingPageState {
  userPrompt: string;
  context?: GenerationContext;
  generatedHtml: string;
  isValid: boolean;
  iterations: number;
  maxIterations: number;
  errors: string[];
}

// Initialize OpenRouter client
const llm = new ChatOpenAI({
  modelName: "meta-llama/llama-3.1-8b-instruct:free",
  openAIApiKey: env.OPENROUTER_API_KEY as string,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": env.BETTER_AUTH_URL as string,
      "X-Title": "LandingWise",
    },
  },
  temperature: 0.7,
  maxTokens: 4000,
});

// LangGraph node functions
async function generateInitialContent(state: LandingPageState): Promise<Partial<LandingPageState>> {
  try {
    const prompt = generateLandingPagePrompt({
      userPrompt: state.userPrompt,
      ...state.context,
    });

    const response = await llm.invoke([
      new SystemMessage(prompt),
      new HumanMessage(state.userPrompt),
    ]);

    const generatedHtml = response.content as string;

    return {
      generatedHtml,
      iterations: state.iterations + 1,
    };
  } catch (error: unknown) {
    return {
      errors: [...state.errors, `Generation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      iterations: state.iterations + 1,
    };
  }
}

async function validateContent(state: LandingPageState): Promise<Partial<LandingPageState>> {
  try {
    // Basic validation checks
    const html = state.generatedHtml;
    const hasHtmlStructure = html.includes('<html') && html.includes('</html>');
    const hasWaitlistForm = html.includes('form') &&
      (html.includes('email') || html.includes('waitlist'));
    const hasTailwind = html.includes('tailwind') || html.includes('cdn.tailwindcss.com');

    const isBasicValid = hasHtmlStructure && hasWaitlistForm && hasTailwind;

    if (isBasicValid) {
      return { isValid: true };
    }

    // If basic validation fails, try to fix with AI
    if (state.iterations < state.maxIterations) {
      const validationPrompt = `${VALIDATION_PROMPT}

Current HTML:
${html}

Issues detected:
${!hasHtmlStructure ? "- Missing proper HTML structure" : ""}
${!hasWaitlistForm ? "- Missing waitlist email form" : ""}
${!hasTailwind ? "- Missing Tailwind CSS" : ""}

Fix these issues and return the corrected HTML.`;

      const response = await llm.invoke([
        new SystemMessage(validationPrompt),
      ]);

      return {
        generatedHtml: response.content as string,
        iterations: state.iterations + 1,
        isValid: false, // Will re-validate in next iteration
      };
    }

    return {
      isValid: false,
      errors: [...state.errors, "Validation failed after maximum iterations"],
    };
  } catch (error: unknown) {
    return {
      isValid: false,
      errors: [...state.errors, `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

// Conditional function to determine next step
function shouldContinueGeneration(state: LandingPageState): string {
  if (state.isValid) {
    return END;
  }

  if (state.iterations >= state.maxIterations) {
    return END;
  }

  return "validate";
}

// Create the LangGraph workflow
const createLandingPageWorkflow = () => {
  const workflow = new StateGraph<LandingPageState>({
    channels: {
      userPrompt: null,
      context: null,
      generatedHtml: null,
      isValid: null,
      iterations: null,
      maxIterations: null,
      errors: null,
    },
  });

  // Add nodes
  workflow.addNode("generate", generateInitialContent);
  workflow.addNode("validate", validateContent);

  // Add edges
  workflow.addEdge("generate", "validate");
  workflow.addConditionalEdges("validate", shouldContinueGeneration, {
    validate: "validate",
    [END]: END,
  });

  // Set entry point
  workflow.setEntryPoint("generate");

  return workflow.compile();
};

// Main service class
export class LandingPageGenerator {
  private workflow = createLandingPageWorkflow();

  async generateLandingPage(
    userPrompt: string,
    context?: Partial<GenerationContext>
  ): Promise<{
    html: string;
    success: boolean;
    errors: string[];
    iterations: number;
  }> {
    const initialState: LandingPageState = {
      userPrompt,
      context: context as GenerationContext,
      generatedHtml: "",
      isValid: false,
      iterations: 0,
      maxIterations: 3,
      errors: [],
    };

    try {
      const result = await this.workflow.invoke(initialState);

      return {
        html: result.generatedHtml ?? "",
        success: result.isValid ?? false,
        errors: result.errors ?? [],
        iterations: result.iterations ?? 0,
      };
    } catch (error: unknown) {
      return {
        html: "",
        success: false,
        errors: [`Workflow error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        iterations: 0,
      };
    }
  }

  async refineContent(
    currentHtml: string,
    userFeedback: string,
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>
  ): Promise<{
    html: string;
    success: boolean;
    errors: string[];
  }> {
    try {
      const context: GenerationContext = {
        userPrompt: userFeedback,
        currentContent: currentHtml,
        previousMessages: conversationHistory,
      };

      const result = await this.generateLandingPage(userFeedback, context);
      return result;
    } catch (error) {
      return {
        html: currentHtml, // Return original if refinement fails
        success: false,
        errors: [`Refinement error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };
    }
  }

  async adjustStyle(
    currentHtml: string,
    styleRequest: string,
    targetStyle: "modern" | "minimal" | "corporate" | "creative" = "modern"
  ): Promise<{
    html: string;
    success: boolean;
    errors: string[];
  }> {
    try {
      const prompt = generateStyleAdjustmentPrompt(currentHtml, styleRequest, targetStyle);

      const response = await llm.invoke([
        new SystemMessage(prompt),
      ]);

      return {
        html: response.content as string,
        success: true,
        errors: [],
      };
    } catch (error) {
      return {
        html: currentHtml, // Return original if style adjustment fails
        success: false,
        errors: [`Style adjustment error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };
    }
  }
}

// Singleton instance
export const landingPageGenerator = new LandingPageGenerator(); 