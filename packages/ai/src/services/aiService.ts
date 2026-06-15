import { anthropic, MODEL } from '../client';
import { AIGenerationError } from '../errors';
import { buildBusinessPlanPrompt } from '../prompts/businessPlan';
import { buildPitchDeckPrompt } from '../prompts/pitchDeck';
import { buildFinancialNarrativePrompt } from '../prompts/financialNarrative';
import { buildCoverLetterPrompt } from '../prompts/coverLetter';
import { buildPitchReviewPrompt } from '../prompts/pitchReview';
import { buildChatSystemPrompt } from '../prompts/chat';
import { buildBankLoanPrompt } from '../prompts/bankLoan';
import type {
  OnboardingData,
  BusinessPlanContent,
  PitchDeckContent,
  PitchReviewResult,
  FinancialModelOutputs,
  ChatMessage,
  AudienceType,
  PitchFramework,
  BusinessPlanSection,
} from '@sme-pitch-ai/shared';
import { BUSINESS_PLAN_SECTIONS, PitchDeckContentSchema, PitchReviewResultSchema } from '@sme-pitch-ai/shared';

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const isOverload =
        err instanceof Error &&
        (err.message.includes('529') || err.message.includes('overloaded'));
      if (!isOverload || attempt === maxRetries) break;
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

export async function generateBusinessPlanSection(
  profile: OnboardingData,
  section: BusinessPlanSection,
  audience: AudienceType
): Promise<string> {
  const { system, user } = buildBusinessPlanPrompt(profile, section, audience);
  return withRetry(async () => {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: user }],
    });
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AI] section=${section} tokens=${JSON.stringify(response.usage)}`);
    }
    const block = response.content[0];
    if (block.type !== 'text') throw new AIGenerationError('Unexpected response type', 'UNEXPECTED_RESPONSE');
    return block.text;
  });
}

export async function generateFullBusinessPlan(
  profile: OnboardingData,
  audience: AudienceType,
  onSection: (sectionId: string, content: string) => void
): Promise<BusinessPlanContent> {
  const sections: BusinessPlanContent['sections'] = [];
  let totalWordCount = 0;

  for (const sectionDef of BUSINESS_PLAN_SECTIONS) {
    const content = await generateBusinessPlanSection(profile, sectionDef.id, audience);
    const wordCount = content.split(/\s+/).length;
    totalWordCount += wordCount;
    const sectionResult = {
      id: sectionDef.id,
      title: sectionDef.title,
      content,
      wordCount,
      generatedAt: new Date().toISOString(),
    };
    sections.push(sectionResult);
    onSection(sectionDef.id, content);
  }

  return {
    audience,
    sections,
    totalWordCount,
    generatedAt: new Date().toISOString(),
  };
}

export async function generatePitchDeck(
  profile: OnboardingData,
  framework: PitchFramework
): Promise<PitchDeckContent> {
  const { system, user } = buildPitchDeckPrompt(profile, framework);
  return withRetry(async () => {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: user }],
    });
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AI] pitchDeck tokens=${JSON.stringify(response.usage)}`);
    }
    const block = response.content[0];
    if (block.type !== 'text') throw new AIGenerationError('Unexpected response type', 'UNEXPECTED_RESPONSE');
    const parsed = JSON.parse(block.text) as unknown;
    return PitchDeckContentSchema.parse(parsed);
  });
}

export async function reviewPitchDeck(deck: PitchDeckContent): Promise<PitchReviewResult> {
  const { system, user } = buildPitchReviewPrompt(deck);
  return withRetry(async () => {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: user }],
    });
    const block = response.content[0];
    if (block.type !== 'text') throw new AIGenerationError('Unexpected response type', 'UNEXPECTED_RESPONSE');
    const parsed = JSON.parse(block.text) as unknown;
    return PitchReviewResultSchema.parse(parsed);
  });
}

export async function generateCoverLetter(
  profile: OnboardingData,
  funderName: string,
  amount: number,
  purpose: string
): Promise<string> {
  const { system, user } = buildCoverLetterPrompt(profile, funderName, amount, purpose);
  return withRetry(async () => {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: user }],
    });
    const block = response.content[0];
    if (block.type !== 'text') throw new AIGenerationError('Unexpected response type', 'UNEXPECTED_RESPONSE');
    return block.text;
  });
}

export async function generateBankLoanApplication(
  profile: OnboardingData,
  bankName: string,
  loanAmount: number,
  purpose: string,
  tenureMonths: number
): Promise<string> {
  const { system, user } = buildBankLoanPrompt(profile, bankName, loanAmount, purpose, tenureMonths);
  return withRetry(async () => {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: user }],
    });
    const block = response.content[0];
    if (block.type !== 'text') throw new AIGenerationError('Unexpected response type', 'UNEXPECTED_RESPONSE');
    return block.text;
  });
}

export async function generateFinancialNarrative(
  profile: OnboardingData,
  outputs: FinancialModelOutputs
): Promise<string> {
  const { system, user } = buildFinancialNarrativePrompt(profile, outputs);
  return withRetry(async () => {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      system,
      messages: [{ role: 'user', content: user }],
    });
    const block = response.content[0];
    if (block.type !== 'text') throw new AIGenerationError('Unexpected response type', 'UNEXPECTED_RESPONSE');
    return block.text;
  });
}

export async function streamChatResponse(
  profile: OnboardingData,
  messages: ChatMessage[],
  onChunk: (text: string) => void
): Promise<void> {
  const systemPrompt = buildChatSystemPrompt(profile);
  await withRetry(async () => {
    const stream = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: true,
    });
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        onChunk(event.delta.text);
      }
    }
  });
}
