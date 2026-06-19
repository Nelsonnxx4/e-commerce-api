import express from "express";
import dotenv from "dotenv";
import router from "./routes/index";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api", router);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
