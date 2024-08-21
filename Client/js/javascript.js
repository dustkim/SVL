let map;
let infowindow;
let setLocation;
let markers = [];
let visibleMarkers = [];
let localData;
let bounds;
let checkObject;

// 서울시 구 이름
let checkName = "";
let beforeOverlay = null;
let globalOverlay = null;
let checklanguage = "English";
let card_title;
let card_texts;
let setCategory = "";
let searchMarker = null;
let beforebtn = null;
const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png'

// window.addEventListener("resize", findHeight)

function findHeight() {
    const navPc = document.getElementById("navPc");
    const navMobile = document.getElementById("navMobile");

    const doc = document.documentElement;
    doc.style.setProperty('--navPc-height', `${navPc.getBoundingClientRect().height}px`)

    const total = navPc.getBoundingClientRect().height + navMobile.getBoundingClientRect().height
    doc.style.setProperty('--header-total', `${total}px`)
}

window.onload = function() {
    findHeight()

    let mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = { 
        center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
        level: 9 // 지도의 확대 레벨
    };

    const menu = document.getElementById("menu");
    menu.addEventListener("click", toggleMenu())

    // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
    map = new kakao.maps.Map(mapContainer, mapOption);
    // customOverlay = new kakao.maps.CustomOverlay({});
    infowindow = new kakao.maps.InfoWindow({removable: true});
    
    // 마커 다 만듦.
    seoulArea();

    // 지도가 축소(4레벨이상)이면 숨기고, 확대(4레벨 미만)되면 보임.
    kakao.maps.event.addListener(map, 'zoom_changed', visible);
    kakao.maps.event.addListener(map, 'dragend', refresh);

    const foodbtn = document.getElementById("food");
    const lodgingbtn = document.getElementById("lodging");
    const heritagebtn = document.getElementById("heritage");
    const park = document.getElementById("park");

    const searchInputPc = document.getElementById("search_pc");
    const searchButtonPc = document.getElementById("search_button_pc");
    const searchInputMobile = document.getElementById("search_mobile");
    const searchButtonMobile = document.getElementById("search_button_mobile");

    // 첫 진입 후 enter 키 사용시 리셋 현상 존재
    searchInputPc.addEventListener("keyup", (e) => {
        if(e.keyCode === 13){
            searchInputMobile.value = searchInputPc.value;
            search(searchInputPc);
        }
    })
    searchButtonPc.addEventListener("click", () => {
        searchInputMobile.value = searchInputPc.value;
        search(searchInputPc);
    })

    // 첫 진입 후 enter 키 사용시 리셋 현상 존재
    searchInputMobile.addEventListener("keyup", (e) => {
        if(e.keyCode === 13){
            searchInputPc.value = searchInputMobile.value;
            search(searchInputMobile);
        }
    })
    searchButtonMobile.addEventListener("click", () => {
        searchInputPc.value = searchInputMobile.value;
        search(searchInputMobile);
    })

    const translatebtn = document.getElementById("translate");
    const languagebtn = document.getElementById("language");
    
    // list 안에 데이터 있는지 확인.
    // 있으면 삭제
    // 비동기로 데이터 요청
    // 데이터로 반복문 접근
    // appendMenuBtn 함수 접근
    // 데이터 생성 후 list 태그에 자식으로 추가

    foodbtn.addEventListener("click", () => {
        if(!checkName){
            return alert("서울시 구를 선택하신 후 다시 사용해주시기 바랍니다.");
        }
        changeColorbtn("food");
        appendMenuBtn(getFood, foodDetailInfo, checkName, "food", "storeName")
        setCategory = "food";
        hideMarkers()
        showMarkers()
    });

    lodgingbtn.addEventListener("click", () => {
        if(!checkName){
            return alert("서울시 구를 선택하신 후 다시 사용해주시기 바랍니다.");
        }
        changeColorbtn("lodging");
        appendMenuBtn(getLodging, lodgingDetailInfo, checkName, "lodging", "lodgingName");
        setCategory = "lodging";
        hideMarkers()
        showMarkers()
    });

    heritagebtn.addEventListener("click", () => {
        if(!checkName){
            return alert("서울시 구를 선택하신 후 다시 사용해주시기 바랍니다.");
        }
        changeColorbtn("heritage");
        appendMenuBtn(getHeritage, heritageDetailInfo, checkName, "heritage", "heritageName");
        setCategory = "heritage"
        hideMarkers()
        showMarkers()
    });

    park.addEventListener("click", () => {
        if(!checkName){
            return alert("서울시 구를 선택하신 후 다시 사용해주시기 바랍니다.");
        }
        changeColorbtn("park");
        appendMenuBtn(getPark, parkDetailInfo, checkName, "park", "parkName");
        setCategory = "park";
        hideMarkers()
        showMarkers()
    });

    translatebtn.addEventListener("click", () => {
        translateApi();
    })

    languagebtn.addEventListener("click", () => {
        settingInfo();
    })
}

