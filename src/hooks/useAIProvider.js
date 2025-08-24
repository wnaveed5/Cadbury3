// AI provider hook - calls our secure server endpoint
// NOTE: API keys are now stored securely on the server

export function useAIProvider() {
  async function getFieldSuggestions(payload) {
    try {
      const response = await fetch('/api/ai/fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI call failed: ${errorText}`);
      }

      const { suggestions } = await response.json();
      return { suggestions };
    } catch (error) {
      console.error('AI API call failed:', error);
      throw error;
    }
  }

  return { getFieldSuggestions };
}


