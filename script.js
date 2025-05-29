// 전역 상태 변수
let allHotelData = [];
let currentHotelIndex = -1; 

// DOM 요소 참조 변수 (DOMContentLoaded 내에서 할당)
let hotelTabsContainer, addHotelTabBtn, hotelEditorForm;
let hotelNameKoInput, hotelNameEnInput, hotelMapLinkInput, hotelImageInput, hotelDescriptionInput;
let previewHotelBtn, saveHotelHtmlBtn, loadHotelHtmlBtn, loadHotelExcelBtn;
let hotelHtmlLoadInput, hotelExcelLoadInput;

function renderTabs() {
    console.log("[Function Called] renderTabs, currentHotelIndex:", currentHotelIndex); // 로그 추가
    // ... (기존 renderTabs 내용) ...
}

function renderEditorForCurrentHotel() {
    console.log("[Function Called] renderEditorForCurrentHotel, currentHotelIndex:", currentHotelIndex); // 로그 추가
    // ... (기존 renderEditorForCurrentHotel 내용) ...
}

function switchTab(index) {
    console.log("[Function Called] switchTab, switching to index:", index); // 로그 추가
    // ... (기존 switchTab 내용) ...
}

function addHotel() {
    console.log("[Function Called] addHotel"); // 로그 추가
    // ... (기존 addHotel 내용) ...
}

function deleteHotel(indexToDelete) {
    console.log("[Function Called] deleteHotel, indexToDelete:", indexToDelete); // 로그 추가
    // ... (기존 deleteHotel 내용) ...
}

function syncCurrentHotelData() {
    if (currentHotelIndex === -1 || !allHotelData[currentHotelIndex]) return; 
    console.log("[Function Called] syncCurrentHotelData for index:", currentHotelIndex); // 로그 추가
    // ... (기존 syncCurrentHotelData 내용) ...
}

function previewHotelInfo() {
    console.log("[Function Called] previewHotelInfo"); // 로그 추가
    // ... (기존 previewHotelInfo 내용) ...
}


document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMContentLoaded: Script started."); // DOM 로드 완료 시점 로그

    // DOM 요소 참조 변수 할당
    hotelTabsContainer = document.getElementById('hotelTabsContainer');
    addHotelTabBtn = document.getElementById('addHotelTabBtn');
    hotelEditorForm = document.getElementById('hotelEditorForm');
    // ... (다른 요소들 할당) ...
    previewHotelBtn = document.getElementById('previewHotelBtn');
    saveHotelHtmlBtn = document.getElementById('saveHotelHtmlBtn');
    loadHotelHtmlBtn = document.getElementById('loadHotelHtmlBtn');
    loadHotelExcelBtn = document.getElementById('loadHotelExcelBtn');
    hotelHtmlLoadInput = document.getElementById('hotelHtmlLoadInput');
    hotelExcelLoadInput = document.getElementById('hotelExcelLoadInput');
    
    // 각 버튼 요소들이 제대로 찾아졌는지 확인
    if (!addHotelTabBtn) console.error("Error: addHotelTabBtn not found!");
    if (!previewHotelBtn) console.error("Error: previewHotelBtn not found!");
    // 다른 주요 버튼들도 필요에 따라 확인 로그 추가 가능

    // 이벤트 리스너 연결
    if (addHotelTabBtn) {
        addHotelTabBtn.addEventListener('click', function() {
            console.log("Button Clicked: Add New Hotel"); // 새 호텔 추가 버튼 클릭 로그
            addHotel();
        });
    }
    
    if (previewHotelBtn) {
        previewHotelBtn.addEventListener('click', function() {
            console.log("Button Clicked: Preview Hotel"); // 미리보기 버튼 클릭 로그
            previewHotelInfo();
        });
    }

    // ... (다른 input 및 버튼들의 이벤트 리스너 연결) ...
    // 예시: HTML 저장 버튼
    if (saveHotelHtmlBtn) {
        saveHotelHtmlBtn.addEventListener('click', () => {
            console.log("Button Clicked: Save HTML");
            syncCurrentHotelData(); 
            if (allHotelData.length === 0) {
                alert('저장할 호텔 정보가 없습니다.');
                return;
            }
            const dataStr = JSON.stringify(allHotelData); 
            const htmlContent = `<!DOCTYPE html><html><head><title>저장된 호텔 목록</title></head><body><script type="application/json" id="embeddedHotelData">${dataStr.replace(/<\/script>/g, '<\\/script>')}<\/script><p>이 파일은 호텔 정보 복원용입니다. 편집기에서 'HTML 불러오기'로 열어주세요.</p></body></html>`;
            const blob = new Blob([htmlContent], { type: 'text/html' }); 
            const a = document.createElement('a'); 
            a.href = URL.createObjectURL(blob);
            a.download = `전체_호텔정보_${new Date().toISOString().slice(0, 10)}.html`; 
            a.click(); 
            URL.revokeObjectURL(a.href); 
            alert('모든 호텔 정보가 HTML 파일로 저장되었습니다.');
        });
    }

    // ... (HTML 불러오기, Excel 불러오기 버튼 리스너에도 유사하게 로그 추가) ...

    // 초기화 호출
    console.log("Initializing tabs with currentHotelIndex:", currentHotelIndex);
    switchTab(currentHotelIndex); 
    console.log("DOMContentLoaded: Script finished initialization.");
});
