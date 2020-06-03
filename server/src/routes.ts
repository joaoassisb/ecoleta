import express, { request, response } from "express";

import PointsController from "./controllers/pointsController";
import ItemsController from "./controllers/itemsController";

const router = express.Router();
const pointsController = new PointsController();
const itemsController = new ItemsController();

router.get("/items", itemsController.list);

router.post("/points", pointsController.create);
router.get("/points", pointsController.list);
router.get("/points/:id", pointsController.show);

export default router;
