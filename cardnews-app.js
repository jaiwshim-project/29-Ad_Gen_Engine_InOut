// ============================================
// AI 카드뉴스 생성기
// ============================================

// Supabase 설정
const CARDNEWS_SUPABASE_URL = 'https://haxcktfnuudlqciyljtp.supabase.co';
const CARDNEWS_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheGNrdGZudXVkbHFjaXlsanRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMDUwNDAsImV4cCI6MjA4NDg4MTA0MH0.suN7BeaHx3MjaNlMDQa0940P-rMl2XPyk4ksoQEU3YM';
let cardnewsSupabase = null;

function initCardnewsSupabase() {
  try {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
      cardnewsSupabase = window.supabase.createClient(CARDNEWS_SUPABASE_URL, CARDNEWS_SUPABASE_KEY);
      console.log('[CardNews] Supabase 연결 성공');
    }
  } catch (err) {
    console.error('[CardNews] Supabase 초기화 실패:', err);
  }
}

async function loadApiKeyFromSupabase() {
  if (!cardnewsSupabase) return '';
  try {
    const { data, error } = await cardnewsSupabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'gemini_api_key')
      .single();
    if (error) throw error;
    return data?.setting_value || '';
  } catch (err) {
    console.warn('[CardNews] API 키 로드 실패:', err.message);
    return '';
  }
}

async function saveApiKeyToSupabase(key) {
  if (!cardnewsSupabase) return false;
  try {
    const { error } = await cardnewsSupabase
      .from('app_settings')
      .upsert(
        { setting_key: 'gemini_api_key', setting_value: key, updated_at: new Date().toISOString() },
        { onConflict: 'setting_key' }
      );
    if (error) throw error;
    console.log('[CardNews] API 키 Supabase 저장 완료');
    return true;
  } catch (err) {
    console.error('[CardNews] API 키 저장 실패:', err.message);
    return false;
  }
}

// 전역 변수
let apiKey = '';
let currentCards = [];
let currentDomain = 'general';
let currentCardIndex = 0;
let currentTopic = '';
let currentBusinessName = '';
let currentContactNumber = '';

// 저장된 업체 정보 목록
let savedBusinessInfoList = JSON.parse(localStorage.getItem('saved_business_info') || '[]');

// 도메인+타겟별 주제 예시
const DOMAIN_TARGET_TOPIC_EXAMPLES = {
  hospital: {
    '10대': { '학생': '청소년 치아교정, 언제 시작하면 좋을까?', 'default': '성장기 치아 관리의 중요성' },
    '20대': { '직장인': '바쁜 직장인을 위한 점심시간 스케일링', '학생': '취준생 면접 전 치아미백 꿀팁', 'default': '20대 사랑니 발치 시기와 주의사항' },
    '30대': { '직장인': '직장인 치아 미백, 점심시간에 가능할까?', '주부': '육아맘을 위한 치과 정기검진 가이드', 'default': '30대 잇몸 건강 관리법' },
    '40대': { '직장인': '40대 직장인 임플란트 vs 브릿지 선택 가이드', '자영업자': '바쁜 사장님을 위한 빠른 치료 솔루션', 'default': '40대부터 시작하는 잇몸 질환 예방' },
    '50대': { 'default': '50대 임플란트, 지금이 적기인 이유' },
    '60대': { '은퇴자': '은퇴 후 치아 건강 관리 총정리', 'default': '60대 틀니 vs 임플란트 비교' },
    '70대': { 'default': '어르신 맞춤 무통 임플란트 안내' },
    'default': '치아 미백의 효과와 주의사항'
  },
  election: {
    '20대': { '학생': '청년 일자리 창출 5대 공약', '직장인': '청년 주거 안정화 정책', 'default': '청년이 살기 좋은 도시 만들기' },
    '30대': { '직장인': '워라밸 실현을 위한 정책 제안', '주부': '육아 지원 정책 강화 공약', 'default': '30대 맞벌이 가정 지원 정책' },
    '40대': { 'default': '교육 환경 개선을 위한 비전' },
    '50대': { 'default': '중장년 일자리 정책 제안' },
    '60대': { '은퇴자': '노후 복지 강화 공약', 'default': '어르신 복지 증진 정책' },
    'default': '우리 지역 발전을 위한 5대 공약'
  },
  education: {
    '10대': { '학생': '중학생 내신 대비 학습 전략', 'default': '고등학교 입시 준비 가이드' },
    '20대': { '학생': '대학생 취업 스펙 쌓기 전략', '직장인': '직장인 자격증 취득 가이드', 'default': '20대 자기계발 로드맵' },
    '30대': { '직장인': '직장인 MBA 도전기', '주부': '육아와 병행하는 자격증 취득', 'default': '30대 커리어 전환 교육' },
    '40대': { '자영업자': '사업주를 위한 경영 교육', 'default': '40대 제2의 인생 준비 교육' },
    'default': '수학 성적 향상을 위한 학습법'
  },
  realestate: {
    '20대': { '직장인': '사회초년생 첫 내집 마련 전략', 'default': '20대 청약 당첨 노하우' },
    '30대': { '직장인': '신혼부부 아파트 청약 가이드', '맞벌이': '맞벌이 부부 내집 마련 전략', 'default': '30대 첫 아파트 구매 가이드' },
    '40대': { '직장인': '자녀 학군 고려한 이사 전략', 'default': '40대 갈아타기 적기 분석' },
    '50대': { 'default': '은퇴 준비 부동산 투자 전략' },
    'default': '강남역 신축 오피스텔 분양 안내'
  },
  finance: {
    '20대': { '직장인': '사회초년생 월급 관리법', '학생': '대학생 용돈 관리와 적금', 'default': '20대 재테크 첫걸음' },
    '30대': { '직장인': '30대 직장인 자산 포트폴리오', '주부': '주부를 위한 생활비 절약 재테크', 'default': '30대 내집 마련 자금 모으기' },
    '40대': { '자영업자': '자영업자 절세 전략', 'default': '40대 자녀 교육비 준비' },
    '50대': { 'default': '50대 노후 자금 굴리기' },
    '60대': { '은퇴자': '은퇴 후 연금 수령 전략', 'default': '60대 안정적인 자산 관리' },
    'default': '30대를 위한 노후 준비 재테크'
  },
  beauty: {
    '10대': { '학생': '10대 여드름 피부 관리법', 'default': '청소년 피부 트러블 해결법' },
    '20대': { '직장인': '직장인 데일리 메이크업 꿀팁', '학생': '대학생 가성비 스킨케어', 'default': '20대 피부 탄력 유지 비법' },
    '30대': { '직장인': '바쁜 직장맘 5분 메이크업', '주부': '육아맘 피부 회복 케어', 'default': '30대 안티에이징 시작하기' },
    '40대': { 'default': '40대 주름 개선 집중 케어' },
    '50대': { 'default': '50대 피부 탄력 회복 프로그램' },
    'default': '여름철 피부 관리 꿀팁'
  },
  food: {
    '10대': { '학생': '수험생 집중력 높이는 영양 식단', 'default': '성장기 청소년 영양 만점 메뉴' },
    '20대': { '직장인': '직장인 점심 도시락 메뉴 추천', '학생': '자취생 간편 요리 레시피', 'default': '20대 건강 다이어트 식단' },
    '30대': { '직장인': '야근러를 위한 건강 야식', '주부': '온가족 영양 만점 집밥', 'default': '30대 건강 밥상 차리기' },
    '40대': { '자영업자': '바쁜 사장님 건강 식단', 'default': '40대 성인병 예방 식단' },
    '50대': { 'default': '50대 혈압/혈당 관리 식단' },
    '60대': { '은퇴자': '어르신 건강 보양식 추천', 'default': '60대 소화 잘되는 건강식' },
    'default': '건강한 다이어트 도시락 메뉴'
  },
  general: {
    'default': '효과적인 시간 관리 방법'
  },
  custom: {
    'default': '우리 서비스의 특별한 장점'
  }
};

