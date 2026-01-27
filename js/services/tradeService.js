import { getSession, getGrade } from '../utils/tradeHelpers.js';

const supabase = window.supabase;

export async function saveTrade(state) {
    /* ===== AUTH USER ===== */
    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error('User not authenticated');
    }

    /* ===== VALIDATION ===== */
    if (!state.instrument || !state.direction || !state.tradeDatetime) {
        throw new Error('Missing trade data');
    }

    if (!state.score || !state.checkedQuestions) {
        throw new Error('Checklist data missing');
    }

    if (!state.isLive && !state.tradeResult) {
        throw new Error('Backtest result missing');
    }

    /* ===== TRADE OBJECT ===== */
    const trade = {
        user_id: user.id,
        instrument: state.instrument,
        direction: state.direction,
        is_live: state.isLive,
        trade_datetime: state.tradeDatetime,
        session: getSession(state.tradeDatetime),
        checklist_score: state.score,
        grade: getGrade(state.score),
        result: state.isLive ? null : state.tradeResult,
        checked_questions: state.checkedQuestions
    };

    /* ===== INSERT + RETURN ID ===== */
    const { data, error } = await supabase
        .from('trades')
        .insert(trade)
        .select('id')
        .single();

    if (error) {
        console.error('Supabase insert error:', error);
        throw error;
    }

    // 🔥 KLÍČOVÁ ZMĚNA
    return data.id;
}
