const today = new Date();
const todayYear = today.getFullYear();
const startYear = todayYear - 80;
const year = document.getElementById("year");
const month = document.getElementById("month");
const day = document.getElementById("day");
let flag = true;

//  년도(Year) 나타내기 올해부터 80년 전까지
year.addEventListener("focus", function () {
  if (this.querySelectorAll("option").length > 1) return;
  for (let i = todayYear; i >= startYear; i--) {
    const Tag = document.createElement("option");
    Tag.textContent = i;
    this.appendChild(Tag);
  }
});

//  달(Month) 나타내기
month.addEventListener("focus", function () {
  if (this.querySelectorAll("option").length > 1) return;
  for (let i = 1; i <= 12; i++) {
    const Tag = document.createElement("option");
    Tag.textContent = i;
    this.appendChild(Tag);
    flag = false;
  }
});

//  일(Day) 나타내기
day.addEventListener("focus", function () {
  const dayCall = document.getElementById("day");
  const countChild = dayCall.childElementCount;
  if (countChild > 1) {
    for (let i = 1; i <= countChild; i++) {
      const Remove = document.getElementById("day");
      Remove.removeChild(Remove.lastElementChild);
    }
  }

  const monthToDay = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const selectMonth = document.getElementById("month").value;
  for (let i = 1; i <= monthToDay[selectMonth]; i++) {
    const Tag = document.createElement("option");
    Tag.textContent = i;
    this.append(Tag);
  }
});

//  언어(language) 나타내기
const array = [
  "그루지야어",
  "네덜란드어",
  "독일어",
  "러시아어",
  "마라티어",
  "말레이어",
  "베트남어",
  "벵골어",
  "스페인어",
  "아랍어",
  "영어",
  "우르두어",
  "우크라이나어",
  "이탈리아어",
  "인도네시아어",
  "일본어",
  "중국어",
  "체코어",
  "타갈로그어",
  "타밀어",
  "태국어",
  "터키어",
  "텔루구어",
  "펀자브어",
  "페르시아어",
  "포르투갈어",
  "프랑스어",
  "한국어",
  "헝가리어",
  "힌디어",
];
const arrayEng = [
  "Georgian",
  "Dutch",
  "German",
  "Russian",
  "Marathi",
  "Malay",
  "Vietnamese",
  "Bengali",
  "Spanish",
  "Arabic",
  "English",
  "Urdu",
  "Ukrainian",
  "Italian",
  "Indonesian",
  "Japanese",
  "Chinese",
  "Czech",
  "Tagalog",
  "Tamil",
  "Thai",
  "Turkish",
  "Telugu",
  "Punjabi",
  "Persian",
  "Portuguese",
  "French",
  "Korean",
  "Hungarian",
  "Hindi",
];
const contry = document.getElementById("language");

contry.addEventListener("focus", function () {
  for (let i = 0; i < array.length; i++) {
    const Tag = document.createElement("option");
    Tag.textContent = array[i];
    Tag.value = arrayEng[i];
    this.append(Tag);
  }
});

// 2차 수정부분 비동기 작업으로 변경
async function sendit(event) {
  event.preventDefault(); // 미리 폼 제출되는 것을 방지
  const userid = document.getElementById("userId");
  const userpw = document.getElementById("userPw");
  const userpw_re = document.getElementById("userPwCheck");
  const name = document.getElementById("userName");
  const gender = document.getElementById("userGender");
  const hp = document.getElementById("userNumber");
  const email = document.getElementById("userEmail");
  const year = document.getElementById("year");
  const month = document.getElementById("month");
  const day = document.getElementById("day");
  const language = document.getElementById("language");

  const expIdText = /^[A-Za-z0-9]{4,20}$/;
  const expPwText = /^(?=.*[A-Za-z])(?=.*[!@#$%^&*+-])(?=.*[0-9]).{4,20}$/;
  const expNameText = /^[가-힣]+$/;
  const expNumberText = /^\d{3}-\d{3,4}-\d{4}$/;
  const expEmailText = /^[A-Za-z0-9\-\.\_]+@[A-Za-z0-9\-]+\.com+$/;

  // 2차 수정한 부분 중복 아이디 체크 함수를 호출
  const check = await checkId(userid.value);
  // 2차 수정한 부분 alert 내용
  if (!expIdText.test(userid.value)) {
    alert("아이디는 4자이상 20자이하의 영문자 또는 숫자를 포함해 입력하세요");
    userid.focus();
    return false;
  }
  // 2차 수정한 부분 중복 아이디 체크부분
  if (!check) {
    alert("중복된 아이디 입니다.");
    userid.focus();
    return false;
  }
  if (!expPwText.test(userpw.value)) {
    alert(
      "비밀번호는 4자이상 20자이하의 영문자, 숫자, 특수문자를 1자이상 꼭 포함해야 합니다."
    );
    userpw.focus();
    return false;
  }
  if (userpw.value != userpw_re.value) {
    alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
    userpw_re.focus();
    return false;
  }
  if (!expNameText.test(name.value)) {
    alert("이름은 한글로 입력하세요");
    name.focus();
    return false;
  }
  if (!(gender.value == "남자" || gender.value == "여자")) {
    alert("성별을 선택하세요.");
    gender.focus();
    return false;
  }
  if (!(year.value > 0)) {
    alert("생년월일을 선택하세요");
    year.focus();
    return false;
  }
  if (!(month.value > 0)) {
    alert("생년월일을 선택하세요");
    month.focus();
    return false;
  }
  if (!(day.value > 0)) {
    alert("생년월일을 선택하세요");
    day.focus();
    return false;
  }
  if (!expEmailText.test(email.value)) {
    alert("이메일 형식이 일치하지 않습니다.");
    email.focus();
    return false;
  }
  if (!expNumberText.test(hp.value)) {
    alert("휴대폰번호는 010-0000-0000 형식으로 입력해주세요");
    hp.focus();
    return false;
  }
  if (language.value == "언어") {
    alert("언어를 선택해주세요");
    language.focus();
    return false;
  }
  // 위 작업이 완료되면 폼 제출
  document.getElementById("joinForm").submit();
}
///////2차 수정한 부분 //////////////
// get으로 아이디를 보내 중복이 되는지 확인한다.
async function checkId(userId) {
  const useridCheck = await fetch(`/user/checkId/${userId}`)
    .then((response) => response.json())
    .then((result) => {
      return result;
    });
  return useridCheck;
}