// 도메인별 업체명 예시
const DOMAIN_BUSINESS_EXAMPLES = {
  hospital: '화이트서울치과',
  election: '홍길동 후보 캠프',
  education: '스마트러닝 학원',
  realestate: '강남프라임 부동산',
  finance: '미래에셋 보험설계사',
  beauty: '글로우업 뷰티샵',
  food: '맛있는 밥상',
  general: '우리 회사',
  custom: '우리 업체'
};

// 도메인별 연락처 예시
const DOMAIN_CONTACT_EXAMPLES = {
  hospital: '02-1234-5678',
  election: '010-1234-5678',
  education: '02-123-4567',
  realestate: '02-555-1234',
  finance: '010-9876-5432',
  beauty: '02-777-8888',
  food: '02-333-4444',
  general: '02-000-0000',
  custom: '02-000-0000'
};

// 도메인+타겟별 핵심 메시지 예시
const DOMAIN_TARGET_MESSAGE_EXAMPLES = {
  hospital: {
    '10대': { '학생': '성장기에 맞는 교정 치료로 평생 가는 바른 치아를 만들어 드립니다. 학업에 지장 없는 방학 집중 치료!', 'default': '청소년 눈높이에 맞춘 친절한 진료로 치과 공포증 없이 건강한 치아를 지켜드립니다.' },
    '20대': { '직장인': '점심시간 30분 스케일링부터 퇴근 후 야간 진료까지! 바쁜 직장인 스케줄에 맞춘 맞춤 진료를 제공합니다.', '학생': '취업 면접 전 환한 미소를 준비하세요. 학생 할인으로 부담 없이 미백 치료를 받으실 수 있습니다.', 'default': '20대 맞춤 치아 관리로 평생 건강한 치아를 유지하세요.' },
    '30대': { '직장인': '바쁜 일상 속에서도 치아 건강을 지키세요. 점심시간 이용 가능한 빠른 진료 시스템을 운영합니다.', '주부': '아이 케어하랴 집안일하랴 바쁜 엄마들을 위한 원스톱 가족 치과 진료를 제공합니다.', 'default': '30대부터 시작하는 잇몸 건강 관리! 전문의 상담으로 맞춤 치료 계획을 세워드립니다.' },
    '40대': { '직장인': '중요한 비즈니스 미팅을 위한 자신감 있는 미소! 자연스러운 심미 치료로 이미지 업그레이드하세요.', '자영업자': '바쁜 사장님도 건강은 챙기셔야죠. 예약제 운영으로 대기 없이 빠른 진료를 받으실 수 있습니다.', 'default': '40대 구강 건강 종합 검진으로 잇몸 질환을 미리 예방하세요.' },
    '50대': { 'default': '50대 맞춤 임플란트 상담! 풍부한 경험의 전문의가 최적의 치료 방법을 제안해 드립니다.' },
    '60대': { '은퇴자': '여유로운 은퇴 생활, 건강한 치아와 함께하세요. 어르신 전용 케어 프로그램을 운영합니다.', 'default': '60대 눈높이에 맞춘 친절한 상담과 꼼꼼한 진료로 편안한 치과 경험을 선사합니다.' },
    '70대': { 'default': '어르신의 편안한 식사를 위한 맞춤 보철 치료! 무통 진료로 부담 없이 방문하세요.' },
    'default': '전문 치과에서 안전하고 효과적인 치료를 받아보세요.'
  },
  election: {
    '20대': { '학생': '청년의 꿈을 응원합니다! 일자리 창출과 주거 안정으로 희망찬 미래를 만들어 가겠습니다.', '직장인': '워라밸이 보장되는 일터를 만들겠습니다. 청년 직장인의 목소리에 귀 기울이겠습니다.', 'default': '청년이 행복한 도시! 여러분의 목소리로 변화를 만들어 갑니다.' },
    '30대': { '직장인': '일과 가정의 균형을 지원합니다. 육아휴직 활성화와 보육 시설 확충으로 함께 성장하는 사회를 만들겠습니다.', '주부': '안심하고 아이 키울 수 있는 환경을 만들겠습니다. 촘촘한 육아 지원 정책을 약속드립니다.', 'default': '30대 가정의 행복을 위해 실질적인 지원 정책을 펼치겠습니다.' },
    '40대': { 'default': '자녀 교육 걱정 없는 도시! 공교육 정상화와 교육 환경 개선에 최선을 다하겠습니다.' },
    '50대': { 'default': '인생 2막을 응원합니다! 중장년 재취업 지원과 평생교육 기회를 확대하겠습니다.' },
    '60대': { '은퇴자': '노후가 행복한 도시를 만들겠습니다. 어르신 복지 증진과 일자리 창출에 힘쓰겠습니다.', 'default': '건강하고 활기찬 노년을 위한 정책을 펼치겠습니다.' },
    'default': '주민 여러분의 목소리에 귀 기울이겠습니다. 실현 가능한 공약으로 지역 발전에 앞장서겠습니다.'
  },
  education: {
    '10대': { '학생': '내신과 수능을 한 번에! 체계적인 커리큘럼으로 목표 대학 합격을 도와드립니다.', 'default': '학생 개개인의 수준에 맞춘 1:1 맞춤 학습으로 성적 향상을 보장합니다.' },
    '20대': { '학생': '취업 경쟁력을 높이는 실무 중심 교육! 자격증 취득부터 포트폴리오까지 완벽 지원합니다.', '직장인': '퇴근 후 자기계발! 직장인 맞춤 야간/주말 강좌로 커리어 업그레이드하세요.', 'default': '20대의 무한한 가능성을 깨우는 맞춤형 교육 프로그램을 제공합니다.' },
    '30대': { '직장인': '바쁜 직장인도 할 수 있습니다! 온라인 병행 과정으로 시간과 장소의 제약 없이 학습하세요.', '주부': '육아와 병행 가능한 유연한 수업 스케줄! 엄마의 꿈도 포기하지 마세요.', 'default': '30대 커리어 전환을 위한 전문 교육 과정을 운영합니다.' },
    '40대': { '자영업자': '사업 성공을 위한 경영 노하우! 실전 중심 CEO 교육 과정을 만나보세요.', 'default': '인생 2막을 준비하는 40대를 위한 재교육 프로그램을 제공합니다.' },
    'default': '체계적인 커리큘럼으로 학습 목표 달성을 도와드립니다.'
  },
  realestate: {
    '20대': { '직장인': '사회초년생도 내집 마련 가능합니다! 청약 전략부터 대출 상담까지 원스톱으로 도와드립니다.', 'default': '20대 눈높이에 맞춘 부동산 컨설팅으로 첫 내집 마련을 응원합니다.' },
    '30대': { '직장인': '신혼집부터 학군 좋은 아파트까지! 라이프스타일에 맞는 최적의 매물을 추천해 드립니다.', '주부': '아이 키우기 좋은 환경, 꼼꼼히 따져보셨나요? 학군과 생활 인프라를 분석해 드립니다.', 'default': '30대 가정에 딱 맞는 주거 공간을 찾아드립니다.' },
    '40대': { '직장인': '자녀 교육과 출퇴근을 모두 고려한 최적의 입지! 맞춤 매물을 추천해 드립니다.', 'default': '갈아타기 적기입니다! 시세 분석과 투자 전략을 상담해 드립니다.' },
    '50대': { 'default': '은퇴 후를 대비한 수익형 부동산 투자! 안정적인 임대 수익을 설계해 드립니다.' },
    'default': '역세권 프리미엄 입지! 투자가치와 실거주 만족도를 모두 갖춘 최적의 선택을 안내해 드립니다.'
  },
  finance: {
    '20대': { '직장인': '첫 월급부터 시작하는 재테크! 적금, 펀드, 보험까지 사회초년생 맞춤 포트폴리오를 설계해 드립니다.', '학생': '용돈도 굴릴 수 있습니다! 소액으로 시작하는 재테크 습관을 만들어 드립니다.', 'default': '20대부터 시작하는 현명한 자산 관리! 미래를 위한 첫걸음을 함께합니다.' },
    '30대': { '직장인': '내집 마련과 노후 준비를 동시에! 30대 맞춤 자산 포트폴리오를 설계해 드립니다.', '주부': '생활비 절약하면서 목돈 만들기! 주부 맞춤 재테크 노하우를 알려드립니다.', 'default': '30대 황금기를 놓치지 마세요! 체계적인 자산 관리로 부자 되는 길을 안내합니다.' },
    '40대': { '자영업자': '사업자금과 개인자산 분리 관리! 절세 전략까지 한 번에 상담해 드립니다.', 'default': '자녀 교육비와 노후 자금, 두 마리 토끼를 잡는 전략을 제안합니다.' },
    '50대': { 'default': '은퇴 D-10년! 지금부터 준비하면 여유로운 노후가 가능합니다.' },
    '60대': { '은퇴자': '연금 수령 최적화 전략! 은퇴 자금을 안전하게 굴리는 방법을 알려드립니다.', 'default': '안정적인 노후를 위한 자산 관리! 원금 보장형 상품을 추천해 드립니다.' },
    'default': '전문 상담사가 고객님의 상황에 맞는 최적의 재테크 솔루션을 제안합니다.'
  },
  beauty: {
    '10대': { '학생': '사춘기 피부 고민 해결! 여드름 전문 케어로 자신감을 되찾아 드립니다.', 'default': '청소년 피부에 맞는 순한 성분으로 건강한 피부 습관을 만들어 드립니다.' },
    '20대': { '직장인': '퇴근 후 30분 관리로 피로한 피부를 케어하세요. 직장인 맞춤 스피드 관리를 제공합니다.', '학생': '가성비 좋은 학생 전용 프로그램! 부담 없이 피부 관리를 시작하세요.', 'default': '20대 피부 황금기를 유지하는 맞춤 케어 솔루션을 제안합니다.' },
    '30대': { '직장인': '스트레스와 피로에 지친 피부를 위한 집중 케어! 안티에이징의 골든타임을 놓치지 마세요.', '주부': '육아에 지친 피부도 회복할 수 있습니다! 엄마를 위한 힐링 케어를 경험하세요.', 'default': '30대부터 시작하는 안티에이징! 주름이 생기기 전에 예방하세요.' },
    '40대': { 'default': '40대 피부 고민 집중 케어! 탄력과 윤기를 되찾는 프리미엄 프로그램을 만나보세요.' },
    '50대': { 'default': '50대 피부도 아름다울 수 있습니다! 리프팅과 탄력 케어로 젊음을 되찾으세요.' },
    'default': '피부 전문가의 1:1 맞춤 케어로 건강한 피부를 선물합니다.'
  },
  food: {
    '10대': { '학생': '공부하는 우리 아이 두뇌 발달을 위한 영양 만점 식단! 맛있고 건강하게 먹여주세요.', 'default': '성장기 청소년에게 필요한 영양소를 골고루 담은 균형 잡힌 식단을 제공합니다.' },
    '20대': { '직장인': '바쁜 직장인을 위한 간편하고 건강한 한 끼! 도시락 정기 배송으로 점심 고민을 해결하세요.', '학생': '자취생 필수! 간편하게 조리해서 맛있게 먹는 건강 밀키트를 만나보세요.', 'default': '20대 입맛과 건강을 동시에 잡는 맛있는 식단을 제공합니다.' },
    '30대': { '직장인': '야근해도 건강하게! 늦은 밤에도 부담 없이 먹을 수 있는 건강 야식을 준비했습니다.', '주부': '온 가족이 맛있게 먹을 수 있는 건강 집밥! 식재료부터 레시피까지 제공합니다.', 'default': '30대 가정의 건강한 밥상을 책임집니다.' },
    '40대': { '자영업자': '바쁜 일상에도 건강을 챙기세요! 간편하게 먹는 영양 가득 건강식을 준비했습니다.', 'default': '40대 건강을 지키는 맛있는 습관! 성인병 예방 식단을 경험하세요.' },
    '50대': { 'default': '혈압, 혈당 관리가 필요한 50대를 위한 저염·저당 건강식을 제공합니다.' },
    '60대': { '은퇴자': '소화 잘 되고 영양 가득한 어르신 맞춤 건강식! 부드럽고 맛있게 드세요.', 'default': '60대 건강을 위한 맞춤 영양식을 정성껏 준비합니다.' },
    'default': '신선한 재료로 정성껏 만든 건강한 한 끼를 경험하세요.'
  },
  general: {
    'default': '고객님의 만족을 최우선으로 생각합니다. 믿을 수 있는 전문 서비스로 최상의 결과를 약속드립니다.'
  },
  custom: {
    'default': '차별화된 서비스와 전문성으로 고객님께 최고의 가치를 제공하겠습니다.'
  }
};

