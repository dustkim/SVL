import express from "express";
import * as adminController from "../controller/admin.js";
import { tokenCheck } from "../middleware/verify.js";

const router = express.Router();

// 수정한 부분 관리자 메인페이지 삭제
// 수정한 부분 router.get("/info" ...) => router.get("/" ...)
// 회원목록 페이지
router.get("/", tokenCheck, async (req, res) => {
  const data = await adminController.userInfo();
  res.render("../Client/views/admin/info.ejs", { data });
});

// 회원 정보 수정 페이지
router.get("/update", tokenCheck, async (req, res) => {
  const data = await adminController.userInfo();
  res.render("../Client/views/admin/update.ejs", {
    data,
    message: "",
  });
});

// 회원 정보 수정 페이지에서 삭제버튼에 대한 라우터
router.delete("/delete/:id", tokenCheck, async (req, res) => {
  const userid = req.params.id;
  await adminController.userdelete(userid);
  const data = await adminController.userInfo();
  res.render("../Client/views/admin/update.ejs", {
    data,
    message: "삭제되었습니다.",
  });
});

// 회원 정보 수정 페이지에서 수정버튼에 대한 라우터
router.put("/put", tokenCheck, async (req, res) => {
  const { id, name, gender, birthdate, email, number } = req.body;
  const userData = { id, name, gender, birthdate, email, number };
  await adminController.userUpdate(userData);
  const data = await adminController.userInfo();
  res.render("../Client/views/admin/update.ejs", {
    data,
    message: "수정되었습니다.",
  });
});

// 로그아웃에 대한 라우터(쿠키 삭제 시 필요)
router.post("/redirect", tokenCheck, async (req, res) => {
  const token = req.cookies.token;
  res.clearCookie("token");
  res.send(
    `<script>alert("로그아웃 되었습니다."); window.location.href='/user/login'; </script>`
  );
});

export default router;
