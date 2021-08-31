
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";

const app: Express = express();


app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public/uploads'));
app.use('/api', routes);

export default app;