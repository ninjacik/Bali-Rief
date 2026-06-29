import { Router, type IRouter } from "express";
import healthRouter from "./health";
import laporanRouter from "./bencana/laporan";
import kebutuhanRouter from "./bencana/kebutuhan";
import relawanRouter from "./bencana/relawan";
import inventarisRouter from "./bencana/inventaris";
import penugasanRouter from "./bencana/penugasan";
import dashboardRouter from "./bencana/dashboard";
import authRouter from "./bencana/auth";
import donaturRouter from "./bencana/donatur";
import transparansiRouter from "./bencana/transparansi";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(laporanRouter);
router.use(kebutuhanRouter);
router.use(relawanRouter);
router.use(inventarisRouter);
router.use(penugasanRouter);
router.use(dashboardRouter);
router.use(donaturRouter);
router.use(transparansiRouter);

export default router;
