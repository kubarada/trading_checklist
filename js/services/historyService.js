const supabase = window.supabase;

export async function fetchTrades(state) {
    let query = supabase
        .from('trades')
        .select('*');

    /* ===== FILTERS ===== */
    if (state.filters.instrument) {
        query = query.ilike(
            'instrument',
            `%${state.filters.instrument}%`
        );
    }

    if (state.filters.session) {
        query = query.ilike(
            'session',
            `%${state.filters.session}%`
        );
    }

    if (state.filters.result === 'LIVE') {
        query = query.is('result', null);
    }

    if (
        state.filters.result &&
        state.filters.result !== 'LIVE'
    ) {
        query = query.eq('result', state.filters.result);
    }

    /* ===== SORT ===== */
    query = query.order(
        state.sort.column,
        { ascending: state.sort.direction === 'asc' }
    );

    const { data, error } = await query;

    if (error) throw error;
    return data;
}