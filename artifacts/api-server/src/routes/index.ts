import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import studentsRouter from "./students";
import classesRouter from "./classes";
import packagesRouter from "./packages";
import paymentMethodsRouter from "./payment-methods";
import purchasesRouter from "./purchases";
import rentalsRouter from "./rentals";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(studentsRouter);
router.use(classesRouter);
router.use(packagesRouter);
router.use(paymentMethodsRouter);
router.use(purchasesRouter);
router.use(rentalsRouter);
router.use(dashboardRouter);

export default router;
