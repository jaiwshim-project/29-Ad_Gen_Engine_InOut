// ============================================
// 카드뉴스 결과 페이지 스크립트
// ============================================

// 상수
const CARD_TYPES = ['HOOK', 'EMPATHY', 'PROBLEM', 'SOLUTION', 'CTA'];

const CARD_TYPE_LABELS = {
  HOOK: '관심 유도',
  EMPATHY: '공감 형성',
  PROBLEM: '문제 제기',
  SOLUTION: '해결책 제시',
  CTA: '행동 유도'
};

const CARD_TYPE_COLORS = {
  HOOK: { gradient: 'card-gradient-hook', badge: 'bg-blue-700' },
  EMPATHY: { gradient: 'card-gradient-empathy', badge: 'bg-green-700' },
  PROBLEM: { gradient: 'card-gradient-problem', badge: 'bg-yellow-700' },
  SOLUTION: { gradient: 'card-gradient-solution', badge: 'bg-purple-700' },
  CTA: { gradient: 'card-gradient-cta', badge: 'bg-red-700' }
};

const CARD_TYPE_LABELS_KR = {
  HOOK: '관심 유도',
  EMPATHY: '공감 형성',
  PROBLEM: '문제 제기',
  SOLUTION: '해결책 제시',
  CTA: '행동 유도'
};

// 전역 변수
let currentCards = [];
let currentCardIndex = 0;
let currentBusinessName = '';
let currentContactNumber = '';
let currentDomain = 'general';

// ============================================
// 초기화
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const raw = sessionStorage.getItem('cardnews_result');
  if (!raw) {
    alert('표시할 카드뉴스 데이터가 없습니다. 카드뉴스 생성 페이지로 이동합니다.');
    window.location.href = 'cardnews.html';
    return;
  }

  try {
    const data = JSON.parse(raw);
    currentCards = data.cards || [];
    currentBusinessName = data.businessName || '';
    currentContactNumber = data.contactNumber || '';
    currentDomain = data.domain || 'general';
    const qualityScore = data.qualityScore || {};

    if (!currentCards.length) {
      alert('카드 데이터가 비어 있습니다.');
      window.location.href = 'cardnews.html';
      return;
    }

    // 품질 점수 표시
    displayQualityScore(qualityScore);

    // 첫 번째 카드 표시
    showCard(0);

    // 전체 카드 미리보기
    renderAllCardsPreview(currentCards);
  } catch (err) {
    console.error('카드뉴스 데이터 파싱 오류:', err);
    alert('데이터를 불러오는 중 오류가 발생했습니다.');
    window.location.href = 'cardnews.html';
  }
});

// ============================================
// 품질 점수 표시
// ============================================
function displayQualityScore(qualityScore) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const overall = qualityScore.overall || 0;
  const hook = qualityScore.hookStrength || 0;
  const flow = qualityScore.flowCoherence || 0;
  const cta = qualityScore.ctaClarity || 0;
  const domain = qualityScore.domainRelevance || 0;

  document.getElementById('overall-score').textContent = `${overall}점`;
  document.getElementById('overall-score').className = `text-4xl font-black ${getScoreColor(overall)}`;

  document.getElementById('hook-score').textContent = `${hook}/25`;
  document.getElementById('hook-score').className = `text-2xl font-black ${getScoreColor(hook * 4)}`;

  document.getElementById('flow-score').textContent = `${flow}/25`;
  document.getElementById('flow-score').className = `text-2xl font-black ${getScoreColor(flow * 4)}`;

  document.getElementById('cta-score').textContent = `${cta}/25`;
  document.getElementById('cta-score').className = `text-2xl font-black ${getScoreColor(cta * 4)}`;

  document.getElementById('domain-score').textContent = `${domain}/25`;
  document.getElementById('domain-score').className = `text-2xl font-black ${getScoreColor(domain * 4)}`;

  // 피드백
  const feedbackList = document.getElementById('feedback-list');
  const feedback = qualityScore.feedback || [];
  feedbackList.innerHTML = feedback.map(fb =>
    `<li class="flex items-start gap-2"><span class="text-slate-400">&bull;</span>${fb}</li>`
  ).join('');
}