// 도메인별 이미지 키워드
const DOMAIN_IMAGE_KEYWORDS = {
  hospital: ['dental', 'medical', 'healthcare', 'clinic', 'doctor', 'smile', 'teeth'],
  election: ['politics', 'vote', 'community', 'people', 'city', 'government', 'future'],
  education: ['education', 'learning', 'student', 'book', 'classroom', 'study', 'growth'],
  general: ['business', 'technology', 'modern', 'lifestyle', 'success', 'office', 'team'],
  realestate: ['building', 'apartment', 'house', 'city', 'architecture', 'home', 'interior'],
  finance: ['finance', 'money', 'investment', 'business', 'growth', 'chart', 'savings'],
  beauty: ['beauty', 'skincare', 'spa', 'cosmetics', 'fashion', 'wellness', 'luxury'],
  food: ['food', 'restaurant', 'cooking', 'delicious', 'kitchen', 'chef', 'dining'],
  custom: ['business', 'professional', 'service', 'quality', 'modern', 'success', 'team']
};

// 카드 타입별 이미지 키워드
const CARD_TYPE_IMAGE_KEYWORDS = {
  HOOK: ['attention', 'surprise', 'question', 'curious'],
  EMPATHY: ['understanding', 'emotion', 'care', 'support'],
  PROBLEM: ['challenge', 'problem', 'concern', 'issue'],
  SOLUTION: ['solution', 'success', 'help', 'answer'],
  CTA: ['action', 'contact', 'start', 'call']
};

