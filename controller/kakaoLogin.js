import { config } from "../config.js";
import jwt from "jsonwebtoken";

function createJwtoken(id) {
  return jwt.sign({ id }, config.jwt.secretkey, {
    expiresIn: config.jwt.expiresInSec,
  });
}

export async function signInKakao(req, res) {
  const baseURL = "https://kauth.kakao.com/oauth/authorize";
  const kakaoconfig = {
    client_id: "115e1f60a2135b144fe94c3669aaa3c7",
    redirect_uri: "https://port-0-map-1mrfs72llwpzj2e4.sel5.cloudtype.app/kakao/callback",
    response_type: "code",
  };
  const params = new URLSearchParams(kakaoconfig).toString();

  const finalURL = `${baseURL}?${params}`;
  return res.redirect(finalURL);
}

export async function signInKakaoFinish(req, res) {
  const baseURL = "https://kauth.kakao.com/oauth/token";
  const kakaoconfig = {
    client_id: config.kakao.client_id,
    client_secret: process.env.KAKAO_SECRET,
    grant_type: "authorization_code",
    redirect_uri: "https://port-0-map-1mrfs72llwpzj2e4.sel5.cloudtype.app/kakao/callback",
    code: req.query.code,
  };
  const params = new URLSearchParams(kakaoconfig).toString();
  const finalURL = `${baseURL}?${params}`;
  const kakaoTokenRequest = await (
    await fetch(finalURL, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
    })
  ).json();
  if ("access_token" in kakaoTokenRequest) {
    const { access_token } = kakaoTokenRequest;
    const userRequest = await (
      await fetch("https://kapi.kakao.com/v2/user/me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-type": "application/json",
        },
      })
    ).json();
    console.log(userRequest);
    const token = createJwtoken(userRequest.properties.nickname);
    res.cookie("token", token, {
      expires: new Date(Date.now() + config.jwt.expiresInSec),
      httpOnly: true,
    });
    return res.redirect(302, "../../map");
  } else {
    return res.redirect("/user/login");
  }
}