// 번역 함수
async function translateApi() {
    const detailInfo = document.getElementById("detailInfo");
    // const card_body = document.querySelector(".card-body");

    if(detailInfo.style.display != "block"){
        alert("상세 정보 조회를 한 후에 실행해주시기 바랍니다.");
        return;
    }

    alert(`${checklanguage}로 번역합니다`)

    // 값이 있을 때
    // const card_title = card_body.querySelector(".card-title");
    // const card_texts = card_body.querySelectorAll(".card-text");

    const getTitle = await getTranslate(card_title.innerText, checklanguage)
    card_title.innerText = getTitle.content;

    for (const card_text of card_texts){
        const response = await getTranslate(card_text.innerText, checklanguage);
        card_text.innerText = response.content;
    }
}

async function search(searchInput) {
    if(!checkName){
        return alert("서울시 구를 선택하신 후 다시 사용해주시기 바랍니다.");
    }

    if(!setCategory){
        return alert("카테고리 선택 후에 다시 사용해주시기 바랍니다.");
    }

    const keyword = searchInput.value.trim();

    if(keyword.length < 2){
        return alert("2글자 이상 입력하시기 바랍니다.");
    }

    let name = "";
    let address= "";

    if(setCategory == "food"){
        address = "roadAddress"
        name = "storeName"
    } else if(setCategory == "lodging"){
        address = "roadAddress"
        name = "lodgingName"
    } else if(setCategory == "heritage"){
        address = "heritageAddress"
        name = "heritageName"
    } else if(setCategory == "park"){
        address = "parkAddress"
        name = "parkName"
    }

    const result = await getSearch(checkName, keyword, setCategory, address, name);

    const menuList = document.getElementById("menuList");
    const list = document.getElementById("list");
    const detailInfo = document.getElementById("detailInfo");

    if(globalOverlay){
        globalOverlay.setMap(null)
        globalOverlay = null;
    }

    detailInfo.style.display = "none";
    menuList.style.display = "block";

    if(list.innerHTML != ""){
        list.innerHTML = "";
    }

    if(result.length == 0){
        const li = document.createElement("li")
        li.className = "list-group-item list-group-item-dark d-flex justify-content-between align-items-center"

        li.innerText = "검색 결과가 없습니다!"

        list.appendChild(li);
        return;
    }

    if(setCategory == "food"){
        for(let i = 0; i < result.length; i++){
            searchMenuList(result[i], foodDetailInfo, checkName, "food", "storeName");
        }
    } else if(setCategory == "lodging"){
        for(let i = 0; i < result.length; i++){
            searchMenuList(result[i], lodgingDetailInfo, checkName, "lodging", "lodgingName");
        }
    } else if(setCategory == "heritage"){
        for(let i = 0; i < result.length; i++){
            searchMenuList(result[i], heritageDetailInfo, checkName, "heritage", "heritageName");
        }
    } else if(setCategory == "park"){
        for(let i = 0; i < result.length; i++){
            searchMenuList(result[i], parkDetailInfo, checkName, "park", "parkName");
        }
    } else {
        console.log("에러 발생");
        return
    }
}

function searchMenuList(data, detailFunc, areaName, dataName, titleName){
    const li = document.createElement("li")
    li.className = "list-group-item list-group-item-dark d-flex justify-content-between align-items-center"

    li.innerText = `[${areaName}] ` + data[titleName]

    li.addEventListener("click", function() {
        detailFunc(data)
        setPosition(data.location)
        Overlay(data, dataName);
    })

    list.appendChild(li);
}

function toggleMenu() {
    return function() {
        const menuList = document.getElementById("menuList");
        const detailInfo = document.getElementById("detailInfo");
        if(menuList.style.display == "block"){
            menuList.style.display = "none"
            if(detailInfo.style.display == "block"){
                detailInfo.style.display = "none"
            }
        } else if(menuList.style.display == "none"){
            menuList.style.display = "block"
        } else {
            menuList.style.display = "block"
        }
    }
}

const refresh = () => {
    if(searchMarker){
        searchMarker.setMap(null)
        searchMarker = null;
    }

    if(globalOverlay){
        globalOverlay.setMap(null)
        globalOverlay = null;
    }

    // 새로 화면 갱신
    let level = map.getLevel();
    if(markers.length != 0 && level <= 2){
        hideMarkers();
        showMarkers(map)
    }
};

