import { Router, type IRouter } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  GenerateOfferResponse,
  ListOffersResponse,
} from "@workspace/api-zod";
import type { Offer } from "@workspace/api-zod";
import { buildContextState } from "../services/contextService";
import { generateOffer } from "../services/geminiService";
import {
  addOffer,
  getDefaultMerchant,
  listRecentOffers,
} from "../lib/store";

const router: IRouter = Router();

router.post("/offers/generate", async (_req, res, next) => {
  try {
    const merchant = getDefaultMerchant();
    const context = await buildContextState();
    const generated = await generateOffer(context, merchant.rules);

    const offer: Offer = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      merchantId: merchant.id,
      merchantName: merchant.name,
      merchantEmoji: merchant.emoji,
      distanceMeters: merchant.distanceMeters,
      headline: generated.headline,
      subtext: generated.subtext,
      discountPercent: generated.discountPercent,
      expiryMinutes: generated.expiryMinutes,
      tone: generated.tone,
      ctaText: generated.ctaText,
      contextSnapshot: context,
      accepted: false,
    };

    addOffer(offer);
    const data = GenerateOfferResponse.parse(offer);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/offers", (_req, res, next) => {
  try {
    const offers = listRecentOffers(10);
    const data = ListOffersResponse.parse(offers);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
