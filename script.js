// 전역 상태 변수
let allHotelData = [];
let currentHotelIndex = -1;

// DOM 요소 참조 변수
let hotelTabsContainer, addHotelTabBtn, hotelEditorForm;
let hotelNameKoInput, hotelNameEnInput, hotelWebsiteInput, hotelImageInput, hotelDescriptionInput;
let previewHotelBtn, saveHotelHtmlBtn, loadHotelHtmlBtn, savePreviewHtmlBtn, copyHtmlBtn, manualBtn;
let hotelHtmlLoadInput;


/**
 * 호텔 카드 1개에 대한 HTML 코드를 생성하는 헬퍼 함수
 * @param {object} hotel - 호텔 정보 객체
 * @param {object} options - 추가 옵션 (예: { forImage: true })
 * @returns {string} - 호텔 카드의 HTML 문자열
 */
function generateHotelCardHtml(hotel, options = {}) {
    const { forImage = false } = options; 

    const placeholderImage = 'https://placehold.co/400x300/e2e8f0/cbd5e0?text=No+Image';
    const currentHotelImage = (typeof hotel.image === 'string' && hotel.image.startsWith('http')) ? hotel.image : placeholderImage;

    const descriptionItems = hotel.description ? hotel.description.split('\n').filter(line => line.trim() !== '') : [];
    const descriptionHtml = descriptionItems.map(item => {
        return `
            <div style="margin-bottom: 6px; line-height: 1.6;">
                <span style="font-size: 14px; color: #34495e; vertical-align: middle;">${item.replace(/● /g, '')}</span>
            </div>
        `;
    }).join('');

    let websiteButtonHtml = '';
    if (hotel.website && !forImage) {
        websiteButtonHtml = `
            <div style="margin-top: 20px;">
                <a href="${hotel.website}" target="_blank" style="background-color: #3498db; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px;">
                    웹사이트 바로가기
                </a>
            </div>
        `;
    }

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
                      <div style="font-size: 18px; font-weight: bold; color: #2c3e50; margin: 0;">${hotel.nameKo || '호텔명 없음'}</div>
                      ${hotel.nameEn ? `<div style="font-size: 13px; color: #7f8c8d; margin-top: 4px;">${hotel.nameEn}</div>` : ''}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style="vertical-align: middle;">
              <div>
                ${descriptionHtml}
                ${websiteButtonHtml}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    `;
}


/**
 * 미리보기(팝업 또는 HTML 파일)를 위한 전체 HTML 페이지 코드를 생성합니다.
 * @param {Array} data - HTML로 만들 호텔 데이터 배열
 * @returns {string} - 전체 HTML 페이지의 문자열
 */
function generateFullPreviewHtml(data) {
    const hotelName = data.length > 0 ? data[0].nameKo : '호텔';

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

    if (data.length > 1) {
        const slides = data.map(hotel => `<div class="swiper-slide">${generateHotelCardHtml(hotel)}</div>`).join('');
        bodyContent = `
            <div class="swiper" style="max-width: 800px; margin: auto;">
                <div class="swiper-wrapper">${slides}</div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
            </div>
            ${sliderBodyScript}
        `;
    } else if (data.length === 1) {
        bodyContent = generateHotelCardHtml(data[0]);
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
            ${data.length > 1 ? sliderHead : ''}
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
 * 현재 선택된 호텔의 HTML 코드를 클립보드에 복사합니다.
 */
function copyOptimizedHtml() {
    if (currentHotelIndex === -1) {
        alert('먼저 복사할 호텔 탭을 선택해주세요.');
        return;
    }
    const hotel = allHotelData[currentHotelIndex];
    // 웹사이트 버튼을 포함한 순수 HTML 코드 생성
    const htmlToCopy = generateHotelCardHtml(hotel, { forImage: false });

    // 최신 Clipboard API를 사용하여 텍스트 복사
    navigator.clipboard.writeText(htmlToCopy).then(() => {
        alert('호텔 카드 HTML 코드가 클립보드에 복사되었습니다.');
    }).catch(err => {
        console.error('클립보드 복사 실패:', err);
        alert('오류가 발생하여 복사하지 못했습니다. 브라우저 개발자 콘솔을 확인해주세요.');
    });
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

    const previewHtml = generateFullPreviewHtml(allHotelData);
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
    if (!hotelEditorForm || !hotelNameKoInput || !hotelNameEnInput || !hotelWebsiteInput || !hotelImageInput || !hotelDescriptionInput) return;
    if (currentHotelIndex === -1 || !allHotelData[currentHotelIndex]) {
        hotelEditorForm.classList.add('disabled');
        hotelNameKoInput.value = '';
        hotelNameEnInput.value = '';
        hotelWebsiteInput.value = '';
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
    hotelWebsiteInput.value = hotel.website || '';
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
    const newHotel = { nameKo: `새 호텔 ${allHotelData.length + 1}`, nameEn: "", website: "", image: "", description: "" };
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
    hotel.website = hotelWebsiteInput.value.trim();
    hotel.image = hotelImageInput.value.trim();
    hotel.description = hotelDescriptionInput.value.trim();
}

document.addEventListener('DOMContentLoaded', function () {
    hotelTabsContainer = document.getElementById('hotelTabsContainer');
    addHotelTabBtn = document.getElementById('addHotelTabBtn');
    hotelEditorForm = document.getElementById('hotelEditorForm');
    hotelNameKoInput = document.getElementById('hotelNameKo');
    hotelNameEnInput = document.getElementById('hotelNameEn');
    hotelWebsiteInput = document.getElementById('hotelWebsite');
    hotelImageInput = document.getElementById('hotelImage');
    hotelDescriptionInput = document.getElementById('hotelDescription');
    previewHotelBtn = document.getElementById('previewHotelBtn');
    saveHotelHtmlBtn = document.getElementById('saveHotelHtmlBtn');
    loadHotelHtmlBtn = document.getElementById('loadHotelHtmlBtn');
    savePreviewHtmlBtn = document.getElementById('savePreviewHtmlBtn');
    copyHtmlBtn = document.getElementById('copyHtmlBtn');
    manualBtn = document.getElementById('manualBtn'); // 메뉴얼 버튼 참조 추가
    hotelHtmlLoadInput = document.getElementById('hotelHtmlLoadInput');

    if (addHotelTabBtn) addHotelTabBtn.addEventListener('click', addHotel);
    if (previewHotelBtn) previewHotelBtn.addEventListener('click', previewHotelInfo);
    if (copyHtmlBtn) copyHtmlBtn.addEventListener('click', copyOptimizedHtml);

    // 메뉴얼 버튼 이벤트 리스너 추가
    if (manualBtn) {
        manualBtn.addEventListener('click', () => {
            window.open('https://kaknakiak.github.io/hotelinformation/manual/', '_blank');
        });
    }
    
    if (savePreviewHtmlBtn) {
        savePreviewHtmlBtn.addEventListener('click', () => {
            syncCurrentHotelData();
            if (allHotelData.length === 0) {
                alert('저장할 호텔 정보가 없습니다.');
                return;
            }
            if (!confirm(`총 ${allHotelData.length}개의 호텔 안내 HTML 파일을 각각 저장하시겠습니까?`)) {
                return;
            }
            allHotelData.forEach((hotel, index) => {
                const finalHtml = generateFullPreviewHtml([hotel]);
                const blob = new Blob([finalHtml], { type: 'text/html;charset=utf-8' });
                const link = document.createElement('a');
                const safeFileName = (hotel.nameKo || `호텔_${index + 1}`).replace(/[\s\/\\?%*:|"<>]/g, '_');
                link.download = `${safeFileName}_안내.html`;
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
            });
            alert(`${allHotelData.length}개의 호텔 안내 파일 저장이 시작되었습니다.`);
        });
    }

    [hotelNameKoInput, hotelNameEnInput, hotelWebsiteInput, hotelImageInput, hotelDescriptionInput].forEach(input => {
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
            allHotelData.forEach((hotel, index) => {
                const singleHotelDataArray = [hotel];
                const dataStr = JSON.stringify(singleHotelDataArray);
                const htmlContent = `<!DOCTYPE html><html><head><title>저장된 호텔 데이터</title></head><body><script type="application/json" id="embeddedHotelData">${dataStr.replace(/<\/script>/g, '<\\/script>')}<\/script><p>이 파일은 호텔 정보 복원용입니다. 편집기에서 '데이터 불러오기'로 열어주세요.</p></body></html>`;
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const a = document.createElement('a');
                const safeFileName = (hotel.nameKo || `호텔_데이터_${index + 1}`).replace(/[\s\/\\?%*:|"<>]/g, '_');
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
                    const newHotels = loadedData.map(hotel => ({ nameKo: hotel.nameKo || "", nameEn: hotel.nameEn || "", website: hotel.website || "", image: hotel.image || "", description: hotel.description || "" }));
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

    switchTab(currentHotelIndex);
});
