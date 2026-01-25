const supabase = window.supabase;

export async function fetchStats() {
    const { data, error } = await supabase
        .from('trades')
        .select('is_live, result, checked_questions');

    if (error) throw error;
    return data;
}
