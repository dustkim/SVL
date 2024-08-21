import * as mapRepository from "../data/map.js";
import fs from "fs";

export async function requestAll(req, res) {
  const region = req.query.request;

  const data = await mapRepository.getAll(region);

  return res.json(data);
}

// 카테고리 음식점
export async function requestFood(req, res) {
  const region = req.query.request;

  // console.log("음식점 시작 인덱스: " + start);

  const data = await mapRepository.getFood(region);
  
  console.log(data);

  return res.json(data);
}

// 카테고리 숙소
export async function requestLodging(req, res) {
  const region = req.query.request;

  const data = await mapRepository.getLodging(region);
  return res.json(data);
}

// 카테고리 문화유산
export async function requestHeritage(req, res) {
  const region = req.query.request;

  const data = await mapRepository.getHeritage(region);
  return res.json(data);
}

// 카테고리 공원
export async function requestPark(req, res) {
  const region = req.query.request;

  const data = await mapRepository.getPark(region);
  return res.json(data);
}

// 검색
export async function requestSearch(req, res) {
  const region = req.query.request;
  const keyword = req.query.keyword;
  const table = req.query.category;
  const address = req.query.address;
  const name = req.query.name;

  const data = await mapRepository.search(region, keyword, table, address, name);

  return res.json(data);
}

// 좌표 정보 조회
export async function requestEqualsPoint(req, res) {
  const region = req.query.request;
  const x = req.query.x;
  const y = req.query.y;

  // setCategory가 있으면 처리하는 값. 없으면 기본값인 ""가 보내짐.
  const table = req.query.category;
  const address = req.query.address;
  
  console.log(region, x, y, table, address)

  let data;

  if(table == "false"){
    data = await mapRepository.getAllPoints(region, x, y);
  } else {
    data = await mapRepository.getRegionPoints(region, x, y, table, address);
  }

  console.log(data);

  return res.json(data);
}

// 폴리곤 데이터 가져오기
export async function requestPolygons(req, res){
  const jsonFile = fs.readFileSync('./seoulData/seoulPolygons.json', 'utf8');
  return res.json(jsonFile);
}

// 반경 탐색
export async function requestSearchRadius(req, res) {
  const location = JSON.parse(req.query.request);

  const data = await mapRepository.searchRadius(location);

  return res.json(data);
}