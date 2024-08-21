let map;
let marker;
let geocoder;
let circle;;
let center_marker;

let isFetching = false;
let hasMore = true;

let beforeFucn;
let beforeDetailFunc;
let beforeName;
let checkCategory = false;
let start = 0

let checklanguage = "English";

const objectXY = new Object();


window.onload = function() {
    const fobtn = document.getElementById("fo");
    const lobtn = document.getElementById("lo");
    const chbtn = document.getElementById("ch");
    const pabtn = document.getElementById("pa");
    const searchInput = document.getElementById("search");
    const translatebtn = document.getElementById("translate");
    const settingBtn = document.getElementById("setting");
    const closeBtn = document.getElementById("close");

    fobtn.addEventListener("click", () => {
        showTotal(getFood, foodDetailInfo, "storeName");
    })

    lobtn.addEventListener("click", () => {
        showTotal(getLodging, loDetailInfo, "lodgingName");
    })

    chbtn.addEventListener("click", () => {
        showTotal(getHeritage, chDetailInfo, "heritageName");
    })

    pabtn.addEventListener("click", () => {
        showTotal(getPark, paDetailInfo, "parkName");
    })

    searchInput.addEventListener("keyup", (e) => {
        if (e.keyCode === 13) {
            search(searchInput);
        }
    });

    translatebtn.addEventListener("click", () => {
        translateApi();
    })

    settingBtn.addEventListener("click", () => {
        settingInfo();
    })

    closeBtn.onclick = function() {
        closeInfo();
    }

    // 기본적으로 클릭 -> 스크롤 -> 추가 조회
    // resize 작은 것에서 큰 방향으로 일어나면 동작 안함.
    document.getElementById('menuList').addEventListener('scroll', () => {

        if (isFetching || !hasMore) {
            return
        }

        if ((document.getElementById('menuList').scrollTop + window.innerHeight >= document.getElementById('menuList').scrollHeight) && checkCategory ) {
            showTotal(beforeFucn, beforeDetailFunc, beforeName, "Scroll");
        }
    })

    // div로 클릭한 대상을 기준으로 탐색.
    document.getElementById('menuList').addEventListener('click', event => {
        if(event.target.className == "language"){
            checklanguage = event.target.id;
            alert(`${event.target.id} selected`);
        }
    })

    const mapContainer = document.getElementById('map'),
    mapOption = {
        center: new kakao.maps.LatLng(37.552, 126.99183654785156), // 지도의 중심좌표
        level: 5, // 지도의 확대 레벨
        disableDefaultUI: true, // 기본 UI 컨트롤을 비활성화
        zoomControl: false, // 확대/축소 컨트롤 비활성화
        mapTypeControl: false // 지도/위성 전환 컨트롤 비활성화
    };

    map = new kakao.maps.Map(mapContainer, mapOption);
    geocoder = new kakao.maps.services.Geocoder();

    kakao.maps.event.addListener(map, 'click', clickLocation);
}

const clickLocation = async function (mouseEvent) {
    kakao.maps.event.removeListener(map, 'click', clickLocation);

    let latlng = mouseEvent.latLng;

    if(circle) {
        circle.setMap(null);
        if(center_marker){
            center_marker.setMap(null);
        }
    }

    const menuList = document.getElementById('menuList');
    const detailInfo = document.getElementById("detailInfo");

    if(menuList.innerHTML != ""){
        menuList.innerHTML = "";
    }

    if(detailInfo.style.display == "block"){
        closeInfo();
    }

    // 원 중심을 마커로 생성합니다
    center_marker = makeMarker(latlng.getLng(), latlng.getLat());

    // 지도에 표시할 원을 생성합니다
    circle = makeCircle(latlng.getLat(), latlng.getLng());
    circle.setMap(map);

    objectXY.x = latlng.getLng();  // 경도
    objectXY.y = latlng.getLat();  // 위도

    console.log(objectXY);

    await searchRadius(objectXY);

    kakao.maps.event.addListener(map, 'click', clickLocation);
}