const visible = () => {
    let level = map.getLevel();
    if(markers.length > 0){
        if(level > 2){
            if(globalOverlay){
                globalOverlay.setMap(null);
            }
            hideMarkers();
        } else {
            if(globalOverlay){
                globalOverlay.setMap(map);
            }
            refresh();
        }
    }
}

// 서울 권역 생성
async function seoulArea(){
    const areas = await getTopo();

    for (let i = 0, len = areas.length; i < len; i++) {
        displayArea(areas[i]);
    }
}

// 서울 권역별 다각형 생성
function displayArea(area) {
    let polygonPath = []
    let locationList = area['_WKT']
    
    for (let i = 0; i < locationList.length; i++) {
        let location = locationList[i]
        polygonPath.push(new kakao.maps.LatLng(location.y, location.x))
    }

    // 다각형을 생성합니다 
    let polygon = new kakao.maps.Polygon({
        map: map, // 다각형을 표시할 지도 객체
        path: polygonPath,
        strokeWeight: 2,
        strokeColor: '#004c80',
        strokeOpacity: 0.8,
        fillColor: '#fff',
        fillOpacity: 0.5 
    });

    kakao.maps.event.addListener(polygon, 'mouseover', function(mouseEvent) {
        let level = map.getLevel();

        if(level <= 2){
            polygon.setOptions({fillColor: '#fff'});
        } else {
            polygon.setOptions({fillColor: '#09f'});
        }

        // // 권역 이름 마우스로 띄우기
        // customOverlay.setContent('<div class="area">' + area.nm + '</div>');
        // customOverlay.setPosition(mouseEvent.latLng); 
        // customOverlay.setMap(map);
    });

    // 권역 범위 이탈시 삭제
    kakao.maps.event.addListener(polygon, 'mouseout', function() {
        polygon.setOptions({fillColor: '#fff'});
        // customOverlay.setMap(null);
    }); 

    // 권역 이름 마우스 위치에 맞춰서 이동
    // kakao.maps.event.addListener(polygon, 'mousemove', function(mouseEvent) {
    //     customOverlay.setPosition(mouseEvent.latLng); 
    // });

    kakao.maps.event.addListener(polygon, 'click', function() {

        let level = map.getLevel();

        // 확대는 3레벨부터
        if(level > 2){
            let menuBtnList = document.querySelectorAll(".category")
            menuBtnList.forEach(menubtn => {
                menubtn.style.backgroundColor = "rgba(0, 0, 0, 0)"
    
            })

            setCategory = "";
            let setLocation = area.location
            map.setCenter(new kakao.maps.LatLng(setLocation.y, setLocation.x));
            map.setLevel(2);
            checkName = area.nm;
            initData(area);
        } else if(checkName != area.nm){
            let menuBtnList = document.querySelectorAll(".category")
            menuBtnList.forEach(menubtn => {
                menubtn.style.backgroundColor = "rgba(0, 0, 0, 0)"
    
            })

            setCategory = "";
            checkName = area.nm;
            initData(area);
            const list = document.getElementById("list");
            const detailInfo = document.getElementById("detailInfo");
            if(list.innerHTML != ""){
                list.innerHTML = ""
                if(detailInfo.style.display == "block"){
                    detailInfo.style.display = "none"
                }
            }
        }
    });
}

async function initData(area){
    // 마커 초기화
    hideMarkers();
    markers = [];

    const menuList = document.getElementById("menuList");
    const list = document.getElementById("list");
    const detailInfo = document.getElementById("detailInfo");

    if(globalOverlay){
        globalOverlay.setMap(null)
        globalOverlay = null;
    }

    detailInfo.style.display = "none";
    menuList.style.display = "none";

    if(list.innerHTML != ""){
        list.innerHTML = "";
    }

    let allData = await getAll(area.nm);

    for(let i = 0; i < allData[0].length; i++){
        addMarker(allData[0][i], area.nm, "food");
    }

    for(let i = 0; i < allData[1].length; i++){
        addMarker(allData[1][i], area.nm, "lodging");
    }
    
    for(let i = 0; i < allData[2].length; i++){
        addMarker(allData[2][i], area.nm, "heritage");
    }

    for(let i = 0; i < allData[3].length; i++){
        addMarker(allData[3][i], area.nm, "park");
    }

    // markers = markers.filter(marker => {
    //     let latLng = marker[2];
    //     markers.forEach(target => {
    //         if(latLng.equals(target[2].getPosition())){
    //             console.log("같음");
    //             return false;
    //         }
    //     })
    //     return true;
    // })

    showMarkers();
}