// 도메인별 규칙
const DOMAIN_RULES = {
  hospital: {
    displayName: '병원/의료',
    forbiddenWords: ['100% 완치', '기적', '최고', '최초', '유일', '확실한 효과', '부작용 없음', '절대', '무조건'],
    recommendedWords: ['전문', '맞춤', '상담', '안전', '신뢰', '케어', '건강', '정기 검진', '예방', '관리'],
    toneGuide: '신뢰감 있고 전문적인 톤. 과장 표현 없이 사실 기반으로 작성.',
    maxLength: { title: 20, content: 80 }
  },
  election: {
    displayName: '선거/정치',
    forbiddenWords: ['확실한 당선', '무조건', '거짓말', '비방', '특정 정당 비하', '혐오', '선동'],
    recommendedWords: ['공약', '비전', '변화', '미래', '함께', '시민', '발전', '소통', '참여', '희망'],
    toneGuide: '희망적이고 신뢰감 있는 톤. 긍정적인 비전 제시 중심.',
    maxLength: { title: 15, content: 60 }
  },
  education: {
    displayName: '교육',
    forbiddenWords: ['100% 합격', '무조건', '기적', '천재', '확실한', '실패 없는'],
    recommendedWords: ['성장', '발전', '학습', '미래', '가능성', '도전', '역량', '창의', '사고력', '문제 해결'],
    toneGuide: '긍정적이고 동기부여가 되는 톤. 학습자 중심의 표현 사용.',
    maxLength: { title: 20, content: 70 }
  },
  general: {
    displayName: '일반',
    forbiddenWords: ['무조건', '100%', '확실한', '절대', '기적'],
    recommendedWords: ['함께', '새로운', '특별한', '쉽게', '빠르게', '효과적', '스마트', '편리'],
    toneGuide: '친근하고 이해하기 쉬운 톤. 대중적인 표현 사용.',
    maxLength: { title: 20, content: 80 }
  },
  realestate: {
    displayName: '부동산',
    forbiddenWords: ['확정 수익', '무조건 상승', '100% 보장', '절대 손해없음', '투기'],
    recommendedWords: ['입지', '투자가치', '교통', '학군', '편의시설', '미래가치', '프리미엄', '생활환경', '개발호재', '시세'],
    toneGuide: '신뢰감 있고 전문적인 톤. 객관적인 정보 제공 중심.',
    maxLength: { title: 20, content: 80 }
  },
  finance: {
    displayName: '금융/보험',
    forbiddenWords: ['확정 수익', '무조건', '100% 보장', '원금 보장', '손해 없음'],
    recommendedWords: ['안정', '수익', '보장', '절세', '노후준비', '자산관리', '맞춤설계', '전문상담', '보험료', '혜택'],
    toneGuide: '신뢰감 있고 전문적인 톤. 정확한 정보와 안정성 강조.',
    maxLength: { title: 20, content: 80 }
  },
  beauty: {
    displayName: '뷰티/미용',
    forbiddenWords: ['100% 효과', '기적', '완벽한', '부작용 없음', '영구적'],
    recommendedWords: ['자연스러운', '맞춤케어', '피부관리', '트렌드', '전문가', '프리미엄', '안전한', '효과적', '뷰티', '관리'],
    toneGuide: '세련되고 트렌디한 톤. 자연스러운 아름다움 강조.',
    maxLength: { title: 20, content: 80 }
  },
  food: {
    displayName: '음식/요식업',
    forbiddenWords: ['최고', '유일', '세계 1위', '무조건'],
    recommendedWords: ['신선한', '정성', '맛집', '특별한', '프리미엄', '수제', '건강한', '인기', '추천', '분위기'],
    toneGuide: '친근하고 맛있는 느낌의 톤. 감성적인 표현 사용.',
    maxLength: { title: 20, content: 80 }
  }
};

// 카드 타입 정보
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

// 톤 설명
const TONE_MAP = {
  formal: '격식 있고 전문적인',
  friendly: '친근하고 따뜻한',
  urgent: '긴급하고 강조하는',
  professional: '전문적이고 신뢰감 있는'
};

// ============================================
// 초기화
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  // Supabase 초기화 후 API 키 로드
  initCardnewsSupabase();
  apiKey = await loadApiKeyFromSupabase();

  if (apiKey) {
    document.getElementById('api-key-input').value = apiKey;
    showApiKeyStatus('API 키가 저장되어 있습니다.', 'success');
  } else {
    showApiKeyStatus('Gemini API 키를 입력해주세요.', 'warning');
  }

  // 폼 제출 이벤트
  document.getElementById('cardnews-form').addEventListener('submit', handleSubmit);

  // 초기 키워드 버튼 생성
  updateKeywordButtons();

  // 초기 주제 placeholder 설정
  updateTopicPlaceholder();

  // 초기 핵심 메시지 placeholder 설정
  updateMessagePlaceholder();

  // 업체 정보 배지 초기화
  updateBusinessCountBadge();

  // 광고 콘텐츠에서 전달된 데이터가 있으면 자동 채우기
  loadPrefillData();
});

/**
 * 광고 콘텐츠에서 전달된 데이터로 폼 자동 채우기
 */
function loadPrefillData() {
  const prefillDataStr = localStorage.getItem('cardnews_prefill_data');
  if (!prefillDataStr) return;

  try {
    const prefillData = JSON.parse(prefillDataStr);

    // 데이터 사용 후 삭제 (일회성)
    localStorage.removeItem('cardnews_prefill_data');

    // 광고 콘텐츠에서 온 것인지 확인
    if (!prefillData.fromAdContent) return;

    // 폼 필드 자동 채우기
    if (prefillData.topic) {
      document.getElementById('topic').value = prefillData.topic;
    }
    if (prefillData.mainMessage) {
      document.getElementById('main-message').value = prefillData.mainMessage;
    }
    if (prefillData.businessName) {
      document.getElementById('business-name').value = prefillData.businessName;
    }
    if (prefillData.contactNumber) {
      document.getElementById('contact-number').value = prefillData.contactNumber;
    }

    // 도메인 선택
    if (prefillData.domain) {
      selectDomain(prefillData.domain);
    }

    // 안내 메시지 표시
    showPrefillNotice();

  } catch (e) {
    console.error('Prefill data parsing error:', e);
  }
}

/**
 * 광고 콘텐츠에서 데이터가 전달되었음을 알리는 메시지 표시
 */
function showPrefillNotice() {
  const formSection = document.getElementById('form-section');
  if (!formSection) return;

  const notice = document.createElement('div');
  notice.className = 'glass-card rounded-2xl shadow-xl p-4 mb-6 animate-fadeIn';
  notice.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  notice.innerHTML = `
    <div class="flex items-center gap-3 text-white">
      <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <div>
        <p class="font-bold">광고 콘텐츠에서 데이터를 가져왔습니다</p>
        <p class="text-sm opacity-90">필요한 부분을 수정한 후 카드뉴스를 생성하세요</p>
      </div>
    </div>
  `;
  formSection.insertBefore(notice, formSection.firstChild);
}

// 선택된 연령대와 직업군
let selectedAge = '30대';
let selectedJob = '직장인';
let selectedKeywords = [];

// 도메인별 기본 키워드
const DOMAIN_KEYWORDS = {
  hospital: ['전문치료', '안전', '최신장비', '무통시술', '맞춤케어', '정기검진', '예방치료', '자연스러운'],
  election: ['변화', '희망', '미래', '소통', '공약실천', '시민참여', '지역발전', '신뢰'],
  education: ['성장', '미래인재', '창의력', '맞춤학습', '실력향상', '자기주도', '문제해결', '역량강화'],
  general: ['혁신', '편리함', '가성비', '프리미엄', '트렌드', '스마트', '효율적', '신뢰'],
  realestate: ['입지조건', '투자가치', '교통편리', '학군우수', '개발호재', '미래가치', '생활인프라', '시세상승'],
  finance: ['안정수익', '노후준비', '절세혜택', '맞춤설계', '자산관리', '보장내용', '전문상담', '월납입'],
  beauty: ['자연스러운', '피부관리', '맞춤케어', '트렌드', '프리미엄', '전문가', '안전시술', '효과만족'],
  food: ['신선재료', '정성가득', '맛집추천', '분위기좋은', '프리미엄', '수제음식', '건강식단', '인기메뉴'],
  custom: ['전문성', '신뢰', '품질', '서비스', '맞춤', '프리미엄', '효과', '만족']
};

// 연령대별 추가 키워드
const AGE_KEYWORDS = {
  '10대': ['학업', '성장기', '교정', '예방'],
  '20대': ['취업', '자기관리', '외모', '가성비'],
  '30대': ['직장생활', '건강관리', '시간절약', '전문성'],
  '40대': ['가족건강', '노후준비', '신뢰', '품질'],
  '50대': ['건강회복', '관리', '경험', '안정'],
  '60대': ['건강유지', '편안함', '꼼꼼함', '배려'],
  '70대': ['건강관리', '편리함', '안심', '케어']
};

