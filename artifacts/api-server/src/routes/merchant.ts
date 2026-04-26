import { Router, type IRouter } from "express";
import {
  GetMerchantDashboardResponse,
  GetMerchantRulesResponse,
  UpdateMerchantRulesBody,
  UpdateMerchantRulesResponse,
} from "@workspace/api-zod";
import type { OfferPerformance } from "@workspace/api-zod";
import {
  getDefaultMerchant,
  listRecentOffers,
  listRedemptions,
  store,
  updateRules,
} from "../lib/store";
import { buildContextState } from "../services/contextService";

const router: IRouter = Router();

const AVERAGE_PRICE_EUR = 5;

router.get("/merchant/dashboard", async (_req, res, next) => {
  try {
    const merchant = getDefaultMerchant();
    const allOffers = store.offers;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaysOffers = allOffers.filter(
      (o) => new Date(o.timestamp) >= todayStart,
    );
    const acceptedToday = todaysOffers.filter((o) => o.accepted);
    const acceptRate =
      todaysOffers.length > 0
        ? Math.round((acceptedToday.length / todaysOffers.length) * 100)
        : 0;

    const redemptions = listRedemptions();
    const totalRevenueLift =
      Math.round(
        redemptions.reduce(
          (sum, r) => sum + (AVERAGE_PRICE_EUR - r.cashbackAmount),
          0,
        ) * 100,
      ) / 100;

    const avgDiscount =
      todaysOffers.length > 0
        ? Math.round(
            todaysOffers.reduce((sum, o) => sum + o.discountPercent, 0) /
              todaysOffers.length,
          )
        : merchant.rules.maxDiscountPercent;

    const currentOffer = allOffers[allOffers.length - 1] ?? null;

    const offersList: OfferPerformance[] = listRecentOffers(10).map((o) => {
      const offerRedemptions = redemptions.filter((r) => r.offerId === o.id);
      const accepted = offerRedemptions.length > 0 || o.accepted;
      return {
        offerId: o.id,
        headline: o.headline,
        discountPercent: o.discountPercent,
        timestamp: o.timestamp,
        accepted,
        acceptRate: accepted ? 100 : 0,
        revenue:
          Math.round(
            offerRedemptions.reduce(
              (sum, r) => sum + (AVERAGE_PRICE_EUR - r.cashbackAmount),
              0,
            ) * 100,
          ) / 100,
      };
    });

    const context = await buildContextState();

    const dashboard = {
      merchant,
      offersToday: todaysOffers.length,
      acceptRate,
      totalRevenueLift,
      avgDiscount,
      currentOffer,
      viewsProgress: 60,
      redemptionsProgress: Math.min(100, acceptRate),
      offersList,
      context,
    };

    const data = GetMerchantDashboardResponse.parse(dashboard);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/merchant/rules", (_req, res, next) => {
  try {
    const merchant = getDefaultMerchant();
    const data = GetMerchantRulesResponse.parse(merchant);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.put("/merchant/rules", (req, res, next) => {
  try {
    const body = UpdateMerchantRulesBody.parse(req.body);
    const rules = updateRules(body);
    const data = UpdateMerchantRulesResponse.parse({ success: true, rules });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
