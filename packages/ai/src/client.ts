import Anthropic from '@anthropic-ai/sdk';

let _anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

// Lazy proxy: the Anthropic client is only constructed on first property
// access, so a missing ANTHROPIC_API_KEY does not crash the whole serverless
// function at module-load time — only AI-dependent requests fail.
export const anthropic = new Proxy({} as Anthropic, {
  get(_target, prop) {
    const client = getAnthropic();
    const value = client[prop as keyof Anthropic];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export const MODEL = 'claude-sonnet-4-20250514';
