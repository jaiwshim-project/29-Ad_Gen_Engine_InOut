/**
 * 통합 마케팅 콘텐츠 생성 엔진
 *
 * 통합된 이론:
 * 1. 러셀 브런슨 - Hook, Story, Offer / Value Ladder / AIDA
 * 2. 간다 마사노리 - 마케팅 피라미드 (관계 단계)
 * 3. NLP - 언어 패턴, 감정 유도
 * 4. 5단계 신뢰 구축 - 공감→이해→결정→가치→신뢰
 * 5. 조 비테일 - Spiritual Marketing (감정 공감)
 * 6. 짐 에드워드 - 카피라이팅 (감정 트리거)
 */

class MarketingEngine {
    constructor() {
        // 고객 인지 단계 (간다 마사노리)
        this.awarenessLevels = {
            unaware: '문제 인식 전',
            problemAware: '문제 인식',
            solutionAware: '해결책 인식',
            productAware: '제품 인식',
            mostAware: '구매 준비'
        };

        // NLP 언어 패턴
        this.nlpPatterns = {
            presupposition: '이미 ~한 것처럼',
            embedded: '내재된 명령',
            metaphor: '은유적 표현',
            pacing: '페이싱 (공감)',
            leading: '리딩 (유도)'
        };

        // 감정 트리거 (카피라이팅)
        this.emotionalTriggers = {
            fear: '두려움 (손실 회피)',
            desire: '욕구 (얻고 싶음)',
            trust: '신뢰 (안전함)',
            belonging: '소속감',
            authority: '권위',
            scarcity: '희소성',
            reciprocity: '상호성',
            proof: '증거/사회적 증명'
        };

        // 조건부 단어 풀 시스템 (신뢰 훼손 방지용 안전장치)
        this.initializeWordPool();
    }

    /**
     * 조건부 단어 풀 초기화
     * Layer 1: 공통 허용 (항상 가능)
     * Layer 2: 단계 조건부 허용 (STAGE별)
     * Layer 3: 고급 조건부 허용 (보상형, 원장 1인칭)
     * Layer 4: 절대 금지
     */
    initializeWordPool() {
        // Layer 1: 공통 허용 단어 (모든 STAGE에서 사용 가능)
        this.commonAllowedWords = [
            // 기본 설명 단어
            '설명', '안내', '이해', '확인', '질문', '답변', '대화', '소통', '경청',
            '살펴보다', '검토', '비교', '판단', '결정', '시간', '여유',
            '진단', '상담', '배려', '존중',

            // 속도 반대 키워드 (광고 거부감 제거)
            '천천히', '충분히', '서두르지 않고', '신중하게', '한 번 더',
            '차근차근', '하나씩', '단계별로', '여유있게', '급하지 않게',

            // 광고 회피형 표현
            '기록', '이야기', '고민', '생각', '과정', '부담을 줄이다'
        ];

        // Layer 2: 단계 조건부 허용 단어
        this.stageConditionalWords = {
            // STAGE 1-2: 설명·공감 단계
            'STAGE1-2': {
                allowed: [
                    // 불안 공감 키워드 (감정 진입)
                    '불안', '걱정', '망설임', '쉽지 않은 결정', '부담',
                    '두려움', '고민되는', '어려운', '복잡한', '막막한',
                    '조심스럽게', '서두르지 않다', '이해가 필요하다',
                    '불편함', '궁금하신', '혼란스러운',
                    // 추가: 감정 공감 확장
                    '무서운', '낯선', '걱정스러운', '불확실한', '혼자 고민하는'
                ],
                forbidden: [
                    '철학', '원칙', '기준 선언', '오래', '함께', '신뢰',
                    '관계', '약속', '보증', '지켜드리다', '책임지다'
                ]
            },
            // STAGE 3: 결정권 제공 단계
            'STAGE3': {
                allowed: [
                    // 환자 존중 키워드 (결정권 강조)
                    '선택권', '결정은 환자분의 몫', '환자분의 선택',
                    '충분히 생각한 뒤', '오늘 결정하지 않아도', '비교해보셔도',
                    '자유롭게', '권한', '주도권', '스스로', '직접', '판단하시고',
                    '여유를 가지고', '급하지 않습니다',
                    // 추가: 존중 확장
                    '강요하지 않습니다', '이해하신 후에', '동의하실 때만',
                    '충분히 고민하셔도 됩니다', '환자분께서 원하실 때',
                    '결정을 존중합니다'
                ],
                forbidden: [
                    '1인칭 철학 선언', '장기 관계 암시', '평생', '계속',
                    '항상', '영원히'
                ]
            },
            // STAGE 4: 가치·철학 단계
            'STAGE4': {
                allowed: [
                    // 철학·기준 키워드 (가치 선언)
                    '기준', '원칙', '철학', '방향', '이유', '선택',
                    '지키고 싶은', '중요하게 생각하는', '추구하는',
                    '가치', '신념', '태도', '자세', '마음가짐',
                    // 추가: 철학 확장
                    '고집', '끝까지 지키고 싶은', '제가 선택한 이유',
                    '진료 방식을 선택한 배경', '판단의 기준',
                    '제 생각', '제 진료의 중심'
                ],
                condition: '설명형 문장 안에서만',
                forbidden: [
                    '우리가 최고', '1등', '유일한', '독보적', '비교불가'
                ]
            },
            // STAGE 5: 신뢰·관계 단계 (보상 단어 - 최종 해금)
            'STAGE5': {
                allowed: [
                    // 관계 지속 키워드 (단발 진료 탈피)
                    '함께', '오래', '계속', '관계', '지켜보며', '책임',
                    '끝까지', '앞으로도', '평생', '항상', '언제나',
                    '동행', '파트너', '주치의', '신뢰',
                    // 추가: 관계 확장
                    '과정', '이번 치료만이 아니라', '장기적으로',
                    '꾸준히', '지속적으로', '변화를 함께', '성장을 함께'
                ],
                condition: 'revenue_stage >= STAGE5 AND empathy >= 60 AND understanding >= 60'
            }
        };

        // Layer 3: 고급 조건부 허용 단어 (원장 1인칭)
        this.advancedConditionalWords = {
            firstPerson: {
                words: [
                    // 원장 정체성 키워드 (1인칭 중심)
                    '제가', '저는', '제 생각에는', '제가 생각하는',
                    '제가 중요하게 여기는', '제 진료 기준은', '제 철학은',
                    '저의 경험상', '제 진료는', '제가 생각하는 치료는',
                    '제가 끝까지 지키고 싶은 기준은',
                    // 추가: 책임과 신뢰 집중
                    '제가 책임지겠습니다', '제가 함께하겠습니다',
                    '제 판단으로는', '제가 선택한 이유는'
                ],
                condition: {
                    minimumStage: 'STAGE3',
                    minimumEmpathy: 60,
                    minimumUnderstanding: 60
                },
                usageLimit: {
                    maxPerContent: 2,
                    rule: '선언형 ❌ / 설명형 ⭕',
                    note: '병원이 아닌 사람이 주어 - 책임과 신뢰를 원장에게 집중'
                }
            }
        };

        // Layer 4: 절대 금지 단어 (의료법 + 신뢰 보호 + 광고 회피)
        this.forbiddenWords = [
            // 보장/확약 표현
            '반드시', '무조건', '완치', '보장', '100%', '확실히',
            '틀림없이', '절대', '분명히',

            // 과장 표현
            '최고', '최상', '최대', '유일', '독보적', '압도적',
            '업계 1위', '지역 1위', '최고급', '최상급',

            // 즉시성/긴급성 과장 (속도 중심 표현 금지)
            '빠른 효과', '즉시', '당장', '바로', '지금 바로',
            '오늘만', '한정', '마지막 기회', '빠르게', '신속하게',

            // 상업적 표현 (광고 회피형 표현 의도적 배제)
            '이벤트', '할인', '혜택', '특가', '프로모션',
            '무료', '증정', '사은품', '홍보', '최저가',

            // 비교/경쟁 표현
            'Before/After', '타 병원', '다른 곳', '경쟁 병원',
            '비교 불가', '압도적 차이',

            // 의료법 위반 소지
            '치료 보장', '효과 보장', '부작용 없음', '100% 안전',
            '무통', '통증 제로'
        ];

        // 단어 풀 매핑 (STAGE -> 허용 레이어)
        this.stageToWordPoolMapping = {
            'STAGE1': ['common', 'STAGE1-2'],
            'STAGE2': ['common', 'STAGE1-2'],
            'STAGE3': ['common', 'STAGE1-2', 'STAGE3'],
            'STAGE4': ['common', 'STAGE1-2', 'STAGE3', 'STAGE4'],
            'STAGE5': ['common', 'STAGE1-2', 'STAGE3', 'STAGE4', 'STAGE5']
        };

        // 정체성 선언 스타일 키워드 그룹 (7개 그룹)
        this.identityKeywordGroups = {
            // ① 원장 정체성 (1인칭 중심) - Layer 3에서 관리
            directorIdentity: {
                keywords: this.advancedConditionalWords.firstPerson.words,
                purpose: '병원이 아닌 사람이 주어, 책임과 신뢰를 원장에게 집중',
                usage: 'STAGE3 이상 + 신뢰점수 조건'
            },

            // ② 철학·기준 (가치 선언) - STAGE4
            philosophy: {
                keywords: ['기준', '원칙', '철학', '방향', '이유', '선택', '고집', '태도'],
                purpose: '기술이 아니라 판단의 이유를 강조',
                usage: 'STAGE4 이상, 설명형 문장에서만'
            },

            // ③ 속도 반대 (광고 거부감 제거) - Layer 1
            antiSpeed: {
                keywords: ['천천히', '충분히', '서두르지 않고', '신중하게', '한 번 더', '끝까지', '오래'],
                purpose: '이 병원은 나를 급하게 몰지 않겠구나',
                usage: '모든 STAGE'
            },

            // ④ 환자 존중 (결정권 강조) - STAGE3
            patientRespect: {
                keywords: ['환자분의 선택', '결정은 환자분의 몫', '강요하지 않습니다', '이해하신 후에', '동의하실 때만'],
                purpose: '문장이 광고 같지 않게 느껴지도록',
                usage: 'STAGE3 이상'
            },

            // ⑤ 불안 공감 (감정 진입) - STAGE1-2
            anxietyEmpathy: {
                keywords: ['걱정', '불안', '망설임', '두려움', '고민', '부담', '쉽지 않은 결정'],
                purpose: '치료 이야기 전에 감정부터 건드림',
                usage: 'STAGE1-2, 문장 초반부'
            },

            // ⑥ 관계 지속 (단발 진료 탈피) - STAGE5
            relationship: {
                keywords: ['함께', '오래', '앞으로도', '계속', '관계', '과정', '지켜보며'],
                purpose: '병원을 사건이 아니라 관계로 인식',
                usage: 'STAGE5, 보상 단어'
            },

            // ⑦ 광고 회피형 표현 - Layer 1
            antiAdvertising: {
                allowed: ['안내', '설명', '기록', '이야기', '생각'],
                forbidden: ['홍보', '이벤트', '혜택', '할인', '최저가', '빠른 효과'],
                purpose: '의도적으로 광고 단어 배제'
            }
        };
    }

    /**
     * 단어 검증: 특정 단어가 현재 STAGE와 신뢰 점수에서 사용 가능한지 확인
     * @param {string} word - 검증할 단어
     * @param {string} stage - 현재 STAGE (STAGE1~5)
     * @param {object} trustScores - 신뢰 점수 {empathy, understanding, decision, value, trust}
     * @returns {object} {allowed: boolean, reason: string}
     */
    validateWord(word, stage, trustScores = {}) {
        // Layer 4: 절대 금지 단어 체크
        if (this.forbiddenWords.some(forbidden => word.includes(forbidden))) {
            return {
                allowed: false,
                reason: '절대 금지 단어 (의료법 + 신뢰 보호)',
                layer: 'Layer 4'
            };
        }

        // Layer 1: 공통 허용 단어 체크
        if (this.commonAllowedWords.some(common => word.includes(common))) {
            return {
                allowed: true,
                reason: '공통 허용 단어',
                layer: 'Layer 1'
            };
        }

        // Layer 2: 단계 조건부 허용 단어 체크
        const allowedLayers = this.stageToWordPoolMapping[stage] || ['common'];

        for (const layerKey of allowedLayers) {
            if (layerKey === 'common') continue;

            const layerConfig = this.stageConditionalWords[layerKey];
            if (!layerConfig) continue;

            // 해당 레이어의 금지 단어 체크
            if (layerConfig.forbidden &&
                layerConfig.forbidden.some(forbidden => word.includes(forbidden))) {
                return {
                    allowed: false,
                    reason: `${layerKey}에서 금지된 단어`,
                    layer: 'Layer 2'
                };
            }

            // 해당 레이어의 허용 단어 체크
            if (layerConfig.allowed &&
                layerConfig.allowed.some(allowed => word.includes(allowed))) {
                return {
                    allowed: true,
                    reason: `${layerKey}에서 허용된 단어`,
                    layer: 'Layer 2',
                    condition: layerConfig.condition
                };
            }
        }

        // Layer 3: 고급 조건부 허용 (원장 1인칭) 체크
        const firstPersonConfig = this.advancedConditionalWords.firstPerson;
        if (firstPersonConfig.words.some(fp => word.includes(fp))) {
            const { minimumStage, minimumEmpathy, minimumUnderstanding } =
                firstPersonConfig.condition;

            const stageNum = parseInt(stage.replace('STAGE', ''));
            const minStageNum = parseInt(minimumStage.replace('STAGE', ''));

            const meetsCondition =
                stageNum >= minStageNum &&
                (trustScores.empathy || 0) >= minimumEmpathy &&
                (trustScores.understanding || 0) >= minimumUnderstanding;

            return {
                allowed: meetsCondition,
                reason: meetsCondition
                    ? '고급 조건부 허용 (원장 1인칭)'
                    : '조건 미충족 (STAGE3 이상 + empathy 60+ + understanding 60+)',
                layer: 'Layer 3',
                usageLimit: firstPersonConfig.usageLimit
            };
        }

        // 어떤 레이어에도 해당하지 않음 (기본 허용)
        return {
            allowed: true,
            reason: '일반 단어 (제한 없음)',
            layer: 'None'
        };
    }

