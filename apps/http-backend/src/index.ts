import express from "express";
import cors from "cors";
import userRouter from "./routes/user";
import { config } from "dotenv";
config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/user", userRouter);

app.listen(8080, () => {
  console.log("Server is listening on PORT 8080");
});