// 음식점 api
// 아리
const getFood = request => {
    return fetch(`http://localhost:4000/map/food?request=${request}`)
    .then(res => res.json())
}

// 숙소 api
const getLodging = request => {
    return fetch(`http://localhost:4000/map/lodging?request=${request}`)
    .then(res => res.json())
}

// 문화유산 api
const getHeritage = request => {
    return fetch(`http://localhost:4000/map/heritage?request=${request}`)
    .then(res => res.json())
}

// 공원 api
const getPark = request => {
    return fetch(`http://localhost:4000/map/park?request=${request}`)
    .then(res => res.json())
}

// 번역 api
const getTranslate = (request, language)=> {
    return fetch(`http://localhost:4000/request?request=${request}&language=${language}`)
    .then(res => res.json())
}

// 번역 함수
async function translateApi() {
    const detailInfo = document.getElementById("detailInfo");

    // 값이 있을 때
    if(detailInfo.innerHTML){
        let title = detailInfo.querySelector("h3");
        let detailHtmls = detailInfo.querySelectorAll("p");

        const getTitle = await getTranslate(title.innerText, checklanguage)
        title.innerText = getTitle.content;

        for (const detailHtml of detailHtmls){
            console.log(detailHtml.innerText)
            const response = await getTranslate(detailHtml.innerText, checklanguage);
            detailHtml.innerText = response.content;
        }
    } else {
        alert("데이터가 없습니다");
    }
}

// 마커 함수
function makeMarker(lat, lng){
    map.setCenter(new kakao.maps.LatLng(lng, lat));
    map.setLevel(5);
    return new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(lng, lat),
    });
}

// 원 함수
function makeCircle(lat, lng){
    return new kakao.maps.Circle({
        center : new kakao.maps.LatLng(lat, lng),  // 원의 중심좌표 입니다 
        radius: 500, // 미터 단위의 원의 반지름입니다 
        strokeWeight: 1, // 선의 두께입니다 
        strokeColor: 'black', // 선의 색깔입니다
        strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
        strokeStyle: 'linar', // 선의 스타일 입니다
        fillColor: 'none', // 채우기 색깔입니다
        fillOpacity: 0.7  // 채우기 불투명도 입니다   
    });
}

// 닫기 함수
function closeInfo() {
    const detailInfo = document.getElementById("detailInfo");
    const menuList = document.getElementById("menuList");

    if(detailInfo.style.display == "block"){
        detailInfo.style.display = "none"
        detailInfo.innerHTML = ""
        menuList.style.display = "block"
        marker.setMap(null)
    };
}

// div 생성 함수
function createDiv(name){
    const createDiv = document.createElement('div');
    createDiv.classList.add('location');
    createDiv.innerText = name
    return createDiv;
}

// 메뉴 리스트 추가 함수
async function appendMenuList(menuList, data, name, detailFunc){
    data.forEach(row => {
        const div = createDiv(row[name])

        div.addEventListener('click', function() {
            menuList.style.display = "none"
            marker = makeMarker(row.location.x, row.location.y);
            detailFunc(row)
        })

        menuList.appendChild(div);
    })
}

// 카테고리 전용
async function showTotal(apiFunc, detailFunc, name, option = "Click") {
    const menuList = document.getElementById('menuList');
    const detailInfo = document.getElementById("detailInfo");
    checkCategory = true;

    beforeFucn = apiFunc;
    beforeDetailFunc = detailFunc;
    beforeName = name;

    if(circle) {
        circle.setMap(null);
        if(center_marker){
            center_marker.setMap(null);
        }
    }

    if(option == "Click"){
        start = 0;
        
        if(menuList.innerHTML != ""){
            menuList.innerHTML = "";
        }

        hasMore = true;
    }

    if(detailInfo.style.display == "block"){
        closeInfo();
    }

    isFetching = true;
    const result = await apiFunc(start);
    isFetching = false;

    if(result.length === 0) {
        hasMore = false;
        return
    }

    appendMenuList(menuList, result, name, detailFunc)
    start += 50
}