    /**
     * 텍스트 필터링: 생성된 텍스트에서 금지 단어 제거 및 경고
     * @param {string} text - 필터링할 텍스트
     * @param {string} stage - 현재 STAGE
     * @param {object} trustScores - 신뢰 점수
     * @returns {object} {filteredText: string, warnings: array, violations: array}
     */
    filterText(text, stage, trustScores = {}) {
        let filteredText = text;
        const warnings = [];
        const violations = [];
        const firstPersonCount = {};

        // 문장 단위로 분리
        const sentences = text.split(/[.!?\n]/);
        const filteredSentences = [];

        for (const sentence of sentences) {
            if (!sentence.trim()) {
                filteredSentences.push(sentence);
                continue;
            }

            let shouldRemoveSentence = false;
            const sentenceWarnings = [];

            // 각 단어 검증
            const words = sentence.split(/[\s,]/);
            for (const word of words) {
                if (!word.trim()) continue;

                const validation = this.validateWord(word, stage, trustScores);

                if (!validation.allowed) {
                    if (validation.layer === 'Layer 4') {
                        // 절대 금지 단어 발견 - 문장 제거
                        shouldRemoveSentence = true;
                        violations.push({
                            word,
                            sentence,
                            reason: validation.reason
                        });
                        break;
                    } else {
                        // 조건부 금지 - 경고만
                        sentenceWarnings.push({
                            word,
                            reason: validation.reason,
                            layer: validation.layer
                        });
                    }
                }

                // Layer 3 (원장 1인칭) 사용 횟수 카운트
                if (validation.layer === 'Layer 3' && validation.allowed) {
                    const key = validation.reason;
                    firstPersonCount[key] = (firstPersonCount[key] || 0) + 1;

                    if (firstPersonCount[key] > validation.usageLimit.maxPerContent) {
                        sentenceWarnings.push({
                            word,
                            reason: `원장 1인칭 과다 사용 (최대 ${validation.usageLimit.maxPerContent}회)`,
                            layer: 'Layer 3'
                        });
                    }
                }
            }

            if (!shouldRemoveSentence) {
                filteredSentences.push(sentence);
                if (sentenceWarnings.length > 0) {
                    warnings.push(...sentenceWarnings);
                }
            }
        }

        filteredText = filteredSentences.join('. ').replace(/\.\s*\./g, '.');

        return {
            filteredText,
            warnings,
            violations,
            stats: {
                originalLength: text.length,
                filteredLength: filteredText.length,
                removedSentences: sentences.length - filteredSentences.length,
                firstPersonUsage: firstPersonCount
            }
        };
    }

    /**
     * STAGE별 허용 단어 풀 조회
     * @param {string} stage - STAGE1~5
     * @returns {object} 해당 STAGE에서 사용 가능한 모든 단어
     */
    getAllowedWordPool(stage) {
        const allowedLayers = this.stageToWordPoolMapping[stage] || ['common'];
        const wordPool = {
            common: this.commonAllowedWords,
            stageSpecific: [],
            advanced: [],
            forbidden: this.forbiddenWords
        };

        for (const layerKey of allowedLayers) {
            if (layerKey === 'common') continue;

            const layerConfig = this.stageConditionalWords[layerKey];
            if (layerConfig && layerConfig.allowed) {
                wordPool.stageSpecific.push(...layerConfig.allowed);
            }
        }

        // STAGE3 이상에서 원장 1인칭 허용
        if (parseInt(stage.replace('STAGE', '')) >= 3) {
            wordPool.advanced = this.advancedConditionalWords.firstPerson.words;
        }

        return wordPool;
    }

    /**
     * 광고 제목 생성 - 치과명 + 원장명 조합
     * Permission Level에 따라 제목 톤 조절
     */
    generateAdTitle(clinicName, directorName, contentType, permissionLevel = 'L3') {
        const titlesByLevel = {
            L0: {
                empathy: `${clinicName} ${directorName} 원장과 편안하게 상담하세요`,
                understanding: `${directorName} 원장이 자세히 설명드립니다`,
                decision: `${clinicName}에서는 환자님이 선택합니다`,
                value: `${directorName} 원장의 장기적 치료 철학`,
                trust: `${clinicName} ${directorName} 원장이 함께합니다`
            },
            L1: {
                empathy: `${clinicName} ${directorName} 원장의 공감 진료`,
                understanding: `${directorName} 원장의 명확한 설명`,
                decision: `${clinicName}의 환자 중심 치료`,
                value: `${directorName} 원장이 제안하는 가치 있는 치료`,
                trust: `${clinicName}에서 시작하는 평생 관계`
            },
            L2: {
                empathy: `${clinicName} ${directorName} 원장이 당신의 마음을 이해합니다`,
                understanding: `${directorName} 원장의 투명한 진단`,
                decision: `${clinicName}의 선택 존중 시스템`,
                value: `${directorName} 원장의 10년을 생각하는 치료`,
                trust: `${clinicName} ${directorName} 원장, 평생 주치의`
            },
            L3: {
                empathy: `${clinicName} ${directorName} 원장과 함께 두려움을 극복하세요`,
                understanding: `${directorName} 원장의 정확한 진단이 답입니다`,
                decision: `${clinicName}에서 당신이 주인공입니다`,
                value: `${directorName} 원장이 보장하는 평생 가치`,
                trust: `${clinicName} ${directorName} 원장을 믿어보세요`
            },
            L4: {
                empathy: `${clinicName} ${directorName} 원장과 지금 바로 해결하세요`,
                understanding: `${directorName} 원장의 정확한 진단, 더 이상 헤매지 마세요`,
                decision: `${clinicName}에서 당신의 권리를 되찾으세요`,
                value: `${directorName} 원장이 약속하는 확실한 투자`,
                trust: `${clinicName} ${directorName} 원장, 지역 1위에는 이유가 있습니다`
            },
            L5: {
                empathy: `${clinicName} ${directorName} 원장이 오늘 당장 공포를 끝냅니다`,
                understanding: `${directorName} 원장의 정확한 답변, 더 이상 속지 마세요`,
                decision: `${clinicName}에서 인생을 바꾸세요`,
                value: `${directorName} 원장의 평생 보증, 지금이 마지막 기회`,
                trust: `${clinicName} ${directorName} 원장, 만족 못하면 100% 환불`
            }
        };

        const titles = titlesByLevel[permissionLevel] || titlesByLevel.L3;
        return titles[contentType] || titles.empathy;
    }

    /**
     * 러셀 브런슨의 Hook-Story-Offer 프레임워크
     */
    generateHookStoryOffer(context) {
        const { stage, style, trustScores } = context;

        return {
            hook: this.createHook(context),
            story: this.createStory(context),
            offer: this.createOffer(context)
        };
    }

    /**
     * Hook (주목 끌기) - 첫 3초 안에 주목
     * Permission Level에 따라 Hook의 강도 조절
     * Variant에 따라 다른 Hook 선택
     */
    createHook(context) {
        const permissionLevel = context.permissionLevel || 'L3';
        const variant = context.variant || 1;

        const hooks = {
            // L0: 가장 부드러운 질문형
            L0: {
                empathy: [
                    '"치과 방문이 걱정되시나요?"',
                    '"치과가 두려우신가요?"',
                    '"편안한 치과를 찾고 계신가요?"'
                ],
                understanding: [
                    '"치료에 대해 궁금하신 점이 있으신가요?"',
                    '"어떤 치료가 필요한지 알고 싶으신가요?"',
                    '"치료 과정이 궁금하신가요?"'
                ],
                decision: [
                    '"충분한 설명을 듣고 결정하고 싶으신가요?"',
                    '"여러 선택지를 고민하고 계신가요?"',
                    '"천천히 결정하고 싶으신가요?"'
                ],
                value: [
                    '"오래 사용할 수 있는 치료를 원하시나요?"',
                    '"장기적으로 만족할 치료를 찾으시나요?"',
                    '"가치 있는 투자를 원하시나요?"'
                ],
                trust: [
                    '"믿을 수 있는 치과를 찾고 계신가요?"',
                    '"신뢰할 수 있는 원장님을 찾고 계신가요?"',
                    '"오래 다닐 수 있는 치과를 원하시나요?"'
                ]
            },
            // L1: 부드럽지만 약간 더 구체적
            L1: {
                empathy: [
                    '"편안한 치과 경험을 원하시나요?"',
                    '"통증 없는 치료를 받고 싶으신가요?"',
                    '"치과 방문이 부담스러우신가요?"'
                ],
                understanding: [
                    '"치료 계획을 명확히 이해하고 싶으신가요?"',
                    '"왜 이 치료가 필요한지 알고 싶으신가요?"',
                    '"치료 옵션을 비교하고 싶으신가요?"'
                ],
                decision: [
                    '"여러 선택지를 고민하고 계신가요?"',
                    '"내가 선택하고 싶으신가요?"',
                    '"충분히 고민하고 결정하고 싶으신가요?"'
                ],
                value: [
                    '"장기적 관점에서 치료를 고민하고 계신가요?"',
                    '"10년 후에도 만족할 치료를 원하시나요?"',
                    '"비용보다 가치를 생각하시나요?"'
                ],
                trust: [
                    '"오랫동안 함께할 치과를 원하시나요?"',
                    '"평생 주치의를 찾고 계신가요?"',
                    '"가족처럼 편한 치과를 원하시나요?"'
                ]
            },
            // L2: 중립적, 공감형
            L2: {
                empathy: [
                    '"치과 치료가 두려우신가요?"',
                    '"치과 방문을 미루고 계신가요?"',
                    '"치과에 대한 불안이 있으신가요?"'
                ],
                understanding: [
                    '"임플란트, 정말 필요할까요?"',
                    '"어떤 치료가 적합할까요?"',
                    '"치료 비용이 궁금하신가요?"'
                ],
                decision: [
                    '"결정은 언제나 환자님의 몫입니다"',
                    '"당신이 선택하는 치료"',
                    '"강요하지 않는 진료"'
                ],
                value: [
                    '"3년 후에도 만족하실 수 있을까요?"',
                    '"저렴한 치료 vs 오래가는 치료"',
                    '"진짜 가치를 생각하세요"'
                ],
                trust: [
                    '"믿을 수 있는 치과를 찾고 계신가요?"',
                    '"신뢰할 수 있는 곳을 원하시나요?"',
                    '"평생 함께할 치과가 필요하신가요?"'
                ]
            },
            // L3: 약간 적극적, 문제 제기
            L3: {
                empathy: [
                    '"치과 치료가 두려우셨나요?"',
                    '"이제는 편안하게 치료받으세요"',
                    '"두려움을 극복할 수 있습니다"'
                ],
                understanding: [
                    '"왜 이 치료를 해야 하는지 궁금하셨죠?"',
                    '"정확한 진단이 필요합니다"',
                    '"명확한 답을 드립니다"'
                ],
                decision: [
                    '"선택권을 되찾으세요"',
                    '"당신이 결정하세요"',
                    '"자율성을 존중합니다"'
                ],
                value: [
                    '"저렴한 치료 vs 오래가는 치료"',
                    '"진짜 가치를 제공합니다"',
                    '"10년 후를 생각하세요"'
                ],
                trust: [
                    '"3대가 다니는 치과가 있습니다"',
                    '"20년 경력의 신뢰"',
                    '"입소문으로 성장한 치과"'
                ]
            },
            // L4: 공격적, 문제 강조
            L4: {
                empathy: [
                    '"더 이상 미루면 안 됩니다"',
                    '"지금 당장 해결하세요"',
                    '"오늘이 마지막 기회입니다"'
                ],
                understanding: [
                    '"잘못된 치료로 돈을 낭비하고 계십니다"',
                    '"정확한 진단을 받으세요"',
                    '"더 이상 헤매지 마세요"'
                ],
                decision: [
                    '"강요당하는 치료, 이제 그만!"',
                    '"당신의 권리를 되찾으세요"',
                    '"주도권을 가지세요"'
                ],
                value: [
                    '"싼 게 비지떡, 후회하기 전에!"',
                    '"지금 투자하지 않으면 10배 비용"',
                    '"제대로 한 번에 끝내세요"'
                ],
                trust: [
                    '"이제 진짜 주치의를 만나야 할 때"',
                    '"검증된 실력을 경험하세요"',
                    '"지역 1위에는 이유가 있습니다"'
                ]
            },
            // L5: 최대 공격적, 긴급성 최대
            L5: {
                empathy: [
                    '"치과 공포증 때문에 건강을 포기하시겠습니까?"',
                    '"오늘 결정하지 않으면 평생 후회합니다"',
                    '"지금이 마지막 기회입니다"'
                ],
                understanding: [
                    '"왜 계속 속고만 계신가요?"',
                    '"더 이상 시간을 낭비하지 마세요"',
                    '"100% 확실한 답을 드립니다"'
                ],
                decision: [
                    '"더 이상 당하지 마세요"',
                    '"당신의 인생을 바꾸세요"',
                    '"지금 바로 결정하세요"'
                ],
                value: [
                    '"지금 제대로 하지 않으면 평생 후회합니다"',
                    '"미루면 비용은 3배로 증가합니다"',
                    '"평생 가치를 보장합니다"'
                ],
                trust: [
                    '"지금 결정이 평생을 좌우합니다"',
                    '"만족 못하면 100% 환불"',
                    '"대한민국 Top 1% 전문의"'
                ]
            }
        };

        const selectedHooks = hooks[permissionLevel] || hooks.L3;
        const hooksArray = selectedHooks[context.contentType] || selectedHooks.empathy;

        // Use variant to select from array (wrap around if variant exceeds array length)
        const hookIndex = (variant - 1) % hooksArray.length;
        return [hooksArray[hookIndex]];
    }

