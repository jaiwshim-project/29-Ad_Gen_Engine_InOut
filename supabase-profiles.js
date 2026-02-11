/**
 * Supabase 프로필 관리 모듈
 * registered_clinics 테이블 전용 (Supabase Only)
 */

const PROFILE_SUPABASE_URL = 'https://haxcktfnuudlqciyljtp.supabase.co';
const PROFILE_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheGNrdGZudXVkbHFjaXlsanRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMDUwNDAsImV4cCI6MjA4NDg4MTA0MH0.suN7BeaHx3MjaNlMDQa0940P-rMl2XPyk4ksoQEU3YM';

let profileSupabase = null;
let profileSupabaseReady = false;

function initProfileSupabase() {
    try {
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            profileSupabase = window.supabase.createClient(PROFILE_SUPABASE_URL, PROFILE_SUPABASE_KEY);
            profileSupabaseReady = true;
            console.log('[ProfileDB] Supabase 연결 성공');
        } else {
            console.error('[ProfileDB] Supabase SDK 미로드');
            profileSupabaseReady = false;
        }
    } catch (err) {
        console.error('[ProfileDB] Supabase 초기화 실패:', err);
        profileSupabaseReady = false;
    }
}

// === JS ↔ DB 필드 매핑 ===

function profileToDbRow(profile) {
    return {
        name: profile.clinicName || '',
        director: profile.directorName || '',
        region: profile.location || '',
        profile_number: profile.profileNumber || null,
        phone: profile.phone || '',
        specialty: profile.specialty || '',
        access_password: profile.accessPassword || '',
        revenue_stage1: profile.revenueStage1 || '',
        revenue_stage2: profile.revenueStage2 || '',
        director_style1: profile.directorStyle1 || '',
        director_style2: profile.directorStyle2 || '',
        empathy: parseInt(profile.empathy) || 0,
        understanding: parseInt(profile.understanding) || 0,
        decision_score: parseInt(profile.decision) || 0,
        value_score: parseInt(profile.value) || 0,
        trust_score: parseInt(profile.trust) || 0,
        space_score: parseInt(profile.space) || 0,
        philosophy: profile.philosophy || '',
        differentiation: profile.differentiation || '',
        channel: profile.channel || [],
        content_types: profile.content || [],
        saved_at: profile.savedAt || new Date().toISOString(),
        registered_at: profile.createdAt || new Date().toISOString()
    };
}

function dbRowToProfile(row) {
    return {
        clinicName: row.name || '',
        directorName: row.director || '',
        location: row.region || '',
        profileNumber: row.profile_number || '',
        phone: row.phone || '',
        specialty: row.specialty || '',
        accessPassword: row.access_password || '',
        revenueStage1: row.revenue_stage1 || '',
        revenueStage2: row.revenue_stage2 || '',
        directorStyle1: row.director_style1 || '',
        directorStyle2: row.director_style2 || '',
        empathy: String(row.empathy || 0),
        understanding: String(row.understanding || 0),
        decision: String(row.decision_score || 0),
        value: String(row.value_score || 0),
        trust: String(row.trust_score || 0),
        space: String(row.space_score || 0),
        philosophy: row.philosophy || '',
        differentiation: row.differentiation || '',
        channel: row.channel || [],
        content: row.content_types || [],
        savedAt: row.saved_at || row.registered_at || '',
        createdAt: row.registered_at || '',
        id: row.id || 0
    };
}

// === CRUD 함수 ===

async function loadAllProfiles() {
    if (!profileSupabaseReady) {
        console.error('[ProfileDB] Supabase 미연결');
        return [];
    }

    try {
        const { data, error } = await profileSupabase
            .from('registered_clinics')
            .select('*')
            .order('registered_at', { ascending: true });

        if (error) throw error;

        const profiles = (data || []).map(dbRowToProfile);
        console.log(`[ProfileDB] ${profiles.length}개 프로필 로드 완료`);
        return profiles;
    } catch (err) {
        console.error('[ProfileDB] 로드 실패:', err.message);
        return [];
    }
}

async function saveProfileToSupabase(profileData) {
    if (!profileSupabaseReady) {
        console.error('[ProfileDB] Supabase 미연결, 저장 불가');
        return { success: false, error: 'Supabase 미연결' };
    }

    try {
        const dbRow = profileToDbRow(profileData);

        const { data, error } = await profileSupabase
            .from('registered_clinics')
            .upsert(dbRow, { onConflict: 'profile_number' })
            .select();

        if (error) throw error;

        console.log(`[ProfileDB] 프로필 저장 완료: #${profileData.profileNumber}`);
        return { success: true, data };
    } catch (err) {
        console.error('[ProfileDB] 저장 실패:', err.message);
        return { success: false, error: err.message };
    }
}

async function deleteProfileFromSupabase(profileNumber) {
    if (!profileSupabaseReady) {
        console.error('[ProfileDB] Supabase 미연결, 삭제 불가');
        return { success: false, error: 'Supabase 미연결' };
    }

    try {
        const { error } = await profileSupabase
            .from('registered_clinics')
            .delete()
            .eq('profile_number', profileNumber);

        if (error) throw error;

        console.log(`[ProfileDB] 프로필 삭제 완료: #${profileNumber}`);
        return { success: true };
    } catch (err) {
        console.error('[ProfileDB] 삭제 실패:', err.message);
        return { success: false, error: err.message };
    }
}

async function searchProfiles(filters) {
    if (!profileSupabaseReady) {
        console.error('[ProfileDB] Supabase 미연결');
        return [];
    }

    try {
        let query = profileSupabase
            .from('registered_clinics')
            .select('*')
            .order('registered_at', { ascending: true });

        if (filters.profileNumber) {
            query = query.ilike('profile_number', `%${filters.profileNumber}%`);
        }
        if (filters.clinicName) {
            query = query.ilike('name', `%${filters.clinicName}%`);
        }
        if (filters.directorName) {
            query = query.ilike('director', `%${filters.directorName}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map(dbRowToProfile);
    } catch (err) {
        console.error('[ProfileDB] 검색 실패:', err.message);
        return [];
    }
}

async function getNextProfileNumber() {
    if (!profileSupabaseReady) {
        return '0001';
    }

    try {
        const { data, error } = await profileSupabase
            .from('registered_clinics')
            .select('profile_number')
            .order('profile_number', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (data && data.length > 0 && data[0].profile_number) {
            const maxNum = parseInt(data[0].profile_number) || 0;
            return String(maxNum + 1).padStart(4, '0');
        }

        return '0001';
    } catch (err) {
        console.error('[ProfileDB] 번호 조회 실패:', err.message);
        return '0001';
    }
}

async function getProfileByNumber(profileNumber) {
    if (!profileSupabaseReady) {
        console.error('[ProfileDB] Supabase 미연결');
        return null;
    }

    try {
        const { data, error } = await profileSupabase
            .from('registered_clinics')
            .select('*')
            .eq('profile_number', profileNumber)
            .single();

        if (error) throw error;
        return dbRowToProfile(data);
    } catch (err) {
        console.error('[ProfileDB] 단건 조회 실패:', err.message);
        return null;
    }
}

async function getProfileCount() {
    if (!profileSupabaseReady) {
        return 0;
    }

    try {
        const { count, error } = await profileSupabase
            .from('registered_clinics')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return count || 0;
    } catch (err) {
        console.error('[ProfileDB] 카운트 실패:', err.message);
        return 0;
    }
}
