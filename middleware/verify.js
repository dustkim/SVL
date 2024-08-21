import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function tokenCheck(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send(`<script>alert("로그인 하십시오"); window.location.href="/user/login"; </script>`);
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secretkey);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).send(`<script>alert("유효하지 않은 접근입니다."); window.location.href="/user/login"; </script>`);
  }
}
