/**
 * Simplified AI Service for Landing Page Generation
 * A basic implementation for testing without complex LangGraph setup
 */

import { env } from "~/env";

interface GenerationContext {
  userPrompt: string;
  previousMessages?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  currentContent?: string;
  style?: "modern" | "minimal" | "corporate" | "creative";
}

export class SimpleLandingPageGenerator {
  private async callOpenRouter(prompt: string): Promise<string> {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": env.BETTER_AUTH_URL as string,
          "X-Title": "LandingWise",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [
            {
              role: "system",
              content: `You are an expert web developer creating landing pages. Generate a complete, responsive HTML landing page using Tailwind CSS.

REQUIREMENTS:
1. Use only HTML and Tailwind CSS (include CDN)
2. Include a prominent email collection form for waitlist signup
3. Make it fully responsive and modern
4. Include proper semantic HTML
5. Add the form attribute data-waitlist="true" to the email form

OUTPUT: Return only the complete HTML document, no explanations.`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("OpenRouter API call failed:", error);
      return this.getFallbackHTML();
    }
  }

  private getFallbackHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Landing Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen flex items-center justify-center px-4">
        <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
            <h1 class="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h1>
            <p class="text-gray-600 mb-6">We're building something amazing. Join our waitlist to be the first to know when we launch!</p>
            
            <form data-waitlist="true" class="space-y-4">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        required
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email"
                    >
                </div>
                <button 
                    type="submit"
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Join Waitlist
                </button>
            </form>
        </div>
    </div>
</body>
</html>`;
  }

  async generateLandingPage(
    userPrompt: string,
    context?: Partial<GenerationContext>
  ): Promise<{
    html: string;
    success: boolean;
    errors: string[];
    iterations: number;
  }> {
    try {
      let prompt = userPrompt;

      if (context?.currentContent) {
        prompt = `Modify this existing landing page based on the user's request: "${userPrompt}"\n\nCurrent content:\n${context.currentContent}`;
      }

      if (context?.style) {
        prompt += `\n\nStyle: Use a ${context.style} design aesthetic.`;
      }

      const html = await this.callOpenRouter(prompt);

      // Basic validation
      const hasHtml = html.includes('<html') && html.includes('</html>');
      const hasForm = html.includes('data-waitlist') || html.includes('type="email"');

      if (!hasHtml || !hasForm) {
        return {
          html: this.getFallbackHTML(),
          success: false,
          errors: ["Generated content doesn't meet requirements, using fallback"],
          iterations: 1,
        };
      }

      return {
        html,
        success: true,
        errors: [],
        iterations: 1,
      };
    } catch (error) {
      return {
        html: this.getFallbackHTML(),
        success: false,
        errors: [`Generation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        iterations: 1,
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
    const result = await this.generateLandingPage(userFeedback, {
      userPrompt: userFeedback,
      currentContent: currentHtml,
      previousMessages: conversationHistory,
    });

    return {
      html: result.html,
      success: result.success,
      errors: result.errors,
    };
  }
}

// Export singleton instance
export const simpleAIService = new SimpleLandingPageGenerator();
