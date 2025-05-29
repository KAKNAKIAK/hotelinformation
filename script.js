// 전역 상태 변수
let allHotelData = [];
let currentHotelIndex = -1;

// DOM 요소 참조 변수
let hotelTabsContainer, addHotelTabBtn, hotelEditorForm;
let hotelNameKoInput, hotelNameEnInput, hotelMapLinkInput, hotelImageInput, hotelDescriptionInput;
let previewHotelBtn, saveHotelHtmlBtn, loadHotelHtmlBtn, loadHotelExcelBtn, savePreviewImageBtn, savePreviewHtmlBtn;
let hotelHtmlLoadInput, hotelExcelLoadInput;


/**
 * ==================================================================
 * ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ 테이블 레이아웃으로 변경 ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
 * ==================================================================
 * 호텔 카드 1개에 대한 HTML 코드를 생성하는 헬퍼 함수
 * @param {object} hotel - 호텔 정보 객체
 * @returns {string} - 호텔 카드의 HTML 문자열
 */
function generateHotelCardHtml(hotel) {
    const placeholderImage = 'https://placehold.co/400x300/e2e8f0/cbd5e0?text=No+Image';
    const currentHotelImage = (typeof hotel.image === 'string' && hotel.image.startsWith('http')) ? hotel.image : placeholderImage;

    // 상세 설명 텍스트를 줄바꿈 기준으로 나누어 리스트 HTML로 변환
    const descriptionItems = hotel.description ? hotel.description.split('\n').filter(line => line.trim() !== '') : [];
    const descriptionHtml = descriptionItems.map(item => {
        return `
            <div style="margin-bottom: 8px; line-height: 1.6;">
                <span style="color: #3498db; margin-right: 8px; font-size: 10px; vertical-align: middle;">●</span>
                <span style="font-size: 15px; color: #34495e; vertical-align: middle;">${item.replace(/● /g, '')}</span>
            </div>
        `;
    }).join('');

    // 어떤 에디터에서도 깨지지 않는 테이블 레이아웃 사용
    return `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 750px; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; border-collapse: separate; border-spacing: 24px;">
        <tbody>
          <tr>
            <td width="320" style="width: 320px; vertical-align: top;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden;">
                <tbody>
                  <tr>
                    <td>
                      <img src="${currentHotelImage}" alt="${hotel.nameKo || '호텔 이미지'}" width="320" style="width: 100%; height: auto; display: block; border: 0;" onerror="this.onerror=null; this.src='${placeholderImage}';">
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 16px 20px;">
                      <div style="font-size: 20px; font-weight: bold; color: #2c3e50; margin: 0;">${hotel.nameKo || '호텔명 없음'}</div>
                      ${hotel.nameEn ? `<div style="font-size: 14px; color: #7f8c8d; margin-top: 4px;">${hotel.nameEn}</div>` : ''}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style="vertical-align: middle;">
              <div>
                ${descriptionHtml}
                ${hotel.mapLink ? `
                  <div style="margin-top: 24px;">
                    <a href="${hotel.mapLink}" target="_blank" style="background-color: #3498db; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 16px;">
                      지도 보기
                    </a>
                  </div>` : ''}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    `;
}


/**
 * 미리보기(팝업 또는 HTML 파일)를 위한 전체 HTML 페이지 코드를 생성합니다.
 * @returns {string} - 전체 HTML 페이지의 문자열
 */
