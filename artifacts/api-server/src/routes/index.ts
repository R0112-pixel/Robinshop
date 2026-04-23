import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storesRouter from "./stores";
import productsRouter from "./products";
import publicRouter from "./public";
import marketingRouter from "./marketing";
import dropshippingRouter from "./dropshipping";
import { apiRateLimit } from "../middlewares/rateLimit";

const router: IRouter = Router();

router.use(apiRateLimit);
router.use(healthRouter);
router.use(storesRouter);
router.use(productsRouter);
router.use(publicRouter);
router.use(marketingRouter);
router.use(dropshippingRouter);

export default router;
