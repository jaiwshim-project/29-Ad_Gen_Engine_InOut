// ============================================
// AI 환자 메시지 생성기 - 로컬 버전
// ============================================

// 전역 변수
let clinicInfo = JSON.parse(localStorage.getItem('patient_msg_clinic_info') || '{}');
let savedPatients = JSON.parse(localStorage.getItem('patient_msg_saved_patients') || '[]');
let messageHistory = JSON.parse(localStorage.getItem('patient_msg_history') || '[]');
let dentalCases = JSON.parse(localStorage.getItem('dentalCases') || '[]');
let selectedClinicIndex = -1; // dentalCases 배열 인덱스 (-1 = 직접 입력 모드)
let clinicFilterMode = 'all'; // 'all' | 'number' | 'name' | 'director'

let currentInputMode = 'individual'; // 'individual' | 'csv'
let currentMessageType = '';
let currentChannel = '';
let selectedTreatments = [];
let csvPatients = [];
let currentGeneratedMessage = '';
let currentGeneratedKakaoButtons = [];
let currentTemplateIndex = 0;
let isGenerating = false;

// ============================================
// 메시지 템플릿
// ============================================
const MESSAGE_TEMPLATES = {
  postTreatmentCare: {
    label: '치료 후 케어',
    icon: '\u{1F3E5}',
    sms: [
      { text: '{{name}}님, {{clinicName}}입니다. {{treatment}} 치료 후 불편하신 점은 없으신가요? 궁금하신 점은 언제든 연락주세요. {{clinicPhone}}' },
      { text: '{{name}}님 안녕하세요. {{treatment}} 후 관리가 중요합니다. 통증이나 부기가 있으시면 {{clinicName}}으로 연락주세요.' },
      { text: '{{name}}님, {{visitDate}} {{treatment}} 치료 잘 마치셨습니다. 3일간 자극적인 음식은 피해주세요. -{{clinicName}}' }
    ],
    kakao: [
      {
        text: '안녕하세요 {{name}}님!\n{{clinicName}}입니다.\n\n{{visitDate}}에 받으신 {{treatment}} 치료 이후 경과는 어떠신가요?\n\n[치료 후 관리 안내]\n- 치료 부위는 2~3일간 자극적인 음식을 피해주세요\n- 처방받으신 약은 정해진 시간에 꼭 복용해주세요\n- 양치할 때 치료 부위는 부드럽게 닦아주세요\n\n불편하시거나 궁금하신 점이 있으시면 언제든 연락 주세요!\n{{clinicName}} {{clinicPhone}}',
        buttons: [{ label: '전화 문의', type: 'call' }, { label: '예약 변경', type: 'link' }]
      },
      {
        text: '{{name}}님, {{clinicName}}에서 인사드립니다.\n\n{{treatment}} 치료 후 회복은 잘 되고 계신가요?\n\n혹시 다음과 같은 증상이 있으시다면 내원을 권장드립니다:\n- 심한 통증이 지속될 때\n- 출혈이 멈추지 않을 때\n- 부기가 계속 심해질 때\n\n대부분의 경우 2~3일 이내에 호전됩니다.\n편안한 회복 되시길 바랍니다!\n\n{{clinicName}} {{clinicPhone}}',
        buttons: [{ label: '전화 문의', type: 'call' }]
      }
    ]
  },

  regularCheckup: {
    label: '정기검진 리마인드',
    icon: '\u{1F4CB}',
    sms: [
      { text: '{{name}}님, {{clinicName}}입니다. 마지막 방문({{visitDate}}) 이후 검진 시기가 되었습니다. 예약 문의: {{clinicPhone}}' },
      { text: '{{name}}님 안녕하세요! 정기검진 시기입니다. 건강한 치아를 위해 6개월마다 검진을 권장드려요. -{{clinicName}}' },
      { text: '{{name}}님, {{nextVisitDate}} 검진 예약을 안내드립니다. {{clinicName}}에서 도와드릴게요. {{clinicPhone}}' }
    ],
    kakao: [
      {
        text: '{{name}}님 안녕하세요!\n{{clinicName}}에서 안내드립니다.\n\n마지막 방문일: {{visitDate}}\n권장 검진일: {{nextVisitDate}}\n\n건강한 치아를 유지하려면 정기적인 검진이 중요합니다!\n조기에 발견하면 치료도 간단하고 비용도 절약됩니다.\n\n전화 한 통이면 간편하게 예약 가능합니다.\n{{clinicName}} {{clinicPhone}}',
        buttons: [{ label: '검진 예약하기', type: 'link' }, { label: '전화 문의', type: 'call' }]
      },
      {
        text: '{{name}}님, {{clinicName}}입니다.\n\n마지막 {{treatment}} 치료 이후 6개월이 다가오고 있습니다.\n\n정기 검진을 통해:\n- 충치 조기 발견\n- 잇몸 건강 체크\n- 스케일링으로 치석 제거\n\n간단한 검진으로 큰 치료를 예방할 수 있습니다.\n\n{{clinicName}} {{clinicPhone}}',
        buttons: [{ label: '예약하기', type: 'link' }]
      }
    ]
  },

  referralReward: {
    label: '소개/추천 리워드',
    icon: '\u{1F381}',
    sms: [
      { text: '{{name}}님! {{clinicName}} 소개 이벤트! 지인 소개 시 양쪽 모두 스케일링 무료! 자세한 내용: {{clinicPhone}}' },
      { text: '{{name}}님, {{clinicName}}을 주변에 소개해주세요! 소개해주신 분과 소개받은 분 모두 특별 혜택을 드립니다.' },
      { text: '{{name}}님 감사합니다! {{clinicName}} 추천 프로그램 - 추천 1건당 치료비 10% 할인 적립! {{clinicPhone}}' }
    ],
    kakao: [
      {
        text: '{{name}}님 안녕하세요!\n{{clinicName}} 소개 리워드 프로그램을 안내드립니다.\n\n[소개 혜택 안내]\n소개해주신 분: 다음 치료 10% 할인\n소개받으신 분: 첫 검진 무료 + 5% 할인\n\n[소개 방법]\n1. 지인에게 {{clinicName}}을 추천해주세요\n2. 내원 시 "{{name}}님 소개"라고 말씀해주세요\n3. 양쪽 모두 자동으로 혜택이 적용됩니다!\n\n소중한 분들에게 건강한 치아를 선물하세요!\n{{clinicName}} {{clinicPhone}}',
        buttons: [{ label: '자세히 보기', type: 'link' }, { label: '전화 문의', type: 'call' }]
      },
      {
        text: '{{name}}님, {{clinicName}}에서 감사 이벤트를 진행합니다!\n\n[가족/지인 추천 혜택]\n- 추천인: 스케일링 1회 무료\n- 피추천인: 첫 방문 검진 무료\n- 추가 추천 시 혜택 누적!\n\n{{name}}님의 소중한 추천 한마디가\n가족과 지인의 치아 건강을 지켜줍니다.\n\n{{clinicName}} {{clinicPhone}}',
        buttons: [{ label: '전화 문의', type: 'call' }]
      }
    ]
  },

  seasonalTips: {
    label: '계절별 구강관리 팁',
    icon: '\u{1F33F}',
    sms: [
      { text: '{{name}}님, 봄철 환절기에는 면역력 저하로 잇몸 질환이 증가해요. 정기검진 받으세요! -{{clinicName}}', season: 'spring' },
      { text: '{{name}}님, 여름 냉음료로 시린 이가 걱정되시나요? {{clinicName}}에서 검진받아보세요. {{clinicPhone}}', season: 'summer' },
      { text: '{{name}}님, 가을 건조한 날씨에 구강건조증 주의! 물을 자주 마시고 정기검진 잊지 마세요. -{{clinicName}}', season: 'fall' },
      { text: '{{name}}님, 겨울 뜨거운 음식 주의! 급격한 온도 차이는 치아 균열의 원인이 됩니다. -{{clinicName}}', season: 'winter' }
    ],
    kakao: [
      {
        text: '{{name}}님 안녕하세요!\n{{clinicName}}에서 {{seasonName}} 구강관리 팁을 전해드립니다.\n\n{{seasonTips}}\n\n{{seasonName}}을 맞아 구강검진 한 번 받아보시는 건 어떨까요?\n{{clinicName}} {{clinicPhone}}',
        buttons: [{ label: '검진 예약하기', type: 'link' }],
        season: 'auto'
      }
    ]
  },

  thankYou: {
    label: '감사/안부 인사',
    icon: '\u{1F49D}',
    sms: [
      { text: '{{name}}님, 항상 {{clinicName}}을 믿고 방문해주셔서 감사합니다. 건강한 하루 보내세요!' },
      { text: '{{name}}님 안녕하세요. {{clinicName}}에서 안부 인사드려요. 치아 건강은 잘 유지되고 계신가요?' },
      { text: '{{name}}님, 좋은 하루 보내고 계신가요? 언제든 필요하시면 {{clinicName}}이 함께합니다. {{clinicPhone}}' }
    ],
    kakao: [
      {
        text: '{{name}}님 안녕하세요!\n\n{{clinicName}}에서 감사 인사를 전합니다.\n\n항상 저희 치과를 믿고 방문해주셔서\n진심으로 감사드립니다.\n\n{{name}}님의 건강한 미소가\n저희에게는 가장 큰 보람입니다.\n\n앞으로도 최선의 진료로 보답하겠습니다.\n건강하고 행복한 날들 되세요!\n\n{{clinicName}} 드림',
        buttons: []
      },
      {
        text: '{{name}}님, {{clinicName}}입니다.\n\n{{visitDate}} 방문 이후 잘 지내고 계신가요?\n\n{{treatment}} 치료 후 불편한 점은 없으셨는지\n안부가 궁금하여 연락드렸습니다.\n\n언제든 궁금하신 점이 있으시면\n편하게 연락 주세요.\n\n건강한 하루 보내세요!\n{{clinicName}} {{clinicPhone}}',
        buttons: [{ label: '전화 문의', type: 'call' }]
      }
    ]
  }
};