// ============================================
// 이미지 키워드 & URL
// ============================================
function getImageKeywords(card, domain) {
  const domainKeywords = {
    hospital: ['dental,clinic', 'dentist,smile', 'medical,health', 'teeth,white', 'doctor,care'],
    election: ['vote,democracy', 'community,people', 'city,future', 'handshake,trust', 'speech,leader'],
    education: ['study,learning', 'classroom,student', 'book,education', 'graduation,success', 'teacher,school'],
    realestate: ['apartment,building', 'house,home', 'interior,modern', 'city,skyline', 'architecture,design'],
    finance: ['money,investment', 'business,growth', 'chart,success', 'savings,piggybank', 'financial,planning'],
    beauty: ['skincare,beauty', 'spa,wellness', 'cosmetics,makeup', 'facial,treatment', 'woman,glow'],
    food: ['food,delicious', 'restaurant,dining', 'cooking,kitchen', 'healthy,meal', 'chef,cuisine'],
    general: ['business,professional', 'success,team', 'office,modern', 'handshake,deal', 'growth,achievement'],
    custom: ['business,service', 'professional,quality', 'success,team', 'modern,office', 'customer,satisfaction']
  };

  const typeKeywords = {
    HOOK: ['attention,surprise', 'question,curious', 'wow,amazing', 'highlight,focus', 'interest,discover'],
    EMPATHY: ['understanding,care', 'emotion,support', 'together,help', 'listen,comfort', 'family,warm'],
    PROBLEM: ['challenge,problem', 'worry,concern', 'stress,difficulty', 'question,think', 'solution,search'],
    SOLUTION: ['solution,success', 'answer,help', 'happy,satisfaction', 'thumbsup,great', 'achievement,win'],
    CTA: ['action,start', 'contact,call', 'click,button', 'phone,message', 'appointment,schedule']
  };

  const domainKw = domainKeywords[domain] || domainKeywords.general;
  const typeKw = typeKeywords[card.type] || typeKeywords.HOOK;
  const cardIndex = CARD_TYPES.indexOf(card.type);
  const primaryKw = domainKw[cardIndex % domainKw.length];
  const secondaryKw = typeKw[cardIndex % typeKw.length];

  return `${primaryKw},${secondaryKw.split(',')[0]}`;
}

function getCardImageUrl(card, domain, width = 800, height = 1000) {
  const keywords = getImageKeywords(card, domain);
  const sig = `${card.type}-${domain}-${Date.now()}`;
  return `https://source.unsplash.com/${width}x${height}/?${keywords}&sig=${sig}`;
}

// ============================================
// 카드 렌더링
// ============================================
function renderCard(card, index) {
  const colors = CARD_TYPE_COLORS[card.type];
  const imageUrl = getCardImageUrl(card, currentDomain, 800, 1000);

  return `
    <div id="card-${index}" class="w-[400px] h-[500px] rounded-2xl overflow-hidden shadow-xl text-white flex flex-col relative">
      <div class="absolute inset-0">
        <img
          src="${imageUrl}"
          alt="배경 이미지"
          class="w-full h-full object-cover"
          crossorigin="anonymous"
          onerror="this.style.display='none'"
        />
        <div class="absolute inset-0 bg-black/50"></div>
        <div class="absolute inset-0 ${colors.gradient} opacity-60"></div>
      </div>
      <div class="relative z-10 p-6 pb-4">
        <div class="flex items-center justify-end mb-4">
          <span class="text-white font-bold text-sm" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">${index + 1} / 5</span>
        </div>
      </div>
      <div class="relative z-10 flex-1 px-6 flex flex-col justify-center">
        <h2 class="text-3xl font-black mb-8 leading-tight text-white" style="text-shadow: 3px 3px 6px rgba(0,0,0,0.9), -1px -1px 0 rgba(0,0,0,0.5);">${card.title}</h2>
        <p class="text-xl font-bold leading-relaxed text-white" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.9);">${card.content}</p>
      </div>
      <div class="relative z-10 p-6 pt-4">
        <div class="text-center">
          <span class="text-lg font-black text-yellow-300" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.9);">${currentBusinessName}</span>
          ${card.type === 'CTA' ? `
          <div class="mt-2">
            <span class="text-xl font-black text-white" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.9);">📞 ${currentContactNumber}</span>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function showCard(index) {
  currentCardIndex = index;
  const card = currentCards[index];

  // 탭 버튼 활성화
  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    if (i === index) {
      btn.classList.add('tab-active');
      btn.classList.remove('bg-slate-100');
    } else {
      btn.classList.remove('tab-active');
      btn.classList.add('bg-slate-100');
    }
  });

  // 카드 렌더링
  const container = document.getElementById('card-container');
  container.innerHTML = renderCard(card, index);
}

