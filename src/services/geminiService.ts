import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

let genAI: any = null;

export const getGemini = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. AI features truncated.");
      return null;
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

const renderMapTool: FunctionDeclaration = {
  name: "renderMap",
  description: "Renders an interactive Google Map for a specific location.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: "The name of the place to show on the map (e.g., 'Paris, France')."
      },
      zoom: {
        type: Type.NUMBER,
        description: "The zoom level, from 1 to 20. Default is 12."
      }
    },
    required: ["location"]
  }
};

const generateImageTool: FunctionDeclaration = {
  name: "generateImage",
  description: "Generates an image based on a descriptive prompt.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: "Detailed description of the image to generate."
      }
    },
    required: ["prompt"]
  }
};

export const generateAgentResponse = async (
  agentName: string,
  agentRole: string,
  history: { role: string; content: string }[],
  userPrompt: string,
  modelName: string = "gemini-3-flash-preview",
  provider: 'gemini' | 'openrouter' = 'gemini',
  customApiKey?: string,
  signal?: AbortSignal
) => {
  const systemInstruction = `You are ${agentName}, an AI agent with the role of ${agentRole}. 
  Provide concise, expert-level assistance. 
  Maintain a technical and helpful tone.
  You have access to Google Search for live, real-time data (weather, news, etc.).
  You can also render interactive maps and generate images via tools.
  DO NOT hallucinate data. If you don't know something, use Google Search.`;

  if (provider === 'openrouter') {
    const apiKey = customApiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) return { text: "OpenRouter API Key not found. Please check your settings." };

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal,
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ai.studio/build",
          "X-Title": "Wave Agent"
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: systemInstruction },
            ...history.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
            { role: "user", content: userPrompt }
          ]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "OpenRouter error");
      
      return {
        text: data.choices[0].message.content || "",
        functionCalls: null // OpenRouter tools would need more mapping
      };
    } catch (error) {
      console.error("OpenRouter Error:", error);
      return { text: "Error communicating via OpenRouter. " + (error instanceof Error ? error.message : "") };
    }
  }

  const ai = getGemini();
  if (!ai) return { text: "AI service unavailable. Please check your API key." };

  try {
    const contents = [
      ...history.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      { role: 'user', parts: [{ text: userPrompt }] }
    ];

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction
      },
      tools: [
        { googleSearch: {} },
        { functionDeclarations: [renderMapTool, generateImageTool] }
      ],
      toolConfig: { includeServerSideToolInvocations: true }
    });

    return {
      text: response.text || "",
      functionCalls: response.functionCalls || null
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "Error communicating with the agent. Please try again." };
  }
};
