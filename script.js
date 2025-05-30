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
    const isImageOnly = hotel.image && !hotel.nameKo && !hotel.nameEn && !hotel.description && !hotel.website;

    if (isImageOnly) {
        const placeholderImage = 'https://placehold.co/640x480/e2e8f0/cbd5e0?text=Invalid+Image+URL';
        const currentHotelImage = (typeof hotel.image === 'string' && hotel.image.startsWith('http')) ? hotel.image : placeholderImage;
        return `
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 750px; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;">
            <tbody>
              <tr>
                <td style="text-align: center; padding: 24px;">
                  <img src="${currentHotelImage}" alt="제공된 이미지" style="width: 640px; max-width: 100%; height: auto; display: block; margin: 0 auto;" onerror="this.onerror=null; this.src='${placeholderImage}';">
                </td>
              </tr>
            </tbody>
          </table>
        `;
    }

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

function copyOptimizedHtml() {
    if (currentHotelIndex === -1) {
        alert('먼저 복사할 호텔 탭을 선택해주세요.');
        return;
    }
    const hotel = allHotelData[currentHotelIndex];
    const htmlToCopy = generateHotelCardHtml(hotel, { forImage: false });
    navigator.clipboard.writeText(htmlToCopy).then(() => {
        alert('호텔 카드 HTML 코드가 클립보드에 복사되었습니다.');
    }).catch(err => {
        console.error('클립보드 복사 실패:', err);
        alert('오류가 발생하여 복사하지 못했습니다. 브라우저 개발자 콘솔을 확인해주세요.');
    });
}

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
    if (index < -1 || (index >= allHotelData.length && allHotelData.length > 0)) {
      // 만약 index가 범위를 벗어나고 데이터가 있다면, 유효한 마지막 index로 조정
      if (allHotelData.length > 0) {
        index = allHotelData.length -1;
      } else {
        index = -1; // 데이터가 없으면 -1로
      }
    }

    // 현재 탭의 데이터를 저장 (currentHotelIndex가 유효하고, 다른 탭으로 이동하는 경우)
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

    // 삭제 전에 현재 탭의 데이터를 동기화 (만약 삭제하려는 탭이 현재 탭이라면)
    if (currentHotelIndex === indexToDelete) {
        syncCurrentHotelData(); // 삭제될 탭의 마지막 상태 저장 시도 (필수는 아님)
    }
    
    allHotelData.splice(indexToDelete, 1);
    
    let newActiveIndex = -1; // 기본값: 호텔이 없으면 비활성화

    if (allHotelData.length > 0) { // 남은 호텔이 있다면
        if (currentHotelIndex === indexToDelete) { // 현재 활성화된 탭이 삭제된 경우
            newActiveIndex = Math.max(0, indexToDelete - 1); // 이전 탭을 선택하거나, 첫번째 탭 선택
        } else if (currentHotelIndex > indexToDelete) { // 삭제된 탭보다 뒤에 있는 탭이 활성화된 경우
            newActiveIndex = currentHotelIndex - 1; // 인덱스 하나 감소
        } else { // 삭제된 탭보다 앞에 있는 탭이 활성화된 경우
            newActiveIndex = currentHotelIndex; // 인덱스 변경 없음
        }
        // newActiveIndex가 배열 범위를 벗어나지 않도록 조정
        newActiveIndex = Math.min(newActiveIndex, allHotelData.length - 1);
    }
    
    switchTab(newActiveIndex);
}

// syncCurrentHotelData 함수 수정: 조건문 간결화
function syncCurrentHotelData() {
    // currentHotelIndex가 유효하지 않거나, 해당 호텔 데이터가 없으면 동기화하지 않음
    if (currentHotelIndex === -1 || !allHotelData[currentHotelIndex]) {
        return;
    }
    // 입력 필드가 모두 존재하는지 확인 (초기화 중 오류 방지)
    if (!hotelNameKoInput || !hotelNameEnInput || !hotelWebsiteInput || !hotelImageInput || !hotelDescriptionInput) {
        return;
    }

    const hotel = allHotelData[currentHotelIndex];
    hotel.nameKo = hotelNameKoInput.value.trim();
    hotel.nameEn = hotelNameEnInput.value.trim();
    hotel.website = hotelWebsiteInput.value.trim();
    hotel.image = hotelImageInput.value.trim();
    hotel.description = hotelDescriptionInput.value.trim();
}


