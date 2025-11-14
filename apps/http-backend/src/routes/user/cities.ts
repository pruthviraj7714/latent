import { Response, Router } from "express";
import { prisma } from "@repo/db";
import {
  AuthenticatedRequest,
  verifyAuth,
} from "../../middlewares/authMiddleware";

const cityRouter: Router = Router();

cityRouter.get(
  "/all",
  verifyAuth(["ADMIN", "USER", "SUPERADMIN"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const cities = await prisma.city.findMany({});
      res.status(200).json({
        cities,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

cityRouter.get(
  "/top",
  verifyAuth(["ADMIN", "USER", "SUPERADMIN"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const topCities = await prisma.city.findMany({
        take: 5,
        orderBy: {
          events: {
            _count: "desc",
          },
        },
        include: {
          _count: {
            select: { events: true },
          },
        },
      });

      res.status(200).json({
        success: true,
        cities: topCities,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

export default cityRouter;