    /**
     * Story (공감 스토리) - 5단계 신뢰 프로세스 적용
     */
    createStory(context) {
        const { contentType, trustScores } = context;

        // 5단계 프로세스: 공감 → 이해 → 결정 → 가치 → 신뢰
        const storyStructure = {
            // 1단계: 공감 (Pacing - NLP)
            pacing: this.createPacing(context),

            // 2단계: 이해 (문제 명확화)
            understanding: this.createUnderstanding(context),

            // 3단계: 결정 (선택권 제공)
            decision: this.createDecisionPoint(context),

            // 4단계: 가치 (장기적 가치)
            value: this.createValueProposition(context),

            // 5단계: 신뢰 (관계 구축)
            trust: this.createTrustElement(context)
        };

        return storyStructure;
    }

    /**
     * Offer (행동 유도) - 명확한 CTA
     * Permission Level에 따라 CTA 강도 조절
     */
    createOffer(context) {
        const permissionLevel = context.permissionLevel || 'L3';

        const offers = {
            L0: ['궁금하신 점이 있으시면 문의해주세요'],
            L1: ['편안하게 상담받아보세요'],
            L2: ['무료 상담을 받아보세요'],
            L3: ['지금 예약하고 검진 받으세요'],
            L4: ['오늘 예약 시 특별 혜택'],
            L5: ['지금 바로 시작하세요 - 이달 한정 프로모션']
        };

        return offers[permissionLevel] || offers.L3;
    }

    /**
     * 페이싱 (공감) - NLP 기법
     * Permission Level에 따라 공감 표현 강도 조절
     */
    createPacing(context) {
        const permissionLevel = context.permissionLevel || 'L3';

        const pacing = {
            L0: {
                acknowledgement: '이런 고민을 하시는 분들이 계십니다',
                validation: '충분히 그럴 수 있습니다',
                normalization: '자연스러운 감정입니다'
            },
            L1: {
                acknowledgement: '비슷한 걱정을 하시는 분들이 많습니다',
                validation: '그런 마음 이해합니다',
                normalization: '흔한 고민입니다'
            },
            L2: {
                acknowledgement: '많은 분들이 같은 고민을 하십니다',
                validation: '그 마음, 충분히 이해합니다',
                normalization: '당연한 걱정입니다'
            },
            L3: {
                acknowledgement: '대부분의 환자분들이 같은 불안을 느끼십니다',
                validation: '그 두려움, 정말 잘 압니다',
                normalization: '너무나 당연한 반응입니다'
            },
            L4: {
                acknowledgement: '당신만 이런 고민을 하는 게 아닙니다',
                validation: '더 이상 혼자 고민하지 마세요',
                normalization: '지금 바로 해결할 수 있습니다'
            },
            L5: {
                acknowledgement: '수많은 환자들이 같은 실수를 반복합니다',
                validation: '이제 그만 미루고 결정하세요',
                normalization: '오늘이 마지막 기회일 수 있습니다'
            }
        };

        return pacing[permissionLevel] || pacing.L3;
    }

    /**
     * 이해 단계 - 문제의 본질 파악
     * Permission Level에 따라 문제 제기 강도 조절
     */
    createUnderstanding(context) {
        const permissionLevel = context.permissionLevel || 'L3';

        const understanding = {
            L0: {
                problemIdentification: '어떤 점이 궁금하신가요?',
                rootCause: '상황을 함께 살펴보겠습니다',
                solution: '적절한 방법을 찾아드리겠습니다'
            },
            L1: {
                problemIdentification: '무엇이 가장 걱정되시나요?',
                rootCause: '원인을 함께 파악해보겠습니다',
                solution: '해결 방법을 제안드리겠습니다'
            },
            L2: {
                problemIdentification: '진짜 문제는 무엇인가요?',
                rootCause: '왜 이런 일이 생겼을까요?',
                solution: '어떻게 해결할 수 있을까요?'
            },
            L3: {
                problemIdentification: '핵심 문제를 정확히 파악해야 합니다',
                rootCause: '근본 원인을 찾아야 합니다',
                solution: '최선의 해결책이 있습니다'
            },
            L4: {
                problemIdentification: '문제를 방치하면 더 악화됩니다',
                rootCause: '이미 골든타임을 놓치고 계실 수 있습니다',
                solution: '지금 당장 해결해야 합니다'
            },
            L5: {
                problemIdentification: '당신의 문제는 생각보다 심각합니다',
                rootCause: '지금 이 순간에도 악화되고 있습니다',
                solution: '더 늦기 전에 즉시 조치가 필요합니다'
            }
        };

        return understanding[permissionLevel] || understanding.L3;
    }

    /**
     * 결정 단계 - 선택권 제공
     * Permission Level에 따라 결정 유도 강도 조절
     */
    createDecisionPoint(context) {
        const permissionLevel = context.permissionLevel || 'L3';

        const decision = {
            L0: {
                options: '다양한 선택지가 있습니다',
                prosAndCons: '각 방법의 특징을 설명드립니다',
                autonomy: '천천히 결정하셔도 됩니다'
            },
            L1: {
                options: '여러 옵션을 제공합니다',
                prosAndCons: '장단점을 비교해드립니다',
                autonomy: '충분히 고민하신 후 결정하세요'
            },
            L2: {
                options: '여러 선택지를 드립니다',
                prosAndCons: '각각의 장단점을 알려드립니다',
                autonomy: '결정은 환자님이 하십니다'
            },
            L3: {
                options: '최적의 선택지를 제시합니다',
                prosAndCons: '명확한 비교 분석을 제공합니다',
                autonomy: '당신의 선택을 존중합니다'
            },
            L4: {
                options: '최선의 방법을 제안합니다',
                prosAndCons: '지금 결정하면 최대 혜택을 받으실 수 있습니다',
                autonomy: '빠른 결정이 더 나은 결과를 가져옵니다'
            },
            L5: {
                options: '검증된 최고의 방법입니다',
                prosAndCons: '오늘 결정 시 특별 할인 제공',
                autonomy: '선착순 마감 - 지금 바로 결정하세요'
            }
        };

        return decision[permissionLevel] || decision.L3;
    }

    /**
     * 가치 제안 - 장기적 가치
     * Permission Level에 따라 가치 강조 방식 조절
     */
    createValueProposition(context) {
        const permissionLevel = context.permissionLevel || 'L3';

        const value = {
            L0: {
                immediate: '치료 후 개선을 기대할 수 있습니다',
                longTerm: '장기적으로 건강을 유지할 수 있습니다',
                lifestyle: '일상이 편안해질 수 있습니다',
                prevention: '예방 관리의 중요성'
            },
            L1: {
                immediate: '치료 직후부터 변화를 느낍니다',
                longTerm: '5년, 10년 후에도 건강합니다',
                lifestyle: '삶의 질이 개선됩니다',
                prevention: '미래 비용을 절감할 수 있습니다'
            },
            L2: {
                immediate: '당장의 효과',
                longTerm: '10년 후에도 만족',
                lifestyle: '삶의 질 향상',
                prevention: '예방의 가치'
            },
            L3: {
                immediate: '즉각적인 개선 효과',
                longTerm: '평생 사용할 수 있는 투자',
                lifestyle: '일상의 모든 순간이 달라집니다',
                prevention: '장기적으로 훨씬 경제적입니다'
            },
            L4: {
                immediate: '즉각적인 효과를 경험하게 됩니다',
                longTerm: '평생 후회 없는 투자가 됩니다',
                lifestyle: '인생이 바뀌는 경험입니다',
                prevention: '지금 투자하지 않으면 나중에 10배 비용이 듭니다'
            },
            L5: {
                immediate: '당장 내일부터 인생이 달라집니다',
                longTerm: '평생의 자산이 됩니다 - 절대 후회 없습니다',
                lifestyle: '완전히 새로운 삶을 살게 됩니다',
                prevention: '미루면 평생 후회합니다 - 비용은 2배, 3배로 증가합니다'
            }
        };

        return value[permissionLevel] || value.L3;
    }

    /**
     * 신뢰 요소 - 증거와 사회적 증명
     * Permission Level에 따라 신뢰 요소 강조 방식 조절
     */
    createTrustElement(context) {
        const permissionLevel = context.permissionLevel || 'L3';

        const trust = {
            L0: {
                socialProof: '많은 환자분들이 다니고 계십니다',
                authority: '경험 있는 의료진',
                testimonial: '환자분들의 후기',
                guarantee: '사후 관리 시스템'
            },
            L1: {
                socialProof: '지역 주민들이 꾸준히 방문합니다',
                authority: '10년 이상 경력의 전문의',
                testimonial: '실제 환자들의 생생한 후기',
                guarantee: '체계적인 사후 관리'
            },
            L2: {
                socialProof: '3대가 다니는 치과',
                authority: '20년 경력',
                testimonial: '실제 환자 후기',
                guarantee: '평생 A/S 보증'
            },
            L3: {
                socialProof: '가족 단위로 다니는 단골 환자 다수',
                authority: '20년 경력 + 전문의 자격',
                testimonial: '만족도 95% 이상의 실제 후기',
                guarantee: '평생 보증 + 정기 사후 관리'
            },
            L4: {
                socialProof: '지역 최다 환자 보유 - 3,000명 이상',
                authority: '20년 무사고 진료 - 검증된 실력',
                testimonial: '만족도 99% - 실제 환자들의 극찬',
                guarantee: '평생 보증 + 무료 재치료 약속'
            },
            L5: {
                socialProof: '지역 1위 - 월 500명 이상 내원',
                authority: '대한민국 Top 1% 전문의 - 방송 출연 다수',
                testimonial: '만족도 99.9% - 불만족 시 100% 환불',
                guarantee: '평생 무제한 보증 + 무료 재치료 + 추가 혜택'
            }
        };

        return trust[permissionLevel] || trust.L3;
    }

    /**
     * 간다 마사노리의 마케팅 피라미드 적용
     * 고객 관계 단계: 모르는 사람 → 아는 사람 → 신뢰하는 사람 → 구매자 → 단골
     */
    generateByRelationshipStage(stage, context) {
        const strategies = {
            stranger: {
                goal: '인지도 확보',
                content: '교육적 콘텐츠, 가치 제공',
                tone: '도움을 주는',
                cta: '무료 정보 제공'
            },
            acquaintance: {
                goal: '신뢰 구축',
                content: '전문성 입증, 투명성',
                tone: '진솔하고 솔직한',
                cta: '무료 상담'
            },
            friend: {
                goal: '관계 심화',
                content: '개인화된 솔루션',
                tone: '친구같은',
                cta: '맞춤 제안'
            },
            customer: {
                goal: '만족도 극대화',
                content: '가치 실현',
                tone: '책임감 있는',
                cta: '지속적 케어'
            },
            loyalCustomer: {
                goal: '평생 관계',
                content: '특별한 경험',
                tone: '가족같은',
                cta: '추천 프로그램'
            }
        };

        return strategies[stage] || strategies.stranger;
    }

    /**
     * AIDA 모델 적용 (러셀 브런슨)
     * Attention → Interest → Desire → Action
     */
    generateAIDA(context) {
        return {
            attention: {
                headline: this.createHook(context)[0],
                subheadline: '당신의 고민을 이해합니다',
                visual: '공감 이미지'
            },
            interest: {
                problem: '이런 문제를 겪고 계시나요?',
                agitation: '이대로 방치하면...',
                education: '실제로 이런 이유 때문입니다'
            },
            desire: {
                solution: '이렇게 해결할 수 있습니다',
                benefits: '당신이 얻게 될 것',
                transformation: '변화된 모습',
                proof: '실제 사례'
            },
            action: {
                cta: '지금 시작하세요',
                urgency: '이번 주 한정',
                riskReversal: '만족 보장',
                ease: '간단한 절차'
            }
        };
    }

    /**
     * NLP 언어 패턴 적용
     */
    applyNLPPatterns(text, pattern) {
        const patterns = {
            presupposition: `이미 ${text}을 경험하신 것처럼`,
            embedded: `${text}을 시작하시면`,
            metaphor: `마치 ${text}처럼`,
            pacing: `${text}하신 경험이 있으시죠`,
            leading: `그렇다면 이제 ${text}해보시는 건 어떨까요`
        };

        return patterns[pattern] || text;
    }

    /**
     * 감정 트리거 적용 (카피라이팅)
     */
    applyEmotionalTrigger(content, trigger) {
        const triggers = {
            fear: {
                prefix: '놓치면 후회할',
                emphasis: '지금 당장',
                consequence: '이대로 방치하면'
            },
            desire: {
                prefix: '원하시는',
                emphasis: '꿈꾸던',
                benefit: '당신이 얻게 될'
            },
            trust: {
                prefix: '믿을 수 있는',
                emphasis: '검증된',
                proof: '실제로'
            },
            belonging: {
                prefix: '우리 가족',
                emphasis: '함께',
                community: '많은 분들이'
            },
            authority: {
                prefix: '전문가가 인정한',
                emphasis: '20년 경력',
                credential: '전문의'
            },
            scarcity: {
                prefix: '한정된',
                emphasis: '이번 달만',
                urgency: '서둘러야'
            },
            reciprocity: {
                prefix: '먼저 드리는',
                emphasis: '무료로',
                gift: '선물'
            },
            proof: {
                prefix: '증명된',
                emphasis: '실제 사례',
                testimonial: '환자 후기'
            }
        };

        const selected = triggers[trigger] || triggers.trust;
        return `${selected.prefix} ${content}`;
    }