// 계절별 팁 데이터
const SEASONAL_TIPS = {
  spring: {
    name: '봄',
    tips: '[봄철 구강건강 체크리스트]\n- 환절기 면역력 저하로 잇몸 염증 주의\n- 충분한 수분 섭취로 구강 건조 예방\n- 식후 30분 이내 양치 습관\n- 비타민C 풍부한 과일로 잇몸 건강 UP'
  },
  summer: {
    name: '여름',
    tips: '[여름철 구강건강 체크리스트]\n- 냉음료/빙과류 과다 섭취 시 시린이 주의\n- 야외활동 후 수분 섭취로 구강 건조 방지\n- 차가운 음식 후 바로 뜨거운 음식 섭취 금지\n- 여름 휴가 전 치과 검진 추천'
  },
  fall: {
    name: '가을',
    tips: '[가을철 구강건강 체크리스트]\n- 건조한 날씨로 인한 구강건조증 주의\n- 물 자주 마시기 (하루 8잔 이상)\n- 환절기 면역력 관리로 잇몸 건강 지키기\n- 연말 전 정기검진 받기'
  },
  winter: {
    name: '겨울',
    tips: '[겨울철 구강건강 체크리스트]\n- 뜨거운 음식과 차가운 공기의 온도차 주의\n- 실내 난방으로 인한 구강 건조 방지\n- 따뜻한 물로 양치하기\n- 비타민D 보충으로 치아 건강 관리'
  }
};

// ============================================
// 초기화
// ============================================
let currentStep = 1;

document.addEventListener('DOMContentLoaded', () => {
  // 치과 프로필 로드
  loadSavedClinics();

  // CSV 드래그앤드롭 설정
  setupCSVDropZone();

  // 저장된 환자 수 배지 업데이트
  updatePatientCountBadge();
});

