import { Router, type IRouter } from "express";
import { GetContextResponse } from "@workspace/api-zod";
import { buildContextState } from "../services/contextService";

const router: IRouter = Router();

router.get("/context", async (_req, res, next) => {
  try {
    const state = await buildContextState();
    const data = GetContextResponse.parse(state);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