    /**
     * 통합 콘텐츠 생성 - 모든 이론 적용 + 조건부 단어 풀 필터링
     */
    generateIntegratedContent(context) {
        const {
            contentType,  // empathy, understanding, decision, value, trust
            revenueStage, // 1-5형
            directorStyle, // A-E형
            trustScores,  // 6가지 점수
            length // basic, medium, long
        } = context;

        // 1. Hook-Story-Offer 구조
        const hso = this.generateHookStoryOffer(context);

        // 2. 관계 단계별 전략
        const relationshipStage = this.determineRelationshipStage(trustScores);
        const relationshipStrategy = this.generateByRelationshipStage(relationshipStage, context);

        // 3. AIDA 구조
        const aida = this.generateAIDA(context);

        // 4. 감정 트리거 선택
        const emotionalTrigger = this.selectEmotionalTrigger(contentType);

        // 5. NLP 패턴 적용
        const nlpPattern = this.selectNLPPattern(contentType);

        // 6. 최종 콘텐츠 조합 (조건부 단어 풀 필터링 포함)
        const result = this.assembleContent({
            hso,
            relationshipStrategy,
            aida,
            emotionalTrigger,
            nlpPattern,
            context
        });

        // 필터링 결과와 함께 반환
        return {
            content: result.content,
            wordPoolFilter: result.filterResult,
            stage: this.mapRevenueStageToStage(revenueStage),
            allowedWords: this.getAllowedWordPool(this.mapRevenueStageToStage(revenueStage))
        };
    }

    /**
     * 관계 단계 결정
     */
    determineRelationshipStage(trustScores) {
        const avg = this.calculateAverageTrust(trustScores);

        if (avg < 30) return 'stranger';
        if (avg < 50) return 'acquaintance';
        if (avg < 70) return 'friend';
        if (avg < 85) return 'customer';
        return 'loyalCustomer';
    }

    /**
     * 평균 신뢰 점수 계산
     */
    calculateAverageTrust(scores) {
        const values = Object.values(scores);
        return values.reduce((a, b) => a + b, 0) / values.length;
    }

    /**
     * 콘텐츠 타입별 감정 트리거 선택
     */
    selectEmotionalTrigger(contentType) {
        const mapping = {
            empathy: 'trust',
            understanding: 'desire',
            decision: 'trust',
            value: 'desire',
            trust: 'proof'
        };

        return mapping[contentType] || 'trust';
    }

    /**
     * 콘텐츠 타입별 NLP 패턴 선택
     */
    selectNLPPattern(contentType) {
        const mapping = {
            empathy: 'pacing',
            understanding: 'embedded',
            decision: 'presupposition',
            value: 'metaphor',
            trust: 'leading'
        };

        return mapping[contentType] || 'pacing';
    }

    /**
     * 최종 콘텐츠 조합
     * Permission Level에 따라 톤과 강조점 조절
     */
    assembleContent(components) {
        const { hso, aida, emotionalTrigger, nlpPattern, context } = components;
        const permissionLevel = context.permissionLevel || 'L3';

        // Hook (AIDA의 Attention)
        let content = `<strong style="font-size: 20px; color: #333;">${hso.hook[0]}</strong><br><br>`;

        // Story - 공감 단계 (AIDA의 Interest)
        content += `${hso.story.pacing.acknowledgement}<br>`;
        content += `${hso.story.pacing.validation}<br><br>`;

        // Story - 이해 단계 (AIDA의 Interest → Desire)
        content += `<strong>【 ${hso.story.understanding.problemIdentification} 】</strong><br>`;
        content += `${hso.story.understanding.rootCause}<br>`;
        content += `${hso.story.understanding.solution}<br><br>`;

        // Story - 결정 단계 (가치 제안)
        content += `<strong>【 당신의 선택 】</strong><br>`;
        content += `• ${hso.story.decision.options}<br>`;
        content += `• ${hso.story.decision.prosAndCons}<br>`;
        content += `• ${hso.story.decision.autonomy}<br><br>`;

        // Story - 가치 단계 (AIDA의 Desire) - Permission Level에 따라 강조점 변경
        const valueHeaders = {
            L0: '기대할 수 있는 결과',
            L1: '얻을 수 있는 효과',
            L2: '당신이 얻게 될 것',
            L3: '확실한 가치',
            L4: '놓치면 후회할 가치',
            L5: '지금 당장 얻는 혜택'
        };

        content += `<strong>【 ${valueHeaders[permissionLevel] || valueHeaders.L3} 】</strong><br>`;
        content += `✓ ${hso.story.value.immediate}<br>`;
        content += `✓ ${hso.story.value.longTerm}<br>`;
        content += `✓ ${hso.story.value.lifestyle}<br>`;

        if (permissionLevel === 'L4') {
            content += `✓ 지금 결정하지 않으면 더 큰 비용이 들 수 있습니다<br>`;
        } else if (permissionLevel === 'L5') {
            content += `✓ 지금 결정하지 않으면 더 큰 비용이 들 수 있습니다<br>`;
            content += `✓ 이번 달 한정 - 특별 할인 제공<br>`;
        }
        content += `<br>`;

        // Story - 신뢰 단계 (사회적 증명)
        content += `<strong>【 믿을 수 있는 이유 】</strong><br>`;
        content += `• ${hso.story.trust.socialProof}<br>`;
        content += `• ${hso.story.trust.authority}<br>`;
        content += `• ${hso.story.trust.guarantee}<br>`;

        // 추가 긴급성 요소
        if (permissionLevel === 'L4') {
            content += `• 이달 예약 환자 한정 특별 혜택<br>`;
        } else if (permissionLevel === 'L5') {
            content += `• 선착순 20명 한정 - 조기 마감 예상<br>`;
        }
        content += `<br>`;

        // Offer (AIDA의 Action) - Permission Level에 따라 색상 변경
        const offerColors = {
            L0: '#667eea',
            L1: '#667eea',
            L2: '#667eea',
            L3: '#667eea',
            L4: '#ff6b9d',
            L5: '#ff3366'
        };

        const offerColor = offerColors[permissionLevel] || '#667eea';
        content += `<strong style="color: ${offerColor};">${hso.offer[0]}</strong>`;

        // Add hashtags based on content type and permission level
        content += `<br><br>`;
        content += `<div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0; color: #667eea; font-size: 14px;">`;
        content += this.generateHashtags(context);
        content += `</div>`;

        // 조건부 단어 풀 필터링 적용
        const stage = this.mapRevenueStageToStage(context.revenueStage);
        const filterResult = this.filterText(content, stage, context.trustScores);

        // 필터링 결과 로깅 (개발/디버깅용)
        if (filterResult.violations.length > 0 || filterResult.warnings.length > 0) {
            console.log('📊 단어 필터 결과:', {
                stage,
                violations: filterResult.violations,
                warnings: filterResult.warnings,
                stats: filterResult.stats
            });
        }

        return {
            content: filterResult.filteredText,
            filterResult: {
                violations: filterResult.violations,
                warnings: filterResult.warnings,
                stats: filterResult.stats
            }
        };
    }

    /**
     * revenueStage (숫자 1-5) => STAGE 포맷으로 변환
     */
    mapRevenueStageToStage(revenueStage) {
        const stageNum = parseInt(revenueStage) || 3;
        return `STAGE${stageNum}`;
    }

    /**
     * 해시태그 생성 - contentType과 permissionLevel에 따라 다른 해시태그
     */
    generateHashtags(context) {
        const { contentType, permissionLevel, variant } = context;

        const hashtagsByType = {
            empathy: {
                L0: ['#편안한치과', '#치과걱정해결', '#부담없이상담', '#친절한치과', '#치과추천'],
                L1: ['#치과공포해결', '#통증없는치과', '#안심치료', '#편안한진료', '#치과불안극복'],
                L2: ['#치과공포증', '#두려움극복', '#무서운치과아니에요', '#편안한치과치료', '#치과트라우마해결'],
                L3: ['#치과공포증극복', '#편안한치과', '#통증없는치료', '#치과추천', '#두려움없는치료'],
                L4: ['#치과미루지마세요', '#지금바로치과', '#통증해결', '#치과공포끝', '#즉시치료'],
                L5: ['#치과공포끝내기', '#오늘바로해결', '#평생후회없는선택', '#치과결단', '#건강회복']
            },
            understanding: {
                L0: ['#치과상담', '#치료정보', '#궁금증해결', '#친절한설명', '#치과교육'],
                L1: ['#치과설명', '#치료계획', '#명확한상담', '#치과정보', '#투명한진료'],
                L2: ['#임플란트정보', '#치과상담', '#치료설명', '#투명한진료', '#치과교육'],
                L3: ['#정확한진단', '#치과상담', '#임플란트정보', '#투명한치료', '#치과전문상담'],
                L4: ['#정확한진단필수', '#치과정보확인', '#헤매지마세요', '#전문상담', '#정밀진단'],
                L5: ['#100프로확실한답변', '#즉시정확한진단', '#더이상속지마세요', '#전문가상담', '#확실한해답']
            },
            decision: {
                L0: ['#환자중심', '#선택권존중', '#편안한결정', '#부담없는상담', '#천천히결정'],
                L1: ['#환자가선택', '#자율적결정', '#선택지제공', '#존중하는치과', '#편안한선택'],
                L2: ['#강요없는치과', '#환자중심진료', '#선택권존중', '#자율진료', '#믿을수있는치과'],
                L3: ['#환자중심치과', '#선택권보장', '#강요없는진료', '#자율성존중', '#환자권리'],
                L4: ['#환자권리찾기', '#강요당하지마세요', '#선택권회복', '#주도적치료', '#당신이결정'],
                L5: ['#더이상당하지마세요', '#환자가주인', '#완전한선택권', '#자유로운결정', '#인생을바꾸세요']
            },
            value: {
                L0: ['#장기적치료', '#가치있는치료', '#오래가는치아', '#평생치아', '#건강투자'],
                L1: ['#10년후에도만족', '#장기가치', '#평생사용', '#가치있는투자', '#치과AS'],
                L2: ['#장기적가치', '#평생치아', '#가치있는투자', '#치과AS보증', '#오래가는치료'],
                L3: ['#평생투자', '#장기적만족', '#가치보장', '#10년보증', '#확실한투자'],
                L4: ['#싼게비지떡', '#제대로된투자', '#평생보증', '#후회없는선택', '#확실한가치'],
                L5: ['#평생가치보장', '#지금아니면늦습니다', '#최고의투자', '#100프로보증', '#절대후회없음']
            },
            trust: {
                L0: ['#믿을수있는치과', '#신뢰하는치과', '#오래다니는치과', '#편안한관계', '#평생주치의'],
                L1: ['#신뢰관계', '#평생주치의', '#오랫동안함께', '#가족같은치과', '#믿음직한치과'],
                L2: ['#3대가다니는치과', '#평생주치의', '#신뢰할수있는치과', '#입소문치과', '#지역맛집치과'],
                L3: ['#입소문치과', '#3대단골', '#지역1위', '#20년경력', '#신뢰의치과'],
                L4: ['#검증된실력', '#지역1위치과', '#입소문으로성장', '#20년무사고', '#확실한신뢰'],
                L5: ['#대한민국TOP1프로', '#만족못하면환불', '#100프로보증', '#최고의전문의', '#평생책임']
            }
        };

        const hashtags = hashtagsByType[contentType] || hashtagsByType.empathy;
        const levelHashtags = hashtags[permissionLevel] || hashtags.L3;

        return levelHashtags.map(tag => `<span style="margin-right: 8px;">${tag}</span>`).join(' ');
    }

    /**
     * 스토리텔링 콘텐츠 생성
     * 완전한 내러티브 구조: 시작 → 갈등 → 해결 → 변화
     */
    generateStorytelling(context) {
        const {
            contentType,
            revenueStage,
            directorStyle,
            trustScores,
            clinicName,
            philosophy,
            permissionLevel
        } = context;

        // 1. 캐릭터와 상황 설정
        const character = this.createCharacter(contentType, trustScores, permissionLevel);

        // 2. 갈등/문제 설정
        const conflict = this.createConflict(contentType, trustScores, permissionLevel);

        // 3. 만남과 해결 과정
        const resolution = this.createResolution(contentType, directorStyle, clinicName, permissionLevel);

        // 4. 변화와 결과
        const transformation = this.createTransformation(contentType, trustScores, permissionLevel);

        // 5. 교훈과 메시지
        const message = this.createMessage(contentType, philosophy, permissionLevel);

        // 스토리 조합
        return this.assembleStory({
            character,
            conflict,
            resolution,
            transformation,
            message,
            context
        });
    }

