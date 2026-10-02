import { env } from '../config/env';

/**
 * Single source of truth for the Premium product (§22, §71, §83).
 * Price lives in INTEGER MINOR UNITS — never a float (§84).
 */
export type PremiumProduct = {
  slug: 'REVISE_AI_PREMIUM';
  name: string;
  description: string;
  priceMinor: number;
  currency: string;
  displayPrice: string;
  purchaseChannel: 'DISCORD';
  fulfilment: 'PREMIUM_KEY';
  enabled: boolean;
  features: string[];
  limits: {
    aiRequestsPerDay: number;
    quizGenerationsPerDay: number;
    flashcardGenerationsPerDay: number;
    documentPagesPerDay: number;
    storageBytes: number;
  };
  discord: { inviteUrl: string; configured: boolean; pricingChannel: string; buyChannel: string };
};

const CURRENCY_SYMBOLS: Record<string, string> = { GBP: '£', EUR: '€', USD: '$' };

/** Decimal-safe: builds "£3.99" from 399 using integer arithmetic only. */
export function formatMinor(minor: number, currency: string): string {
  if (!Number.isInteger(minor) || minor < 0) throw new Error('Price must be a non-negative integer in minor units.');
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  const whole = Math.floor(minor / 100);
  const frac = String(minor % 100).padStart(2, '0');
  return `${symbol}${whole}.${frac}`;
}

export function getPremiumProduct(): PremiumProduct {
  const priceMinor = env.PREMIUM_PRICE_MINOR;
  const currency = env.PREMIUM_CURRENCY;
  if (!Number.isInteger(priceMinor) || priceMinor < 0) {
    throw new Error('PREMIUM_PRICE_MINOR must be a non-negative integer.');
  }
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('PREMIUM_CURRENCY must be a 3-letter ISO code.');
  const inviteUrl = env.DISCORD_INVITE_URL;
  return {
    slug: 'REVISE_AI_PREMIUM',
    name: 'Premium',
    description: 'Higher daily AI limits, every available model, longer documents and priority support.',
    priceMinor,
    currency,
    displayPrice: formatMinor(priceMinor, currency),
    purchaseChannel: 'DISCORD',
    fulfilment: 'PREMIUM_KEY',
    enabled: true,
    features: [
      'Higher daily AI request limits',
      'Access to every enabled model, including long-context and image-capable ones',
      'Larger document uploads and more pages per document',
      'Unlimited quiz and flashcard generation',
      'Priority support in the Revise AI Discord'
    ],
    limits: {
      aiRequestsPerDay: 400, quizGenerationsPerDay: 60, flashcardGenerationsPerDay: 60,
      documentPagesPerDay: 300, storageBytes: 200 * 1024 * 1024
    },
    discord: {
      inviteUrl,
      configured: /^https:\/\/(discord\.gg|discord\.com\/invite)\//.test(inviteUrl),
      pricingChannel: '#pricing',
      buyChannel: '#buy-premium'
    }
  };
}

export const FREE_LIMITS = {
  aiRequestsPerDay: 25, quizGenerationsPerDay: 5, flashcardGenerationsPerDay: 5,
  documentPagesPerDay: 25, storageBytes: 20 * 1024 * 1024
} as const;
