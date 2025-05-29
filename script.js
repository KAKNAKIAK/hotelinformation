// 전역 상태 변수
let allHotelData = [];
let currentHotelIndex = -1;

// DOM 요소 참조 변수
let hotelTabsContainer, addHotelTabBtn, hotelEditorForm;
let hotelNameKoInput, hotelNameEnInput, hotelMapLinkInput, hotelImageInput, hotelDescriptionInput;
let previewHotelBtn, saveHotelHtmlBtn, loadHotelHtmlBtn, loadHotelExcelBtn, savePreviewImageBtn, savePreviewHtmlBtn;
let hotelHtmlLoadInput, hotelExcelLoadInput;

/**
 * 호텔 카드 1개에 대한 HTML 코드를 생성하는 헬퍼 함수
 * @param {object} hotel - 호텔 정보 객체
 * @returns {string} - 호텔 카드의 HTML 문자열
 */
function generateHotelCardHtml(hotel) {
    const placeholderImage = 'https://placehold.co/600x400/e2e8f0/cbd5e0?text=No+Image';
    const currentHotelImage = (typeof hotel.image === 'string' && hotel.image.startsWith('http')) ? hotel.image : placeholderImage;

    return `
        <div class="hotel-card" style="background-color: white; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); width: 100%; max-width: 384px; overflow: hidden; margin: auto; font-family: 'Inter', sans-serif;">
            <img src="${currentHotelImage}" alt="${hotel.nameKo || '호텔 이미지'}" style="width: 100%; height: 224px; object-fit: cover;" onerror="this.onerror=null; this.src='${placeholderImage}';">
            <div class="hotel-card-content" style="padding: 1.5rem;">
                <h1 style="font-size: 1.5rem; font-weight: 700; color: #1a202c; margin-bottom: 0.25rem;">${hotel.nameKo || '호텔명 없음'}</h1>
                ${hotel.nameEn ? `<h2 style="font-size: 1rem; color: #718096; margin-bottom: 1.25rem; font-weight: 500;">${hotel.nameEn}</h2>` : ''}
                <div style="font-size: 0.9rem; color: #4a5568; line-height: 1.6; white-space: pre-wrap;">${hotel.description || ''}</div>
                ${hotel.mapLink ? `<div style="margin-top: 1.5rem;"><a href="${hotel.mapLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #3b82f6; color: white; padding: 0.6rem 1.2rem; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; text-decoration: none; transition: background-color 0.2s;">지도 보기</a></div>` : ''}
            </div>
        </div>
    `;
}

/**
 * 미리보기(팝업 또는 HTML 파일)를 위한 전체 HTML 페이지 코드를 생성합니다.
 * 호텔 수에 따라 단일 카드 또는 슬라이드 형식으로 생성합니다.
 * @returns {string} - 전체 HTML 페이지의 문자열
 */
function generateFullPreviewHtml() {
    const hotelName = allHotelData.length > 0 ? allHotelData[0].nameKo : '호텔';

    // 슬라이더에 필요한 CSS와 JS 초기화 코드
    const sliderHead = `
        <link rel="stylesheet" href="https://unpkg.com/swiper/swiper-bundle.min.css" />
        <script src="https://unpkg.com/swiper/swiper-bundle.min.js"></script>
        <style>
            .swiper-button-next, .swiper-button-prev { color: #333; }
            .swiper-pagination-bullet-active { background: #333; }
        </style>
    `;
    const sliderBodyScript = `
        <script>
            const swiper = new Swiper('.swiper', {
                loop: true,
                pagination: { el: '.swiper-pagination', clickable: true },
                navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            });
        </script>
    `;

    let bodyContent;

    if (allHotelData.length > 1) {
        // 호텔이 2개 이상일 때: 슬라이더
        const slides = allHotelData.map(hotel => `<div class="swiper-slide">${generateHotelCardHtml(hotel)}</div>`).join('');
        bodyContent = `
            <div class="swiper" style="width: 100%; max-width: 420px;">
                <div class="swiper-wrapper">${slides}</div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
            </div>
            ${sliderBodyScript}
        `;
    } else if (allHotelData.length === 1) {
        // 호텔이 1개일 때: 단일 카드
        bodyContent = generateHotelCardHtml(allHotelData[0]);
    } else {
        // 호텔이 없을 때
        bodyContent = '<h1>표시할 호텔 정보가 없습니다.</h1>';
    }


    return `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>호텔 안내: ${hotelName}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
            ${allHotelData.length > 1 ? sliderHead : ''}
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #f0f2f5;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    padding: 2rem;
                    box-sizing: border-box;
                    margin: 0;
                }
            </style>
        </head>
        <body>
            ${bodyContent}
        </body>
        </html>
    `;
}