    /**
     * 캐릭터 생성 - 공감 가능한 주인공
     */
    createCharacter(contentType, trustScores, permissionLevel = 'L3') {
        const characters = {
            empathy: {
                name: '김민수 씨(42세)',
                background: '10년 넘게 치과를 피해왔던 직장인',
                fear: '어릴 적 치과 트라우마',
                desire: '통증 없이 치료받고 싶은 마음'
            },
            understanding: {
                name: '이지은 씨(35세)',
                background: '여러 치과를 돌아다니며 상담받았지만',
                fear: '어떤 치료가 정말 필요한지 혼란스러움',
                desire: '명확한 설명을 듣고 싶었음'
            },
            decision: {
                name: '박준호 씨(48세)',
                background: '이전 치과에서 강요당한 듯한 느낌',
                fear: '또 불필요한 치료를 권유받을까 봐',
                desire: '내가 결정할 수 있는 자율성'
            },
            value: {
                name: '최수진 씨(52세)',
                background: '저렴한 치과에서 치료받았지만',
                fear: '3년 만에 다시 문제가 생김',
                desire: '오래 가는 치료를 받고 싶음'
            },
            trust: {
                name: '정민영 씨(60세)',
                background: '20년 넘게 다니던 치과가 문을 닫음',
                fear: '새로운 곳을 믿을 수 있을까',
                desire: '다시 신뢰할 수 있는 주치의를 찾고 싶음'
            }
        };

        return characters[contentType] || characters.empathy;
    }

    /**
     * 갈등/문제 생성
     */
    createConflict(contentType, trustScores, permissionLevel = 'L3') {
        const conflicts = {
            empathy: {
                situation: '어금니가 시큰거리기 시작했습니다. 밤마다 잠을 설칠 정도였죠.',
                innerConflict: '"이번엔 정말 가야 하나... 하지만 무서워."',
                escalation: '주변 사람들은 빨리 가보라고 했지만, 발걸음이 떨어지지 않았습니다.',
                crisis: '어느 날 밤, 통증이 너무 심해져 더 이상 미룰 수 없게 되었습니다.'
            },
            understanding: {
                situation: '3군데 치과에서 각각 다른 치료 계획을 제시했습니다.',
                innerConflict: '"누구 말을 믿어야 하지? 왜 이렇게 다를까?"',
                escalation: '어떤 곳은 간단한 치료면 된다 했고, 어떤 곳은 임플란트가 필요하다 했습니다.',
                crisis: '혼란 속에서 한 달이 지나갔고, 문제는 더 악화되었습니다.'
            },
            decision: {
                situation: '이전 치과에서 200만 원짜리 치료를 강하게 권유받았습니다.',
                innerConflict: '"정말 필요한 걸까? 아니면 수익 때문일까?"',
                escalation: '거절하자 원장의 태도가 달라졌고, 불편한 마음에 그냥 나왔습니다.',
                crisis: '치료는 필요한데, 또 같은 경험을 할까 봐 어디로 가야 할지 막막했습니다.'
            },
            value: {
                situation: '3년 전 저렴한 곳에서 임플란트를 했습니다. 하지만...',
                innerConflict: '"왜 벌써 문제가 생긴 거지? 다른 곳도 마찬가지일까?"',
                escalation: '재치료를 위해 다시 비용이 들어가니, 처음부터 제대로 할 걸 후회됐습니다.',
                crisis: '이번엔 정말 신중하게 선택하고 싶었습니다. 10년, 20년 후에도 만족할 수 있는 곳.'
            },
            trust: {
                situation: '20년 동안 다니던 치과가 갑자기 문을 닫았습니다.',
                innerConflict: '"처음부터 다시? 나를 아는 선생님이 필요한데..."',
                escalation: '새로운 치과들은 젊은 원장님들이 대부분이었고, 낯설었습니다.',
                crisis: '정기 검진 시기가 다가왔지만, 어디로 가야 할지 결정을 못 내리고 있었습니다.'
            }
        };

        return conflicts[contentType] || conflicts.empathy;
    }

    /**
     * 해결 과정 - 치과와의 만남
     */
    createResolution(contentType, directorStyle, clinicName, permissionLevel = 'L3') {
        const resolutions = {
            empathy: {
                discovery: `우연히 ${clinicName}의 후기를 보게 됐습니다. "치과 공포증이 있어도 괜찮았다"는 말에 용기를 냈습니다.`,
                firstContact: '전화로 먼저 상담했습니다. 상담실장님이 제 두려움을 충분히 들어주셨죠.',
                firstVisit: '처음 방문한 날, 원장님은 "오늘은 검사만 하고 가셔도 됩니다"라고 하셨습니다.',
                process: '무리하게 치료하지 않고, 제가 준비될 때까지 기다려주셨습니다. 천천히, 단계별로.',
                outcome: '3개월 후, 모든 치료를 마쳤습니다. 생각보다 전혀 무섭지 않았어요.'
            },
            understanding: {
                discovery: `지인의 소개로 ${clinicName}을 알게 됐습니다.`,
                firstContact: '상담 예약을 잡고, 이전 상담 내용들을 모두 가져갔습니다.',
                firstVisit: '원장님은 30분 동안 각 치과의 진단을 하나하나 설명해주셨습니다.',
                process: '"왜 다른지", "각각의 장단점", "제 경우 가장 적합한 방법"을 3D 영상으로 보여주셨습니다.',
                outcome: '드디어 명확히 이해했습니다. 그리고 확신을 갖고 결정할 수 있었습니다.'
            },
            decision: {
                discovery: `"환자가 선택하는 치과"라는 ${clinicName}의 철학이 마음에 들었습니다.`,
                firstContact: '홈페이지에서 "강요하지 않습니다"라는 문구를 보고 방문했습니다.',
                firstVisit: '원장님은 3가지 옵션을 제시하셨습니다. 각각의 비용, 기간, 장단점과 함께.',
                process: '"결정은 천천히 하셔도 됩니다. 집에 가서 가족과 상의하세요." 압박이 전혀 없었습니다.',
                outcome: '일주일 후, 제가 선택한 방법으로 치료를 시작했습니다. 내 선택이라 더 만족스러웠습니다.'
            },
            value: {
                discovery: `${clinicName}의 "10년 보증 프로그램"을 보고 관심을 가졌습니다.`,
                firstContact: '재치료 케이스라고 솔직히 말씀드렸습니다.',
                firstVisit: '원장님은 왜 문제가 생겼는지, 이번엔 어떻게 다를 수 있는지 설명하셨습니다.',
                process: '좋은 재료, 정밀한 시술, 그리고 사후 관리의 중요성. "비용보다 가치"라고 하셨죠.',
                outcome: '3년이 지난 지금도 전혀 문제없습니다. 정기 검진도 꾸준히 받고 있고요.'
            },
            trust: {
                discovery: `"3대가 다니는 치과" ${clinicName}의 이야기를 들었습니다.`,
                firstContact: '오래된 치과를 찾고 있었는데, 이곳은 20년 넘게 한 자리에 있었습니다.',
                firstVisit: '대기실에서 친구분들과 인사를 나누는 원장님을 봤습니다. 오랜 관계가 느껴졌죠.',
                process: '첫 방문인데도 마치 오래된 주치의처럼 편안하게 대해주셨습니다.',
                outcome: '이제 저도 이곳의 "오랜 환자"가 되어가고 있습니다. 믿을 수 있으니까요.'
            }
        };

        return resolutions[contentType] || resolutions.empathy;
    }

    /**
     * 변화와 결과
     */
    createTransformation(contentType, trustScores, permissionLevel = 'L3') {
        const transformations = {
            empathy: {
                immediate: '이제 정기 검진도 부담 없이 갑니다.',
                emotional: '치과 공포증이 완전히 사라진 건 아니지만, 이젠 관리할 수 있어요.',
                lifestyle: '친구들에게도 "치과 무서워하지 마라"고 말할 수 있게 됐습니다.',
                future: '앞으로도 평생 이곳에서 관리받을 생각입니다.'
            },
            understanding: {
                immediate: '내 입 안에서 무슨 일이 일어나는지 이제 이해합니다.',
                emotional: '혼란이 사라지니 불안도 함께 사라졌습니다.',
                lifestyle: '치료 결정에 대한 확신이 있으니, 과정이 훨씬 편합니다.',
                future: '다음에 문제가 생겨도, 여기서 명확한 답을 들을 수 있다는 믿음이 있습니다.'
            },
            decision: {
                immediate: '내가 선택했다는 것이 치료 과정 내내 힘이 됐습니다.',
                emotional: '자율성을 존중받으니, 원장님을 더 신뢰하게 됐어요.',
                lifestyle: '이제 다른 의료 결정도 더 주체적으로 할 수 있게 됐습니다.',
                future: '강요 없는 치료, 이게 정말 환자를 위한 거라는 걸 알았습니다.'
            },
            value: {
                immediate: '비용은 조금 더 들었지만, 결과는 확실히 다릅니다.',
                emotional: '이번엔 후회가 없습니다. 제대로 투자했다는 만족감.',
                lifestyle: '음식도 편하게 먹고, 웃을 때도 자신감이 생겼습니다.',
                future: '10년 후에도 이 상태를 유지할 자신이 있습니다. 정기 관리만 잘하면.'
            },
            trust: {
                immediate: '새로운 주치의를 찾았습니다.',
                emotional: '낯설었던 것들이 이제 익숙해지고 있습니다.',
                lifestyle: '가족에게도 소개했고, 이제 우리 가족 치과가 됐습니다.',
                future: '오래된 관계는 하루아침에 만들어지지 않죠. 하지만 시작은 좋습니다.'
            }
        };

        return transformations[contentType] || transformations.empathy;
    }

    /**
     * 메시지와 교훈
     * Permission Level에 따라 메시지 톤 조절
     */
    createMessage(contentType, philosophy, permissionLevel = 'L3') {
        const messagesByLevel = {
            L0: {
                empathy: {
                    lesson: '불안한 마음, 충분히 이해합니다.',
                    invitation: '편안하게 이야기 나눠보세요.',
                    promise: '당신의 속도에 맞춰 천천히 진행하겠습니다.'
                },
                understanding: {
                    lesson: '궁금증을 해소하는 것이 중요합니다.',
                    invitation: '질문하고 싶은 것을 편하게 물어보세요.',
                    promise: '이해하실 때까지 설명드리겠습니다.'
                },
                decision: {
                    lesson: '선택은 환자님의 권리입니다.',
                    invitation: '다양한 옵션을 제공하겠습니다.',
                    promise: '천천히 고민하신 후 결정하세요.'
                },
                value: {
                    lesson: '장기적 관점이 중요합니다.',
                    invitation: '함께 최선의 방법을 찾아보겠습니다.',
                    promise: '오래 사용할 수 있는 치료를 제공합니다.'
                },
                trust: {
                    lesson: '신뢰는 시간과 함께 쌓입니다.',
                    invitation: '편안한 관계를 만들어가겠습니다.',
                    promise: '오랫동안 함께하겠습니다.'
                }
            },
            L1: {
                empathy: {
                    lesson: '두려움은 함께 극복할 수 있습니다.',
                    invitation: '당신의 고민을 들려주세요.',
                    promise: '함께 해결해나가겠습니다.'
                },
                understanding: {
                    lesson: '이해가 선행되어야 합니다.',
                    invitation: '궁금한 점을 모두 물어보세요.',
                    promise: '명확히 설명드리겠습니다.'
                },
                decision: {
                    lesson: '좋은 선택을 위해서는 충분한 정보가 필요합니다.',
                    invitation: '여러 선택지를 함께 검토하겠습니다.',
                    promise: '당신의 결정을 존중합니다.'
                },
                value: {
                    lesson: '가치 있는 투자를 고민하셔야 합니다.',
                    invitation: '장기적 관점으로 함께 생각하겠습니다.',
                    promise: '만족하실 수 있는 결과를 제공합니다.'
                },
                trust: {
                    lesson: '신뢰 관계는 첫 만남부터 시작됩니다.',
                    invitation: '편안한 분위기에서 상담하겠습니다.',
                    promise: '지속적인 관계를 만들어가겠습니다.'
                }
            },
            L2: {
                empathy: {
                    lesson: '두려움은 이해받을 때 작아집니다.',
                    invitation: '당신의 두려움을 이야기해보세요.',
                    promise: '한 걸음씩, 당신의 속도에 맞춰 갑니다.'
                },
                understanding: {
                    lesson: '명확한 이해는 올바른 결정의 시작입니다.',
                    invitation: '궁금한 모든 것을 물어보세요.',
                    promise: '투명하고 명확한 정보만을 드립니다.'
                },
                decision: {
                    lesson: '최선의 치료는 환자가 선택한 치료입니다.',
                    invitation: '선택지를 드립니다. 결정은 당신의 몫입니다.',
                    promise: '강요 없는 진료를 약속합니다.'
                },
                value: {
                    lesson: '가치 있는 것이 진짜 투자입니다.',
                    invitation: '장기적 관점에서 함께 고민하겠습니다.',
                    promise: '오래 만족하실 수 있는 치료를 제공합니다.'
                },
                trust: {
                    lesson: '신뢰는 시간이 만들지만, 첫 만남에서 시작됩니다.',
                    invitation: '편안한 관계를 만들어갑니다.',
                    promise: '평생 주치의로서 곁에 있겠습니다.'
                }
            },
            L3: {
                empathy: {
                    lesson: '두려움은 반드시 극복할 수 있습니다.',
                    invitation: '우리가 함께 극복하겠습니다.',
                    promise: '당신의 속도에 맞춰 확실히 해결하겠습니다.'
                },
                understanding: {
                    lesson: '정확한 이해가 최선의 결과를 만듭니다.',
                    invitation: '완벽히 이해할 때까지 설명합니다.',
                    promise: '100% 투명하게 모든 정보를 공개합니다.'
                },
                decision: {
                    lesson: '당신의 선택이 최고의 치료를 만듭니다.',
                    invitation: '최적의 선택지를 제시합니다.',
                    promise: '존중하는 관계, 평생 약속합니다.'
                },
                value: {
                    lesson: '진짜 가치는 시간이 증명합니다.',
                    invitation: '10년 후에도 만족할 치료를 제안합니다.',
                    promise: '평생 만족을 보장합니다.'
                },
                trust: {
                    lesson: '진정한 신뢰는 행동으로 증명됩니다.',
                    invitation: '평생 파트너가 되겠습니다.',
                    promise: '절대 당신을 실망시키지 않겠습니다.'
                }
            },
            L4: {
                empathy: {
                    lesson: '더 이상 두려움 때문에 건강을 미루지 마세요.',
                    invitation: '지금 바로 극복할 수 있습니다.',
                    promise: '빠르고 확실하게 해결하겠습니다.'
                },
                understanding: {
                    lesson: '정확한 진단이 없으면 돈과 시간을 낭비합니다.',
                    invitation: '지금 당장 정확한 답을 드립니다.',
                    promise: '다시는 혼란스럽지 않도록 완벽히 설명합니다.'
                },
                decision: {
                    lesson: '빠른 결정이 더 나은 결과를 만듭니다.',
                    invitation: '최선의 방법을 제시합니다.',
                    promise: '지금 결정하면 최대 혜택을 드립니다.'
                },
                value: {
                    lesson: '싼 게 비지떡, 지금 제대로 하지 않으면 2배 비용이 듭니다.',
                    invitation: '평생 만족할 투자를 하세요.',
                    promise: '절대 후회하지 않을 결과를 약속합니다.'
                },
                trust: {
                    lesson: '검증된 곳을 선택해야 후회하지 않습니다.',
                    invitation: '지역 1위의 이유가 있습니다.',
                    promise: '평생 책임지고 관리합니다.'
                }
            },
            L5: {
                empathy: {
                    lesson: '오늘 결정하지 않으면 평생 후회합니다.',
                    invitation: '지금 이 순간이 변화의 기회입니다.',
                    promise: '당장 내일부터 인생이 달라집니다.'
                },
                understanding: {
                    lesson: '잘못된 선택은 돌이킬 수 없습니다.',
                    invitation: '더 이상 속지 마세요. 정확한 진단을 받으세요.',
                    promise: '100% 확실한 해답을 즉시 제공합니다.'
                },
                decision: {
                    lesson: '미루면 기회를 놓칩니다.',
                    invitation: '오늘 결정 시 특별 할인 제공.',
                    promise: '선착순 마감 - 지금 바로 예약하세요.'
                },
                value: {
                    lesson: '미루면 비용은 2배, 3배로 증가합니다.',
                    invitation: '지금이 평생 중 가장 저렴한 시기입니다.',
                    promise: '오늘 투자하면 평생 행복합니다.'
                },
                trust: {
                    lesson: '지금 결정이 평생을 좌우합니다.',
                    invitation: '검증된 최고의 선택을 하세요.',
                    promise: '만족 못하면 100% 환불 - 위험 제로!'
                }
            }
        };

        const messages = messagesByLevel[permissionLevel] || messagesByLevel.L3;
        return messages[contentType] || messages.empathy;
    }

