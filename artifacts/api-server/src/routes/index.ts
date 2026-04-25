import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contextRouter from "./context";
import offersRouter from "./offers";
import redeemRouter from "./redeem";
import merchantRouter from "./merchant";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contextRouter);
router.use(offersRouter);
router.use(redeemRouter);
router.use(merchantRouter);

export default router;