// 마커를 생성합니다
function addMarker(data, areaName, dataName) {
    // kakao.maps.LatLngBounds
    let bounds = map.getBounds();

    // kakao.maps.LatLng
    let sw = bounds.getSouthWest();
    let ne = bounds.getNorthEast();

    const lb = new kakao.maps.LatLngBounds(sw, ne);
    const latLng = new kakao.maps.LatLng(data.location.y, data.location.x);

    // 해당 좌표에 마커가 있는지 확인하기. 있으면 return
    // 이미 다중 메뉴로 만들어져있기 때문에 추가로 생성할 필요가 없음.

    let marker = new kakao.maps.Marker({
        position: latLng
    });

    if(beforeOverlay){
        beforeOverlay.setMap(null);
        beforeOverlay = null;
    }

    if(lb.contain(latLng)){
        marker.setMap(map);
    }

    kakao.maps.event.addListener(marker, "click",  multi(data, areaName, dataName, marker));
    markers.push([marker, dataName, latLng]);
}

function multi(data, areaName, dataName, marker) {
    return async function() {
        const list = document.getElementById("list");

        if(list.innerHTML != ""){
            list.innerHTML = "";
        }

        const latLng = new kakao.maps.LatLng(data.location.y, data.location.x);

        let result;

        if(setCategory == ""){
            result = await getEqualsPoint(checkName, data.location.x, data.location.y, "false", "false")

            // 음식
            for(let i = 0; i < result[0].length; i++){
                appendMenu(result[0][i], areaName, "food")
            }
            // 숙소
            for(let i = 0; i < result[1].length; i++){
                appendMenu(result[1][i], areaName, "lodging")
            }
            // 문화유산
            for(let i = 0; i < result[2].length; i++){
                appendMenu(result[2][i], areaName, "heritage")
            }
            // 공원
            for(let i = 0; i < result[3].length; i++){
                appendMenu(result[3][i], areaName, "park")
            }
            let totalLength = result[0].length + result[1].length + result[2].length + result[3].length

            // let markerImage = selectMarkerImages(totalLength - 1);
            // marker.setImage(markerImage);

            if(totalLength == 1){
                // 단일 오버레이
                // 종류 중 하나
                if(result[0].length == 1){
                    Overlay(data, dataName)
                } else if(result[1].length == 1){
                    Overlay(data, dataName)
                } else if(result[2].length == 1){
                    Overlay(data, dataName)
                } else if(result[3].length == 1){
                    Overlay(data, dataName)
                }
            } else {
                // 멀티 오버레이
                let content = makeMultiOverlay(totalLength);
                customOverlay = new kakao.maps.CustomOverlay({
                    position: latLng,
                    content: content
                });
                Overlay(data, dataName, totalLength)
            }
        } else {
            let address = "";

            if(setCategory == "food"){
                address = "roadAddress"
            } else if(setCategory == "lodging"){
                address = "roadAddress"
            } else if(setCategory == "heritage"){
                address = "heritageAddress"
            } else if(setCategory == "park"){
                address = "parkAddress"
            }

            result = await getEqualsPoint(checkName, data.location.x, data.location.y, setCategory, address)

            for(let i = 0; i < result.length; i++){
                appendMenu(result[i], areaName, dataName)
            }

            // let markerImage = selectMarkerImages(result.length - 1);
            // marker.setImage(markerImage);

            if(result.length == 1){
                Overlay(data, dataName)
            } else {
                Overlay(data, dataName, result.length)
            }
        }
    }
}

// 카테고리 버튼 클릭했을 때 -> 상세조회로 넘어가기
// 단, 영역 선택을 1번이라도 했어야 가능함.
async function appendMenuBtn(apiFunc, detailFunc, areaName, dataName, titleName){
    const menuList = document.getElementById("menuList");
    const list = document.getElementById("list");
    const detailInfo = document.getElementById("detailInfo");

    if(globalOverlay){
        globalOverlay.setMap(null)
        globalOverlay = null;
    }

    detailInfo.style.display = "none";
    menuList.style.display = "block";
    list.style.display = "block";

    if(list.innerHTML != ""){
        list.innerHTML = "";
    }

    const result = await apiFunc(areaName);

    if(result.length > 0){
        result.forEach(data => {
            const li = document.createElement("li")
            li.className = "list-group-item list-group-item-dark d-flex justify-content-between align-items-center"
    
            li.innerText = `[${areaName}] ` + data[titleName]
    
            li.addEventListener("click", function() {
                detailFunc(data)
                setPosition(data.location)
                Overlay(data, dataName);
            })

            list.appendChild(li);
        })
    } else {
        const li = document.createElement("li")
        li.className = "list-group-item list-group-item-dark d-flex justify-content-between align-items-center"

        li.innerText = "검색 결과가 없습니다!"

        list.appendChild(li);
    }
}