/**
 * 현재 선택된 호텔의 미리보기를 단독 HTML 파일로 저장합니다.
 */
function savePreviewAsHtml() {
    syncCurrentHotelData();
    if (allHotelData.length === 0) {
        alert('저장할 호텔 정보가 없습니다.');
        return;
    }

    const finalHtml = generateFullPreviewHtml();
    const blob = new Blob([finalHtml], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    const fileName = (allHotelData.length > 0 && allHotelData[0].nameKo) ? allHotelData[0].nameKo.replace(/ /g, '_') : '호텔모음';
    link.download = `${fileName}_안내.html`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
}

/**
 * 미리보기 카드를 이미지 파일(PNG)로 저장합니다. (활성화된 탭 하나만 저장)
 */
async function savePreviewAsImage() {
    syncCurrentHotelData();
    if (currentHotelIndex === -1 || !allHotelData[currentHotelIndex]) {
        alert('이미지로 저장할 호텔을 선택해주세요.');
        return;
    }
    const hotel = allHotelData[currentHotelIndex];
    const cardHtml = generateHotelCardHtml(hotel); // 단일 카드 HTML 생성

    const offscreenContainer = document.createElement('div');
    offscreenContainer.style.position = 'absolute';
    offscreenContainer.style.left = '-9999px';
    offscreenContainer.style.width = '384px';
    offscreenContainer.innerHTML = cardHtml;
    document.body.appendChild(offscreenContainer);

    const cardToRender = offscreenContainer.querySelector('.hotel-card');
    const imageToLoad = offscreenContainer.querySelector('img');

    await new Promise((resolve) => {
        imageToLoad.onload = resolve;
        imageToLoad.onerror = () => { imageToLoad.src = 'https://placehold.co/600x400/e2e8f0/cbd5e0?text=No+Image'; };
        if (imageToLoad.complete) resolve();
    });

    try {
        const canvas = await html2canvas(cardToRender, {
            useCORS: true,
            scale: 2,
            backgroundColor: null,
        });
        const link = document.createElement('a');
        const fileName = (hotel.nameKo || 'hotel-preview').replace(/ /g, '_');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error('이미지 생성 오류:', err);
        alert('이미지를 생성하지 못했습니다. 외부 이미지의 CORS 정책 문제일 수 있습니다.');
    } finally {
        document.body.removeChild(offscreenContainer);
    }
}

/**
 * 현재 선택된 호텔 정보를 새 창에서 미리보기로 보여줍니다.
 */
function previewHotelInfo() {
    syncCurrentHotelData();
    if (allHotelData.length === 0) {
        alert('미리보기할 호텔 정보가 없습니다.');
        return;
    }

    const previewHtml = generateFullPreviewHtml();
    const previewWindow = window.open('', '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
    if (previewWindow) {
        previewWindow.document.open();
        previewWindow.document.write(previewHtml);
        previewWindow.document.close();
        previewWindow.focus();
    } else {
        alert('팝업 차단 기능이 활성화되어 미리보기를 열 수 없습니다.');
    }
}


// 이하 기능은 변경되지 않았습니다.
// (renderTabs, renderEditorForCurrentHotel, switchTab, addHotel, deleteHotel, syncCurrentHotelData, DOMContentLoaded 등)

/**
 * 현재 호텔 데이터(allHotelData)를 기반으로 탭 UI를 다시 그립니다.
 */
function renderTabs() {
    if (!hotelTabsContainer || !addHotelTabBtn) return;

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

        const deleteIcon = tabButton.querySelector('.tab-delete-icon');
        if (deleteIcon) {
            deleteIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteHotel(index);
            });
        }
        tabButton.addEventListener('click', () => {
            switchTab(index);
        });
    });
}

