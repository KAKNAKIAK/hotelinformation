// 전역 상태 변수
let allHotelData = [];
let currentHotelIndex = -1; 

// DOM 요소 참조 변수 (DOMContentLoaded 내에서 할당)
let hotelTabsContainer, addHotelTabBtn, hotelEditorForm;
let hotelNameKoInput, hotelNameEnInput, hotelMapLinkInput, hotelImageInput, hotelDescriptionInput;
let previewHotelBtn, saveHotelHtmlBtn, loadHotelHtmlBtn, loadHotelExcelBtn;
let hotelHtmlLoadInput, hotelExcelLoadInput;

function renderTabs() {
    const existingTabs = hotelTabsContainer.querySelectorAll('.hotel-tab-button:not(#addHotelTabBtn)');
    existingTabs.forEach(tab => tab.remove());

    allHotelData.forEach((hotel, index) => {
        const tabButton = document.createElement('button');
        tabButton.className = 'hotel-tab-button';
        tabButton.dataset.index = index; 
        if (index === currentHotelIndex) {
            tabButton.classList.add('active'); 
        }
        tabButton.innerHTML = `
            <span class="tab-title">${hotel.nameKo || `새 호텔 ${index + 1}`}</span>
            <i class="fas fa-times tab-delete-icon" title="이 호텔 정보 삭제"></i>
        `;
        hotelTabsContainer.insertBefore(tabButton, addHotelTabBtn);

        tabButton.querySelector('.tab-delete-icon').addEventListener('click', (e) => {
            e.stopPropagation(); 
            deleteHotel(index); 
        });
        tabButton.addEventListener('click', () => {
            switchTab(index);
        });
    });
}

function renderEditorForCurrentHotel() {
    if (currentHotelIndex === -1 || !allHotelData[currentHotelIndex]) {
        hotelEditorForm.classList.add('disabled'); 
        hotelNameKoInput.value = '';
        hotelNameEnInput.value = '';
        hotelMapLinkInput.value = '';
        hotelImageInput.value = '';
        hotelDescriptionInput.value = '';
        document.querySelectorAll('#hotelEditorForm input, #hotelEditorForm textarea').forEach(el => {
            if(el.value === '') el.placeholder = ' '; 
        });
        return;
    }

    hotelEditorForm.classList.remove('disabled'); 
    const hotel = allHotelData[currentHotelIndex]; 
    hotelNameKoInput.value = hotel.nameKo || '';
    hotelNameEnInput.value = hotel.nameEn || '';
    hotelMapLinkInput.value = hotel.mapLink || '';
    const imageUrl = (typeof hotel.image === 'string' && (hotel.image.startsWith('http://') || hotel.image.startsWith('https://'))) ? hotel.image : '';
    hotelImageInput.value = imageUrl; 
    hotelDescriptionInput.value = hotel.description || '';
    
    document.querySelectorAll('#hotelEditorForm input, #hotelEditorForm textarea').forEach(el => {
        if(el.value !== '') el.placeholder = ' ';
    });
}

function switchTab(index) {
    if (index < -1 || (index >= allHotelData.length && allHotelData.length > 0) ) {
         return;
    }
    
    if (currentHotelIndex !== -1 && currentHotelIndex < allHotelData.length && currentHotelIndex !== index) {
         syncCurrentHotelData();
    }
    
    currentHotelIndex = index; 
    renderTabs(); 
    renderEditorForCurrentHotel(); 
}

function addHotel() {
    const newHotel = { 
        nameKo: `새 호텔 ${allHotelData.length + 1}`, 
        nameEn: "", 
        mapLink: "", 
        image: "", 
        description: "" 
    };
    allHotelData.push(newHotel);
    switchTab(allHotelData.length - 1); 
}

function deleteHotel(indexToDelete) {
    if (indexToDelete < 0 || indexToDelete >= allHotelData.length) {
        return;
    }

    const hotelName = allHotelData[indexToDelete].nameKo || '이 호텔';
    if (!confirm(`'${hotelName}' 정보를 삭제하시겠습니까?`)) {
        return;
    }

    allHotelData.splice(indexToDelete, 1); 

    let newActiveIndex = -1; 
    if (allHotelData.length > 0) { 
        if (currentHotelIndex === indexToDelete) { 
            newActiveIndex = Math.min(indexToDelete, allHotelData.length - 1);
             if (newActiveIndex < 0 && allHotelData.length > 0) { 
                newActiveIndex = 0;
            } else if (newActiveIndex >= allHotelData.length && allHotelData.length > 0) { 
                newActiveIndex = allHotelData.length -1;
            }
        } else if (currentHotelIndex > indexToDelete) { 
            newActiveIndex = currentHotelIndex - 1;
        } else { 
            newActiveIndex = currentHotelIndex; 
        }
    }
    currentHotelIndex = newActiveIndex;
    renderTabs();
    renderEditorForCurrentHotel();
}