// 음식점 상세 조회
function foodDetailInfo(foodinfo){
    const detailInfo = document.getElementById("detailInfo");
    detailInfo.style.display = "block";

    let htmlData = `<h3 id='title'>${foodinfo.storeName}</h3>
    <p>도로명주소: ${foodinfo.roadAddress} </p>
    <p>지번주소: ${foodinfo.localAddress} </p>
    <p>전화번호: ${foodinfo.storeTel}</p>
    <p>음식 카테고리: ${foodinfo.foodCategory}</p>
    <p>영업인허가명: ${foodinfo.accessName}</p>`

    htmlData += foodinfo.distance ? `<p>거리: ${foodinfo.distance}m</p>` : ""
    htmlData += `<p>${foodinfo.shopIntro}</p>`

    detailInfo.innerHTML = htmlData;
}

// 숙소 상세 조회
function loDetailInfo(loinfo){
    const detailInfo = document.getElementById("detailInfo");
    detailInfo.style.display = "block";

    let htmlData = `<h3 id='title'>${loinfo.lodgingName}</h3>
    <p>도로명주소: ${loinfo.roadAddress} </p>
    <p>지번주소: ${loinfo.localAddress} </p>
    <p>영업상태: ${loinfo.businessStatus}</p>
    <p>건물크기: ${loinfo.lodgingSize}</p>`;

    htmlData += loinfo.distance ? `<p>거리: ${loinfo.distance}m</p>` : ""

    detailInfo.innerHTML = htmlData;
}

// 문화유산 상세조회
function chDetailInfo(chinfo){
    const detailInfo = document.getElementById("detailInfo");
    detailInfo.style.display = "block";

    let htmlData = `<h3 id='title'>${chinfo.heritageName}</h3>
    <p>주소: ${chinfo.heritageAddress} </p>
    <p>시대분류: ${chinfo.heritageYear}</p>`;

    htmlData += chinfo.distance ? `<p>거리: ${chinfo.distance}m</p>` : ""
    htmlData += `<p>${chinfo.heritageInfo}</p>`

    detailInfo.innerHTML = htmlData;
}

// 공원상세조회
function paDetailInfo(painfo){
    const detailInfo = document.getElementById("detailInfo");
    detailInfo.style.display = "block";

    let htmlData = `<h3 id='title'>${painfo.parkName}</h3>
    <p>주소: ${painfo.parkAddress} </p>
    <p>전화번호: ${painfo.parkTel}</p>
    <p>공원면적: ${painfo.parkArea}</p>`;

    htmlData += painfo.distance ? `<p>거리: ${painfo.distance}m</p>` : "";
    htmlData += `<p>${painfo.parkIntro}</p>`;

    detailInfo.innerHTML = htmlData;
}

// 검색 api
const getSearch = request => {
    return fetch(`http://localhost:4000/map/search?request=${request}`)
    .then(res => res.json())
}

// 검색 함수
async function search(searchInput){
    const input = searchInput.value.trim();
    checkCategory = false

    if(circle) {
        circle.setMap(null);
        if(center_marker){
            center_marker.setMap(null);
        }
    }

    if(detailInfo.style.display == "block"){
        closeInfo();
    }

    if(menuList.innerHTML != ""){
        menuList.innerHTML = "";
    }

    const result = await getSearch(input);
    
    const detailFunc = [foodDetailInfo, loDetailInfo, chDetailInfo, paDetailInfo]
    const name = ["storeName", "lodgingName", "heritageName", "parkName"]
    for(let i = 0; i < result.length; i++){
        if(result[i].length === 0){
            continue;
        }

        appendMenuList(menuList, result[i], name[i], detailFunc[i])
    }
}


// 반경 탐색 api
const getSearchRadius = request => {
    return fetch(`http://localhost:4000/map/radius?request=${request}`)
    .then(res => res.json())
}

