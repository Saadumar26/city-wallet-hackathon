import type {
  Offer,
  Merchant,
  MerchantRules,
} from "@workspace/api-zod";

interface Redemption {
  token: string;
  offerId: string;
  userId: string;
  cashbackAmount: number;
  used: boolean;
  createdAt: string;
}

interface Store {
  merchants: Merchant[];
  offers: Offer[];
  redemptions: Redemption[];
}

const initialMerchant: Merchant = {
  id: "cafe-muller",
  name: "Café Müller",
  address: "Marktplatz 12, Stuttgart",
  emoji: "☕",
  distanceMeters: 80,
  rules: {
    maxDiscountPercent: 20,
    triggerStartHour: 10,
    triggerEndHour: 14,
    volumeThreshold: 60,
    preferredTone: "warm",
    autoGenerate: true,
  },
};

export const store: Store = {
  merchants: [initialMerchant],
  offers: [],
  redemptions: [],
};

export function getDefaultMerchant(): Merchant {
  const m = store.merchants[0];
  if (!m) throw new Error("No merchant configured");
  return m;
}

export function updateRules(rules: MerchantRules): MerchantRules {
  const m = getDefaultMerchant();
  m.rules = rules;
  return m.rules;
}

export function addOffer(offer: Offer): void {
  store.offers.unshift(offer);
  if (store.offers.length > 50) store.offers.length = 50;
}

export function listRecentOffers(limit = 10): Offer[] {
  return store.offers.slice(0, limit);
}

export function findOffer(id: string): Offer | undefined {
  return store.offers.find((o) => o.id === id);
}

export function markOfferAccepted(id: string): void {
  const o = findOffer(id);
  if (o) o.accepted = true;
}

export function addRedemption(r: Redemption): void {
  store.redemptions.push(r);
}

export function findRedemptionByToken(token: string): Redemption | undefined {
  return store.redemptions.find((r) => r.token === token);
}

export function listRedemptions(): Redemption[] {
  return store.redemptions;
}