// ===================================================================================
// START: 엑셀 데이터 붙여넣기 기능 수정 (옵션 1 적용)
// ===================================================================================
/**
 * TSV (Tab Separated Values) 형식의 텍스트 데이터를 파싱하여 호텔 정보를 가져옵니다.
 * 옵션 1 적용: 현재 선택된 호텔 덮어쓰기 후, 나머지는 뒤에 새 탭으로 추가.
 * @param {string} tsvData - 탭으로 구분된 호텔 정보 텍스트.
 * @returns {object} - { importedCount: number, errors: string[], affectedIndex: number }
 */
function importHotelsFromTSV(tsvData) {
    const lines = tsvData.trim().split('\n').filter(line => line.trim() !== ""); // 비어있지 않은 줄만 처리
    if (lines.length === 0) {
        return { importedCount: 0, errors: [], affectedIndex: currentHotelIndex };
    }

    let importedCount = 0;
    const errors = []; // 오류 메시지 배열 (현재는 사용되지 않으나 확장성 위해 유지)
    let affectedIndex = currentHotelIndex; // 작업 후 활성화할 탭 인덱스

    if (currentHotelIndex !== -1 && allHotelData[currentHotelIndex] && lines.length > 0) {
        // 현재 선택된 호텔(탭)이 있고, 붙여넣을 데이터가 있는 경우:
        // 옵션 1: 첫 번째 줄 데이터로 현재 호텔 정보 덮어쓰기
        const firstLineColumns = lines[0].split('\t');
        const hotelToUpdate = allHotelData[currentHotelIndex];
        
        hotelToUpdate.nameKo = firstLineColumns[0] || "";
        hotelToUpdate.nameEn = firstLineColumns[1] || "";
        hotelToUpdate.website = firstLineColumns[2] || "";
        hotelToUpdate.image = firstLineColumns[3] || "";
        hotelToUpdate.description = firstLineColumns[4] || "";
        importedCount++;
        affectedIndex = currentHotelIndex; // 덮어쓴 탭을 활성 탭으로 유지

        // 나머지 줄 데이터가 있다면, 현재 호텔 다음에 새 호텔로 삽입
        if (lines.length > 1) {
            const remainingLines = lines.slice(1);
            const newHotelsToInsert = [];
            remainingLines.forEach((line) => {
                const columns = line.split('\t');
                newHotelsToInsert.push({
                    nameKo: columns[0] || "",
                    nameEn: columns[1] || "",
                    website: columns[2] || "",
                    image: columns[3] || "",
                    description: columns[4] || ""
                });
            });
            // splice를 사용하여 현재 호텔 바로 다음에 삽입
            allHotelData.splice(currentHotelIndex + 1, 0, ...newHotelsToInsert);
            importedCount += newHotelsToInsert.length;
        }
    } else {
        // 현재 선택된 호텔이 없거나 (currentHotelIndex === -1), 붙여넣을 데이터만 있는 경우:
        // 모든 줄을 새 호텔로 맨 뒤에 추가
        affectedIndex = allHotelData.length; // 새로 추가될 첫번째 호텔의 인덱스
        lines.forEach((line) => {
            const columns = line.split('\t');
            allHotelData.push({
                nameKo: columns[0] || "",
                nameEn: columns[1] || "",
                website: columns[2] || "",
                image: columns[3] || "",
                description: columns[4] || ""
            });
            importedCount++;
        });
        if (importedCount === 0) affectedIndex = -1; // 아무것도 추가 안됐으면 -1
    }

    return { importedCount, errors, affectedIndex };
}
// ===================================================================================
// END: 엑셀 데이터 붙여넣기 기능 수정
// ===================================================================================


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
    manualBtn = document.getElementById('manualBtn');
    hotelHtmlLoadInput = document.getElementById('hotelHtmlLoadInput');

    if (addHotelTabBtn) addHotelTabBtn.addEventListener('click', addHotel);
    if (previewHotelBtn) previewHotelBtn.addEventListener('click', previewHotelInfo);
    if (copyHtmlBtn) copyHtmlBtn.addEventListener('click', copyOptimizedHtml);

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
                    const loadedDataArray = JSON.parse(dataScript.textContent);
                    if (!Array.isArray(loadedDataArray)) throw new Error('데이터 형식이 올바지 않습니다 (배열이 아님).');
                    const newHotels = loadedDataArray.map(hotel => ({
                        nameKo: hotel.nameKo || "",
                        nameEn: hotel.nameEn || "",
                        website: hotel.website || "",
                        image: hotel.image || "",
                        description: hotel.description || ""
                    }));
                    allHotelData.push(...newHotels);
                    switchTab(allHotelData.length - 1);
                    alert(`호텔 ${newHotels.length}개를 성공적으로 불러왔습니다.`);
                } catch (err) {
                    alert(`파일 처리 오류: ${err.message}`);
                    console.error("File loading error:", err);
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });
    }

    // ===================================================================================
    // START: 엑셀 데이터 붙여넣기 이벤트 리스너 수정 (옵션 1 적용)
    // ===================================================================================
    if (hotelEditorForm) {
        hotelEditorForm.addEventListener('paste', function(event) {
            const pastedText = (event.clipboardData || window.clipboardData).getData('text/plain');
            const isTSVLike = pastedText.includes('\t') && pastedText.includes('\n');

            if (isTSVLike) {
                if (confirm('엑셀/표 형식의 데이터를 붙여넣어 호텔 정보를 처리하시겠습니까?\n(선택된 호텔이 있으면 첫 줄로 덮어쓰고 나머지는 뒤에 추가, 없으면 모두 새 호텔로 추가됩니다.)')) {
                    event.preventDefault(); 

                    // 붙여넣기 전, 현재 활성화된 탭의 입력 내용을 먼저 동기화
                    syncCurrentHotelData();

                    const result = importHotelsFromTSV(pastedText);

                    if (result.importedCount > 0) {
                        alert(`${result.importedCount}개의 호텔 정보가 처리되었습니다.`);
                        renderTabs();
                        if (result.affectedIndex !== -1 && result.affectedIndex < allHotelData.length) {
                            switchTab(result.affectedIndex);
                        } else if (allHotelData.length > 0) {
                            switchTab(0); // 만약 affectedIndex가 유효하지 않으면 첫번째 탭으로
                        } else {
                            switchTab(-1); // 데이터가 전혀 없으면 비활성화
                        }
                    } else {
                        alert('붙여넣은 데이터에서 유효한 호텔 정보를 찾을 수 없거나, 형식이 맞지 않습니다.');
                    }

                    if (result.errors.length > 0) { // errors 배열은 현재는 비어있지만, 추후 활용 가능
                        console.warn("Import errors:\n" + result.errors.join("\n"));
                        alert(`가져오기 중 ${result.errors.length}개의 항목에서 오류가 발생했습니다. 자세한 내용은 개발자 콘솔을 확인하세요.`);
                    }
                }
            }
        });
    }
    // ===================================================================================
    // END: 엑셀 데이터 붙여넣기 이벤트 리스너 수정
    // ===================================================================================

    // ===================================================================================
    // START: 초기 로드 시 호텔 데이터 없으면 기본 호텔 추가 (첫 번째 요청)
    // ===================================================================================
    if (allHotelData.length === 0) {
        addHotel(); // 기본 호텔 1개 추가 및 활성화
    } else {
        // 데이터가 이미 있다면, 첫 번째 탭을 기본으로 활성화 (또는 마지막 작업 상태 복원 로직이 있다면 그에 따름)
        // 현재는 currentHotelIndex가 -1이므로, 첫 번째 탭을 활성화하도록 명시적 호출
        if(currentHotelIndex === -1 && allHotelData.length > 0) {
            switchTab(0);
        } else {
            switchTab(currentHotelIndex); // 기존 로직 유지 (예: 페이지 새로고침 시 마지막 상태 복원)
        }
    }
    // ===================================================================================
    // END: 초기 로드 시 호텔 데이터 없으면 기본 호텔 추가
    // ===================================================================================
});
