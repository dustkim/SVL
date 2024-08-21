import { db } from "../DB/database.js";
import bcrypt from "bcrypt";
import { config } from "../config.js";

// Login
// 아이디 중복체크
export async function findByUserid(userid) {
  return await db
    .execute("select * from users where id = ?", [userid])
    .then((result) => {
      return result[0][0];
    });
}

// 로그인
export async function login(userid) {
  return await db
    .execute("select * from users where id = ?", [userid])
    .then((result) => {
      return result[0][0];
    });
}

//  로그인 기록
export async function LoginDT(userid) {
  const found = await db
    .execute("select * from users where id = ?", [userid])
    .then((result) => {
      return result[0][0];
    });
  await db.execute("update users set signinDT = now() where id = ?", [userid]);
}

// 회원가입
export async function signup(user) {
  db.execute(
    "insert into users (id, name, password, gender, birthday, email, number, language) value (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      user.userid,
      user.username,
      user.hashed,
      user.gender,
      user.birthday,
      user.useremail,
      user.usernumber,
      user.language,
    ]
  ).then((result) => {
    return result[0];
  });
}

// 아이디 찾기
export async function findByUsername(username) {
  return await db
    .execute("select * from users where name = ?", [username])
    .then((result) => {
      return result[0][0];
    });
}

// 비밀번호 재설정
export async function resetUserpw(userid, newpassword) {
  const user = await db.execute("select * from users where id = ?", [userid]);
  const isValidpassword = await bcrypt.compareSync(
    newpassword,
    user[0][0].password
  );
  const hashed = await bcrypt.hash(newpassword, config.bcrypt.saltRounds);
  if (user[0][0].id == userid) {
    if (!isValidpassword) {
      db.execute("update users set password = ? where id = ?", [
        hashed,
        userid,
      ]);
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

// admin
// 회원목록 가져오기
export async function AllUserInfo() {
  return await db.execute("select * from users").then((result) => {
    return result[0];
  });
}

// 회원 삭제
export async function DeleteOne(userid) {
  await db.execute("delete from users where id = ?", [userid]);
}

// 회원 정보 수정
export async function UserUpdate(userData){
  console.log(userData);
  await db.execute("update users set name = ?, gender = ?, birthday = ?, email = ?, number = ? where id = ?", [userData.name, userData.gender, userData.birthdate, userData.email, userData.number, userData.id]);
}
