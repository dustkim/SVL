import { db } from "../DB/database.js";

// 10개를 출력, 시작 인덱스는 0
// select * from member ORDERS LIMIT 10 OFFSET 0;
// select * from food orders limit 0, 10;

// 권역에 맞춰 전부 가져오기
export async function getAll(region) {
  region = '%' + region + '%'

  const sql = [
    db.format("select * from food where roadAddress like ?", [region]),
    db.format("select * from lodging where roadAddress like ?", [region]),
    db.format("select * from heritage where heritageAddress like ?", [region]),
    db.format("select * from park where parkAddress like ?", [region]),
  ];

  const [food, lodging, heritage, park] = await Promise.all([
    db.execute(sql[0]),
    db.execute(sql[1]),
    db.execute(sql[2]),
    db.execute(sql[3]),
  ]);

  return [food[0], lodging[0], heritage[0], park[0]];
}

// 음식점 조회
export async function getFood(region) {
  region = '%' + region + '%'
  return db.execute("select * from food where roadAddress like ?", [region])
  .then(result => {
    return result[0];
  })
}

// 숙소 조회
export async function getLodging(region) {
  region = '%' + region + '%'
  return await db
    .execute("select * from lodging where roadAddress like ?", [region])
    .then((result) => {
      return result[0];
    });
}

// 문화유산 조회
export async function getHeritage(region) {
  region = '%' + region + '%'
  return await db
    .execute("select * from heritage where heritageAddress like ?", [region])
    .then((result) => {
      return result[0];
    });
}

// 공원 조회
export async function getPark(region) {
  region = '%' + region + '%'
  return await db
    .execute("select * from park where parkAddress like ?", [region])
    .then((result) => {
      return result[0];
    });
}

// 검색 조회
export async function search(region, keyword, table, address, name) {
  region = '%' + region + '%';
  keyword = "%" + keyword + "%";

  const sql = `select * from ${table} where ${address} like ? and ${name} like ?`

  return db.execute(sql, [region, keyword])
  .then(result => result[0])
}

// 카테고리 구분 없이 전체 조회
export async function getAllPoints(region, x, y) {
  region = '%' + region + '%';

  // 127 -> x, 37 -> y
  const sql = [
    db.format("select * from food where roadAddress like ? and location = Point(?, ?)", [region, x, y]),
    db.format("select * from lodging where roadAddress like ? and location = Point(?, ?)", [region, x, y]),
    db.format("select * from heritage where heritageAddress like ? and location = Point(?, ?)", [region, x, y]),
    db.format("select * from park where parkAddress like ? and location = Point(?, ?)", [region, x, y]),
  ];

  const [food, lodging, heritage, park] = await Promise.all([
    db.execute(sql[0]),
    db.execute(sql[1]),
    db.execute(sql[2]),
    db.execute(sql[3]),
  ]);

  return [food[0], lodging[0], heritage[0], park[0]];
}

// 카테고리 구분하여 조회
export async function getRegionPoints(region, x, y, table, address) {
  region = '%' + region + '%';
  const sql = `select * from ${table} where ${address} like ? and location = Point(?, ?)`
  return db.execute(sql, [region, x, y])
  .then(result => result[0])
}

// 반경 탐색 조회
export async function searchRadius(location) {
  const sql = [
    db.format(FOOD_RADIUSQUERY, [location.x, location.y]),
    db.format(LODGING_RADIUSQUERY, [location.x, location.y]),
    db.format(HERITAGE_RADIUSQUERY, [location.x, location.y]),
    db.format(PARK_RADIUSQUERY, [location.x, location.y]),
  ];

  const [food, lodging, heritage, park] = await Promise.all([
    db.execute(sql[0]),
    db.execute(sql[1]),
    db.execute(sql[2]),
    db.execute(sql[3]),
  ]);

  return {
    food: food[0],
    lodging: lodging[0],
    heritage: heritage[0],
    park: park[0],
  };
}

// // 언어 변경
// export async function changeLanguage(){

// }
