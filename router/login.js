import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import * as loginController from "../controller/login.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// GET
// 웹 페이지 화면 불러오기
router.get("/login", (req, res) => {
  const token = req.cookies.token;
  res.clearCookie("token");
  res.sendFile(path.join(__dirname, "../Client/login/login.html"));
});

router.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/login/regist.html"));
});

router.get("/findid", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/login/searchID.html"));
});

router.get("/findpw", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/login/searchPW1.html"));
});

router.get("/findpw/ok", (req, res) => {
  res.render("searchPW2");
});
// 2차 수정한 부분 아이디 중복체크  get으로 params에 id값을 받아온다.
router.get("/checkId/:id", loginController.checkId);

// POST
// 웹 페이지 화면 정보 전달하기
router.post("/login", loginController.login);

router.post("/signup", loginController.signup);

router.post("/findid", loginController.findid);

router.post("/findpw", loginController.findpw);

router.post("/findpw/ok", loginController.findpw2);

router.post("/redirect", async (req, res) => {
  const cookies = req.cookies;
  console.log(cookies);
  if (req.cookies.Token) {
    res.clearCookie("token");
    res.send(
      `<script>alert("로그아웃 되었습니다."); window.location.href='/user/login'; </script>`
    );
  }
  res.clearCookie("kakaoToken");
  res.send(
    `<script>alert("로그아웃 되었습니다."); window.location.href='/user/login'; </script>`
  );
});

export default router;
