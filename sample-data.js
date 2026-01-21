/**
 * 샘플 데이터 - 화이트서울치과 임영일 원장
 * 리포트.pdf의 실제 진단 결과 기반
 */

const sampleData = {
    // 기본 정보
    clinicName: '화이트서울치과',
    directorName: '임영일',
    location: '대전 중구',
    specialty: '임플란트, 심미치료, 일반진료',

    // 진단 결과 (리포트 기반)
    // 4형 - 수익 안정·확장 준비 (20점) 주 단계
    // 5형 - 고수익·브랜드형 (13점) 보조 단계
    revenueStage1: '4',
    revenueStage2: '5',

    // 원장 스타일 (리포트 기반)
    // D형 - 수익·경영형 (50점) 주 유형
    // E형 - 환자·신뢰형 (25점) 보조 유형
    directorStyle1: 'D',
    directorStyle2: 'E',

    // DF-AI 신뢰 점수 (리포트에는 없지만 원장 스타일 기반 추정)
    // D형(수익·경영형) + E형(환자·신뢰형) 특성 반영
    empathy: '65',        // 공감: E형 특성으로 중상
    understanding: '75',   // 이해: D형의 체계적 설명 능력
    decision: '80',        // 결정 자율성: D형의 선택지 제시 능력
    value: '85',          // 가치 전달: D형의 ROI 중심 사고
    trust: '70',          // 신뢰 관계: E형의 환자 중심 사고
    space: '60',          // 공간/감성: 확장 준비 단계로 중

    // 치과 철학 및 특징
    philosophy: `환자 중심의 진료를 원칙으로 하되, 명확한 ROI와 효율적인 진료 시스템을 추구합니다.
단순히 치료만 하는 것이 아니라, 환자분의 장기적인 구강 건강을 위한 파트너가 되고자 합니다.
데이터 기반 의사결정과 환자 신뢰를 동시에 중시하는 것이 저희의 철학입니다.`,

    differentiation: `• 체계적인 상담 프로세스: 5단계 신뢰 구축 시스템 도입
• 투명한 비용 안내: 모든 치료 옵션의 장단점과 비용을 명확히 제시
• 최신 장비 투자: 3D CT 및 디지털 진단 시스템 구비
• 효율적 진료: 대기 시간 최소화 및 예약 시스템 최적화
• 장기 관리 프로그램: 정기 검진 및 사후 관리 체계`,

    // 콘텐츠 선호도
    channel: ['naver', 'instagram', 'local'],
    content: ['educational', 'cases', 'story'],

    // 메타 정보
    createdAt: new Date('2026-01-07T18:57:00').toISOString(),
    sampleDescription: '실제 진단 리포트 기반 샘플 데이터',

    // 원장 고민 및 목표 (리포트 기반)
    currentConcern: '신환 유치',
    futureVision: '3년 후 3배 확장',
    investmentPriority: '최신 장비'
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = sampleData;
}