// 직업군별 추가 키워드
const JOB_KEYWORDS = {
  '직장인': ['점심시간', '야간진료', '빠른치료', '직장근처'],
  '자영업자': ['시간유연', '비용효율', '단골혜택', '빠른회복'],
  '주부': ['가족케어', '주간시간', '꼼꼼상담', '가격대비'],
  '학생': ['학생할인', '방학기간', '빠른치료', '부담없는'],
  '프리랜서': ['유연예약', '시간절약', '온라인상담', '효율적'],
  '은퇴자': ['충분한상담', '정기관리', '편안함', '친절'],
  '전문직': ['프리미엄', '최신기술', '맞춤서비스', '시간효율']
};

// ============================================
// 도메인 선택
// ============================================
// 현재 커스텀 도메인명 저장
let customDomainName = '';

function selectDomain(domain) {
  // hidden input 값 업데이트
  document.getElementById('domain').value = domain;

  // 모든 버튼 스타일 초기화
  document.querySelectorAll('.domain-btn').forEach(btn => {
    btn.classList.remove('border-emerald-500', 'bg-emerald-500', 'text-white', 'shadow-md');
    btn.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
  });

  // 직접입력 버튼 기본 스타일 복원
  const customBtn = document.getElementById('domain-btn-custom');
  if (customBtn && domain !== 'custom') {
    customBtn.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');
    customBtn.classList.add('border-dashed', 'border-emerald-400', 'bg-emerald-50', 'text-emerald-600');
  }

  // 선택된 버튼 스타일 적용
  const selectedBtn = document.getElementById(`domain-btn-${domain}`);
  if (selectedBtn) {
    selectedBtn.classList.remove('border-slate-200', 'bg-white', 'text-slate-600', 'border-dashed', 'border-emerald-400', 'bg-emerald-50', 'text-emerald-600');
    selectedBtn.classList.add('border-emerald-500', 'bg-emerald-500', 'text-white', 'shadow-md');
  }

  // 직접입력 선택 시 입력창 표시
  const customInputWrap = document.getElementById('custom-domain-input-wrap');
  if (domain === 'custom') {
    customInputWrap.classList.remove('hidden');
  } else {
    customInputWrap.classList.add('hidden');
  }

  // 주제 입력란 placeholder 업데이트 (도메인+타겟 기반)
  updateTopicPlaceholder();

  // 핵심 메시지 입력란 placeholder 업데이트 (도메인+타겟 기반)
  updateMessagePlaceholder();

  // 업체명 입력란 placeholder 업데이트
  const businessInput = document.getElementById('business-name');
  if (businessInput) {
    businessInput.placeholder = DOMAIN_BUSINESS_EXAMPLES[domain] || DOMAIN_BUSINESS_EXAMPLES.general;
  }

  // 연락처 입력란 placeholder 업데이트
  const contactInput = document.getElementById('contact-number');
  if (contactInput) {
    contactInput.placeholder = DOMAIN_CONTACT_EXAMPLES[domain] || DOMAIN_CONTACT_EXAMPLES.general;
  }

  // 키워드 버튼 업데이트
  updateKeywordButtons();
}

// 커스텀 도메인 적용
function applyCustomDomain() {
  const input = document.getElementById('custom-domain-input');
  const domainName = input.value.trim();

  if (!domainName) {
    alert('도메인명을 입력해주세요.');
    return;
  }

  customDomainName = domainName;

  // custom 도메인 규칙 동적 업데이트
  DOMAIN_RULES.custom = {
    displayName: domainName,
    forbiddenWords: ['무조건', '100%', '확실한', '절대', '기적'],
    recommendedWords: ['전문', '신뢰', '품질', '서비스', '맞춤', '프리미엄', '효과', '만족'],
    toneGuide: '친근하고 전문적인 톤.',
    maxLength: { title: 20, content: 80 }
  };

  // custom 키워드도 업데이트
  DOMAIN_KEYWORDS.custom = ['전문성', '신뢰', '품질', '서비스', '맞춤', '프리미엄', '효과', '만족'];

  // 버튼 텍스트 변경
  const customBtn = document.getElementById('domain-btn-custom');
  if (customBtn) {
    customBtn.textContent = domainName;
  }

  // 키워드 버튼 업데이트
  updateKeywordButtons();

  alert(`"${domainName}" 도메인이 적용되었습니다.`);
}

// ============================================
// 톤앤매너 선택
// ============================================
let customToneName = '';

function selectTone(tone) {
  // hidden input 값 업데이트
  document.getElementById('tone').value = tone;

  // 모든 버튼 스타일 초기화
  document.querySelectorAll('.tone-btn').forEach(btn => {
    btn.classList.remove('border-slate-600', 'bg-slate-600', 'text-white', 'shadow-md');
    btn.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
  });

  // 직접입력 버튼 기본 스타일 복원
  const customBtn = document.getElementById('tone-btn-custom');
  if (customBtn && tone !== 'custom') {
    customBtn.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');
    customBtn.classList.add('border-dashed', 'border-slate-400', 'bg-slate-100', 'text-slate-500');
  }

  // 선택된 버튼 스타일 적용
  const selectedBtn = document.getElementById(`tone-btn-${tone}`);
  if (selectedBtn) {
    selectedBtn.classList.remove('border-slate-200', 'bg-white', 'text-slate-600', 'border-dashed', 'border-slate-400', 'bg-slate-100', 'text-slate-500');
    selectedBtn.classList.add('border-slate-600', 'bg-slate-600', 'text-white', 'shadow-md');
  }

  // 직접입력 선택 시 입력창 표시
  const customInputWrap = document.getElementById('custom-tone-input-wrap');
  if (tone === 'custom') {
    customInputWrap.classList.remove('hidden');
  } else {
    customInputWrap.classList.add('hidden');
  }
}

// 커스텀 톤앤매너 적용
function applyCustomTone() {
  const input = document.getElementById('custom-tone-input');
  const toneName = input.value.trim();

  if (!toneName) {
    alert('톤앤매너를 입력해주세요.');
    return;
  }

  customToneName = toneName;

  // TONE_MAP에 커스텀 톤 추가
  TONE_MAP.custom = toneName;

  // 버튼 텍스트 변경
  const customBtn = document.getElementById('tone-btn-custom');
  if (customBtn) {
    customBtn.textContent = toneName;
  }

  alert(`"${toneName}" 톤앤매너가 적용되었습니다.`);
}

// ============================================
// 연령대 선택
// ============================================
function selectAge(age) {
  selectedAge = age;
  updateTargetAudience();

  // 모든 버튼 스타일 초기화
  document.querySelectorAll('.age-btn').forEach(btn => {
    btn.classList.remove('border-violet-500', 'bg-violet-500', 'text-white', 'shadow-md');
    btn.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
  });

  // 선택된 버튼 스타일 적용
  const selectedBtn = document.getElementById(`age-btn-${age}`);
  if (selectedBtn) {
    selectedBtn.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');
    selectedBtn.classList.add('border-violet-500', 'bg-violet-500', 'text-white', 'shadow-md');
  }
}

// ============================================
// 직업군 선택
// ============================================
let customJobName = '';

