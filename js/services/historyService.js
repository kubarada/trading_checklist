const supabase = window.supabase;

export async function fetchTrades(filters = {}) {
    let query = supabase
        .from('trades')
        .select('*')
        .order('trade_datetime', { ascending: false });

    /* ===== INSTRUMENT ===== */
    if (filters.instrument) {
        query = query.eq('instrument', filters.instrument);
    }

    /* ===== MODE (LIVE / BACKTEST) ===== */
    if (filters.is_live === 'true') {
        query = query.eq('is_live', true);
    }

    if (filters.is_live === 'false') {
        query = query.eq('is_live', false);
    }

    // WIN / LOSS / BE
    if (
        filters.result &&
        filters.result !== 'LIVE'
    ) {
        query = query.eq('result', filters.result);
    }

    const { data, error } = await query;

    console.log('FETCH TRADES:', filters, data, error);

    if (error) {
        throw error;
    }

    return data;
}