function renderAllCardsPreview(cards) {
  const container = document.getElementById('all-cards-container');
  container.innerHTML = cards.map((card, index) => {
    const imageUrl = getCardImageUrl(card, currentDomain, 240, 300);

    return `
      <div onclick="showCard(${index})" class="cursor-pointer transform hover:scale-105 transition">
        <div class="w-[120px] h-[150px] rounded-lg overflow-hidden shadow text-white relative">
          <img
            src="${imageUrl}"
            alt=""
            class="absolute inset-0 w-full h-full object-cover"
            onerror="this.style.display='none'"
          />
          <div class="absolute inset-0 ${CARD_TYPE_COLORS[card.type].gradient} opacity-75"></div>
          <div class="relative z-10 p-2 h-full flex flex-col">
            <div class="text-[8px] opacity-70 mb-1">${CARD_TYPE_LABELS[card.type]}</div>
            <div class="text-[10px] font-bold leading-tight line-clamp-2">${card.title}</div>
            <div class="flex-1"></div>
            <div class="text-[8px] opacity-50 text-center">${index + 1}/5</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// PNG 다운로드
// ============================================
async function downloadCurrentCard() {
  const cardElement = document.getElementById(`card-${currentCardIndex}`);
  if (!cardElement) return;

  try {
    const canvas = await html2canvas(cardElement, {
      scale: 1,
      backgroundColor: null,
      useCORS: true
    });

    const link = document.createElement('a');
    link.download = `cardnews_${currentCards[currentCardIndex].type}_${currentCardIndex + 1}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    alert('이미지 다운로드 중 오류가 발생했습니다.');
    console.error(error);
  }
}

async function downloadAllCards() {
  for (let i = 0; i < currentCards.length; i++) {
    showCard(i);
    await new Promise(resolve => setTimeout(resolve, 300));

    const cardElement = document.getElementById(`card-${i}`);
    if (!cardElement) continue;

    try {
      const canvas = await html2canvas(cardElement, {
        scale: 1,
        backgroundColor: null,
        useCORS: true
      });

      const link = document.createElement('a');
      link.download = `cardnews_${currentCards[i].type}_${i + 1}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Card ${i + 1} download error:`, error);
    }
  }
}

// ============================================
// 카드 텍스트 수정
// ============================================
function openEditModal() {
  if (!currentCards || !currentCards.length) {
    alert('카드 데이터가 없습니다.');
    return;
  }

  const card = currentCards[currentCardIndex];
  if (!card) return;

  const modal = document.getElementById('edit-modal');
  const titleInput = document.getElementById('edit-title');
  const contentInput = document.getElementById('edit-content');

  document.getElementById('edit-modal-title').textContent = `카드 ${currentCardIndex + 1} 텍스트 수정`;
  document.getElementById('edit-modal-type').textContent = CARD_TYPE_LABELS_KR[card.type] || '';

  titleInput.value = card.title;
  contentInput.value = card.content;

  document.getElementById('edit-title-count').textContent = card.title.length;
  document.getElementById('edit-content-count').textContent = card.content.length;

  titleInput.oninput = () => {
    document.getElementById('edit-title-count').textContent = titleInput.value.length;
  };
  contentInput.oninput = () => {
    document.getElementById('edit-content-count').textContent = contentInput.value.length;
  };

  modal.classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
}

function saveEditedCard() {
  const titleInput = document.getElementById('edit-title');
  const contentInput = document.getElementById('edit-content');

  const newTitle = titleInput.value.trim();
  const newContent = contentInput.value.trim();

  if (!newTitle) {
    alert('제목을 입력해주세요.');
    titleInput.focus();
    return;
  }

  currentCards[currentCardIndex].title = newTitle;
  currentCards[currentCardIndex].content = newContent;

  // sessionStorage 업데이트
  const raw = sessionStorage.getItem('cardnews_result');
  if (raw) {
    try {
      const data = JSON.parse(raw);
      data.cards = currentCards;
      sessionStorage.setItem('cardnews_result', JSON.stringify(data));
    } catch (e) {
      console.error('sessionStorage 업데이트 실패:', e);
    }
  }

  // 현재 카드 재렌더링
  showCard(currentCardIndex);

  // 썸네일 프리뷰도 갱신
  renderAllCardsPreview(currentCards);

  closeEditModal();
}
