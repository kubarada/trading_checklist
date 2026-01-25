const supabase = window.supabase;

export async function fetchStats() {
    const { data, error } = await supabase
        .from('trades')
        .select('is_live, result, checked_questions');

    if (error) throw error;

    // 🔒 NORMALIZACE DAT (KLÍČOVÉ)
    return data.map(t => ({
        ...t,
        checked_questions: normalizeQuestions(t.checked_questions)
    }));
}

function normalizeQuestions(raw) {
    if (!Array.isArray(raw)) return [];

    return raw
        .map(q => {
            // string ID
            if (typeof q === 'string') return q.trim();

            // object { id, text }
            if (typeof q === 'object' && q !== null) {
                return String(q.id || '').trim();
            }

            return null;
        })
        .filter(Boolean);
}