function Overlay(data, dataName, option = "") {
    let content;
    
    if(option != ""){
        content = makeMultiOverlay(option);
    } else {
        content = makeOverlay(data, dataName)
    }

    const latLng = new kakao.maps.LatLng(data.location.y, data.location.x)

    if(globalOverlay){
        if(globalOverlay.getContent() == content){
            globalOverlay.setMap(null);
            globalOverlay = null;
            return;
        }
        globalOverlay.setMap(null);
        globalOverlay = null;
    }

    globalOverlay = new kakao.maps.CustomOverlay({
        position: latLng,
        content: content
    });

    globalOverlay.setZIndex(1000);
    globalOverlay.setMap(map);
}

function makeMultiOverlay(length) {
    const content = '<div class="wrap">' + 
    '    <div class="info">' + 
    '        <div class="title">' + 
    `        밀집 구역` + 
    '        </div>' + 
    '        <div class="body">' + 
    '            <div class="desc">' + 
    `                <div class="ellipsis">해당 장소에는 ${length}개가 존재합니다.</div>` +
    '            </div>' + 
    '        </div>' + 
    '    </div>' +    
    '</div>';

    return content;
}


// 메뉴 추가 함수
function appendMenu(data, areaName, dataName){
    const menuList = document.getElementById("menuList");
    const list = document.getElementById("list");

    if(menuList.style.display != "block"){
        menuList.style.display = "block";
    }

    const menu = document.createElement("li")
    menu.className = "list-group-item list-group-item-dark d-flex justify-content-between align-items-center"

    if(dataName == "food"){
        if(data){
            menu.innerText = `[${areaName}]` + data.storeName
            foodDetailInfo(data)
            menu.addEventListener("click", () => {
                foodDetailInfo(data)
                setPosition(data.location)
                Overlay(data, dataName)
            })
            list.appendChild(menu);
        }
    } else if(dataName == "lodging"){
        if(data){
            menu.innerText = `[${areaName}] ` + data.lodgingName
            lodgingDetailInfo(data)
            menu.addEventListener("click", () => {
                lodgingDetailInfo(data)
                setPosition(data.location)
                Overlay(data, dataName)
            })
            list.appendChild(menu);
        }
    }else if(dataName == "heritage"){
        if(data){
            menu.innerText = `[${areaName}] ` + data.heritageName
            heritageDetailInfo(data)
            menu.addEventListener("click", () => {
                heritageDetailInfo(data)
                setPosition(data.location)
                Overlay(data, dataName)
            })
            list.appendChild(menu);
        }
    }else if(dataName == "park"){
        if(data){
            menu.innerText = `[${areaName}] ` + data.parkName
            parkDetailInfo(data)
            menu.addEventListener("click", () => {
                parkDetailInfo(data)
                setPosition(data.location)
                Overlay(data, dataName)
            })
            list.appendChild(menu);
        }
    }else {
        console.log("에러 발생");
    }
}

// 커스텀 오버레이를 닫기 위해 호출되는 함수입니다 
function closeOverlay() {
    globalOverlay.setMap(null);
    globalOverlay = null;
}

// 음식 상세 정보 조회하는 함수
function foodDetailInfo(datainfo){
    const detailInfo = document.getElementById("detailInfo");

    checking(detailInfo, datainfo);

    let htmlData = `
    <div id="subDetailInfo" class="card border-secondary mb-3">
        <div class="card-header">상세정보</div>
        <div class="card-body">
            <h4 class="card-title">${datainfo.storeName}</h4>
            <p class="card-text">도로명주소: ${datainfo.roadAddress}</p>
            <p class="card-text">지번주소: ${datainfo.localAddress}</p>
            <p class="card-text">전화번호: ${datainfo.storeTel}</p>
            <p class="card-text">음식 카테고리: ${datainfo.foodCategory}</p>
            <p class="card-text">영업인허가명: ${datainfo.accessName}</p>
            <p class="card-text">${datainfo.shopIntro}</p>
        </div>
    </div>`

    detailInfo.innerHTML = htmlData;

    btnclose = document.createElement("btn_close");
    btnclose.id = "btn_close";
    btnclose.className = "btn_close";

    btnclose.addEventListener("click", () => (closeInfo(detailInfo, btnclose)))
    savedetailInfo();
    detailInfo.appendChild(btnclose)
}

