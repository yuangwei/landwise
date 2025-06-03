/**
 * AI Prompt Configuration for LandingWise
 * Configurable prompts for landing page generation using LangGraph
 */

export interface GenerationContext {
  userPrompt: string;
  previousMessages?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  currentContent?: string;
  requirements?: string[];
  style?: "modern" | "minimal" | "corporate" | "creative";
}

export const SYSTEM_PROMPTS = {
  // Main system prompt for landing page generation
  LANDING_PAGE_GENERATOR: `You are an expert web developer and UI/UX designer specializing in creating high-converting landing pages.

Your task is to generate modern, responsive landing pages using HTML, Tailwind CSS, and minimal JavaScript.

KEY REQUIREMENTS:
1. Use only HTML, Tailwind CSS classes, and vanilla JavaScript (no frameworks)
2. Create a modern, clean, and professional design
3. Include a prominent email collection form for waitlist signup
4. Make it fully responsive (mobile-first approach)
5. Include proper semantic HTML and accessibility features
6. Add subtle animations and interactions to enhance UX
7. Generate complete, ready-to-use HTML that can run standalone

DESIGN PRINCIPLES:
- Modern and minimalist aesthetic
- High contrast and readable typography
- Strategic use of whitespace
- Clear visual hierarchy
- Strong call-to-action elements
- Trust signals and social proof when appropriate

OUTPUT FORMAT:
Return only the complete HTML document with embedded CSS (using Tailwind CDN) and JavaScript.
Include the waitlist form with proper form handling.
Do not include any explanations or markdown - just the raw HTML.`,

  // Prompt for refining existing content
  CONTENT_REFINER: `You are helping to refine and improve an existing landing page based on user feedback.

Analyze the current content and the user's specific requests for changes.
Make targeted improvements while maintaining the overall design consistency.

Focus on:
1. Implementing the specific changes requested
2. Maintaining design coherence
3. Improving conversion elements
4. Enhancing user experience
5. Keeping the waitlist form functional

Return the updated complete HTML document.`,

  // Prompt for style adjustments
  STYLE_ADJUSTER: `You are a UI/UX specialist focused on visual design and styling.

Your task is to adjust the visual style of the landing page while keeping the content and structure intact.

Available styles:
- modern: Clean lines, bold typography, contemporary design
- minimal: Maximum whitespace, simple elements, subtle design
- corporate: Professional, trustworthy, business-oriented
- creative: Unique layouts, artistic elements, engaging visuals

Apply the requested style changes while ensuring:
1. Responsive design is maintained
2. Accessibility standards are met
3. The waitlist form remains prominent and functional
4. Overall user experience is enhanced

Return the updated complete HTML document.`,
};

export const generateLandingPagePrompt = (context: GenerationContext): string => {
  const { userPrompt, previousMessages, currentContent, style = "modern" } = context;

  let prompt = SYSTEM_PROMPTS.LANDING_PAGE_GENERATOR;

  // Add style-specific instructions
  prompt += `\n\nSTYLE REQUIREMENTS:
Apply a ${style} design style to the landing page.`;

  // Add conversation context if available
  if (previousMessages && previousMessages.length > 0) {
    prompt += `\n\nCONVERSATION CONTEXT:
Previous conversation history:
${previousMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`;
  }

  // Add current content context if available
  if (currentContent) {
    prompt += `\n\nCURRENT CONTENT:
Here's the existing landing page that needs to be modified:
${currentContent}`;
    prompt = SYSTEM_PROMPTS.CONTENT_REFINER + prompt;
  }

  // Add the user's specific request
  prompt += `\n\nUSER REQUEST:
${userPrompt}

Generate the complete HTML landing page now.`;

  return prompt;
};

export const generateStyleAdjustmentPrompt = (
  currentContent: string,
  styleChanges: string,
  targetStyle = "modern"
): string => {
  return `${SYSTEM_PROMPTS.STYLE_ADJUSTER}

TARGET STYLE: ${targetStyle}

CURRENT LANDING PAGE:
${currentContent}

REQUESTED STYLE CHANGES:
${styleChanges}

Apply these style changes and return the updated complete HTML document.`;
};

// Validation prompt to ensure output quality
export const VALIDATION_PROMPT = `Review the generated landing page HTML and ensure:

1. It's a complete, valid HTML document
2. Uses Tailwind CSS classes properly
3. Includes a functional waitlist email form
4. Is fully responsive
5. Has proper semantic structure
6. Includes necessary meta tags and accessibility features
7. Contains appropriate call-to-action elements

If any issues are found, provide the corrected HTML.`;

// Available design elements for dynamic prompting
export const DESIGN_ELEMENTS = {
  colors: {
    modern: "blue-600, gray-900, white",
    minimal: "gray-800, gray-100, white",
    corporate: "blue-800, gray-700, white",
    creative: "purple-600, pink-500, yellow-400"
  },
  typography: {
    modern: "font-sans, font-semibold headings",
    minimal: "font-light, clean serif for body",
    corporate: "font-sans, font-medium headings",
    creative: "mix of sans and display fonts"
  },
  layouts: {
    modern: "grid-based, card components",
    minimal: "single column, lots of whitespace",
    corporate: "traditional sections, hero-features-testimonials",
    creative: "asymmetric, overlapping elements"
  }
}; 