    /**
     * 스토리 최종 조합
     */
    assembleStory(components) {
        const { character, conflict, resolution, transformation, message, context } = components;
        const length = context.length || 'basic';

        let story = '';

        // 제목 (Hook)
        story += `<div style="text-align: center; margin-bottom: 30px;">`;
        story += `<strong style="font-size: 24px; color: #667eea;">한 사람의 이야기</strong><br>`;
        story += `<span style="font-size: 14px; color: #999;">실제 환자의 경험을 바탕으로 재구성했습니다</span>`;
        story += `</div>`;

        // 1. 캐릭터 소개
        story += `<div style="margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 12px;">`;
        story += `<strong style="font-size: 18px; color: #333;">◆ ${character.name}</strong><br><br>`;
        story += `${character.background}.<br>`;
        story += `${character.fear}, 하지만 ${character.desire}.`;

        // 중문/장문: 캐릭터 배경 상세 추가
        if (length === 'medium' || length === 'long') {
            story += `<br><br>`;
            story += `<div style="padding: 15px; background: white; border-radius: 8px; margin-top: 15px;">`;
            story += `<strong>【 배경 】</strong><br><br>`;

            if (context.contentType === 'empathy') {
                story += `어릴 때 치과에서 겪은 나쁜 경험이 트라우마로 남아있었습니다. 그때의 공포가 아직도 생생했죠. 치과 냄새만 맡아도 심장이 두근거리고, 밤만 되면 치아가 시큰거렸습니다.`;
            } else if (context.contentType === 'understanding') {
                story += `여러 치과를 방문하면서 각각 다른 진단을 받았습니다. 한 곳은 3개월이면 된다고 했고, 다른 곳은 1년이 걸린다고 했습니다. 누구 말을 믿어야 할지 혼란스러웠습니다.`;
            } else if (context.contentType === 'decision') {
                story += `이전 치과에서는 원장님이 일방적으로 치료 계획을 정했습니다. "이렇게 하셔야 합니다"라는 말만 반복했죠. 거절할 분위기가 아니었고, 불편한 마음에 그냥 동의했습니다.`;
            } else if (context.contentType === 'value') {
                story += `3년 전, 가격이 저렴하다는 이유로 선택한 치과였습니다. 당시엔 만족했지만, 시간이 지나니 문제가 생기기 시작했습니다. 재치료 비용이 더 들게 됐죠.`;
            } else {
                story += `20년 넘게 다니던 치과 원장님이 은퇴하셨습니다. 그분은 제 치아 상태를 꿰뚫고 계셨고, 저도 원장님을 완전히 신뢰했습니다. 새로운 곳을 찾는다는 게 막막했습니다.`;
            }

            story += `</div>`;
        }

        story += `</div>`;

        // 2. 갈등과 문제
        story += `<div style="margin-bottom: 25px;">`;
        story += `<strong style="font-size: 16px; color: #ff6b9d;">【 위기 】</strong><br><br>`;
        story += `${conflict.situation}<br><br>`;
        story += `<em style="color: #666;">${conflict.innerConflict}</em><br><br>`;
        story += `${conflict.escalation}<br><br>`;
        story += `${conflict.crisis}`;

        // 장문: 위기의 디테일 추가
        if (length === 'long') {
            story += `<br><br>`;
            story += `<div style="padding: 15px; background: #fff5f5; border-radius: 8px; margin-top: 15px;">`;
            story += `<strong>【 그날의 심정 】</strong><br><br>`;

            if (context.contentType === 'empathy') {
                story += `"아, 이건 정말 참을 수 없어." 밤 2시, 진통제를 먹어도 통증이 가라앉지 않았습니다. 내일 회사는 어떻게 가지? 하지만 치과를 가야 한다는 생각만으로도 식은땀이 났습니다. 손바닥에 땀이 차고, 숨쉬기가 힘들었습니다.`;
            } else if (context.contentType === 'understanding') {
                story += `세 군데 치과, 세 가지 진단. 노트에 적어둔 내용을 보니 더 혼란스러웠습니다. A치과: 크라운 3개, 비용 300만원. B치과: 임플란트 1개, 크라운 2개, 비용 500만원. C치과: 임플란트 2개, 비용 800만원. 대체 진실은 무엇일까요?`;
            } else if (context.contentType === 'decision') {
                story += `원장님의 목소리가 귓가에 맴돌았습니다. "이 치료 안 하시면 나중에 더 큰 문제 생깁니다." 협박처럼 느껴졌습니다. 정말 필요한 걸까, 아니면 수익 때문에 권하는 걸까. 의심이 신뢰를 갉아먹었습니다.`;
            } else if (context.contentType === 'value') {
                story += `영수증을 다시 꺼내봤습니다. 120만원. 당시엔 저렴하다고 생각했는데, 3년 만에 재치료로 또 200만원이 들어갑니다. 처음부터 제대로 했으면 이렇게 되지 않았을 텐데. 후회가 밀려왔습니다.`;
            } else {
                story += `지갑 속 낡은 진료 카드를 꺼내봤습니다. "○○치과 - 박원장님". 22년간의 기록이 담긴 카드였습니다. 이제는 쓸모없는 종이 조각이 됐지만, 버릴 수가 없었습니다. 마치 오랜 친구와 이별한 것 같았습니다.`;
            }

            story += `</div>`;
        }

        story += `</div>`;

        // 3. 만남과 해결
        story += `<div style="margin-bottom: 25px; padding: 20px; background: #fff9e6; border-left: 4px solid #ffa500; border-radius: 8px;">`;
        story += `<strong style="font-size: 16px; color: #333;">【 전환점 】</strong><br><br>`;
        story += `${resolution.discovery}<br><br>`;
        story += `${resolution.firstContact}<br><br>`;
        story += `${resolution.firstVisit}<br><br>`;

        // 중문/장문: 첫 방문 디테일 추가
        if (length === 'medium' || length === 'long') {
            story += `<div style="padding: 15px; background: #fffef0; border-radius: 8px; margin: 15px 0;">`;
            story += `<strong>【 첫 만남의 순간 】</strong><br><br>`;
            story += `대기실에 들어서자 은은한 아로마 향이 났습니다. 일반 치과 소독약 냄새가 아니었죠. 차분한 음악이 흐르고, 따뜻한 조명이 불안감을 덜어줬습니다.<br><br>`;
            story += `"${character.name}님, 오늘 처음 오셨죠? 편하게 앉으세요." 상담실장님의 목소리가 부드러웠습니다. 강압적인 분위기가 전혀 없었습니다.`;
            story += `</div>`;
        }

        story += `${resolution.process}<br><br>`;

        // 장문: 치료 과정의 에피소드 추가
        if (length === 'long') {
            story += `<div style="padding: 15px; background: #fffef0; border-radius: 8px; margin: 15px 0;">`;
            story += `<strong>【 치료 여정 】</strong><br><br>`;

            if (context.contentType === 'empathy') {
                story += `<strong>1주차:</strong> 첫 검진. 손을 꽉 쥐고 있었는데, 간호사님이 "힘 빼세요, 오늘은 보기만 해요"라며 손을 툭툭 두드렸습니다.<br><br>`;
                story += `<strong>2주차:</strong> 간단한 스케일링. "무섭다"고 했더니 원장님이 한 단계씩 설명하면서 천천히 진행했습니다.<br><br>`;
                story += `<strong>1개월 후:</strong> "이제 할 수 있을 것 같아요"라고 먼저 말했습니다. 처음으로 제가 준비된 순간이었죠.<br><br>`;
                story += `<strong>3개월 후:</strong> 마지막 치료. 전혀 무섭지 않았습니다. 오히려 원장님과 농담을 주고받았죠.`;
            } else if (context.contentType === 'understanding') {
                story += `<strong>초진 상담 (1시간):</strong> 3D CT를 찍고, 구강 사진을 20장 넘게 촬영했습니다. 모니터에 제 치아가 확대되어 나타났죠.<br><br>`;
                story += `"여기 보이시죠? 이 부분이 문제입니다." 원장님이 하나하나 짚어가며 설명했습니다. 다른 치과들의 진단도 함께 비교 분석해주셨습니다.<br><br>`;
                story += `"A치과는 이렇게 본 거고, B치과는 저렇게 본 겁니다. 둘 다 틀린 건 아니에요. 다만 접근 방식이 다를 뿐이죠."<br><br>`;
                story += `드디어 이해했습니다. 왜 다른지, 무엇이 맞는지.`;
            } else if (context.contentType === 'decision') {
                story += `"세 가지 방법이 있습니다." 원장님이 종이에 그림을 그리며 설명했습니다.<br><br>`;
                story += `<strong>옵션 A:</strong> 비용 150만원, 기간 3개월, 내구성 7-10년<br>`;
                story += `<strong>옵션 B:</strong> 비용 250만원, 기간 6개월, 내구성 10-15년<br>`;
                story += `<strong>옵션 C:</strong> 비용 400만원, 기간 9개월, 내구성 15-20년<br><br>`;
                story += `"어떤 게 정답이다, 이런 건 없습니다. ${character.name}님의 상황, 예산, 라이프스타일을 고려해서 선택하시면 됩니다."<br><br>`;
                story += `일주일 동안 고민했고, 제 선택은 옵션 B였습니다. 원장님은 "좋은 선택입니다"라며 웃으셨죠.`;
            } else if (context.contentType === 'value') {
                story += `"왜 이전 치료가 문제가 생겼는지 아세요?" 원장님이 이전 X-ray를 가져왔습니다.<br><br>`;
                story += `"여기, 이 부분이 제대로 처리되지 않았어요. 당장은 괜찮아 보이지만, 시간이 지나면 문제가 생길 수밖에 없는 구조입니다."<br><br>`;
                story += `이번엔 달랐습니다. 더 좋은 재료, 더 정밀한 시술, 그리고 사후 관리 시스템. "비용이 조금 더 들지만, 10년 후에도 만족하실 겁니다."<br><br>`;
                story += `3년이 지난 지금, 전혀 문제없습니다. 6개월마다 정기 검진을 받고 있고, 원장님은 "완벽합니다"라고 하십니다.`;
            } else {
                story += `첫 방문 때 원장님이 물으셨습니다. "이전 치과 원장님께 무슨 치료를 받으셨나요?"<br><br>`;
                story += `제가 말하자 "아, 박 원장님이시군요. 저도 잘 압니다. 훌륭하신 분이죠." 같은 지역 치과 원장님들끼리 서로 알고 계셨습니다.<br><br>`;
                story += `"박 원장님처럼 하겠습니다. 새로운 스타일로 하는 게 아니라, 계속 이어가는 거죠. 편하게 생각하세요."<br><br>`;
                story += `그 말에 마음이 놓였습니다. 새로 시작하는 게 아니라, 이어가는 거라는 생각에.`;
            }

            story += `</div>`;
        }

        story += `<strong>${resolution.outcome}</strong>`;
        story += `</div>`;

        // 4. 변화와 결과
        story += `<div style="margin-bottom: 25px;">`;
        story += `<strong style="font-size: 16px; color: #667eea;">【 변화 】</strong><br><br>`;
        story += `<strong>✓ 당장의 변화:</strong> ${transformation.immediate}<br><br>`;
        story += `<strong>✓ 감정의 변화:</strong> ${transformation.emotional}<br><br>`;
        story += `<strong>✓ 삶의 변화:</strong> ${transformation.lifestyle}<br><br>`;
        story += `<strong>✓ 미래의 기대:</strong> ${transformation.future}`;

        // 중문/장문: 구체적인 변화 사례 추가
        if (length === 'medium' || length === 'long') {
            story += `<br><br>`;
            story += `<div style="padding: 15px; background: #f0f7ff; border-radius: 8px; margin-top: 15px;">`;
            story += `<strong>【 6개월 후의 나 】</strong><br><br>`;

            if (context.contentType === 'empathy') {
                story += `친구가 물었습니다. "너 요즘 치과 다니는 거 맞아? 전에는 말만 꺼내도 질색하더니."<br><br>`;
                story += `맞습니다. 이제는 정기 검진 날짜가 다가와도 스트레스받지 않습니다. 오히려 "점검 받는다"는 느낌으로 가볍게 갑니다.`;
            } else if (context.contentType === 'understanding') {
                story += `지인이 치과 추천을 부탁했을 때, 자신 있게 말할 수 있었습니다.<br><br>`;
                story += `"거기 가봐. 원장님이 정말 자세히 설명해주셔. 네가 궁금한 거 다 물어봐도 돼. 이해할 때까지 설명해주시거든."`;
            } else if (context.contentType === 'decision') {
                story += `다른 건강 문제로 병원을 갔을 때도 달라졌습니다.<br><br>`;
                story += `"선생님, 다른 방법은 없나요? 장단점을 좀 더 들어보고 싶어요." 의사 선생님이 놀란 표정으로 "요즘 환자분들 많이 똑똑해지셨네요"라고 하셨죠.`;
            } else if (context.contentType === 'value') {
                story += `아내가 말했습니다. "그때 좀 더 내더라도 제대로 하길 잘했어. 지금 다시 하느라 고생하는 거 봐봐."<br><br>`;
                story += `맞습니다. 당장의 비용이 아니라, 장기적인 가치를 봐야 한다는 걸 배웠습니다.`;
            } else {
                story += `새 치과를 찾아야 한다는 두려움이 오히려 좋은 기회가 됐습니다.<br><br>`;
                story += `"새로운 시작이 아니라 계속되는 관계"라는 걸 알게 됐죠. 이제는 우리 가족 모두 이곳에 다닙니다.`;
            }

            story += `</div>`;
        }

        story += `</div>`;

        // 5. 메시지
        story += `<div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">`;
        story += `<strong style="font-size: 18px;">${message.lesson}</strong><br><br>`;
        story += `${message.invitation}<br><br>`;
        story += `<em style="font-size: 16px;">"${message.promise}"</em>`;
        story += `</div>`;

        // CTA - Permission Level에 따라 조절
        const permissionLevel = context.permissionLevel || 'L3';
        story += `<div style="text-align: center; margin-top: 30px;">`;

        const ctaMessages = {
            L0: {
                title: '당신의 이야기도 시작될 수 있습니다',
                subtitle: '궁금하신 점이 있으시면 편안하게 문의해주세요',
                color: '#667eea'
            },
            L1: {
                title: '당신의 이야기를 함께 만들어가고 싶습니다',
                subtitle: '부담 없이 상담받아보세요',
                color: '#667eea'
            },
            L2: {
                title: '당신의 이야기는 어떻게 시작될까요?',
                subtitle: '부담 없이 먼저 이야기 나눠보세요',
                color: '#667eea'
            },
            L3: {
                title: '당신의 변화, 지금 시작하세요',
                subtitle: '무료 상담으로 먼저 시작해보세요',
                color: '#667eea'
            },
            L4: {
                title: '지금 바로 당신의 이야기를 시작하세요!',
                subtitle: '상담 예약은 선착순으로 마감됩니다',
                color: '#ff6b9d'
            },
            L5: {
                title: '오늘이 당신 인생의 전환점입니다!',
                subtitle: '지금 예약 시 특별 혜택 제공 - 서둘러 주세요',
                color: '#ff3366'
            }
        };

        const cta = ctaMessages[permissionLevel] || ctaMessages.L3;
        story += `<strong style="font-size: 18px; color: ${cta.color};">${cta.title}</strong><br><br>`;
        story += `<span style="font-size: 14px; color: #666;">${cta.subtitle}</span>`;

        story += `</div>`;

        // Add hashtags for storytelling
        story += `<br>`;
        story += `<div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0; color: #667eea; font-size: 14px; text-align: center;">`;
        story += this.generateHashtags(context);
        story += `</div>`;

        return story;
    }

