import * as Data from "../data/user.js";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import bcrypt from "bcrypt";

function createJwtoken(id) {
  return jwt.sign({ id }, config.jwt.secretkey, {
    expiresIn: config.jwt.expiresInSec,
  });
}

// 로그인하기
export async function login(req, res) {
  const { userid, userpw } = req.body;
  const user = await Data.login(userid);

  if (!user) {
    console.log("사용자를 찾을 수 없음");
    return res
      .status(404)
      .send(
        `<script>alert("사용자를 찾을 수 없습니다."); window.location.href="/user/login"; </script>`
      );
  }
  const isValidpassword = await bcrypt.compareSync(userpw, user.password);
  if (!isValidpassword) {
    console.log("비밀번호 불일치");
    return res
      .status(401)
      .send(
        `<script>alert("아이디 또는 비밀번호를 확인하세요."); window.location.href="/user/login";</script>`
      );
  }
  if (user.id == "admin" && isValidpassword) {
    const userLoginDt = await Data.LoginDT(userid);
    const token = createJwtoken(user.id);
    res.cookie("token", token, { httpOnly: true });
    return res.redirect("/admin");
  } else {
    const userLoginDt = await Data.LoginDT(userid);
    const token = createJwtoken(user.id);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/map");
  }
}

//// 수정한 부분 /////////////////////////
// 회원가입하기
export async function signup(req, res) {
  const {
    userid,
    userpw,
    userpwcheck,
    username,
    gender,
    year,
    month,
    day,
    useremail,
    usernumber,
    language,
  } = req.body;
  const birthday = year + month + day;

  // const found = await Data.findByUserid(userid);
  // if (found) {
  //   return res
  //     .status(404)
  //     .send(
  //       `<script>alert('${userid}는 이미 존재합니다..'); window.location.href='/user/signup';</script>`
  //     );
  // }
  const hashed = await bcrypt.hash(userpw, config.bcrypt.saltRounds);
  const newUser = await Data.signup({
    userid,
    username,
    hashed,
    gender,
    birthday,
    useremail,
    usernumber,
    language,
  });
  res
    .status(201)
    .send(
      `<script>alert('회원가입이 완료되었습니다.'); window.location.href = '/user/login';</script>`
    );
}

// 아이디 찾기
export async function findid(req, res) {
  const { username, useremail } = req.body;
  const found = await Data.findByUsername(username);

  if (!found || !(found.email === useremail)) {
    res
      .status(404)
      .send(
        `<script>alert('이름 또는 이메일을 확인하세요'); window.location.href='/user/findid';</script>`
      );
  } else {
    res.status(201).render("../Client/login/searchID2.ejs", { id: found.id });
  }
}

// 비밀번호 찾기
export async function findpw(req, res) {
  const { userid, username, useremail } = req.body;
  const found = await Data.findByUserid(userid);

  //  사용자의 아이디, 이름, 이메일이 일차하지 않는 경우 메세지 전송
  if (!found || found.email != useremail || found.name != username) {
    res
      .status(404)
      .send(
        `<script>alert('일치하는 정보가 없습니다.'); window.location.href='/user/findpw';</script>`
      );
  }
  // 일치하는 경우 비밀번호 재설정 페이지 이동
  else {
    res.render("../Client/login/searchPW2.ejs", {
      id: found.id,
      error: "비밀번호를 재설정 해주세요.",
    });
  }
}

export async function findpw2(req, res) {
  const expPwText = /^(?=.*[A-Za-z])(?=.*[!@#$%^&*+-])(?=.*[0-9]).{4,20}$/;
  const { userid, repassword, repasswordcheck } = req.body;
  if (!expPwText.test(repassword)) {
    return res.render("../Client/login/searchPW2.ejs", {
      id: userid,
      error:
        "비밀번호는 4자이상 20자이하의 영문자, 숫자, 특수문자를 1자이상 꼭 포함해야 합니다.",
    });
  }
  if (repassword !== repasswordcheck) {
    return res.render("../Client/login/searchPW2.ejs", {
      id: userid,
      error: "비밀번호 확인이 같지 않습니다.",
    });
  }

  const found = await Data.resetUserpw(userid, repassword);
  if (found == true) {
    res
      .status(201)
      .send(
        `<script>alert('비밀번호가 변경되었습니다.'); window.location.href='/user/login';</script>`
      );
  } else {
    res.render("../Client/login/searchPW2.ejs", {
      id: userid,
      error: "최근 사용했던 비밀번호입니다.",
    });
  }
}

/// 2차 수정한 부분 get으로 받아서 params에 id값을 가져와 database에서 확인한다.
export async function checkId(req, res) {
  const userid = req.params.id;
  const found = await Data.findByUserid(userid);
  if (!found) {
    return res.send(true);
  } else {
    return res.send(false);
  }
}
