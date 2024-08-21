import express from "express";
import loginRouter from "./router/login.js";
import adminRouter from "./router/admin.js";
import kakaoRouter from "./router/kakaoLogin.js";
import requestRouter from "./router/request.js";
import mapRouter from "./router/map.js";
import { config } from "./config.js";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser"; ////2차 수정한 부분///

const app = express();
app.use(express.urlencoded({ extended: true })); // 데이터를 파싱하기 위한 미들웨어 - 클라이언트가 전송한 폼 데이터를 해석해서 사용하게 도와줌
app.use(bodyParser.urlencoded({ extended: true })); ///// 2차 수정한 부분///////

app.use(
  cors({
    origin: "*", // 접근 권한을 부여하는 도메인
    credentials: true, // 응답 헤더에 Access-Control-Allow-Credentials 추가
    optionsSuccessStatus: 200, // 응답 상태 200으로 설정
  })
);

app.use(cookieParser());
app.use(methodOverride("_method")); // method-override middleware 등록
app.use("/css", express.static("./Client/css"));
app.use("/js", express.static("./Client/js"));
app.use("/image", express.static("./Client/image"));
app.set("view engine", "ejs");

app.use("/user", loginRouter);
app.use("/admin", adminRouter);
app.use("/", kakaoRouter);
app.use("/request", requestRouter);
app.use("/map", mapRouter);

app.listen(config.host.port, () => {
  console.log(`Server is running on port ${config.host.port}`);
});