function selectJob(job) {
  selectedJob = job === 'custom' ? (customJobName || '직접입력') : job;
  updateTargetAudience();

  // 모든 버튼 스타일 초기화
  document.querySelectorAll('.job-btn').forEach(btn => {
    btn.classList.remove('border-purple-500', 'bg-purple-500', 'text-white', 'shadow-md');
    btn.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
  });

  // 직접입력 버튼 기본 스타일 복원
  const customBtn = document.getElementById('job-btn-custom');
  if (customBtn && job !== 'custom') {
    customBtn.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');
    customBtn.classList.add('border-dashed', 'border-purple-400', 'bg-purple-50', 'text-purple-600');
  }

  // 선택된 버튼 스타일 적용
  const selectedBtn = document.getElementById(`job-btn-${job}`);
  if (selectedBtn) {
    selectedBtn.classList.remove('border-slate-200', 'bg-white', 'text-slate-600', 'border-dashed', 'border-purple-400', 'bg-purple-50', 'text-purple-600');
    selectedBtn.classList.add('border-purple-500', 'bg-purple-500', 'text-white', 'shadow-md');
  }

  // 직접입력 선택 시 입력창 표시
  const customInputWrap = document.getElementById('custom-job-input-wrap');
  if (job === 'custom') {
    customInputWrap.classList.remove('hidden');
  } else {
    customInputWrap.classList.add('hidden');
  }
}

// 커스텀 직업군 적용
function applyCustomJob() {
  const input = document.getElementById('custom-job-input');
  const jobName = input.value.trim();

  if (!jobName) {
    alert('직업군을 입력해주세요.');
    return;
  }

  customJobName = jobName;
  selectedJob = jobName;

  // JOB_KEYWORDS에 커스텀 직업 추가
  JOB_KEYWORDS[jobName] = ['맞춤서비스', '전문상담', '편리함', '효율적'];

  // 버튼 텍스트 변경
  const customBtn = document.getElementById('job-btn-custom');
  if (customBtn) {
    customBtn.textContent = jobName;
  }

  // 타겟 대상 및 키워드 업데이트
  updateTargetAudience();

  alert(`"${jobName}" 직업군이 적용되었습니다.`);
}

// ============================================
// 타겟 대상 업데이트
// ============================================
function updateTargetAudience() {
  const targetAudience = `${selectedAge} ${selectedJob}`;
  document.getElementById('target-audience').value = targetAudience;
  // 키워드 업데이트
  updateKeywordButtons();
  // 주제 placeholder 업데이트
  updateTopicPlaceholder();
  // 핵심 메시지 placeholder 업데이트
  updateMessagePlaceholder();
}

// ============================================
// 주제 placeholder 업데이트 (도메인+타겟 기반)
// ============================================
function updateTopicPlaceholder() {
  const domain = document.getElementById('domain').value;
  const topicInput = document.getElementById('topic');

  if (!topicInput) return;

  // 도메인별 타겟 예시 가져오기
  const domainTopics = DOMAIN_TARGET_TOPIC_EXAMPLES[domain] || DOMAIN_TARGET_TOPIC_EXAMPLES.general;

  // 연령대별 예시 찾기
  const ageTopics = domainTopics[selectedAge] || domainTopics['default'] || {};

  // 직업군별 예시 찾기
  let topicExample;
  if (typeof ageTopics === 'string') {
    topicExample = ageTopics;
  } else {
    topicExample = ageTopics[selectedJob] || ageTopics['default'] || domainTopics['default'] || '주제를 입력하세요';
  }

  topicInput.placeholder = topicExample;
}

// ============================================
// 핵심 메시지 placeholder 업데이트 (도메인+타겟 기반)
// ============================================
function updateMessagePlaceholder() {
  const domain = document.getElementById('domain').value;
  const messageInput = document.getElementById('main-message');

  if (!messageInput) return;

  // 도메인별 타겟 예시 가져오기
  const domainMessages = DOMAIN_TARGET_MESSAGE_EXAMPLES[domain] || DOMAIN_TARGET_MESSAGE_EXAMPLES.general;

  // 연령대별 예시 찾기
  const ageMessages = domainMessages[selectedAge] || domainMessages['default'] || {};

  // 직업군별 예시 찾기
  let messageExample;
  if (typeof ageMessages === 'string') {
    messageExample = ageMessages;
  } else {
    messageExample = ageMessages[selectedJob] || ageMessages['default'] || domainMessages['default'] || '핵심 메시지를 입력하세요';
  }

  messageInput.placeholder = messageExample;
}

// ============================================
// 키워드 버튼 업데이트
// ============================================
function updateKeywordButtons() {
  const domain = document.getElementById('domain').value;

  // 도메인, 연령대, 직업군에서 키워드 조합
  const domainKw = DOMAIN_KEYWORDS[domain] || DOMAIN_KEYWORDS.general;
  const ageKw = AGE_KEYWORDS[selectedAge] || [];
  const jobKw = JOB_KEYWORDS[selectedJob] || [];

  // 키워드 조합 (중복 제거, 6개 선택)
  const allKeywords = [...new Set([...domainKw.slice(0, 3), ...ageKw.slice(0, 2), ...jobKw.slice(0, 2)])];
  const displayKeywords = allKeywords.slice(0, 6);

  // 선택된 키워드 초기화 (새 키워드 목록에 없는 것 제거)
  selectedKeywords = selectedKeywords.filter(kw => displayKeywords.includes(kw));

  // 버튼 생성
  const container = document.getElementById('keyword-buttons');
  container.innerHTML = displayKeywords.map(keyword => {
    const isSelected = selectedKeywords.includes(keyword);
    const selectedClass = isSelected
      ? 'border-cyan-500 bg-cyan-500 text-white shadow-md'
      : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:bg-cyan-50';
    return `
      <button
        type="button"
        onclick="toggleKeyword('${keyword}')"
        id="keyword-btn-${keyword}"
        class="keyword-btn select-btn px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${selectedClass}"
      >
        ${keyword}
      </button>
    `;
  }).join('');

  // hidden input 업데이트
  document.getElementById('keywords').value = selectedKeywords.join(', ');
}

// ============================================
// 키워드 토글 (선택/해제)
// ============================================
function toggleKeyword(keyword) {
  const index = selectedKeywords.indexOf(keyword);
  if (index > -1) {
    // 이미 선택됨 -> 해제
    selectedKeywords.splice(index, 1);
  } else {
    // 선택 추가
    selectedKeywords.push(keyword);
  }

  // 버튼 스타일 업데이트
  const btn = document.getElementById(`keyword-btn-${keyword}`);
  if (btn) {
    if (selectedKeywords.includes(keyword)) {
      btn.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');
      btn.classList.add('border-cyan-500', 'bg-cyan-500', 'text-white', 'shadow-md');
    } else {
      btn.classList.remove('border-cyan-500', 'bg-cyan-500', 'text-white', 'shadow-md');
      btn.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
    }
  }

  // hidden input 업데이트
  document.getElementById('keywords').value = selectedKeywords.join(', ');
}

// ============================================
// 커스텀 키워드 추가
// ============================================
function addCustomKeyword() {
  const input = document.getElementById('custom-keyword-input');
  const keyword = input.value.trim();

  if (!keyword) return;

  // 이미 선택된 키워드인지 확인
  if (selectedKeywords.includes(keyword)) {
    input.value = '';
    return;
  }

  // 키워드 추가
  selectedKeywords.push(keyword);

  // 버튼 컨테이너에 새 버튼 추가
  const container = document.getElementById('keyword-buttons');
  const newBtn = document.createElement('button');
  newBtn.type = 'button';
  newBtn.id = `keyword-btn-${keyword}`;
  newBtn.className = 'keyword-btn select-btn px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 border-cyan-500 bg-cyan-500 text-white shadow-md';
  newBtn.textContent = keyword;
  newBtn.onclick = () => toggleKeyword(keyword);
  container.appendChild(newBtn);

  // hidden input 업데이트
  document.getElementById('keywords').value = selectedKeywords.join(', ');

  // 입력창 초기화
  input.value = '';
}

// ============================================
// API 키 관리
// ============================================
async function saveApiKey() {
  const input = document.getElementById('api-key-input');
  apiKey = input.value.trim();

  if (!apiKey) {
    showApiKeyStatus('API 키를 입력해주세요.', 'error');
    return;
  }

  const saved = await saveApiKeyToSupabase(apiKey);
  if (saved) {
    showApiKeyStatus('API 키가 저장되었습니다.', 'success');
  } else {
    showApiKeyStatus('API 키 저장에 실패했습니다.', 'error');
  }
}