// 숙소 상세 정보 조회하는 함수
function lodgingDetailInfo(datainfo){
    const detailInfo = document.getElementById("detailInfo");

    checking(detailInfo, datainfo);

    let htmlData = `
    <div id="subDetailInfo" class="card border-secondary mb-3">
        <div class="card-header">상세정보</div>
        <div class="card-body">
            <h4 class="card-title">${datainfo.lodgingName}</h4>
            <p class="card-text">도로명주소: ${datainfo.roadAddress} </p>
            <p class="card-text">지번주소: ${datainfo.localAddress} </p>
            <p class="card-text">영업상태: ${datainfo.businessStatus}</p>
            <p class="card-text">건물크기: ${datainfo.lodgingSize}</p>
        </div>
    </div>`

    detailInfo.innerHTML = htmlData;

    btnclose = document.createElement("btn_close");
    btnclose.id = "btn_close";
    btnclose.className = "btn_close";

    btnclose.addEventListener("click", () => (closeInfo(detailInfo, btnclose)))
    savedetailInfo();
    detailInfo.appendChild(btnclose)
}

// 문화유산 상세 정보 조회하는 함수
function heritageDetailInfo(datainfo){
    const detailInfo = document.getElementById("detailInfo");
    checking(detailInfo, datainfo);
    let htmlData = `
    <div id="subDetailInfo" class="card border-secondary mb-3">
        <div class="card-header">상세정보</div>
        <div class="card-body">
            <h4 class="card-title">${datainfo.heritageName}</h4>
            <p class="card-text">주소: ${datainfo.heritageAddress} </p>
            <p class="card-text">시대분류: ${datainfo.heritageYear}</p>
            <p class="card-text">개요: ${datainfo.heritageInfo}</p>
        </div>
    </div>`

    detailInfo.innerHTML = htmlData;

    btnclose = document.createElement("btn_close");
    btnclose.id = "btn_close";
    btnclose.className = "btn_close";

    btnclose.addEventListener("click", () => (closeInfo(detailInfo, btnclose)))
    savedetailInfo();
    detailInfo.appendChild(btnclose)
}

// 공원 상세 정보 조회하는 함수
function parkDetailInfo(datainfo){
    const detailInfo = document.getElementById("detailInfo");
    checking(detailInfo, datainfo);
    let htmlData = `
    <div id="subDetailInfo" class="card border-secondary mb-3">
        <div class="card-header">상세정보</div>
        <div class="card-body">
            <h4 class="card-title">${datainfo.parkName}</h4>
            <p class="card-text">주소: ${datainfo.parkAddress} </p>
            <p class="card-text">전화번호: ${datainfo.parkTel}</p>
            <p class="card-text">공원면적: ${datainfo.parkArea}</p>
            <p class="card-text">공원소개: ${datainfo.parkIntro}</p>
        </div>
    </div>`

    detailInfo.innerHTML = htmlData;

    btnclose = document.createElement("btn_close");
    btnclose.id = "btn_close";
    btnclose.className = "btn_close";

    btnclose.addEventListener("click", () => (closeInfo(detailInfo, btnclose)))
    savedetailInfo();
    detailInfo.appendChild(btnclose)
}

function checking(detailInfo, datainfo){
    if(checkObject !== datainfo || !checkObject){
        detailInfo.style.display = "block";
        checkObject = datainfo;
    } else {
        detailInfo.style.display = "block";
    }
    
    if(detailInfo.innerHTML != ""){
        detailInfo.innerHTML = ""
    }
}

function setPosition(datainfo){
    map.setCenter(new kakao.maps.LatLng(datainfo.y, datainfo.x));
    hideMarkers();
    if(searchMarker){
        searchMarker.setMap(null);
        searchMarker = null;
        searchMarker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(datainfo.y, datainfo.x)
        });
        searchMarker.setMap(map);
    } else {
        searchMarker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(datainfo.y, datainfo.x)
        });
        searchMarker.setMap(map);
    }
    map.setLevel(2);
}

// 삭제 함수
function closeInfo(detailInfo, btnclose) {
    detailInfo.innerHTML = ""
    detailInfo.style.display = "none"
    detailInfo.removeChild(btnclose)

    beforeOverlay.setMap(null);
    beforeOverlay = null;
}

// 배열에 추가된 마커들을 지도에 표시하거나 삭제하는 함수입니다
function setMarkers(map) {
    // kakao.maps.LatLngBounds
    let bounds = map.getBounds();

    // kakao.maps.LatLng
    let sw = bounds.getSouthWest();
    let ne = bounds.getNorthEast();

    const lb = new kakao.maps.LatLngBounds(sw, ne);

    if(searchMarker){
        searchMarker.setMap(null);
    } else if (setCategory != "") {
        for (let i = 0; i < markers.length; i++){
            if(lb.contain(markers[i][0].getPosition()) && markers[i][1] == setCategory){
                markers[i][0].setMap(map);
            }
        }
    } else {
        for (let i = 0; i < markers.length; i++) {
            if(lb.contain(markers[i][0].getPosition())){
                markers[i][0].setMap(map);
            }
        }
    }
}