async function searchRadius(xy){
    const menuList = document.getElementById('menuList');
    const detailInfo = document.getElementById("detailInfo");
    checkCategory = false

    if(detailInfo.style.display == "block"){
        closeInfo();
    }

    if(menuList.innerHTML != ""){
        menuList.innerHTML = "";
    }

    const result = await getSearchRadius(JSON.stringify(xy));

    console.log(result);

    const detailFunc = [foodDetailInfo, loDetailInfo, chDetailInfo, paDetailInfo]
    const name = ["storeName", "lodgingName", "heritageName", "parkName"]
    for(let i = 0; i < result.length; i++){
        if(result[i].length === 0){
            continue;
        }

        appendMenuList(menuList, result[i], name[i], detailFunc[i])
    }
}

// 언어 선택 함수
function settingInfo() {
    const menuList = document.getElementById('menuList');
    const detailInfo = document.getElementById("detailInfo");
    checkCategory = false

    if(menuList.innerHTML != ""){
        menuList.innerHTML = "";
    }

    if(detailInfo.style.display == "block"){
        closeInfo();
    }

    // 언어 객체
    const languageData = [
        {id:'English', className:'language', textContent:'영어 (English)'},
        {id:'Chinese', className:'language', textContent:'중국어(Chinese)'},
        {id:'Spanish', className:'language', textContent:'스페인어 (Spanish)'},
        {id:'Hindi', className:'language', textContent:'힌디어 (Hindi)'},
        {id:'Portuguese', className:'language', textContent:'포르투갈어 (Portuguese)'},
        {id:'Bengali', className:'language', textContent:'벵골어 (Bengali)'},
        {id:'Russian', className:'language', textContent:'러시아어 (Russian)'},
        {id:'Urdu', className:'language', textContent:'우르두어 (Urdu)'},
        {id:'Indonesian', className:'language', textContent:'인도네시아어 (Indonesian)'},
        {id:'French', className:'language', textContent:'프랑스어 (French)'},
        {id:'Japanese', className:'language', textContent:'일본어 (Japanese)'},
        {id:'German', className:'language', textContent:'독일어 (German)'},
        {id:'Marathi', className:'language', textContent:'마라티어 (Marathi)'},
        {id:'Punjabi', className:'language', textContent:'펀자브어 (Punjabi)'},
        {id:'Korean', className:'language', textContent:'한국어 (Korean)'},
        {id:'Tagalog', className:'language', textContent:'타갈로그어 (Tagalog)'},
        {id:'Italian', className:'language', textContent:'이탈리아어 (Italian)'},
        {id:'Tamil', className:'language', textContent:'타밀어 (Tamil)'},
        {id:'Georgian', className:'language', textContent:'그루지야어 (Georgian)'},
        {id:'Telugu', className:'language', textContent:'텔루구어 (Telugu)'},
        {id:'Ukrainian', className:'language', textContent:'우크라이나어 (Ukrainian)'},
        {id:'Turkish', className:'language', textContent:'터키어 (Turkish)'},
        {id:'Persian', className:'language', textContent:'페르시아어 (Persian)'},
        {id:'Vietnamese', className:'language', textContent:'베트남어 (Vietnamese)'},
        {id:'Thai', className:'language', textContent:'태국어 (Thai)'},
        {id:'Malay', className:'language', textContent:'말레이어 (Malay)'},
        {id:'Dutch', className:'language', textContent:'네덜란드어 (Dutch)'},
        {id:'Hungarian', className:'language', textContent:'헝가리어 (Hungarian)'},
        {id:'Czech', className:'language', textContent:'체코어 (Czech)'},
        {id:'Arabic', className:'language', textContent:'아랍어 (Arabic)'},
    ]

    languageData.forEach(language => {
        const settingDiv = document.createElement('div');
        settingDiv.id = language.id;
        settingDiv.className = language.className;
        settingDiv.textContent = language.textContent;
        menuList.appendChild(settingDiv);
    });
}
