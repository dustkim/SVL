import express from "express";
import * as requestController from "../controller/request.js";

const router = express.Router();

router.get('/', requestController.requestData);

export default router;