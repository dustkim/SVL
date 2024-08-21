import express from "express";
import * as kakaoLogin from "../controller/kakaoLogin.js";

const router = express.Router();

router.get("/kakao", kakaoLogin.signInKakao);
router.get("/kakao/callback", kakaoLogin.signInKakaoFinish);

export default router;