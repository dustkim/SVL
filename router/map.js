import express from "express";
import * as mapController from "../controller/map.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("../Client/views/main/layout.ejs", { alert: "로그인되었습니다." });
});

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// router.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "../Client/views/main/layout.html"));
// });

router.get("/all", mapController.requestAll);
router.get("/food", mapController.requestFood);
router.get("/lodging", mapController.requestLodging);
router.get("/heritage", mapController.requestHeritage);
router.get("/park", mapController.requestPark);
router.get("/search", mapController.requestSearch);
router.get("/point", mapController.requestEqualsPoint);
router.get("/polygons", mapController.requestPolygons);

router.get("/radius", mapController.requestSearchRadius);

export default router;