function showApiKeyStatus(message, type) {
  const status = document.getElementById('api-key-status');
  status.textContent = message;
  const colorClass = type === 'success' ? 'text-green-600' : type === 'warning' ? 'text-amber-600' : 'text-red-600';
  status.className = `text-sm mt-2 ${colorClass}`;
  status.classList.remove('hidden');
}

// ============================================
// 폼 제출 핸들러
// ============================================
async function handleSubmit(e) {
  e.preventDefault();

  if (!apiKey) {
    showError('먼저 Gemini API 키를 설정해주세요.');
    return;
  }

  const businessName = document.getElementById('business-name').value.trim();
  const contactNumber = document.getElementById('contact-number').value.trim();
  const domain = document.getElementById('domain').value;
  const topic = document.getElementById('topic').value.trim();
  const targetAudience = document.getElementById('target-audience').value.trim();
  const mainMessage = document.getElementById('main-message').value.trim();
  const keywords = document.getElementById('keywords').value.trim();
  const tone = document.getElementById('tone').value;

  if (!businessName || !contactNumber || !topic || !targetAudience || !mainMessage) {
    showError('필수 항목을 모두 입력해주세요.');
    return;
  }

  // 전역 변수에 저장
  currentBusinessName = businessName;
  currentContactNumber = contactNumber;

  // 로딩 상태
  setLoading(true);
  hideError();

  try {
    // 카드 생성
    const cards = await generateCards({
      domain,
      topic,
      targetAudience,
      mainMessage,
      keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
      tone
    });

    currentCards = cards;
    currentDomain = domain;

    // 품질 점수 계산
    const qualityScore = calculateQualityScore(cards, { domain });

    // 업체 정보 자동 저장 (업체명, 연락처, 도메인만)
    saveBusinessInfo({
      businessName,
      contactNumber,
      domain
    });

    // 결과 표시
    displayResults(cards, qualityScore);

  } catch (error) {
    showError(error.message || 'AI 생성 중 오류가 발생했습니다.');
  } finally {
    setLoading(false);
  }
}

