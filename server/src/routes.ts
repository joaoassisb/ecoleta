import express, { request, response } from "express";
import multer from "multer";

import multerConfig from "../config/multer";
import PointsController from "./controllers/pointsController";
import ItemsController from "./controllers/itemsController";

const router = express.Router();
const pointsController = new PointsController();
const itemsController = new ItemsController();

const upload = multer(multerConfig);

router.get("/items", itemsController.list);

router.post("/points", upload.single("image"), pointsController.create);
router.get("/points", pointsController.list);
router.get("/points/:id", pointsController.show);
router.delete("/points/:id", pointsController.delete);

export default router;