    /**
     * 정체성 선언 스타일 문장 생성 (정체성 선언 + 설득 문장)
     *
     * 문장 공식:
     * ① 환자의 불안 언급
     * ② 원장 1인칭 등장
     * ③ 진료 철학 선언
     * ④ 서두르지 않겠다는 약속
     * ⑤ 결정권은 환자에게 있음
     * ⑥ 관계 중심 마무리
     *
     * @param {object} context - {contentType, revenueStage, directorName, clinicName, trustScores}
     * @returns {object} {content, filterResult}
     */
    generateIdentityStyle(context) {
        const {
            contentType = 'empathy',
            revenueStage,
            directorName = '원장',
            clinicName = '치과',
            trustScores = {}
        } = context;

        const stage = this.mapRevenueStageToStage(revenueStage);
        let content = '';

        // Step ① 환자의 불안 언급 (STAGE1-2 키워드)
        const anxietyOpening = this.generateAnxietyOpening(stage, contentType);
        content += `<strong style="font-size: 18px; color: #333;">${anxietyOpening}</strong><br><br>`;

        // Step ② 원장 1인칭 등장 (STAGE3 이상에서만)
        if (parseInt(stage.replace('STAGE', '')) >= 3) {
            const directorVoice = this.generateDirectorVoice(stage, directorName, trustScores);
            if (directorVoice) {
                content += `${directorVoice}<br><br>`;
            }
        }

        // Step ③ 진료 철학 선언 (STAGE4 이상에서만)
        if (parseInt(stage.replace('STAGE', '')) >= 4) {
            const philosophy = this.generatePhilosophyStatement(stage, directorName, contentType);
            content += `<strong>【 진료 철학 】</strong><br>${philosophy}<br><br>`;
        }

        // Step ④ 서두르지 않겠다는 약속 (모든 STAGE)
        const noRushPromise = this.generateNoRushPromise(stage);
        content += `${noRushPromise}<br><br>`;

        // Step ⑤ 결정권은 환자에게 있음 (STAGE3 이상에서만)
        if (parseInt(stage.replace('STAGE', '')) >= 3) {
            const patientAutonomy = this.generatePatientAutonomy(stage);
            content += `${patientAutonomy}<br><br>`;
        }

        // Step ⑥ 관계 중심 마무리 (STAGE5에서만)
        if (parseInt(stage.replace('STAGE', '')) >= 5) {
            const relationshipClosing = this.generateRelationshipClosing(stage, directorName, clinicName);
            content += `<strong style="color: #667eea;">${relationshipClosing}</strong>`;
        }

        // 조건부 단어 풀 필터링 적용
        const filterResult = this.filterText(content, stage, trustScores);

        return {
            content: filterResult.filteredText,
            filterResult: {
                violations: filterResult.violations,
                warnings: filterResult.warnings,
                stats: filterResult.stats
            },
            style: 'Identity',
            formula: '불안언급 → 원장1인칭 → 철학선언 → 서두르지않음 → 결정권환자 → 관계중심'
        };
    }

    /**
     * Step ① 환자의 불안 언급
     */
    generateAnxietyOpening(stage, contentType) {
        const anxietyTemplates = {
            empathy: [
                '치과 치료를 앞두고 걱정이 되시나요?',
                '치과에 가기가 망설여지시나요?',
                '어떤 치료가 필요한지 혼란스러우실 수 있습니다.'
            ],
            understanding: [
                '치과 치료에 대해 궁금하신 점이 많으실 겁니다.',
                '어떤 치료가 맞는지 고민이 되실 수 있습니다.',
                '복잡한 치료 설명이 부담스러우셨을 수 있습니다.'
            ],
            decision: [
                '치과 치료 결정이 쉽지 않으실 겁니다.',
                '어떤 선택이 맞는지 망설여지실 수 있습니다.',
                '비용과 효과를 놓고 고민이 되실 겁니다.'
            ],
            value: [
                '장기적으로 좋은 치료가 무엇인지 고민되시나요?',
                '지금 투자가 가치있을지 망설여지시나요?',
                '치료 후에도 유지가 될지 불안하실 수 있습니다.'
            ],
            trust: [
                '어떤 병원을 선택해야 할지 고민이시죠.',
                '이 병원을 믿어도 될지 망설여지실 수 있습니다.',
                '오래 함께할 치과를 찾기가 어려우셨을 겁니다.'
            ]
        };

        const templates = anxietyTemplates[contentType] || anxietyTemplates.empathy;
        return templates[Math.floor(Math.random() * templates.length)];
    }

    /**
     * Step ② 원장 1인칭 등장
     */
    generateDirectorVoice(stage, directorName, trustScores) {
        // 조건 체크
        const validation = this.validateWord('제가', stage, trustScores);
        if (!validation.allowed) {
            return ''; // 조건 미충족 시 생략
        }

        const templates = [
            `${directorName}입니다. 제가 직접 상담하고 치료합니다.`,
            `저는 ${directorName}입니다. 제가 환자분과 충분히 이야기 나누겠습니다.`,
            `${directorName}입니다. 제가 끝까지 책임지겠습니다.`
        ];

        return templates[Math.floor(Math.random() * templates.length)];
    }

    /**
     * Step ③ 진료 철학 선언
     */
    generatePhilosophyStatement(stage, directorName, contentType) {
        const philosophyTemplates = {
            empathy: '제가 가장 중요하게 생각하는 것은 환자분의 마음입니다. 불안을 먼저 해소하는 것이 치료의 시작이라고 믿습니다.',
            understanding: '제 진료 기준은 명확한 설명입니다. 환자분이 충분히 이해하실 때까지 설명하는 것이 제 원칙입니다.',
            decision: '제 철학은 환자분의 선택을 존중하는 것입니다. 강요하지 않고, 선택을 돕는 것이 제 역할입니다.',
            value: '제가 추구하는 치료는 10년 뒤를 생각하는 치료입니다. 지금 당장보다 오래 유지되는 가치를 중요하게 여깁니다.',
            trust: '제가 끝까지 지키고 싶은 기준은 신뢰입니다. 한 번의 치료가 아니라 평생 관계를 만드는 것이 제 목표입니다.'
        };

        return philosophyTemplates[contentType] || philosophyTemplates.empathy;
    }

    /**
     * Step ④ 서두르지 않겠다는 약속
     */
    generateNoRushPromise(stage) {
        const templates = [
            '천천히 충분히 고민하셔도 됩니다. 서두르지 않겠습니다.',
            '시간을 가지고 신중하게 결정하시면 됩니다. 급하지 않습니다.',
            '한 번 더 생각하시고 결정하셔도 충분합니다. 여유있게 결정하세요.',
            '오늘 결정하지 않으셔도 됩니다. 충분히 고민하신 후에 선택하세요.'
        ];

        return templates[Math.floor(Math.random() * templates.length)];
    }

    /**
     * Step ⑤ 결정권은 환자에게 있음
     */
    generatePatientAutonomy(stage) {
        const templates = [
            '결정은 환자분의 몫입니다. 이해하신 후에 동의하실 때만 진행합니다.',
            '환자분의 선택을 존중합니다. 강요하지 않습니다.',
            '최종 결정은 환자분께서 하시면 됩니다. 판단을 돕겠습니다.',
            '환자분이 원하실 때 시작하시면 됩니다. 선택은 자유롭게 하세요.'
        ];

        return templates[Math.floor(Math.random() * templates.length)];
    }

    /**
     * Step ⑥ 관계 중심 마무리
     */
    generateRelationshipClosing(stage, directorName, clinicName) {
        const templates = [
            `${clinicName}은 함께 오래 가는 관계를 만들고 싶습니다. 앞으로도 지켜보며 함께하겠습니다.`,
            `${directorName}은 이번 치료만이 아니라 과정을 함께하고 싶습니다. 계속 관계를 이어가겠습니다.`,
            `${clinicName}에서 평생 주치의 관계를 시작하세요. 끝까지 책임지겠습니다.`
        ];

        return templates[Math.floor(Math.random() * templates.length)];
    }

    /**
     * 정체성 선언 키워드 그룹 조회
     */
    getIdentityKeywordGroup(groupName) {
        return this.identityKeywordGroups[groupName] || null;
    }

    /**
     * 현재 STAGE에서 사용 가능한 정체성 선언 키워드 확인
     */
    getAvailableIdentityKeywords(stage, trustScores = {}) {
        const stageNum = parseInt(stage.replace('STAGE', ''));
        const available = {
            antiSpeed: this.identityKeywordGroups.antiSpeed.keywords, // 항상 사용 가능
            antiAdvertising: this.identityKeywordGroups.antiAdvertising.allowed, // 항상 사용 가능
            anxietyEmpathy: stageNum >= 1 ? this.identityKeywordGroups.anxietyEmpathy.keywords : [],
            patientRespect: stageNum >= 3 ? this.identityKeywordGroups.patientRespect.keywords : [],
            directorIdentity: stageNum >= 3 && trustScores.empathy >= 60 && trustScores.understanding >= 60
                ? this.identityKeywordGroups.directorIdentity.keywords : [],
            philosophy: stageNum >= 4 ? this.identityKeywordGroups.philosophy.keywords : [],
            relationship: stageNum >= 5 ? this.identityKeywordGroups.relationship.keywords : []
        };

        return available;
    }