function generateFullPreviewHtml() {
    const hotelName = allHotelData.length > 0 ? allHotelData[0].nameKo : '호텔';

    const sliderHead = `
        <link rel="stylesheet" href="https://unpkg.com/swiper/swiper-bundle.min.css" />
        <script src="https://unpkg.com/swiper/swiper-bundle.min.js"></script>
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
        const slides = allHotelData.map(hotel => `<div class="swiper-slide">${generateHotelCardHtml(hotel)}</div>`).join('');
        bodyContent = `
            <div class="swiper" style="max-width: 800px; margin: auto;">
                <div class="swiper-wrapper">${slides}</div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
            </div>
            ${sliderBodyScript}
        `;
    } else if (allHotelData.length === 1) {
        bodyContent = generateHotelCardHtml(allHotelData[0]);
    } else {
        bodyContent = '<h1 style="text-align: center;">표시할 호텔 정보가 없습니다.</h1>';
    }


    return `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>호텔 안내: ${hotelName}</title>
            ${allHotelData.length > 1 ? sliderHead : ''}
            <style>
                body {
                    font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
                    background-color: #f0f2f5;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    padding: 2rem;
                    box-sizing: border-box;
                    margin: 0;
                }
                .swiper-slide {
                    display: flex;
                    justify-content: center;
                    align-items: center;
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
 * 현재 호텔의 미리보기 화면을 단독 HTML 파일로 저장합니다.
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
    
    const fileName = (allHotelData.length > 0 && allHotelData[0].nameKo) ? allHotelData[0].nameKo.replace(/[\s\/\\?%*:|"<>]/g, '_') : '호텔모음';
    link.download = `${fileName}_안내.html`;
    
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
}


/**
 * 미리보기 카드를 이미지 파일(PNG)로 저장합니다.
 */
async function savePreviewAsImage() {
    syncCurrentHotelData();
    if (currentHotelIndex === -1 || !allHotelData[currentHotelIndex]) {
        alert('이미지로 저장할 호텔을 선택해주세요.');
        return;
    }
    const hotel = allHotelData[currentHotelIndex];
    
    // 테이블 레이아웃은 외부 스타일 없이 자체적으로 렌더링되므로, 별도 스타일 주입 불필요
    const offscreenContainer = document.createElement('div');
    offscreenContainer.style.position = 'absolute';
    offscreenContainer.style.left = '-9999px';
    offscreenContainer.style.padding = '2rem'; // 배경색이 보이도록 패딩 추가
    offscreenContainer.style.backgroundColor = '#f0f2f5'; // 배경색 지정
    offscreenContainer.innerHTML = generateHotelCardHtml(hotel);
    
    document.body.appendChild(offscreenContainer);

    const cardToRender = offscreenContainer.querySelector('table');
    const imageToLoad = offscreenContainer.querySelector('img');

    await new Promise((resolve) => {
        if (imageToLoad.complete) { resolve(); return; }
        imageToLoad.onload = resolve;
        imageToLoad.onerror = () => { imageToLoad.src = 'https://placehold.co/400x300/e2e8f0/cbd5e0?text=No+Image'; resolve(); };
    });

    try {
        const canvas = await html2canvas(cardToRender, {
            useCORS: true,
            scale: 2,
            backgroundColor: '#f0f2f5',
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
    const previewWindow = window.open('', '_blank', 'width=900,height=600,scrollbars=yes,resizable=yes');
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
        tabButton.innerHTML = `<span class="tab-title">${hotel.nameKo || `새 호텔 ${index + 1}`}</span><i class="fas fa-times tab-delete-icon" title="이 호텔 정보 삭제"></i>`;
        hotelTabsContainer.insertBefore(tabButton, addHotelTabBtn);
        const deleteIcon = tabButton.querySelector('.tab-delete-icon');
        if (deleteIcon) {
            deleteIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteHotel(index);
            });
        }
        tabButton.addEventListener('click', () => switchTab(index));
    });
}

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

function switchTab(index) {
    if (index < -1 || (index >= allHotelData.length && allHotelData.length > 0)) return;
    if (currentHotelIndex !== -1 && currentHotelIndex < allHotelData.length && currentHotelIndex !== index) {
        syncCurrentHotelData();
    }
    currentHotelIndex = index;
    renderTabs();
    renderEditorForCurrentHotel();
}

function addHotel() {
    const newHotel = { nameKo: `새 호텔 ${allHotelData.length + 1}`, nameEn: "", mapLink: "", image: "", description: "" };
    allHotelData.push(newHotel);
    switchTab(allHotelData.length - 1);
}

function deleteHotel(indexToDelete) {
    if (indexToDelete < 0 || indexToDelete >= allHotelData.length) return;
    const hotelName = allHotelData[indexToDelete].nameKo || '이 호텔';
    if (!confirm(`'${hotelName}' 정보를 삭제하시겠습니까?`)) return;
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

function syncCurrentHotelData() {
    if (currentHotelIndex === -1 || !allHotelData[currentHotelIndex]) return;
    const hotel = allHotelData[currentHotelIndex];
    hotel.nameKo = hotelNameKoInput.value.trim();
    hotel.nameEn = hotelNameEnInput.value.trim();
    hotel.mapLink = hotelMapLinkInput.value.trim();
    hotel.image = hotelImageInput.value.trim();
    hotel.description = hotelDescriptionInput.value.trim();
}

document.addEventListener('DOMContentLoaded', function () {
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
            if (allHotelData.length === 0) { alert('저장할 호텔 정보가 없습니다.'); return; }
            if (!confirm(`총 ${allHotelData.length}개의 호텔 정보를 각각 개별 파일로 저장하시겠습니까?`)) return;
            allHotelData.forEach(hotel => {
                const singleHotelDataArray = [hotel];
                const dataStr = JSON.stringify(singleHotelDataArray);
                const htmlContent = `<!DOCTYPE html><html><head><title>저장된 호텔 데이터</title></head><body><script type="application/json" id="embeddedHotelData">${dataStr.replace(/<\/script>/g, '<\\/script>')}<\/script><p>이 파일은 호텔 정보 복원용입니다. 편집기에서 '데이터 불러오기'로 열어주세요.</p></body></html>`;
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const a = document.createElement('a');
                const safeFileName = (hotel.nameKo || `호텔_데이터_${allHotelData.indexOf(hotel) + 1}`).replace(/[\s\/\\?%*:|"<>]/g, '_');
                a.download = `${safeFileName}_데이터.html`;
                a.href = URL.createObjectURL(blob);
                a.click();
                URL.revokeObjectURL(a.href);
            });
            alert(`${allHotelData.length}개의 호텔 정보 파일 저장이 시작되었습니다.`);
        });
    }

    if (loadHotelHtmlBtn) {
        loadHotelHtmlBtn.addEventListener('click', () => hotelHtmlLoadInput.click());
    }
    
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
                    const newHotels = loadedData.map(hotel => ({ nameKo: hotel.nameKo || "", nameEn: hotel.nameEn || "", mapLink: hotel.mapLink || "", image: hotel.image || "", description: hotel.description || "" }));
                    allHotelData.push(...newHotels);
                    switchTab(allHotelData.length - 1);
                    alert(`호텔 ${newHotels.length}개를 성공적으로 불러왔습니다.`);
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
            if (currentHotelIndex === -1) { alert('엑셀 데이터를 적용할 호텔을 먼저 선택하거나 추가해주세요.'); return; }
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

    switchTab(currentHotelIndex);
});
