import express from "express";
import dotenv from "dotenv";
import router from "./routes/index";
import redisClient from "./utils/redis";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api", router);

const startServer = async () => {
	await redisClient.connect();

	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
};

startServer();
