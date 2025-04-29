import { Request, Response, Router } from "express";
import { prisma } from "@repo/db/client";
import { userMiddleware } from "../../middlewares/authMiddleware";

const cityRouter: Router = Router();

interface UserAuthenticatedRequest extends Request {
  user?: {
    id: string;
    phoneNumber: string;
  };
}

cityRouter.get(
  "/all",
  userMiddleware,
  async (req: UserAuthenticatedRequest, res: Response): Promise<void> => {
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
  userMiddleware,
  async (req: UserAuthenticatedRequest, res: Response): Promise<void> => {
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