// ============================================
// Gemini API 호출
// ============================================
async function generateCards(input) {
  const rule = DOMAIN_RULES[input.domain];
  const toneDescription = TONE_MAP[input.tone] || '자연스러운';

  const prompt = `당신은 카드뉴스 콘텐츠 전문가입니다. 다음 정보를 바탕으로 5장의 카드뉴스 콘텐츠를 생성해주세요.

## 입력 정보
- 도메인: ${rule.displayName}
- 주제: ${input.topic}
- 타겟 대상: ${input.targetAudience}
- 핵심 메시지: ${input.mainMessage}
${input.keywords.length ? `- 키워드: ${input.keywords.join(', ')}` : ''}
- 톤앤매너: ${toneDescription}

## 도메인 가이드라인
- 톤 가이드: ${rule.toneGuide}
- 권장 단어: ${rule.recommendedWords.join(', ')}
- 금지 단어 (절대 사용 금지): ${rule.forbiddenWords.join(', ')}
- 제목 최대 길이: ${rule.maxLength.title}자
- 본문 최대 길이: ${rule.maxLength.content}자

## 5장 구조 (반드시 이 순서로 작성)
1. HOOK (관심 유도): 독자의 시선을 사로잡는 질문이나 놀라운 사실
2. EMPATHY (공감 형성): 타겟 대상의 고민이나 상황에 공감 표현
3. PROBLEM (문제 제기): 해결해야 할 문제나 니즈를 명확히 제시
4. SOLUTION (해결책 제시): 주제와 관련된 해결책이나 가치 제안
5. CTA (행동 유도): 구체적인 다음 행동 유도 (문의, 방문, 신청 등)

## 출력 형식 (반드시 이 JSON 형식으로만 응답)
{
  "cards": [
    {
      "type": "HOOK",
      "title": "제목 (${rule.maxLength.title}자 이내)",
      "content": "본문 내용 (${rule.maxLength.content}자 이내)",
      "subContent": "추가 설명 (선택사항)"
    },
    {
      "type": "EMPATHY",
      "title": "제목",
      "content": "본문 내용"
    },
    {
      "type": "PROBLEM",
      "title": "제목",
      "content": "본문 내용"
    },
    {
      "type": "SOLUTION",
      "title": "제목",
      "content": "본문 내용"
    },
    {
      "type": "CTA",
      "title": "제목",
      "content": "본문 내용",
      "subContent": "연락처나 추가 정보"
    }
  ]
}

반드시 위 JSON 형식으로만 응답하고, 다른 텍스트는 포함하지 마세요.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048
        }
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'API 호출 실패');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('AI 응답이 비어 있습니다.');
  }

  // JSON 추출
  let jsonStr = text;

  // 마크다운 코드 블록 제거 (여러 형식 지원)
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  } else {
    // { 로 시작하는 JSON 찾기
    const jsonStartIndex = text.indexOf('{');
    const jsonEndIndex = text.lastIndexOf('}');
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      jsonStr = text.substring(jsonStartIndex, jsonEndIndex + 1);
    }
  }

  // JSON 정리 (일반적인 오류 수정)
  jsonStr = jsonStr.trim();
  // trailing comma 제거 (배열/객체 끝의 불필요한 쉼표)
  jsonStr = jsonStr.replace(/,\s*}/g, '}');
  jsonStr = jsonStr.replace(/,\s*]/g, ']');
  // 줄바꿈 문자 정리
  jsonStr = jsonStr.replace(/[\r\n]+/g, ' ');
  // 연속 공백 제거
  jsonStr = jsonStr.replace(/\s+/g, ' ');

  console.log('Extracted JSON:', jsonStr); // 디버깅용

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (parseError) {
    console.error('JSON Parse Error:', parseError);
    console.error('Raw text:', text);
    throw new Error('AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.');
  }

  if (!parsed.cards || !Array.isArray(parsed.cards) || parsed.cards.length !== 5) {
    throw new Error('카드 데이터 형식이 올바르지 않습니다.');
  }

  // 타입 매핑
  return parsed.cards.map((card, index) => ({
    type: CARD_TYPES[index],
    title: card.title || '',
    content: card.content || '',
    subContent: card.subContent || ''
  }));
}

// ============================================
// 품질 점수 계산
// ============================================
function calculateQualityScore(cards, input) {
  const feedback = [];
  const rule = DOMAIN_RULES[input.domain];

  // 1. HOOK 강도 (25점)
  let hookStrength = 25;
  const hookCard = cards.find(c => c.type === 'HOOK');
  if (hookCard) {
    if (!hookCard.title.includes('?') && !hookCard.title.includes('!')) {
      hookStrength -= 5;
      feedback.push('HOOK 제목에 질문이나 감탄문을 추가하면 더 효과적입니다.');
    }
    if (hookCard.title.length > rule.maxLength.title) {
      hookStrength -= 5;
      feedback.push('HOOK 제목이 너무 깁니다.');
    }
    if (hookCard.content.length < 20) {
      hookStrength -= 5;
      feedback.push('HOOK 본문이 너무 짧습니다.');
    }
  } else {
    hookStrength = 0;
    feedback.push('HOOK 카드가 없습니다.');
  }

  // 2. 흐름 일관성 (25점)
  let flowCoherence = 25;
  const expectedFlow = CARD_TYPES;
  const actualFlow = cards.map(c => c.type);
  for (let i = 0; i < expectedFlow.length; i++) {
    if (actualFlow[i] !== expectedFlow[i]) {
      flowCoherence -= 5;
    }
  }
  if (flowCoherence < 25) {
    feedback.push('카드 흐름 순서가 권장 구조와 다릅니다.');
  }

  // 3. CTA 명확성 (25점)
  let ctaClarity = 25;
  const ctaCard = cards.find(c => c.type === 'CTA');
  if (ctaCard) {
    const actionWords = ['문의', '연락', '방문', '신청', '시작', '확인', '예약', '상담'];
    const hasActionWord = actionWords.some(word =>
      ctaCard.title.includes(word) || ctaCard.content.includes(word)
    );
    if (!hasActionWord) {
      ctaClarity -= 10;
      feedback.push('CTA에 구체적인 행동 유도 문구를 추가하세요.');
    }
    if (!ctaCard.subContent) {
      ctaClarity -= 5;
      feedback.push('CTA에 연락처나 추가 정보를 포함하면 좋습니다.');
    }
  } else {
    ctaClarity = 0;
    feedback.push('CTA 카드가 없습니다.');
  }

  // 4. 도메인 적합성 (25점)
  let domainRelevance = 25;
  for (const card of cards) {
    for (const word of rule.forbiddenWords) {
      if (card.title.includes(word) || card.content.includes(word)) {
        domainRelevance -= 5;
        feedback.push(`금지어 사용: "${word}"`);
      }
    }
  }

  const allText = cards.map(c => `${c.title} ${c.content}`).join(' ');
  const usedRecommendedWords = rule.recommendedWords.filter(word => allText.includes(word));
  if (usedRecommendedWords.length < 2) {
    domainRelevance -= 5;
    feedback.push('도메인 관련 권장 단어를 더 활용해보세요.');
  }

  // 점수 보정
  hookStrength = Math.max(0, hookStrength);
  flowCoherence = Math.max(0, flowCoherence);
  ctaClarity = Math.max(0, ctaClarity);
  domainRelevance = Math.max(0, domainRelevance);

  const overall = hookStrength + flowCoherence + ctaClarity + domainRelevance;

  // 긍정적 피드백
  if (overall >= 90) {
    feedback.unshift('훌륭한 카드뉴스입니다!');
  } else if (overall >= 70) {
    feedback.unshift('좋은 품질의 카드뉴스입니다.');
  } else if (overall >= 50) {
    feedback.unshift('개선이 필요한 부분이 있습니다.');
  }

  return {
    overall,
    hookStrength,
    flowCoherence,
    ctaClarity,
    domainRelevance,
    feedback: [...new Set(feedback)]
  };
}

// ============================================
// 결과 표시
// ============================================
function displayResults(cards, qualityScore) {
  // sessionStorage에 결과 데이터 저장 후 결과 페이지로 이동
  const resultData = {
    cards: cards,
    qualityScore: qualityScore,
    businessName: currentBusinessName,
    contactNumber: currentContactNumber,
    domain: currentDomain
  };
  sessionStorage.setItem('cardnews_result', JSON.stringify(resultData));
  window.location.href = 'cardnews_results.html';
}

// ============================================
// 유틸리티 함수
// ============================================

function setLoading(isLoading) {
  const btn = document.getElementById('generate-btn');
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div><span>AI가 생성 중입니다...</span>';
  } else {
    btn.disabled = false;
    btn.innerHTML = '<span>카드뉴스 생성하기</span>';
  }
}

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}

function hideError() {
  document.getElementById('error-message').classList.add('hidden');
}

function resetForm() {
  document.getElementById('form-section').classList.remove('hidden');
  document.getElementById('api-key-section').classList.remove('hidden');
  currentCards = [];
  currentCardIndex = 0;
}

// ============================================
// 홈으로 이동
// ============================================
function goHome() {
  resetForm();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// 업체 정보 패널 관리
// ============================================
function openBusinessInfoPanel() {
  const panel = document.getElementById('business-info-panel');
  const content = document.getElementById('business-panel-content');

  panel.classList.remove('hidden');
  // 애니메이션을 위해 약간의 지연 후 슬라이드
  setTimeout(() => {
    content.classList.remove('translate-x-full');
  }, 10);

  // 업체 정보 목록 렌더링
  renderBusinessInfoList();
}

function closeBusinessInfoPanel() {
  const panel = document.getElementById('business-info-panel');
  const content = document.getElementById('business-panel-content');

  content.classList.add('translate-x-full');
  setTimeout(() => {
    panel.classList.add('hidden');
  }, 300);
}

// ============================================
// 업체 정보 저장
// ============================================
function saveBusinessInfo(businessData) {
  // 중복 체크 (같은 업체명이 있으면 업데이트)
  const existingIndex = savedBusinessInfoList.findIndex(
    item => item.businessName === businessData.businessName
  );

  if (existingIndex > -1) {
    // 기존 정보 업데이트
    savedBusinessInfoList[existingIndex] = {
      ...savedBusinessInfoList[existingIndex],
      ...businessData,
      updatedAt: new Date().toISOString()
    };
  } else {
    // 새 정보 추가
    savedBusinessInfoList.unshift({
      id: Date.now().toString(),
      ...businessData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // localStorage에 저장
  localStorage.setItem('saved_business_info', JSON.stringify(savedBusinessInfoList));

  // 배지 업데이트
  updateBusinessCountBadge();
}

// ============================================
// 업체 정보 목록 렌더링
// ============================================
function renderBusinessInfoList() {
  const listContainer = document.getElementById('saved-business-list');
  const emptyState = document.getElementById('empty-business-state');

  if (savedBusinessInfoList.length === 0) {
    listContainer.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  listContainer.innerHTML = savedBusinessInfoList.map((info, index) => {
    const domainLabel = DOMAIN_RULES[info.domain]?.displayName || info.domain;

    return `
      <div class="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-bold text-white text-base">${info.businessName}</h3>
            <p class="text-slate-400 text-sm">${info.contactNumber}</p>
          </div>
          <span class="px-2 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 text-xs font-medium">${domainLabel}</span>
        </div>

        <div class="flex gap-2">
          <button onclick="loadBusinessInfo(${index})" class="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all flex items-center justify-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
            불러오기
          </button>
          <button onclick="deleteBusinessInfo(${index})" class="px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium transition-all">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// 업체 정보 불러오기
// ============================================
function loadBusinessInfo(index) {
  const info = savedBusinessInfoList[index];
  if (!info) return;

  // 폼으로 이동
  resetForm();
  closeBusinessInfoPanel();

  // 폼에 데이터 채우기 (업체명, 연락처, 도메인만)
  setTimeout(() => {
    // 도메인 선택
    if (info.domain) {
      selectDomain(info.domain);
    }

    // 업체명
    if (info.businessName) {
      document.getElementById('business-name').value = info.businessName;
    }

    // 연락처
    if (info.contactNumber) {
      document.getElementById('contact-number').value = info.contactNumber;
    }

    // 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
}

// ============================================
// 업체 정보 삭제
// ============================================
function deleteBusinessInfo(index) {
  if (!confirm('이 업체 정보를 삭제하시겠습니까?')) return;

  savedBusinessInfoList.splice(index, 1);
  localStorage.setItem('saved_business_info', JSON.stringify(savedBusinessInfoList));

  renderBusinessInfoList();
  updateBusinessCountBadge();
}

// ============================================
// 전체 업체 정보 삭제
// ============================================
function clearAllBusinessInfo() {
  if (savedBusinessInfoList.length === 0) {
    alert('삭제할 업체 정보가 없습니다.');
    return;
  }

  if (!confirm('모든 업체 정보를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;

  savedBusinessInfoList = [];
  localStorage.setItem('saved_business_info', JSON.stringify(savedBusinessInfoList));

  renderBusinessInfoList();
  updateBusinessCountBadge();
}

// ============================================
// 업체 정보 개수 배지 업데이트
// ============================================
function updateBusinessCountBadge() {
  const badge = document.getElementById('business-count-badge');
  if (!badge) return;

  if (savedBusinessInfoList.length > 0) {
    badge.textContent = savedBusinessInfoList.length;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}