function syncCurrentHotelData() {
    if (currentHotelIndex === -1 || !allHotelData[currentHotelIndex]) {
        return; 
    }
    const hotel = allHotelData[currentHotelIndex];
    hotel.nameKo = hotelNameKoInput.value;
    hotel.nameEn = hotelNameEnInput.value;
    hotel.mapLink = hotelMapLinkInput.value;
    hotel.image = hotelImageInput.value;
    hotel.description = hotelDescriptionInput.value;
}

function previewHotelInfo() {
    syncCurrentHotelData(); 

    if (currentHotelIndex === -1 || !allHotelData[currentHotelIndex]) {
        alert('미리보기할 호텔을 선택해주세요.');
        return;
    }
    const hotel = allHotelData[currentHotelIndex];
    const placeholderImage = 'https://placehold.co/600x400/e2e8f0/cbd5e0?text=No+Image';
    const currentHotelImage = (typeof hotel.image === 'string' && (hotel.image.startsWith('http://') || hotel.image.startsWith('https://'))) ? hotel.image : placeholderImage;

    const previewHtml = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>호텔 정보 미리보기: ${hotel.nameKo || '호텔'}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { font-family: 'Inter', sans-serif; background-color: #f0f2f5; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; padding: 2rem; box-sizing: border-box; }
                .hotel-card { 
                    background-color: white; 
                    border-radius: 0.75rem; 
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
                    width: 100%;
                    max-width: 384px; 
                    overflow: hidden;
                }
                .hotel-card-image {
                    width: 100%;
                    height: 224px; 
                    object-fit: cover;
                }
                .hotel-card-content {
                    padding: 1.25rem; 
                }
                .hotel-card-title-ko {
                    font-size: 1.25rem; 
                    font-weight: 600; 
                    color: #1a202c; 
                    margin-bottom: 0.25rem; 
                }
                .hotel-card-title-en {
                    font-size: 0.875rem; 
                    color: #718096; 
                    margin-bottom: 1rem; 
                }
                .hotel-card-description {
                    font-size: 0.875rem; 
                    color: #4a5568; 
                    line-height: 1.6;
                    margin-bottom: 1.25rem; 
                    white-space: pre-wrap; 
                }
                .hotel-card-link {
                    display: inline-block;
                    background-color: #4299e1; 
                    color: white;
                    padding: 0.5rem 1rem; 
                    border-radius: 0.375rem; 
                    font-size: 0.875rem; 
                    font-weight: 500; 
                    text-decoration: none;
                    transition: background-color 0.2s;
                }
                .hotel-card-link:hover {
                    background-color: #3182ce; 
                }
            </style>
        </head>
        <body>
            <div class="hotel-card">
                <img src="${currentHotelImage}" alt="${hotel.nameKo || '호텔 이미지'}" class="hotel-card-image" onerror="this.onerror=null; this.src='${placeholderImage}';">
                <div class="hotel-card-content">
                    <h1 class="hotel-card-title-ko">${hotel.nameKo || '호텔명 없음'}</h1>
                    ${hotel.nameEn ? `<h2 class="hotel-card-title-en">${hotel.nameEn}</h2>` : ''}
                    ${hotel.description ? `<p class="hotel-card-description">${hotel.description.replace(/\n/g, '<br>')}</p>` : ''}
                    ${hotel.mapLink ? `<a href="${hotel.mapLink}" target="_blank" rel="noopener noreferrer" class="hotel-card-link">지도 보기</a>` : ''}
                </div>
            </div>
        </body>
        </html>
    `;

    const previewWindow = window.open('', '_blank', 'width=500,height=700,scrollbars=yes,resizable=yes');
    if (previewWindow) {
        previewWindow.document.open();
        previewWindow.document.write(previewHtml);
        previewWindow.document.close();
        previewWindow.focus();
    } else {
        alert('팝업 차단 기능이 활성화되어 미리보기를 열 수 없습니다. 팝업 차단을 해제해주세요.');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // DOM 요소 참조 변수 할당
    hotelTabsContainer = document.getElementById('hotelTabsContainer');
    addHotelTabBtn = document.getElementById('addHotelTabBtn');
    hotelEditorForm = document.getElementById('hotelEditorForm');
    hotelNameKoInput = document.getElementById('hotelNameKo');
    hotelNameEnInput = document.getElementById('hotelNameEn');
    hotelMapLinkInput = document.getElementById('hotelMapLink');
    hotelImageInput = document.getElementById('hotelImage');
    hotelDescriptionInput = document.getElementById('hotelDescription');
    previewHotelBtn = document.getElementById('previewHotelBtn');
    saveHotelHtmlBtn = document.getElementById('saveHotelHtmlBtn');
    loadHotelHtmlBtn = document.getElementById('loadHotelHtmlBtn');
    loadHotelExcelBtn = document.getElementById('loadHotelExcelBtn');
    hotelHtmlLoadInput = document.getElementById('hotelHtmlLoadInput');
    hotelExcelLoadInput = document.getElementById('hotelExcelLoadInput');

    // 이벤트 리스너 연결
    addHotelTabBtn.addEventListener('click', addHotel); 
    previewHotelBtn.addEventListener('click', previewHotelInfo); 

    [hotelNameKoInput, hotelNameEnInput, hotelMapLinkInput, hotelImageInput, hotelDescriptionInput].forEach(input => {
        input.addEventListener('input', () => { 
            syncCurrentHotelData(); 
            if (input.id === 'hotelNameKo' && currentHotelIndex !== -1) {
                renderTabs(); 
            }
            if(input.value !== '') {
                input.placeholder = ' '; 
            }
        });
    });

    saveHotelHtmlBtn.addEventListener('click', () => {
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

    loadHotelHtmlBtn.addEventListener('click', () => hotelHtmlLoadInput.click()); 
    hotelHtmlLoadInput.addEventListener('change', (e) => { 
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const doc = new DOMParser().parseFromString(event.target.result, 'text/html');
                const dataScript = doc.getElementById('embeddedHotelData'); 
                if (dataScript && dataScript.textContent) {
                    const loadedData = JSON.parse(dataScript.textContent); 
                    if (Array.isArray(loadedData)) { 
                        allHotelData = loadedData.map(hotel => ({ 
                            nameKo: hotel.nameKo || "",
                            nameEn: hotel.nameEn || "",
                            mapLink: hotel.mapLink || "",
                            image: hotel.image || "",
                            description: hotel.description || ""
                        }));
                        switchTab(allHotelData.length > 0 ? 0 : -1); 
                        alert('호텔 목록을 성공적으로 불러왔습니다.');
                    } else { throw new Error('데이터 형식이 올바르지 않습니다.'); }
                } else { throw new Error('파일에서 호텔 데이터를 찾을 수 없습니다.'); }
            } catch (err) { alert(`파일 처리 오류: ${err.message}`); }
        };
        reader.readAsText(file); 
        e.target.value = ''; 
    });
    
    loadHotelExcelBtn.addEventListener('click', () => {
        if (currentHotelIndex === -1) { 
            alert('엑셀 데이터를 적용할 호텔을 먼저 선택하거나 추가해주세요.');
            return;
        }
        hotelExcelLoadInput.click(); 
    });
    hotelExcelLoadInput.addEventListener('change', (e) => { 
        const file = e.target.files[0];
        if (!file || currentHotelIndex === -1) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, {type: 'array'}); 
                const hotelInfoSheet = workbook.Sheets[workbook.SheetNames[0]]; 
                const hotelJson = XLSX.utils.sheet_to_json(hotelInfoSheet, {header:1}); 
                if (hotelJson.length > 1) { 
                    const hotelRow = hotelJson[1]; 
                    const hotel = allHotelData[currentHotelIndex]; 
                    hotel.nameKo = hotelRow[0] || hotel.nameKo;
                    hotel.nameEn = hotelRow[1] || hotel.nameEn;
                    hotel.mapLink = hotelRow[2] || hotel.mapLink; 
                    hotel.image = hotelRow[3] || hotel.image;   
                    hotel.description = hotelRow[4] || hotel.description; 
                    renderEditorForCurrentHotel(); 
                    renderTabs(); 
                    alert(`'${hotel.nameKo}' 호텔 정보에 엑셀 데이터를 적용했습니다.`);
                } else {
                    alert('엑셀 파일에 적용할 데이터가 충분하지 않습니다.');
                }
            } catch (err) { alert(`엑셀 파일 처리 오류: ${err.message}`); }
        };
        reader.readAsArrayBuffer(file); 
        e.target.value = ''; 
    });

    // 초기화 호출
    switchTab(currentHotelIndex); 
});
</script>
</body>
</html>
