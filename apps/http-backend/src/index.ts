import express from "express";
import cors from "cors";
import userRouter from "./routes/user";
import { config } from "dotenv";
import adminRouter from "./routes/admin";
import adminEventRouter from "./routes/admin/event";
import superAdminRouter from "./routes/superadmin";
config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/admin/event", adminEventRouter);
app.use("/api/v1/superadmin", superAdminRouter);

app.listen(8080, () => {
  console.log("Server is listening on PORT 8080");
});
