import express from "express";
import type { Request, Response } from "express"
import cors from "cors";
import userRouter from "./routes/user";
import { config } from "dotenv";
import adminRouter from "./routes/admin";
import adminEventRouter from "./routes/admin/event";
import superAdminRouter from "./routes/superadmin";
import paymentRouter from "./routes/payment";
import bookingRouter from "./routes/booking";
import eventRouter from "./routes/user/event";
import cityRouter from "./routes/user/cities";
config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req : Request, res : Response) => {
  res.status(200).json({
    message : "Healthy Server"
  });
  return;
})

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/admin/event", adminEventRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/cities", cityRouter);
app.use("/api/v1/superadmin", superAdminRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/booking", bookingRouter);

app.listen(8080, () => {
  console.log("Server is listening on PORT 8080");
});
