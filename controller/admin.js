import * as Data from "../data/user.js";

// 회원 목록
export async function userInfo() {
  return await Data.AllUserInfo();
}

// 회원 삭제
export async function userdelete(userid) {
  await Data.DeleteOne(userid);
}

// 회원 정보 수정
export async function userUpdate(userData){
  await Data.UserUpdate(userData);
}