    /**
     * ============================================================
     * 네이버 플레이스 전용 4단계 블록 구조 콘텐츠 생성 시스템
     * ============================================================
     *
     * 핵심 철학: 반응을 만들지 않고, 반응이 생길 수밖에 없는 구조를 설계
     *
     * 특징:
     * 1. 4단계 블록 구조 (공감→설명→유보→질문)
     * 2. 마지막 문장은 반드시 질문형
     * 3. 결론/정답 의도적 미제시
     * 4. 네이버 플레이스 신호 최적화 (체류시간, 댓글, 공감, 저장)
     */

    /**
     * 네이버 플레이스 신호 매핑 초기화
     */
    initializeNaverPlaceSignals() {
        this.naverPlaceSignals = {
            dwellTime: {
                strategy: '설명형 구조로 체류 유도',
                contentRatio: 0.6  // 설명형 문장 비율
            },
            empathy: {
                strategy: '초반 공감 블록으로 감정 동조',
                position: 'top_20_percent'
            },
            comments: {
                strategy: '질문형 종결로 댓글 유발',
                required: true
            },
            saves: {
                strategy: '정보 가치 제공으로 저장 유도',
                densityLevel: 'high'
            },
            revisits: {
                strategy: '시리즈 콘텐츠로 재방문 유도',
                toneConsistency: true
            }
        };

        // 질문형 종결 템플릿
        this.questionEndingTemplates = [
            '여러분은 어떤 기준이 더 중요하셨나요?',
            '이런 경우, 어떤 점을 가장 고려하시나요?',
            '치료를 결정하실 때 가장 중요하게 생각하시는 부분은 무엇인가요?',
            '비슷한 고민을 하신 적이 있으신가요?',
            '어떤 방향이 본인에게 더 맞을 것 같으신가요?',
            '이 중 어떤 부분이 가장 궁금하셨나요?',
            '같은 상황이라면 어떤 선택을 하실 것 같으신가요?',
            '환자분께서는 어떤 기준으로 판단하고 계신가요?'
        ];

        // 결론 유보 템플릿
        this.decisionHoldTemplates = [
            '이 부분은 상황에 따라 다를 수 있습니다',
            '개인의 상황마다 적합한 방법이 다를 수 있습니다',
            '충분히 생각해보신 후 결정하셔도 괜찮습니다',
            '서두르지 않고 여유있게 고민하셔도 됩니다',
            '오늘 바로 결정하지 않으셔도 됩니다',
            '여러 가지를 비교해보신 후 선택하시는 것도 좋습니다',
            '각자의 우선순위에 따라 달라질 수 있는 부분입니다',
            '시간을 갖고 신중하게 생각해보셔도 충분합니다'
        ];
    }

    /**
     * 네이버 플레이스 콘텐츠 생성 (메인 메서드)
     */
    generateNaverPlaceContent(context) {
        const {
            contentType = 'empathy',
            revenueStage = 'STAGE3',
            topic = '치과 치료',
            directorName = '원장',
            clinicName = '치과',
            trustScores = {}
        } = context;

        // 네이버 플레이스 신호 초기화 (한 번만)
        if (!this.naverPlaceSignals) {
            this.initializeNaverPlaceSignals();
        }

        // 4단계 블록 구조로 생성
        const blocks = {
            block1: this.generateNaverBlock1_Empathy(topic, contentType, revenueStage),
            block2: this.generateNaverBlock2_Explanation(topic, contentType, revenueStage),
            block3: this.generateNaverBlock3_DecisionHold(revenueStage, trustScores),
            block4: this.generateNaverBlock4_QuestionEnding(topic, contentType, revenueStage)
        };

        // 금지 단어 필터링
        const filtered = this.filterNaverPlaceContent(blocks, revenueStage, trustScores);

        // 제목 생성
        const title = this.generateNaverPlaceTitle(topic, contentType);

        // 최종 조합
        const content = this.assembleNaverPlaceContent(title, filtered);

        return {
            title: content.title,
            body: content.body,
            metadata: {
                channel: 'naver_place',
                stage: revenueStage,
                structure: 'four_block',
                hasQuestionEnding: true,
                conclusionHold: true,
                optimizedFor: ['dwellTime', 'empathy', 'comments', 'saves']
            }
        };
    }

    /**
     * Block 1: 공감 시작 (환자 불안·고민 제시)
     * 위치: 초반 20% (네이버 플레이스 공감 신호 최적화)
     */
    generateNaverBlock1_Empathy(topic, contentType, stage) {
        const empathyTemplates = {
            empathy: [
                `${topic}를 앞두고 걱정이 생기는 것은 자연스러운 일입니다.`,
                `${topic}에 대해 불안한 마음이 드시는 것은 당연합니다.`,
                `${topic}를 결정하는 것은 쉽지 않은 선택입니다.`
            ],
            understanding: [
                `${topic}에 대한 정보가 많아서 오히려 혼란스러우실 수 있습니다.`,
                `${topic}에 대해 궁금한 점이 많으신 것은 당연합니다.`,
                `${topic}를 이해하는 것이 먼저 필요하다는 생각이 드실 겁니다.`
            ],
            decision: [
                `${topic}를 선택할 때 여러 가지를 고려하게 됩니다.`,
                `${topic}에 대한 결정을 내리기가 망설여지실 수 있습니다.`,
                `${topic}를 결정하려면 충분한 시간이 필요합니다.`
            ],
            value: [
                `${topic}의 가치를 판단하기가 쉽지 않으실 겁니다.`,
                `${topic}가 장기적으로 좋을지 고민이 되실 수 있습니다.`,
                `${topic}에 대한 투자 가치를 생각하게 되실 겁니다.`
            ],
            trust: [
                `${topic}를 어디서 받을지 고민이 되실 겁니다.`,
                `${topic}를 믿고 맡길 곳을 찾기가 어려우실 수 있습니다.`,
                `${topic}에 대해 신뢰할 수 있는 정보가 필요하실 겁니다.`
            ]
        };

        const templates = empathyTemplates[contentType] || empathyTemplates.empathy;
        return templates[Math.floor(Math.random() * templates.length)];
    }

    /**
     * Block 2: 설명 (선택 기준 2~3가지 제시)
     * 목적: 체류 시간 증가 + 정보 가치 제공 (저장 유도)
     */
    generateNaverBlock2_Explanation(topic, contentType, stage) {
        return `${topic}를 선택할 때는 과정, 기간, 그리고 본인에게 맞는 방향을 충분히 이해하는 것이 중요합니다. ` +
               `각 방법마다 특징이 다르기 때문에, 여러 가지 기준을 비교해보시는 것이 도움이 됩니다. ` +
               `일반적으로 치료 방식, 회복 기간, 그리고 장기적인 유지 관리를 함께 고려하시면 좋습니다.`;
    }

    /**
     * Block 3: 결론 유보 (정답 의도적 미제시)
     * 목적: 환자 자율성 존중 + 서두르지 않는 태도
     */
    generateNaverBlock3_DecisionHold(stage, trustScores) {
        const baseTemplate = this.decisionHoldTemplates[
            Math.floor(Math.random() * this.decisionHoldTemplates.length)
        ];

        // STAGE별 추가 문장
        let additional = '';
        const stageNum = parseInt(stage.replace('STAGE', ''));

        if (stageNum >= 3) {
            additional = ' 환자분의 선택을 존중합니다.';
        }
        if (stageNum >= 4 && trustScores.empathy >= 60) {
            additional = ' 제가 충분히 설명드리겠습니다.';
        }

        return baseTemplate + '.' + additional;
    }

    /**
     * Block 4: 질문형 종결 (필수)
     * 목적: 댓글 유도 + 사용자 참여 촉진
     *
     * ⚠️ 중요: 네이버 플레이스 콘텐츠는 반드시 질문으로 끝나야 함
     */
    generateNaverBlock4_QuestionEnding(topic, contentType, stage) {
        // 질문 템플릿 랜덤 선택
        let question = this.questionEndingTemplates[
            Math.floor(Math.random() * this.questionEndingTemplates.length)
        ];

        // 주제를 포함한 맞춤형 질문으로 변경 (50% 확률)
        if (Math.random() > 0.5) {
            const topicQuestions = [
                `${topic}에 대해 어떤 점이 가장 궁금하셨나요?`,
                `${topic}를 선택하실 때 가장 중요하게 생각하시는 기준은 무엇인가요?`,
                `${topic}와 관련해 비슷한 고민을 하신 적이 있으신가요?`
            ];
            question = topicQuestions[Math.floor(Math.random() * topicQuestions.length)];
        }

        return question;
    }

    /**
     * 네이버 플레이스 전용 제목 생성
     */
    generateNaverPlaceTitle(topic, contentType) {
        const titleTemplates = {
            empathy: [
                `${topic}를 결정하기 전에 가장 많이 고민하시는 부분`,
                `${topic}, 어떤 기준으로 선택하시나요?`,
                `${topic}에 대해 궁금하신 점이 있으신가요?`
            ],
            understanding: [
                `${topic}, 제대로 이해하고 결정하기`,
                `${topic}를 선택할 때 알아두면 좋은 것들`,
                `${topic}에 대한 궁금증을 정리해드립니다`
            ],
            decision: [
                `${topic} 결정, 충분히 생각해보셔도 괜찮습니다`,
                `${topic}를 선택하는 기준`,
                `${topic}, 어떻게 결정하시나요?`
            ],
            value: [
                `${topic}의 가치, 어떻게 판단하시나요?`,
                `${topic}, 장기적으로 생각해보기`,
                `${topic}를 선택할 때 고려해야 할 것들`
            ],
            trust: [
                `${topic}, 믿고 맡길 수 있는 곳 찾기`,
                `${topic}를 위한 병원 선택 기준`,
                `${topic}, 어디서 받으시나요?`
            ]
        };

        const templates = titleTemplates[contentType] || titleTemplates.empathy;
        return templates[Math.floor(Math.random() * templates.length)];
    }

    /**
     * 네이버 플레이스 콘텐츠 금지 단어 필터링
     * 기존 forbiddenWords에 추가로 네이버 플레이스 특화 필터 적용
     */
    filterNaverPlaceContent(blocks, stage, trustScores) {
        const filtered = {};

        // 네이버 플레이스 추가 금지 패턴
        const naverForbiddenPatterns = [
            /이벤트/g,
            /할인/g,
            /혜택/g,
            /최저가/g,
            /특가/g,
            /프로모션/g,
            /한정/g,
            /오늘만/g,
            /지금 바로/g,
            /무료/g,
            /Before.*After/gi,
            /비포.*애프터/g,
            /타\s*병원/g,
            /다른\s*곳/g
        ];

        for (const blockKey in blocks) {
            let content = blocks[blockKey];

            // 기존 금지 단어 체크
            for (const word of this.forbiddenWords) {
                if (content.includes(word)) {
                    console.warn(`🚨 금지 단어 감지: "${word}" in ${blockKey}`);
                    // 금지 단어를 중립적 표현으로 대체
                    content = content.replace(new RegExp(word, 'g'), '');
                }
            }

            // 네이버 플레이스 특화 패턴 체크
            for (const pattern of naverForbiddenPatterns) {
                if (pattern.test(content)) {
                    console.warn(`🚨 네이버 플레이스 금지 패턴 감지: ${pattern} in ${blockKey}`);
                    content = content.replace(pattern, '');
                }
            }

            filtered[blockKey] = content;
        }

        return filtered;
    }

    /**
     * 네이버 플레이스 콘텐츠 최종 조합
     */
    assembleNaverPlaceContent(title, blocks) {
        const body = [
            blocks.block1,
            '',  // 단락 구분
            blocks.block2,
            '',
            blocks.block3,
            '',
            blocks.block4
        ].filter(line => line !== '');  // 빈 줄 제거

        return {
            title: title,
            body: body
        };
    }

    /**
     * 채널별 콘텐츠 생성 라우터 (통합 진입점)
     */
    generateByChannel(channel, context) {
        switch (channel) {
            case 'naver_place':
                return this.generateNaverPlaceContent(context);

            case 'blog':
                return this.generateStorytelling(context);

            case 'landing':
                return this.generateIntegratedContent(context);

            case 'identity':
                return this.generateIdentityStyle(context);

            default:
                // 기본값: 통합 콘텐츠
                return this.generateIntegratedContent(context);
        }
    }

    /**
     * 네이버 플레이스 콘텐츠 검증
     * - 마지막 문장이 질문형인지 확인
     * - 금지 단어 포함 여부 확인
     */
    validateNaverPlaceContent(content) {
        const validation = {
            valid: true,
            errors: []
        };

        // 1. 질문형 종결 확인
        const lastBlock = content.body[content.body.length - 1];
        if (!lastBlock.endsWith('?') && !lastBlock.includes('?')) {
            validation.valid = false;
            validation.errors.push('마지막 문장이 질문형이 아닙니다');
        }

        // 2. 금지 단어 확인
        const fullText = content.title + ' ' + content.body.join(' ');
        for (const word of this.forbiddenWords) {
            if (fullText.includes(word)) {
                validation.valid = false;
                validation.errors.push(`금지 단어 포함: ${word}`);
            }
        }

        // 3. 4단계 블록 구조 확인
        if (content.body.length < 4) {
            validation.valid = false;
            validation.errors.push('4단계 블록 구조가 아닙니다');
        }

        return validation;
    }
}

// Export for use in result.html
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarketingEngine;
}