/**
 * 현재 선택된 호텔(currentHotelIndex)의 정보를 입력 폼에 표시합니다.
 */
function renderEditorForCurrentHotel() {
    if (!hotelEditorForm || !hotelNameKoInput || !hotelNameEnInput || !hotelMapLinkInput || !hotelImageInput || !hotelDescriptionInput) return;

    if (currentHotelIndex === -1 || !allHotelData[currentHotelIndex]) {
        hotelEditorForm.classList.add('disabled');
        hotelNameKoInput.value = '';
        hotelNameEnInput.value = '';
        hotelMapLinkInput.value = '';
        hotelImageInput.value = '';
        hotelDescriptionInput.value = '';
        document.querySelectorAll('#hotelEditorForm input, #hotelEditorForm textarea').forEach(el => {
            if (el.value === '') el.placeholder = ' ';
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
        if (el.value !== '') el.placeholder = ' ';
    });
}

/**
 * 지정된 인덱스의 탭으로 전환합니다.
 */
function switchTab(index) {
    if (index < -1 || (index >= allHotelData.length && allHotelData.length > 0)) {
        return;
    }

    if (currentHotelIndex !== -1 && currentHotelIndex < allHotelData.length && currentHotelIndex !== index) {
        syncCurrentHotelData();
    }

    currentHotelIndex = index;
    renderTabs();
    renderEditorForCurrentHotel();
}

/**
 * 새 호텔 정보를 allHotelData 배열에 추가하고 해당 탭으로 전환합니다.
 */
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

/**
 * 지정된 인덱스의 호텔 정보를 삭제합니다.
 */
function deleteHotel(indexToDelete) {
    if (indexToDelete < 0 || indexToDelete >= allHotelData.length) {
        return;
    }

    const hotelName = allHotelData[indexToDelete].nameKo || '이 호텔';
    if (!confirm(`'${hotelName}' 정보를 삭제하시겠습니까?`)) {
        return;
    }

    allHotelData.splice(indexToDelete, 1);

    let newActiveIndex = currentHotelIndex;
    if (allHotelData.length === 0) {
        newActiveIndex = -1;
    } else if (currentHotelIndex === indexToDelete) {
        newActiveIndex = Math.min(indexToDelete, allHotelData.length - 1);
    } else if (currentHotelIndex > indexToDelete) {
        newActiveIndex = currentHotelIndex - 1;
    }

    if (newActiveIndex >= allHotelData.length) {
        newActiveIndex = allHotelData.length - 1;
    }

    switchTab(newActiveIndex);
}

/**
 * 현재 입력 폼의 내용을 allHotelData 배열의 현재 호텔 객체에 동기화(저장)합니다.
 */
function syncCurrentHotelData() {
    if (currentHotelIndex === -1 || !allHotelData[currentHotelIndex]) {
        return;
    }
    const hotel = allHotelData[currentHotelIndex];
    hotel.nameKo = hotelNameKoInput.value.trim();
    hotel.nameEn = hotelNameEnInput.value.trim();
    hotel.mapLink = hotelMapLinkInput.value.trim();
    hotel.image = hotelImageInput.value.trim();
    hotel.description = hotelDescriptionInput.value.trim();
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
    savePreviewImageBtn = document.getElementById('savePreviewImageBtn');
    savePreviewHtmlBtn = document.getElementById('savePreviewHtmlBtn');
    hotelHtmlLoadInput = document.getElementById('hotelHtmlLoadInput');
    hotelExcelLoadInput = document.getElementById('hotelExcelLoadInput');

    // 이벤트 리스너 연결
    if (addHotelTabBtn) addHotelTabBtn.addEventListener('click', addHotel);
    if (previewHotelBtn) previewHotelBtn.addEventListener('click', previewHotelInfo);
    if (savePreviewImageBtn) savePreviewImageBtn.addEventListener('click', savePreviewAsImage);
    if (savePreviewHtmlBtn) savePreviewHtmlBtn.addEventListener('click', savePreviewAsHtml);

    [hotelNameKoInput, hotelNameEnInput, hotelMapLinkInput, hotelImageInput, hotelDescriptionInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                syncCurrentHotelData();
                if (input.id === 'hotelNameKo' && currentHotelIndex !== -1) {
                    renderTabs();
                }
                if (input.value !== '') {
                    input.placeholder = ' ';
                }
            });
        }
    });

    if (saveHotelHtmlBtn) {
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

            let fileNamePrefix = '전체_호텔';
            if (allHotelData.length > 0 && allHotelData[0].nameKo) {
                fileNamePrefix = allHotelData[0].nameKo.replace(/ /g, '_');
            }
            a.download = `${fileNamePrefix}_데이터.html`;

            a.href = URL.createObjectURL(blob);
            a.click();
            URL.revokeObjectURL(a.href);
            alert('모든 호텔 정보가 데이터 파일로 저장되었습니다.');
        });
    }

    if (loadHotelHtmlBtn) loadHotelHtmlBtn.addEventListener('click', () => hotelHtmlLoadInput.click());

    if (hotelHtmlLoadInput) {
        hotelHtmlLoadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const doc = new DOMParser().parseFromString(event.target.result, 'text/html');
                    const dataScript = doc.getElementById('embeddedHotelData');
                    if (!dataScript || !dataScript.textContent) throw new Error('파일에서 호텔 데이터를 찾을 수 없습니다.');

                    const loadedData = JSON.parse(dataScript.textContent);
                    if (!Array.isArray(loadedData)) throw new Error('데이터 형식이 올바르지 않습니다 (배열이 아님).');

                    allHotelData = loadedData.map(hotel => ({
                        nameKo: hotel.nameKo || "",
                        nameEn: hotel.nameEn || "",
                        mapLink: hotel.mapLink || "",
                        image: hotel.image || "",
                        description: hotel.description || ""
                    }));
                    switchTab(allHotelData.length > 0 ? 0 : -1);
                    alert(`호텔 목록 ${allHotelData.length}개를 성공적으로 불러왔습니다.`);
                } catch (err) {
                    alert(`파일 처리 오류: ${err.message}`);
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });
    }

    if (loadHotelExcelBtn) {
        loadHotelExcelBtn.addEventListener('click', () => {
            if (currentHotelIndex === -1) {
                alert('엑셀 데이터를 적용할 호텔을 먼저 선택하거나 추가해주세요.');
                return;
            }
            hotelExcelLoadInput.click();
        });
    }

    if (hotelExcelLoadInput) {
        hotelExcelLoadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file || currentHotelIndex === -1) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    if (!sheetName) throw new Error("엑셀 파일에 시트가 없습니다.");

                    const hotelInfoSheet = workbook.Sheets[sheetName];
                    const hotelJson = XLSX.utils.sheet_to_json(hotelInfoSheet, { header: 1 });

                    if (hotelJson.length < 2 || !Array.isArray(hotelJson[1]) || hotelJson[1].every(cell => cell === null || cell === '')) {
                        throw new Error('엑셀 파일 두 번째 행에 유효한 데이터가 없습니다. A2, B2 등에 정보를 입력해주세요.');
                    }

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

                } catch (err) {
                    alert(`엑셀 파일 처리 오류: ${err.message}`);
                }
            };
            reader.readAsArrayBuffer(file);
            e.target.value = '';
        });
    }

    // 초기화 호출
    switchTab(currentHotelIndex);
});