// "마커 보이기" 버튼을 클릭하면 호출되어 배열에 추가된 마커를 지도에 표시하는 함수입니다
function showMarkers() {
    setMarkers(map)
}

// "마커 감추기" 버튼을 클릭하면 호출되어 배열에 추가된 마커를 지도에서 삭제하는 함수입니다
function hideMarkers(){
    if(searchMarker){
        searchMarker.setMap(null);
    } else {
        for (let i = 0; i < markers.length; i++){
            markers[i][0].setMap(null);
        }
    }
}

function makeHoverOverlay(data, dataName){
    let overlayContent = {}

    if(dataName == "food"){
        overlayContent["title"] = data.storeName;
        overlayContent["roadAddress"] = data.roadAddress;
    } else if(dataName == "lodging"){
        overlayContent["title"] = data.lodgingName;
        overlayContent["roadAddress"] = data.roadAddress;
    } else if(dataName == "heritage"){
        overlayContent["title"] = data.heritageName;
        overlayContent["roadAddress"] = data.heritageAddress;
    } else if(dataName == "park"){
        overlayContent["title"] = data.parkName;
        overlayContent["roadAddress"] = data.parkAddress;
    }

    const content = '<div class="wrap">' + 
    '    <div class="info">' + 
    '        <div class="title">' + 
    `        ${overlayContent['title']}` + 
    '        </div>' + 
    '        <div class="body">' + 
    '            <div class="desc">' + 
    `                <div class="ellipsis">${overlayContent['roadAddress']}</div>` +
    '            </div>' + 
    '        </div>' + 
    '    </div>' +    
    '</div>';

    return content;
}

function makeOverlay(data, dataName){
    let overlayContent = {}

    if(dataName == "food"){
        overlayContent["title"] = data.storeName;
        overlayContent["roadAddress"] = data.roadAddress;
    } else if(dataName == "lodging"){
        overlayContent["title"] = data.lodgingName;
        overlayContent["roadAddress"] = data.roadAddress;
    } else if(dataName == "heritage"){
        overlayContent["title"] = data.heritageName;
        overlayContent["roadAddress"] = data.heritageAddress;
    } else if(dataName == "park"){
        overlayContent["title"] = data.parkName;
        overlayContent["roadAddress"] = data.parkAddress;
    }

    const content = '<div class="wrap">' + 
    '    <div class="info">' + 
    '        <div class="title">' + 
    `        ${overlayContent['title']}` + 
    `        <div class="close" onclick="closeOverlay()" title="닫기"></div>` +
    '        </div>' + 
    '        <div class="body">' + 
    '            <div class="desc">' + 
    `                <div class="ellipsis">${overlayContent['roadAddress']}</div>` +
    '            </div>' + 
    '        </div>' + 
    '    </div>' +    
    '</div>';

    return content;
}

