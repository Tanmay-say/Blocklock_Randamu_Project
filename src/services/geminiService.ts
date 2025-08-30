// Gemini REST integration using fetch (mirrors the provided curl structure)

// Minimal safety categories/thresholds retained for reference in prompts
enum HarmCategory {
  HARM_CATEGORY_HARASSMENT = 'harassment',
  HARM_CATEGORY_HATE_SPEECH = 'hate_speech',
  HARM_CATEGORY_SEXUALLY_EXPLICIT = 'sexually_explicit',
  HARM_CATEGORY_DANGEROUS_CONTENT = 'dangerous_content'
}

enum HarmBlockThreshold {
  BLOCK_MEDIUM_AND_ABOVE = 'BLOCK_MEDIUM_AND_ABOVE'
}

export interface ImageGenerationRequest {
  prompt: string;
  style: string;
  size: string;
  negativePrompt?: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  imageHash?: string;
  error?: string;
  contentWarning?: boolean;
}

export interface ContentSafetyResult {
  isSafe: boolean;
  reasons: string[];
}

class GeminiService {
  private apiKey: string | null = null;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    // Get API key from environment variables
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  }

  /**
   * Initialize Gemini service with API key
   */
  public initialize(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Check if service is properly initialized
   */
  public isInitialized(): boolean {
    return this.apiKey !== null && this.apiKey !== 'your_gemini_api_key_here';
  }

  /**
   * Low-level call to Gemini generateContent (mirrors the provided curl)
   */
  private async generateContentRaw(prompt: string): Promise<string> {
    if (!this.isInitialized()) {
      throw new Error('Gemini service not initialized');
    }

    const url = `${this.baseUrl}/models/gemini-2.0-flash:generateContent`;
    const body = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    };

    const res = await fetch(url + `?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': this.apiKey as string
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Gemini API error: ${res.status} ${res.statusText} ${errText}`);
    }

    const data: any = await res.json();
    const text = this.extractTextFromResponse(data);
    return text || '';
  }

  /**
   * Extract text from Gemini response
   */
  private extractTextFromResponse(resp: any): string | null {
    try {
      const candidates = resp.candidates || [];
      for (const cand of candidates) {
        const parts = cand?.content?.parts || [];
        for (const p of parts) {
          if (typeof p?.text === 'string' && p.text.trim().length > 0) {
            return p.text.trim();
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Generate enhanced prompt with style and quality parameters
   */
  private enhancePrompt(request: ImageGenerationRequest): string {
    const { prompt, style, size } = request;
    
    // Style mappings to enhance prompts
    const styleEnhancements = {
      'digital-art': 'digital art, modern illustration, clean lines, vibrant colors, detailed',
      'pixel-art': '8-bit pixel art, retro gaming style, pixelated, nostalgic',
      'watercolor': 'watercolor painting, soft brush strokes, flowing colors, artistic',
      'oil-painting': 'oil painting, classical art style, rich textures, painted canvas',
      'anime': 'anime style, manga artwork, Japanese animation, detailed character design',
      'cyberpunk': 'cyberpunk, futuristic, neon lights, high-tech aesthetic, dystopian'
    };

    // Size-based quality enhancement
    const qualityMap = {
      '512x512': 'medium detail',
      '768x768': 'high detail',
      '1024x1024': 'ultra high detail, 4K quality',
      '1024x1536': 'ultra high detail, portrait orientation, 4K quality',
      '1536x1024': 'ultra high detail, landscape orientation, 4K quality'
    };

    const styleEnhancement = styleEnhancements[style as keyof typeof styleEnhancements] || '';
    const qualityEnhancement = qualityMap[size as keyof typeof qualityMap] || 'high detail';

    return `Create a detailed description for: ${prompt}. Style: ${styleEnhancement}. Quality: ${qualityEnhancement}. Professional artwork, no text, no watermarks, suitable for NFT collection.`;
  }

  /**
   * Check content safety using Gemini
   */
  public async checkContentSafety(prompt: string): Promise<ContentSafetyResult> {
    if (!this.isInitialized()) {
      return { isSafe: false, reasons: ['Service not initialized'] };
    }

    try {
      const safetyCheckPrompt = `Analyze this image generation prompt for safety and appropriateness: "${prompt}". Respond with only "SAFE" if the prompt is appropriate for a family-friendly NFT marketplace, or "UNSAFE: [reason]" if it contains inappropriate content. Consider violence, adult content, hate speech, illegal activities, or harmful content.`;
      const text = (await this.generateContentRaw(safetyCheckPrompt)).trim();

      if (text.startsWith('SAFE')) {
        return { isSafe: true, reasons: [] };
      } else if (text.startsWith('UNSAFE:')) {
        const reason = text.replace('UNSAFE:', '').trim();
        return { isSafe: false, reasons: [reason] };
      } else {
        return { isSafe: false, reasons: ['Content safety check inconclusive'] };
      }
    } catch (error) {
      console.error('Content safety check failed:', error);
      return { isSafe: false, reasons: ['Safety check failed'] };
    }
  }

  /**
   * Generate detailed image description using Gemini
   */
  public async generateImageDescription(request: ImageGenerationRequest): Promise<string> {
    if (!this.isInitialized()) {
      throw new Error('Gemini service not initialized');
    }

    try {
      // First check content safety
      const safetyCheck = await this.checkContentSafety(request.prompt);
      if (!safetyCheck.isSafe) {
        throw new Error(`Content safety violation: ${safetyCheck.reasons.join(', ')}`);
      }
      const enhancedPrompt = this.enhancePrompt(request);
      const descriptionPrompt = `${enhancedPrompt}

Generate a detailed, vivid description that could be used to create this image. Focus on visual elements, composition, lighting, colors, and atmosphere. Make it detailed enough for an AI image generator to create a stunning, professional artwork. Keep the description under 300 words and ensure it's appropriate for an NFT marketplace.`;

      const text = await this.generateContentRaw(descriptionPrompt);
      return text.trim();

    } catch (error) {
      console.error('Failed to generate image description:', error);
      throw new Error('Failed to generate image description');
    }
  }

  /**
   * Simulate image generation (since Gemini doesn't generate images directly)
   * In production, you would integrate with actual image generation services
   */
  public async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    console.log('🔧 generateImage called with:', request);
    console.log('🔑 Service initialized:', this.isInitialized());
    
    try {
      // Basic validation without API key requirement
      const validation = this.validatePrompt(request.prompt);
      console.log('✅ Validation result:', validation);
      
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // If API key is available, attempt safety + description via REST
      if (this.isInitialized()) {
        const safetyCheck = await this.checkContentSafety(request.prompt);
        if (!safetyCheck.isSafe) {
          return {
            success: false,
            error: `Content not suitable for generation: ${safetyCheck.reasons.join(', ')}`,
            contentWarning: true
          };
        }

        // Best-effort description
        try {
          await this.generateImageDescription(request);
        } catch (e) {
          console.warn('Description generation failed, proceeding with placeholder image');
        }
      }

      // Create placeholder image (works with or without API key)
      console.log('🖼️ Creating placeholder image...');
      const placeholderImage = await this.createPlaceholderImage(request, '');
      console.log('🖼️ Placeholder image created:', placeholderImage);
      
      return {
        success: true,
        imageUrl: placeholderImage.url,
        imageHash: placeholderImage.hash
      };

    } catch (error) {
      console.error('Image generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create placeholder image for demonstration
   * In production, replace with actual image generation
   */
  private async createPlaceholderImage(
    request: ImageGenerationRequest,
    description: string
  ): Promise<{ url: string; hash: string }> {
    console.log('🖼️ createPlaceholderImage called with:', { request, description });
    
    // Create a unique hash for the image using simple string manipulation
    const uniqueString = `${request.prompt}_${request.style}_${request.size}_${Date.now()}`;
    const imageHash = btoa(uniqueString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 44);
    console.log('🔐 Generated hash:', imageHash);

    // Create placeholder image URL
    const [width, height] = request.size.split('x').map(Number);
    
    // Build a prompt-driven image using a public endpoint (no API key). This reflects the user's prompt.
    // Service: Pollinations image proxy
    const stylePhrases: Record<string, string> = {
      'digital-art': 'digital art, modern illustration, vibrant colors',
      'pixel-art': '8-bit pixel art, retro game style',
      'watercolor': 'watercolor painting, soft brush strokes',
      'oil-painting': 'oil painting, classical canvas texture',
      'anime': 'anime style, manga artwork',
      'cyberpunk': 'cyberpunk neon futuristic',
      'surreal': 'surreal abstract dreamlike',
      'photorealistic': 'photorealistic high detail'
    };
    const stylePhrase = stylePhrases[request.style] || '';
    const prompt = encodeURIComponent(`${request.prompt}, ${stylePhrase}`);
    const seed = Math.floor(Math.random() * 10_000_000);
    const placeholderUrl = `https://image.pollinations.ai/prompt/${prompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&safe=high&model=flux`;
    console.log('🖼️ Generated URL:', placeholderUrl);

    // Use the actual HTTPS URL as the image reference so wallets (MetaMask, OpenSea)
    // can render previews correctly from tokenURI metadata.
    const result = {
      url: placeholderUrl,
      hash: placeholderUrl
    };
    console.log('🖼️ Returning result:', result);
    return result;
  }

  /**
   * Generate metadata for NFT
   */
  public async generateNFTMetadata(
    prompt: string,
    imageHash: string,
    style: string,
    size: string
  ): Promise<any> {
    if (!this.isInitialized()) {
      throw new Error('Gemini service not initialized');
    }

    try {
      const metadataPrompt = `Generate creative NFT metadata for an AI-generated image with the following details:
      Prompt: "${prompt}"
      Style: ${style}
      Size: ${size}
      
      Create a JSON response with:
      - name: A creative, catchy name for the NFT
      - description: A compelling description for collectors
      - attributes: An array of trait objects with trait_type and value
      
      Make it appealing for NFT collectors and highlight the AI-generated nature.
      Respond with valid JSON only.`;

      const text = (await this.generateContentRaw(metadataPrompt)).trim();

      // Parse JSON response
      try {
        const metadata = JSON.parse(text);
        
        // Add standard attributes
        metadata.attributes = metadata.attributes || [];
        metadata.attributes.push(
          { trait_type: "Generation Method", value: "AI Generated" },
          { trait_type: "Style", value: style },
          { trait_type: "Size", value: size },
          { trait_type: "Platform", value: "NGT GenAI Marketplace" }
        );

        return metadata;
      } catch (parseError) {
        console.error('Failed to parse metadata JSON:', parseError);
        // Fallback metadata
        return {
          name: `AI Genesis #${Date.now()}`,
          description: `AI-generated artwork: ${prompt}`,
          attributes: [
            { trait_type: "Generation Method", value: "AI Generated" },
            { trait_type: "Style", value: style },
            { trait_type: "Size", value: size },
            { trait_type: "Platform", value: "NGT GenAI Marketplace" }
          ]
        };
      }

    } catch (error) {
      console.error('Failed to generate NFT metadata:', error);
      // Return basic metadata
      return {
        name: `AI Genesis #${Date.now()}`,
        description: `AI-generated artwork: ${prompt}`,
        attributes: [
          { trait_type: "Generation Method", value: "AI Generated" },
          { trait_type: "Style", value: style },
          { trait_type: "Size", value: size },
          { trait_type: "Platform", value: "NGT GenAI Marketplace" }
        ]
      };
    }
  }

  /**
   * Generate VRF seed for uniqueness
   */
  public generateVRFSeed(prompt: string, style: string, timestamp: number): number {
    try {
      if (typeof crypto !== 'undefined' && (crypto as any).getRandomValues) {
        const array = new Uint32Array(2);
        (crypto as any).getRandomValues(array);
        const hi = BigInt(array[0]);
        const lo = BigInt(array[1]);
        const seedBig = (hi << 32n) | lo;
        return Number(seedBig % 0xffffffffn);
      }
    } catch {}

    // Fallback: mix prompt/style/time with Math.random and hash-like folding
    const entropy = `${prompt}|${style}|${timestamp}|${Math.random()}|${Math.random()}`;
    let acc = 0;
    for (let i = 0; i < entropy.length; i++) {
      acc = (acc * 31 + entropy.charCodeAt(i)) >>> 0;
    }
    return acc >>> 0;
  }

  /**
   * Validate prompt for AI generation
   */
  public validatePrompt(prompt: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!prompt || prompt.trim().length === 0) {
      errors.push('Prompt cannot be empty');
    }

    if (prompt.length < 10) {
      errors.push('Prompt must be at least 10 characters long');
    }

    if (prompt.length > 500) {
      errors.push('Prompt must be less than 500 characters');
    }

    // Check for prohibited terms
    const prohibitedTerms = [
      'nude', 'naked', 'nsfw', 'explicit', 'adult', 'violence', 'gore', 
      'hate', 'racist', 'discriminatory', 'illegal', 'drugs', 'weapons'
    ];

    const lowerPrompt = prompt.toLowerCase();
    for (const term of prohibitedTerms) {
      if (lowerPrompt.includes(term)) {
        errors.push(`Prompt contains prohibited content: ${term}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const geminiService = new GeminiService();