import { Router, type IRouter } from "express";
import {
  RedeemOfferBody,
  RedeemOfferResponse,
  ValidateRedemptionBody,
  ValidateRedemptionResponse,
} from "@workspace/api-zod";
import { generateQR } from "../services/qrService";
import {
  addRedemption,
  findOffer,
  findRedemptionByToken,
  markOfferAccepted,
} from "../lib/store";

const router: IRouter = Router();

const AVERAGE_PRICE_EUR = 5;

router.post("/redeem", async (req, res, next) => {
  try {
    const body = RedeemOfferBody.parse(req.body);
    const offer = findOffer(body.offerId);
    if (!offer) {
      res.status(404).json({ message: "Offer not found" });
      return;
    }

    const { token, qrDataUrl } = await generateQR(offer.id, body.userId);
    const cashbackAmount =
      Math.round(((AVERAGE_PRICE_EUR * offer.discountPercent) / 100) * 100) /
      100;

    addRedemption({
      token,
      offerId: offer.id,
      userId: body.userId,
      cashbackAmount,
      used: false,
      createdAt: new Date().toISOString(),
    });
    markOfferAccepted(offer.id);

    const data = RedeemOfferResponse.parse({
      success: true,
      token,
      qrDataUrl,
      cashbackAmount,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post("/redeem/validate", (req, res, next) => {
  try {
    const body = ValidateRedemptionBody.parse(req.body);
    const redemption = findRedemptionByToken(body.token);
    if (!redemption) {
      const data = ValidateRedemptionResponse.parse({
        valid: false,
        message: "Token not found",
      });
      res.status(404).json(data);
      return;
    }
    if (redemption.used) {
      const data = ValidateRedemptionResponse.parse({
        valid: false,
        message: "Offer already redeemed",
      });
      res.json(data);
      return;
    }
    redemption.used = true;
    const data = ValidateRedemptionResponse.parse({
      valid: true,
      message: "Offer redeemed successfully",
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