// 닫기 함수
function closeInfo() {
    const detailInfo = document.getElementById("detailInfo");
    const menuList = document.getElementById("menuList");

    if(detailInfo.style.display == "block"){
        detailInfo.style.display = "none"
        detailInfo.innerHTML = ""
        menuList.style.display = "block"
    };
}

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다 
function visibleListener(customOverlay) {
    return function() {
        if(beforeOverlay){
            if(beforeOverlay.getContent() != customOverlay.getContent()){
                beforeOverlay.setMap(null);
                beforeOverlay = null;
                beforeOverlay = customOverlay;
                beforeOverlay.setMap(map);
                beforeOverlay.setZIndex(1000);
            } else {
                beforeOverlay.setMap(null);
                beforeOverlay = null;
            }
        } else {
            beforeOverlay = customOverlay;
            beforeOverlay.setZIndex(1000);
            beforeOverlay.setMap(map);
        }
    };
}

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다 
function makeOverListener(customOverlay) {
    return function() {
        customOverlay.setMap(map);
    };
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다 
function makeOutListener(customOverlay) {
    return function() {
        customOverlay.setMap(null);
    };
}

// 서울 권역 json 파일 가져오기
// node.js는 방식 변경
const getTopo = () => {
    return fetch('https://port-0-map-1mrfs72llwpzj2e4.sel5.cloudtype.app/map/polygons')
    .then(res => res.json())
    .then(res => JSON.parse(res));
}

const getAll = (region) => {
    return fetch(`https://port-0-map-1mrfs72llwpzj2e4.sel5.cloudtype.app/map/all?request=${region}`)
    .then(res => res.json())
}

const getFood = (region) => {
    return fetch(`https://port-0-map-1mrfs72llwpzj2e4.sel5.cloudtype.app/map/food?request=${region}`)
    .then(res => res.json())
}

// 숙소 api
const getLodging = region => {
    return fetch(`https://port-0-map-1mrfs72llwpzj2e4.sel5.cloudtype.app/map/lodging?request=${region}`)
    .then(res => res.json())
}

// 문화유산 api
const getHeritage = region => {
    return fetch(`https://port-0-map-1mrfs72llwpzj2e4.sel5.cloudtype.app/map/heritage?request=${region}`)
    .then(res => res.json())
}

// 공원 api
const getPark = region => {
    return fetch(`https://port-0-map-1mrfs72llwpzj2e4.sel5.cloudtype.app/map/park?request=${region}`)
    .then(res => res.json())
}

// 검색 api
const getSearch = (region, keyword, category, address, name) => {
    return fetch(`https://port-0-map-1mrfs72llwpzj2e4.sel5.cloudtype.app/map/search?request=${region}&keyword=${keyword}&category=${category}&address=${address}&name=${name}`)
    .then(res => res.json())
}

// 같은 좌표 조회 api
const getEqualsPoint = (region, x, y, table, address) => {
    return fetch(`https://port-0-map-1mrfs72llwpzj2e4.sel5.cloudtype.app/map/point?request=${region}&x=${x}&y=${y}&category=${table}&address=${address}`)
    .then(res => res.json())
}

// 번역 api
const getTranslate = (request, language)=> {
    return fetch(`https://port-0-map-1mrfs72llwpzj2e4.sel5.cloudtype.app/request?request=${request}&language=${language}`)
    .then(res => res.json())
}

// 언어 선택 함수
function settingInfo() {
    // 창
    const translateInfo = document.getElementById("translateInfo");
    // 내용
    const translateList = document.getElementById("translateList");

    translateInfo.style.display = "block";

    if(translateList.innerHTML != ""){
        const btnclose = document.createElement("div");
        btnclose.id = "translate_btn_close";
        btnclose.className = "translate_btn_close";
    
        btnclose.addEventListener("click", () => {
            translateClose(translateInfo, btnclose)}
        )
    
        translateInfo.appendChild(btnclose)
        return;
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
        const li = document.createElement('li');
        li.id = language.id;
        li.className = `${language.className} list-group-item list-group-item-dark d-flex justify-content-between align-items-center`;
        li.innerText = language.textContent;

        li.addEventListener('click', () => {
            checklanguage = language.id;
            alert(`${language.textContent}로 설정되었습니다.`);
        })

        translateList.appendChild(li);
    });

    const btnclose = document.createElement("div");
    btnclose.id = "translate_btn_close";
    btnclose.className = "translate_btn_close";

    btnclose.addEventListener("click", () => {
        translateClose(translateInfo, btnclose)}
    )

    translateInfo.appendChild(btnclose)
}

function translateClose(translateInfo, btnclose) {
    translateInfo.style.display = "none"
    translateInfo.removeChild(btnclose)
}

function mobileLogout(){
    document.getElementById("mobileLogout").submit();
}

function savedetailInfo(){
    const card_body = document.querySelector(".card-body");

    card_title = null;
    card_texts = null;

    card_title = card_body.querySelector(".card-title");
    card_texts = card_body.querySelectorAll(".card-text");
}

// 컬러 변경
function changeColorbtn(id){

    // 첫번째 실행이더라도 이벤트 리스너 마지막에서 setCategory가 지정됨.
    if(setCategory == ""){
        beforebtn = document.getElementById(id);
        beforebtn.style.backgroundColor = "rgb(174, 167, 159)"
    } else {
        beforebtn = document.getElementById(setCategory);
        beforebtn.style.backgroundColor = "rgba(0, 0, 0, 0)"

        let selectbtn = document.getElementById(id);
        selectbtn.style.backgroundColor = "rgb(174, 167, 159)"
    }
}

// 마커 숫자 이미지 반환
function selectMarkerImages(length){
    if(length > 15){
        length = 15;
    }

    if(length == 0){
        console.log("에러 발생");
    }

    let imageSize = new kakao.maps.Size(36, 37)  // 마커 이미지의 크기
    let imgOptions =  {
        spriteSize : new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
        spriteOrigin : new kakao.maps.Point(0, (length*46)+10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
        offset: new kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
    }
    return new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions)
}