// ============================================
// 단계 네비게이션
// ============================================
function goToStep(step) {
  // Step 1 → 2: 치과 정보 유효성 검사
  if (currentStep === 1 && step === 2) {
    if (!clinicInfo.clinicName) {
      showToast('치과 정보를 먼저 선택하거나 입력해주세요');
      return;
    }
  }

  // Step 2 → 3: 환자 정보 유효성 검사
  if (currentStep === 2 && step === 3) {
    if (currentInputMode === 'individual') {
      const name = document.getElementById('patient-name').value.trim();
      if (!name) {
        showToast('환자 이름을 입력해주세요');
        return;
      }
    } else {
      if (csvPatients.length === 0) {
        showToast('CSV 파일을 업로드해주세요');
        return;
      }
    }
    updateStep3Summary();
  }

  currentStep = step;

  // 모든 step-container 숨기기
  document.querySelectorAll('.step-container').forEach(el => {
    el.classList.remove('active');
  });
  // 현재 스텝 표시
  document.getElementById(`step-${step}`).classList.add('active');

  // Step 2 진입 시 저장된 환자 목록 렌더링
  if (step === 2) {
    renderStep2SavedPatients();
  }

  // 인디케이터 업데이트
  updateStepIndicator(step);

  // 스크롤 맨 위로
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepIndicator(activeStep) {
  for (let i = 1; i <= 3; i++) {
    const circle = document.getElementById(`step-circle-${i}`);
    const label = document.getElementById(`step-label-${i}`);

    circle.className = 'step-circle';
    label.className = 'step-label';

    if (i < activeStep) {
      circle.classList.add('done');
      label.classList.add('done');
      circle.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';
    } else if (i === activeStep) {
      circle.classList.add('active');
      label.classList.add('active');
      circle.textContent = i;
    } else {
      circle.classList.add('inactive');
      label.classList.add('inactive');
      circle.textContent = i;
    }
  }

  // 연결선 업데이트
  for (let i = 1; i <= 2; i++) {
    const line = document.getElementById(`step-line-${i}`);
    line.className = 'step-line ' + (i < activeStep ? 'active' : 'inactive');
  }
}

function updateStep3Summary() {
  const clinic = getClinicData();
  document.getElementById('summary-clinic').textContent = clinic.clinicName;

  if (currentInputMode === 'individual') {
    const name = document.getElementById('patient-name').value.trim();
    document.getElementById('summary-patient').textContent = name || '-';
  } else {
    const validCount = csvPatients.filter(p => p.status === 'valid').length;
    document.getElementById('summary-patient').textContent = `CSV ${validCount}명`;
  }
}

// ============================================
// 치과 프로필 로딩/선택 (좌우 카드 구조)
// ============================================
function loadSavedClinics() {
  dentalCases = JSON.parse(localStorage.getItem('dentalCases') || '[]');

  // 초기 화면: 좌우 카드 표시
  const countEl = document.getElementById('existing-clinic-count');
  if (countEl) countEl.textContent = dentalCases.length;

  // 이전에 선택했던 치과가 있으면 바로 선택 완료 표시
  if (clinicInfo.clinicName) {
    const matchIdx = dentalCases.findIndex(c => c.clinicName === clinicInfo.clinicName);
    if (matchIdx !== -1) {
      selectSavedClinic(matchIdx);
    } else {
      // 수동 입력으로 저장된 치과 → 선택 완료 바로 표시
      showClinicConfirmation(clinicInfo.clinicName, clinicInfo.clinicPhone || '');
    }
  }
}

function showExistingClinics() {
  if (dentalCases.length === 0) {
    // 프로필 없으면 빈 상태 + 안내
    document.getElementById('no-saved-clinics').classList.remove('hidden');
  } else {
    document.getElementById('no-saved-clinics').classList.add('hidden');
    renderClinicCards();
  }
  document.getElementById('step1-chooser').classList.add('hidden');
  document.getElementById('step1-existing').classList.remove('hidden');
  document.getElementById('step1-new').classList.add('hidden');
  document.getElementById('selected-clinic-display').classList.add('hidden');
}

function showNewClinicForm() {
  document.getElementById('step1-chooser').classList.add('hidden');
  document.getElementById('step1-existing').classList.add('hidden');
  document.getElementById('step1-new').classList.remove('hidden');
  document.getElementById('selected-clinic-display').classList.add('hidden');

  // 입력란 초기화
  document.getElementById('clinic-name').value = '';
  document.getElementById('clinic-phone').value = '';
}

function backToStep1Chooser() {
  document.getElementById('step1-chooser').classList.remove('hidden');
  document.getElementById('step1-existing').classList.add('hidden');
  document.getElementById('step1-new').classList.add('hidden');
  document.getElementById('selected-clinic-display').classList.add('hidden');
  selectedClinicIndex = -1;
}

function renderClinicCards(filteredList) {
  const container = document.getElementById('saved-clinics-list');
  container.innerHTML = '';

  const list = filteredList || dentalCases.map((c, i) => ({ ...c, _origIdx: i }));

  if (list.length === 0 && dentalCases.length > 0) {
    container.innerHTML = '<p class="text-sm text-gray-400 text-center py-6">검색 결과가 없습니다</p>';
    return;
  }

  list.forEach((clinic) => {
    const idx = clinic._origIdx !== undefined ? clinic._origIdx : dentalCases.indexOf(clinic);
    const card = document.createElement('div');
    card.className = 'clinic-card';
    card.onclick = () => selectSavedClinic(idx);

    const profileNum = clinic.profileNumber ? `#${clinic.profileNumber}` : '';
    const phone = clinic.phone || '전화번호 미등록';
    const detail = [clinic.directorName ? `${clinic.directorName} 원장` : '', clinic.location || ''].filter(Boolean).join(' · ');

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            ${profileNum ? `<span class="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono flex-shrink-0">${profileNum}</span>` : ''}
            <span class="text-sm font-bold text-gray-800 truncate">${escapeHtml(clinic.clinicName)}</span>
          </div>
          <div class="text-xs text-gray-500 mt-0.5 truncate">${escapeHtml(detail)}</div>
          <div class="text-xs text-gray-400 mt-0.5">${escapeHtml(phone)}</div>
        </div>
        <div class="flex-shrink-0 ml-3 text-xs font-bold px-3 py-1.5 rounded-lg border border-green-300 text-green-600 hover:bg-green-50">선택</div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ============================================
// 치과 검색 필터
// ============================================
function setClinicFilter(mode) {
  clinicFilterMode = mode;

  // 버튼 활성화 토글
  document.querySelectorAll('.clinic-filter-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`filter-${mode}`).classList.add('active');

  // placeholder 업데이트
  const input = document.getElementById('clinic-search-input');
  const placeholders = {
    all: '일련번호, 치과명, 원장명으로 검색...',
    number: '일련번호로 검색 (예: 0001)',
    name: '치과명으로 검색 (예: 화이트치과)',
    director: '원장명으로 검색 (예: 홍길동)'
  };
  input.placeholder = placeholders[mode];

  // 이미 입력된 값이 있으면 다시 필터링
  if (input.value.trim()) {
    filterClinics();
  }
}

function filterClinics() {
  const input = document.getElementById('clinic-search-input');
  const query = input.value.trim().toLowerCase();
  const clearBtn = document.getElementById('btn-clear-search');
  const resultText = document.getElementById('clinic-search-result');

  // X 버튼 표시/숨김
  if (query) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
    resultText.classList.add('hidden');
    renderClinicCards();
    return;
  }

  // 필터링
  const filtered = dentalCases.map((c, i) => ({ ...c, _origIdx: i })).filter(clinic => {
    switch (clinicFilterMode) {
      case 'number':
        return (clinic.profileNumber || '').toLowerCase().includes(query);
      case 'name':
        return (clinic.clinicName || '').toLowerCase().includes(query);
      case 'director':
        return (clinic.directorName || '').toLowerCase().includes(query);
      default: // 'all'
        return (clinic.profileNumber || '').toLowerCase().includes(query) ||
               (clinic.clinicName || '').toLowerCase().includes(query) ||
               (clinic.directorName || '').toLowerCase().includes(query);
    }
  });

  renderClinicCards(filtered);

  // 결과 텍스트
  resultText.classList.remove('hidden');
  resultText.textContent = `${dentalCases.length}개 중 ${filtered.length}개 검색됨`;
}

function clearClinicSearch() {
  const input = document.getElementById('clinic-search-input');
  input.value = '';
  document.getElementById('btn-clear-search').classList.add('hidden');
  document.getElementById('clinic-search-result').classList.add('hidden');
  renderClinicCards();
  input.focus();
}

function selectSavedClinic(index) {
  const clinic = dentalCases[index];
  if (!clinic) return;

  selectedClinicIndex = index;

  // clinicInfo 업데이트
  clinicInfo = { clinicName: clinic.clinicName, clinicPhone: clinic.phone || '' };
  localStorage.setItem('patient_msg_clinic_info', JSON.stringify(clinicInfo));

  const detail = [clinic.directorName ? `${clinic.directorName} 원장` : '', clinic.phone || '', clinic.location || ''].filter(Boolean).join(' · ');
  showClinicConfirmation(clinic.clinicName, detail);
  showToast(`${clinic.clinicName} 선택됨`);
}

function showClinicConfirmation(name, detail) {
  document.getElementById('step1-chooser').classList.add('hidden');
  document.getElementById('step1-existing').classList.add('hidden');
  document.getElementById('step1-new').classList.add('hidden');
  document.getElementById('selected-clinic-display').classList.remove('hidden');

  document.getElementById('selected-clinic-name-display').textContent = name;
  document.getElementById('selected-clinic-detail-display').textContent = detail;
}

function deselectClinic() {
  selectedClinicIndex = -1;
  clinicInfo = {};
  localStorage.removeItem('patient_msg_clinic_info');
  backToStep1Chooser();
}

// ============================================
// 치과 정보 관리
// ============================================
function saveClinicInfo() {
  const name = document.getElementById('clinic-name').value.trim();
  const phone = document.getElementById('clinic-phone').value.trim();
  if (!name || !phone) {
    showToast('치과명과 전화번호를 모두 입력해주세요');
    return;
  }
  clinicInfo = { clinicName: name, clinicPhone: phone, updatedAt: new Date().toISOString() };
  localStorage.setItem('patient_msg_clinic_info', JSON.stringify(clinicInfo));

  // 저장 후 선택 완료 표시
  selectedClinicIndex = -1; // 직접 입력이므로 -1 유지
  showClinicConfirmation(name, phone);
  showToast('치과 정보가 저장되었습니다');
}

function getClinicData() {
  // 저장된 프로필에서 선택한 경우
  if (selectedClinicIndex >= 0 && dentalCases[selectedClinicIndex]) {
    const clinic = dentalCases[selectedClinicIndex];
    return {
      clinicName: clinic.clinicName || '우리치과',
      clinicPhone: clinic.phone || '02-000-0000'
    };
  }

  // 직접 입력 또는 저장된 clinicInfo 사용
  if (clinicInfo.clinicName) {
    return {
      clinicName: clinicInfo.clinicName,
      clinicPhone: clinicInfo.clinicPhone || '02-000-0000'
    };
  }

  // 입력 폼에서 직접 읽기
  const nameEl = document.getElementById('clinic-name');
  const phoneEl = document.getElementById('clinic-phone');
  return {
    clinicName: (nameEl ? nameEl.value.trim() : '') || '우리치과',
    clinicPhone: (phoneEl ? phoneEl.value.trim() : '') || '02-000-0000'
  };
}

// ============================================
// Step 2: 저장된 환자 목록 표시
// ============================================
let selectedPatientIndex = -1; // 선택된 저장 환자 인덱스

function renderStep2SavedPatients(filterQuery) {
  const section = document.getElementById('saved-patients-step2');
  const listContainer = document.getElementById('saved-patients-step2-list');
  const countEl = document.getElementById('saved-patients-step2-count');

  if (savedPatients.length === 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');

  // 필터링
  let filtered = savedPatients.map((p, i) => ({ ...p, _origIdx: i }));
  if (filterQuery) {
    const q = filterQuery.toLowerCase();
    filtered = filtered.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.treatment || '').toLowerCase().includes(q)
    );
  }

  countEl.textContent = filterQuery
    ? `${savedPatients.length}명 중 ${filtered.length}명`
    : `${savedPatients.length}명`;

  listContainer.innerHTML = '';

  if (filtered.length === 0) {
    listContainer.innerHTML = '<p class="text-xs text-gray-400 text-center py-3">검색 결과가 없습니다</p>';
    return;
  }

  filtered.forEach((patient) => {
    const idx = patient._origIdx;
    const isSelected = idx === selectedPatientIndex;
    const chip = document.createElement('div');
    chip.className = `patient-chip${isSelected ? ' selected' : ''}`;
    chip.onclick = () => selectSavedPatientInStep2(idx);

    const treatmentText = patient.treatment || '치료 미기록';
    const dateText = patient.lastVisit ? formatDate(patient.lastVisit) : '';

    chip.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-gray-800">${escapeHtml(patient.name)}</span>
            ${isSelected ? '<span class="text-xs px-1.5 py-0.5 rounded-full text-white font-bold" style="background: #11998e;">선택됨</span>' : ''}
          </div>
          <div class="text-xs text-gray-500 mt-0.5 truncate">${escapeHtml(treatmentText)}${dateText ? ' · ' + escapeHtml(dateText) : ''}</div>
        </div>
        ${!isSelected ? '<div class="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg border border-green-300 text-green-600 hover:bg-green-50">선택</div>' : '<div class="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg text-amber-600 border border-amber-300 hover:bg-amber-50" onclick="event.stopPropagation(); deselectPatientInStep2()">해제</div>'}
      </div>
    `;
    listContainer.appendChild(chip);
  });
}

function selectSavedPatientInStep2(index) {
  selectedPatientIndex = index;
  loadPatientFromSaved(index);
  renderStep2SavedPatients(document.getElementById('patient-search-input').value.trim());
  showToast(`${savedPatients[index].name}님 정보가 불러와졌습니다`);
}

function deselectPatientInStep2() {
  selectedPatientIndex = -1;
  clearPatientForm();
  renderStep2SavedPatients(document.getElementById('patient-search-input').value.trim());
}

function filterSavedPatientsStep2() {
  const input = document.getElementById('patient-search-input');
  const clearBtn = document.getElementById('btn-clear-patient-search');
  const query = input.value.trim();

  if (query) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }

  renderStep2SavedPatients(query);
}

function clearPatientSearch() {
  const input = document.getElementById('patient-search-input');
  input.value = '';
  document.getElementById('btn-clear-patient-search').classList.add('hidden');
  renderStep2SavedPatients();
  input.focus();
}

// ============================================
// 입력 모드 전환
// ============================================
function switchInputMode(mode) {
  currentInputMode = mode;
  const tabIndividual = document.getElementById('tab-individual');
  const tabCsv = document.getElementById('tab-csv');
  const inputIndividual = document.getElementById('input-individual');
  const inputCsv = document.getElementById('input-csv');

  if (mode === 'individual') {
    tabIndividual.className = 'flex-1 py-2.5 rounded-xl text-sm font-semibold transition tab-active';
    tabCsv.className = 'flex-1 py-2.5 rounded-xl text-sm font-semibold transition bg-gray-100 text-gray-600 hover:bg-gray-200';
    inputIndividual.classList.remove('hidden');
    inputCsv.classList.add('hidden');
  } else {
    tabCsv.className = 'flex-1 py-2.5 rounded-xl text-sm font-semibold transition tab-active';
    tabIndividual.className = 'flex-1 py-2.5 rounded-xl text-sm font-semibold transition bg-gray-100 text-gray-600 hover:bg-gray-200';
    inputCsv.classList.remove('hidden');
    inputIndividual.classList.add('hidden');
  }

  // 결과 섹션 숨기기
  document.getElementById('result-section').classList.add('hidden');
}

// ============================================
// 치료 내역 선택
// ============================================
function toggleTreatment(btn) {
  const value = btn.dataset.value;
  const idx = selectedTreatments.indexOf(value);
  if (idx === -1) {
    selectedTreatments.push(value);
    btn.classList.add('active');
  } else {
    selectedTreatments.splice(idx, 1);
    btn.classList.remove('active');
  }
}

function clearPatientForm() {
  document.getElementById('patient-name').value = '';
  document.getElementById('patient-phone').value = '';
  document.getElementById('patient-last-visit').value = '';
  document.getElementById('patient-next-visit').value = '';
  selectedTreatments = [];
  document.querySelectorAll('.treatment-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('result-section').classList.add('hidden');
}

// ============================================
// 메시지 유형/채널/AI모드 선택
// ============================================
function selectMessageType(type) {
  currentMessageType = type;
  document.querySelectorAll('.msg-type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });
}

function selectChannel(channel) {
  currentChannel = channel;
  document.querySelectorAll('.channel-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.channel === channel);
  });
}

// ============================================
// 메시지 생성 (메인 핸들러)
// ============================================
async function handleGenerate() {
  if (isGenerating) return;

  // 유효성 검사
  if (!currentMessageType) {
    showError('메시지 유형을 선택해주세요.');
    return;
  }
  if (!currentChannel) {
    showError('발송 채널을 선택해주세요.');
    return;
  }

  const clinic = getClinicData();
  if (!clinic.clinicName || clinic.clinicName === '우리치과') {
    const name = document.getElementById('clinic-name').value.trim();
    if (!name) {
      showError('치과명을 입력해주세요.');
      return;
    }
  }

  hideError();

  if (currentInputMode === 'individual') {
    await generateIndividual(clinic);
  } else {
    await generateBulk(clinic);
  }
}

// ============================================
// 개별 메시지 생성
// ============================================
async function generateIndividual(clinic) {
  const name = document.getElementById('patient-name').value.trim();
  const lastVisit = document.getElementById('patient-last-visit').value;

  if (!name) { showError('환자 이름을 입력해주세요.'); return; }
  if (!lastVisit) { showError('최근 방문일을 입력해주세요.'); return; }
  if (selectedTreatments.length === 0) { showError('치료 내역을 선택해주세요.'); return; }

  const patientData = {
    name: name,
    phone: document.getElementById('patient-phone').value.trim(),
    lastVisit: lastVisit,
    nextVisit: document.getElementById('patient-next-visit').value,
    treatment: selectedTreatments.join(', ')
  };

  setLoading(true);

  try {
    currentTemplateIndex = 0;
    const templates = getTemplatesForType(currentMessageType, currentChannel);
    if (!templates || templates.length === 0) {
      showError('해당 유형의 템플릿이 없습니다.');
      setLoading(false);
      return;
    }
    const template = templates[currentTemplateIndex];
    currentGeneratedMessage = applyTemplate(template.text || template, patientData, clinic);
    currentGeneratedKakaoButtons = template.buttons || [];
    displayIndividualResult(currentChannel);
    renderTemplateSelector(templates, patientData, clinic);

    // 이력 저장
    saveToHistory(patientData.name, currentMessageType, currentChannel, currentGeneratedMessage, 'template');
  } catch (err) {
    showError('메시지 생성 중 오류: ' + err.message);
  }

  setLoading(false);
}

// ============================================
// 일괄 메시지 생성
// ============================================
async function generateBulk(clinic) {
  if (csvPatients.length === 0) {
    showError('CSV 파일을 먼저 업로드해주세요.');
    return;
  }

  const validPatients = csvPatients.filter(p => p.status === 'valid');
  if (validPatients.length === 0) {
    showError('유효한 환자 데이터가 없습니다.');
    return;
  }

  setLoading(true);
  const progressEl = document.getElementById('bulk-progress');
  const progressFill = document.getElementById('bulk-progress-fill');
  const progressText = document.getElementById('bulk-progress-text');
  progressEl.classList.remove('hidden');

  const results = [];

  for (let i = 0; i < validPatients.length; i++) {
    const patient = validPatients[i];
    progressText.textContent = `${i + 1}/${validPatients.length}`;
    progressFill.style.width = `${((i + 1) / validPatients.length) * 100}%`;

    try {
      let message;
      const templates = getTemplatesForType(currentMessageType, currentChannel);
      const template = templates[i % templates.length];
      message = applyTemplate(template.text || template, patient, clinic);
      results.push({ name: patient.name, phone: patient.phone || '', message: message, status: 'success' });
    } catch (err) {
      results.push({ name: patient.name, phone: patient.phone, message: '생성 실패: ' + err.message, status: 'error' });
    }
  }

  displayBulkResults(results);
  progressEl.classList.add('hidden');
  setLoading(false);

  // 이력 저장
  results.forEach(r => {
    if (r.status === 'success') {
      saveToHistory(r.name, currentMessageType, currentChannel, r.message, 'template');
    }
  });
}

// ============================================
// 템플릿 기반 생성
// ============================================
function getTemplatesForType(messageType, channel) {
  const typeData = MESSAGE_TEMPLATES[messageType];
  if (!typeData) return [];

  let templates = channel === 'sms' ? typeData.sms : typeData.kakao;

  // 계절별 팁: 현재 계절에 맞는 템플릿 필터링
  if (messageType === 'seasonalTips' && channel === 'sms') {
    const season = getCurrentSeason();
    const seasonalTemplates = templates.filter(t => t.season === season);
    if (seasonalTemplates.length > 0) return seasonalTemplates;
  }

  return templates || [];
}

function applyTemplate(templateText, patientData, clinicData) {
  const season = getCurrentSeason();
  const seasonData = SEASONAL_TIPS[season];

  return templateText
    .replace(/\{\{name\}\}/g, patientData.name || '')
    .replace(/\{\{treatment\}\}/g, patientData.treatment || '')
    .replace(/\{\{visitDate\}\}/g, formatDate(patientData.lastVisit))
    .replace(/\{\{nextVisitDate\}\}/g, formatDate(patientData.nextVisit))
    .replace(/\{\{clinicName\}\}/g, clinicData.clinicName || '')
    .replace(/\{\{clinicPhone\}\}/g, clinicData.clinicPhone || '')
    .replace(/\{\{seasonName\}\}/g, seasonData.name)
    .replace(/\{\{seasonTips\}\}/g, seasonData.tips);
}

function renderTemplateSelector(templates, patientData, clinic) {
  const container = document.getElementById('template-list');
  const selectorDiv = document.getElementById('template-selector');

  if (templates.length <= 1) {
    selectorDiv.classList.add('hidden');
    return;
  }

  selectorDiv.classList.remove('hidden');
  container.innerHTML = '';

  templates.forEach((t, idx) => {
    const btn = document.createElement('button');
    btn.className = `px-3 py-1.5 text-xs rounded-lg border transition ${idx === currentTemplateIndex ? 'bg-green-500 text-white border-green-500' : 'border-gray-300 text-gray-600 hover:border-green-400'}`;
    btn.textContent = `템플릿 ${idx + 1}`;
    btn.onclick = () => {
      currentTemplateIndex = idx;
      const template = templates[idx];
      currentGeneratedMessage = applyTemplate(template.text || template, patientData, clinic);
      currentGeneratedKakaoButtons = template.buttons || [];
      displayIndividualResult(currentChannel);
      renderTemplateSelector(templates, patientData, clinic);
    };
    container.appendChild(btn);
  });
}

// ============================================
// 결과 표시
// ============================================
function displayIndividualResult(channel) {
  const resultSection = document.getElementById('result-section');
  const resultIndividual = document.getElementById('result-individual');
  const resultBulk = document.getElementById('result-bulk');
  const previewSms = document.getElementById('preview-sms');
  const previewKakao = document.getElementById('preview-kakao');

  resultSection.classList.remove('hidden');
  resultIndividual.classList.remove('hidden');
  resultBulk.classList.add('hidden');

  if (channel === 'sms') {
    previewSms.classList.remove('hidden');
    previewKakao.classList.add('hidden');
    document.getElementById('sms-message-text').textContent = currentGeneratedMessage;
    document.getElementById('sms-char-count').textContent = currentGeneratedMessage.length;
  } else {
    previewKakao.classList.remove('hidden');
    previewSms.classList.add('hidden');
    document.getElementById('kakao-clinic-name').textContent = getClinicData().clinicName;
    document.getElementById('kakao-message-text').textContent = currentGeneratedMessage;
    document.getElementById('kakao-char-count').textContent = currentGeneratedMessage.length;

    // 카카오 버튼 렌더링
    const btnContainer = document.getElementById('kakao-buttons');
    btnContainer.innerHTML = '';
    (currentGeneratedKakaoButtons || []).forEach(b => {
      const btnEl = document.createElement('div');
      btnEl.className = 'kakao-button';
      btnEl.textContent = b.label;
      btnContainer.appendChild(btnEl);
    });
  }

  // 스크롤
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayBulkResults(results) {
  const resultSection = document.getElementById('result-section');
  const resultIndividual = document.getElementById('result-individual');
  const resultBulk = document.getElementById('result-bulk');

  resultSection.classList.remove('hidden');
  resultIndividual.classList.add('hidden');
  resultBulk.classList.remove('hidden');

  const successCount = results.filter(r => r.status === 'success').length;
  document.getElementById('bulk-result-count').textContent = `성공 ${successCount}건 / 전체 ${results.length}건`;

  const tbody = document.querySelector('#bulk-result-table tbody');
  tbody.innerHTML = '';

  results.forEach((r, idx) => {
    const tr = document.createElement('tr');
    const statusColor = r.status === 'success' ? '' : 'text-red-500';
    const msgPreview = r.message.length > 60 ? r.message.substring(0, 60) + '...' : r.message;
    tr.innerHTML = `
      <td class="text-gray-400">${idx + 1}</td>
      <td class="font-medium">${escapeHtml(r.name)}</td>
      <td class="text-gray-500">${escapeHtml(r.phone)}</td>
      <td class="${statusColor} text-xs" style="max-width:200px; word-break:break-all;" title="${escapeHtml(r.message)}">${escapeHtml(msgPreview)}</td>
      <td><button onclick="copySingleMessage(${idx})" class="text-xs text-green-600 hover:underline">복사</button></td>
    `;
    tr.dataset.fullMessage = r.message;
    tbody.appendChild(tr);
  });

  // 전역에 결과 저장 (내보내기용)
  window._bulkResults = results;

  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// 다시 생성
// ============================================
function regenerate() {
  // 수정 모드에 있었으면 미리보기로 돌린 뒤 재생성
  cancelEditMessage();
  handleGenerate();
}

// ============================================
// 메시지 수정
// ============================================
function startEditMessage() {
  const previewMode = document.getElementById('preview-mode');
  const editMode = document.getElementById('edit-mode');
  const textarea = document.getElementById('edit-textarea');

  // 현재 메시지를 textarea에 넣기
  textarea.value = currentGeneratedMessage;
  updateEditCharCount();

  // 미리보기 숨기고 수정 모드 표시
  previewMode.classList.add('hidden');
  editMode.classList.remove('hidden');

  // 버튼 상태 변경
  document.getElementById('btn-edit-msg').classList.add('hidden');
  document.getElementById('btn-regenerate').classList.add('hidden');
  document.getElementById('template-selector').classList.add('hidden');

  // textarea에 포커스
  textarea.focus();
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);
}

function applyEditMessage() {
  const textarea = document.getElementById('edit-textarea');
  const newText = textarea.value.trim();

  if (!newText) {
    showToast('메시지 내용을 입력해주세요');
    return;
  }

  // 수정된 내용 적용
  currentGeneratedMessage = newText;

  // 미리보기 다시 렌더링
  displayIndividualResult(currentChannel);

  // 수정 모드 종료
  document.getElementById('edit-mode').classList.add('hidden');
  document.getElementById('preview-mode').classList.remove('hidden');
  document.getElementById('btn-edit-msg').classList.remove('hidden');
  document.getElementById('btn-regenerate').classList.remove('hidden');
  document.getElementById('template-selector').classList.remove('hidden');

  showToast('메시지가 수정되었습니다');
}

function cancelEditMessage() {
  document.getElementById('edit-mode').classList.add('hidden');
  document.getElementById('preview-mode').classList.remove('hidden');
  document.getElementById('btn-edit-msg').classList.remove('hidden');
  document.getElementById('btn-regenerate').classList.remove('hidden');
  document.getElementById('template-selector').classList.remove('hidden');
}

function updateEditCharCount() {
  const textarea = document.getElementById('edit-textarea');
  const count = textarea.value.length;
  const limit = currentChannel === 'sms' ? 90 : 1000;
  const countEl = document.getElementById('edit-char-count');
  countEl.textContent = `${count}자 / ${limit}자`;
  countEl.style.color = count > limit ? '#ef4444' : '#9ca3af';
}

// ============================================
// 복사 및 내보내기
// ============================================
function copyMessage(channel) {
  const text = currentGeneratedMessage;
  navigator.clipboard.writeText(text).then(() => {
    showToast('메시지가 클립보드에 복사되었습니다');
  }).catch(() => {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('메시지가 복사되었습니다');
  });
}

function copySingleMessage(index) {
  const results = window._bulkResults;
  if (!results || !results[index]) return;
  navigator.clipboard.writeText(results[index].message).then(() => {
    showToast('메시지가 복사되었습니다');
  });
}

function downloadMessage(channel) {
  const text = currentGeneratedMessage;
  const patientName = document.getElementById('patient-name').value.trim() || '환자';
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `${patientName}_메시지_${channel}.txt`);
}

function exportBulkCSV() {
  const results = window._bulkResults;
  if (!results || results.length === 0) return;

  const header = '이름,연락처,메시지';
  const rows = results.map(r => {
    const msg = r.message.replace(/"/g, '""');
    return `"${r.name}","${r.phone}","${msg}"`;
  });
  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `환자_메시지_결과_${getDateStr()}.csv`);
  showToast('CSV 파일이 다운로드되었습니다');
}

function exportBulkText() {
  const results = window._bulkResults;
  if (!results || results.length === 0) return;

  const lines = results.map((r, i) => {
    return `[${i + 1}] ${r.name} (${r.phone})\n${r.message}\n`;
  });
  const text = lines.join('\n---\n\n');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `환자_메시지_결과_${getDateStr()}.txt`);
  showToast('텍스트 파일이 다운로드되었습니다');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// CSV 처리
// ============================================
function setupCSVDropZone() {
  const zone = document.getElementById('csv-drop-zone');
  const fileInput = document.getElementById('csv-file-input');

  zone.addEventListener('click', () => fileInput.click());
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleCSVFile(file);
  });
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleCSVFile(file);
  });
}

function handleCSVFile(file) {
  if (!file.name.endsWith('.csv')) {
    showError('CSV 파일만 업로드 가능합니다.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      let text = e.target.result;
      // BOM 제거
      if (text.charCodeAt(0) === 0xFEFF) text = text.substring(1);

      const result = parseCSV(text);
      csvPatients = result.patients;
      displayCSVPreview(result);
    } catch (err) {
      showError('CSV 파싱 오류: ' + err.message);
    }
  };
  reader.readAsText(file, 'UTF-8');
}

function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV 파일에 데이터가 없습니다. 헤더와 최소 1행의 데이터가 필요합니다.');
  }

  const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/"/g, ''));
  const headerMap = {
    '이름': 'name', '환자이름': 'name', '환자 이름': 'name',
    '연락처': 'phone', '전화번호': 'phone', '전화': 'phone',
    '최근방문일': 'lastVisit', '최근 방문일': 'lastVisit', '방문일': 'lastVisit',
    '치료내역': 'treatment', '치료 내역': 'treatment', '치료': 'treatment',
    '다음방문일': 'nextVisit', '다음 방문일': 'nextVisit', '다음권장방문일': 'nextVisit'
  };

  const fieldIndices = {};
  headers.forEach((header, index) => {
    const fieldName = headerMap[header];
    if (fieldName) fieldIndices[fieldName] = index;
  });

  if (!('name' in fieldIndices)) {
    throw new Error('CSV 파일에 "이름" 열이 필요합니다.');
  }

  const patients = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      const patient = {
        rowNum: i,
        name: (values[fieldIndices.name] || '').trim().replace(/"/g, ''),
        phone: fieldIndices.phone !== undefined ? (values[fieldIndices.phone] || '').trim().replace(/"/g, '') : '',
        lastVisit: fieldIndices.lastVisit !== undefined ? (values[fieldIndices.lastVisit] || '').trim().replace(/"/g, '') : '',
        treatment: fieldIndices.treatment !== undefined ? (values[fieldIndices.treatment] || '').trim().replace(/"/g, '') : '',
        nextVisit: fieldIndices.nextVisit !== undefined ? (values[fieldIndices.nextVisit] || '').trim().replace(/"/g, '') : '',
        status: 'valid'
      };

      if (!patient.name) {
        patient.status = 'error';
        patient.errorMessage = '이름 누락';
        errors.push({ row: i + 1, message: '이름이 비어있습니다' });
      }
      if (!patient.treatment) {
        patient.treatment = '정기검진';
      }

      patients.push(patient);
    } catch (err) {
      errors.push({ row: i + 1, message: '행 파싱 오류' });
    }
  }

  return { patients, errors, totalRows: lines.length - 1 };
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function displayCSVPreview(result) {
  const preview = document.getElementById('csv-preview');
  const countEl = document.getElementById('csv-count');
  const tbody = document.querySelector('#csv-table tbody');
  const btnClear = document.getElementById('btn-clear-csv');

  preview.classList.remove('hidden');
  btnClear.classList.remove('hidden');

  const validCount = result.patients.filter(p => p.status === 'valid').length;
  countEl.textContent = `유효 ${validCount}명 / 전체 ${result.totalRows}행${result.errors.length > 0 ? ` (오류 ${result.errors.length}건)` : ''}`;

  tbody.innerHTML = '';
  result.patients.forEach((p, idx) => {
    const tr = document.createElement('tr');
    const statusHtml = p.status === 'valid'
      ? '<span class="text-green-500 text-xs">OK</span>'
      : `<span class="text-red-500 text-xs">${escapeHtml(p.errorMessage || '오류')}</span>`;
    tr.innerHTML = `
      <td class="text-gray-400">${idx + 1}</td>
      <td class="font-medium">${escapeHtml(p.name)}</td>
      <td class="text-gray-500">${escapeHtml(p.phone)}</td>
      <td class="text-gray-500">${escapeHtml(p.lastVisit)}</td>
      <td class="text-gray-500">${escapeHtml(p.treatment)}</td>
      <td class="text-gray-500">${escapeHtml(p.nextVisit)}</td>
      <td>${statusHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

function clearCSV() {
  csvPatients = [];
  document.getElementById('csv-preview').classList.add('hidden');
  document.getElementById('btn-clear-csv').classList.add('hidden');
  document.getElementById('csv-file-input').value = '';
  document.getElementById('result-section').classList.add('hidden');
}

function downloadSampleCSV() {
  const csv = '이름,연락처,최근방문일,치료내역,다음방문일\n' +
    '홍길동,010-1234-5678,2025-12-15,임플란트,2026-06-15\n' +
    '김철수,010-9876-5432,2026-01-03,스케일링,2026-07-03\n' +
    '이영희,010-5555-1234,2025-11-20,"보철, 보존치료",2026-05-20\n' +
    '박지민,010-3333-4444,2026-01-20,미백,\n' +
    '최수연,010-7777-8888,2025-10-05,교정,2026-04-05';
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, '환자_데이터_샘플.csv');
  showToast('샘플 CSV가 다운로드되었습니다');
}

// ============================================
// 환자 저장/관리
// ============================================
function saveCurrentPatient() {
  const name = document.getElementById('patient-name').value.trim();
  if (!name) { showToast('환자 이름을 입력해주세요'); return; }

  const patient = {
    id: Date.now().toString(),
    name: name,
    phone: document.getElementById('patient-phone').value.trim(),
    lastVisit: document.getElementById('patient-last-visit').value,
    treatment: selectedTreatments.join(', '),
    nextVisit: document.getElementById('patient-next-visit').value,
    createdAt: new Date().toISOString()
  };

  // 중복 체크 (이름 + 연락처)
  const existIdx = savedPatients.findIndex(p => p.name === patient.name && p.phone === patient.phone);
  if (existIdx !== -1) {
    savedPatients[existIdx] = { ...savedPatients[existIdx], ...patient, id: savedPatients[existIdx].id };
  } else {
    savedPatients.push(patient);
  }

  localStorage.setItem('patient_msg_saved_patients', JSON.stringify(savedPatients));
  updatePatientCountBadge();
  renderStep2SavedPatients();
  showToast(`${name}님 정보가 저장되었습니다`);
}

function loadPatientFromSaved(index) {
  const patient = savedPatients[index];
  if (!patient) return;

  document.getElementById('patient-name').value = patient.name;
  document.getElementById('patient-phone').value = patient.phone || '';
  document.getElementById('patient-last-visit').value = patient.lastVisit || '';
  document.getElementById('patient-next-visit').value = patient.nextVisit || '';

  // 치료 내역 복원
  selectedTreatments = patient.treatment ? patient.treatment.split(', ').filter(Boolean) : [];
  document.querySelectorAll('.treatment-btn').forEach(btn => {
    btn.classList.toggle('active', selectedTreatments.includes(btn.dataset.value));
  });

  // 개별 입력 모드로 전환
  switchInputMode('individual');

  // 사이드 패널이 열려있으면 닫기
  if (document.getElementById('patient-panel').classList.contains('open')) {
    closePatientPanel();
    showToast(`${patient.name}님 정보가 불러와졌습니다`);
  }
}

function deletePatient(index) {
  const patient = savedPatients[index];
  if (!patient) return;
  savedPatients.splice(index, 1);
  localStorage.setItem('patient_msg_saved_patients', JSON.stringify(savedPatients));
  updatePatientCountBadge();
  renderSavedPatientsList();
  renderStep2SavedPatients();
  // 삭제된 환자가 선택 상태였으면 해제
  if (selectedPatientIndex === index) {
    selectedPatientIndex = -1;
  } else if (selectedPatientIndex > index) {
    selectedPatientIndex--;
  }
  showToast('환자 정보가 삭제되었습니다');
}

function clearAllPatients() {
  if (!confirm('저장된 모든 환자 정보를 삭제하시겠습니까?')) return;
  savedPatients = [];
  selectedPatientIndex = -1;
  localStorage.setItem('patient_msg_saved_patients', JSON.stringify(savedPatients));
  updatePatientCountBadge();
  renderSavedPatientsList();
  renderStep2SavedPatients();
  showToast('모든 환자 정보가 삭제되었습니다');
}

function updatePatientCountBadge() {
  const badge = document.getElementById('patient-count-badge');
  if (savedPatients.length > 0) {
    badge.textContent = savedPatients.length;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// ============================================
// 사이드 패널
// ============================================
function openPatientPanel() {
  renderSavedPatientsList();
  document.getElementById('patient-panel').classList.add('open');
  document.getElementById('panel-overlay').classList.add('open');
}

function closePatientPanel() {
  document.getElementById('patient-panel').classList.remove('open');
  document.getElementById('panel-overlay').classList.remove('open');
}

function renderSavedPatientsList() {
  const container = document.getElementById('saved-patients-list');
  const btnClear = document.getElementById('btn-clear-patients');

  if (savedPatients.length === 0) {
    container.innerHTML = '<p class="text-sm text-gray-400 text-center py-8">저장된 환자가 없습니다</p>';
    btnClear.classList.add('hidden');
    return;
  }

  btnClear.classList.remove('hidden');
  container.innerHTML = '';

  savedPatients.forEach((patient, idx) => {
    const div = document.createElement('div');
    div.className = 'p-3 bg-gray-50 rounded-xl flex items-center justify-between hover:bg-gray-100 transition cursor-pointer';
    div.innerHTML = `
      <div onclick="loadPatientFromSaved(${idx})" class="flex-1">
        <div class="text-sm font-semibold text-gray-800">${escapeHtml(patient.name)}</div>
        <div class="text-xs text-gray-400">${escapeHtml(patient.treatment || '')} | ${escapeHtml(patient.lastVisit || '')}</div>
      </div>
      <button onclick="event.stopPropagation(); deletePatient(${idx})" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 text-sm">&times;</button>
    `;
    container.appendChild(div);
  });
}

// ============================================
// 이력 저장
// ============================================
function saveToHistory(patientName, messageType, channel, message, method) {
  messageHistory.unshift({
    id: Date.now().toString(),
    patientName,
    messageType,
    channel,
    message,
    method,
    createdAt: new Date().toISOString()
  });

  // 최대 100건
  if (messageHistory.length > 100) {
    messageHistory = messageHistory.slice(0, 100);
  }

  localStorage.setItem('patient_msg_history', JSON.stringify(messageHistory));
}

// ============================================
// 유틸리티
// ============================================
function formatDate(dateStr) {
  if (!dateStr) return '';
  // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD 지원
  const normalized = dateStr.replace(/[/.]/g, '-');
  const parts = normalized.split('-');
  if (parts.length === 3) {
    return `${parts[0]}년 ${parseInt(parts[1])}월 ${parseInt(parts[2])}일`;
  }
  return dateStr;
}

function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

function getDateStr() {
  return new Date().toISOString().slice(0, 10);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function setLoading(loading) {
  isGenerating = loading;
  const btn = document.getElementById('btn-generate');
  const btnText = document.getElementById('btn-generate-text');
  const btnSpinner = document.getElementById('btn-generate-spinner');

  if (loading) {
    btn.disabled = true;
    btn.style.opacity = '0.7';
    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
  } else {
    btn.disabled = false;
    btn.style.opacity = '1';
    btnText.classList.remove('hidden');
    btnSpinner.classList.add('hidden');
  }
}

function showError(message) {
  const el = document.getElementById('error-display');
  el.classList.remove('hidden');
  el.querySelector('div').textContent = message;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideError() {
  document.getElementById('error-display').classList.add('hidden');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}
