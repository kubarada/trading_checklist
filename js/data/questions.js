export const questions = {
    long: {
        narative: {
            title: 'Narativ/Seasonality',
            items: [
                { id: 'long_htf_alignment', text: 'Je vyšší timeframe v souladu?' },
                { id: 'long_sr_zone', text: 'Jsme u významné S/R zóny?' },
                { id: 'long_trend', text: 'Je trh v trendu?' }
            ]
        },
        analysis: {
            title: 'Technická analýza',
            items: [
                { id: 'long_entry_pattern', text: 'Je potvrzený vstupní pattern?' },
                { id: 'long_rrr_ok', text: 'Je RRR alespoň 1:2?' },
                { id: 'long_liquidity_taken', text: 'Je likvidita vybraná?' }
            ]
        },
        entry: {
            title: 'Entry model',
            items: [
                { id: 'long_sl_defined', text: 'Je stop-loss jasně definovaný?' },
                { id: 'long_position_size', text: 'Je velikost pozice správná?' },
                { id: 'long_trade_plan', text: 'Je trade v souladu s plánem?' }
            ]
        }
    },

    short: {
        narative: {
            title: 'Narativ/Seasonality',
            items: [
                { id: 'short_htf_bearish', text: 'Je vyšší timeframe bearish?' },
                { id: 'short_resistance', text: 'Jsme u rezistence?' },
                { id: 'short_structure_clear', text: 'Je struktura trhu jasná?' }
            ]
        },
        analysis: {
            title: 'Technická analýza',
            items: [
                { id: 'short_entry_pattern', text: 'Je potvrzený short pattern?' },
                { id: 'short_rrr_ok', text: 'Je RRR alespoň 1:2?' },
                { id: 'short_liquidity_above_high', text: 'Je likvidita nad high?' }
            ]
        },
        entry: {
            title: 'Entry model',
            items: [
                { id: 'short_sl_above_high', text: 'Je stop-loss nad high?' },
                { id: 'short_risk_fixed', text: 'Je risk fixní?' },
                { id: 'short_trade_plan', text: 'Je trade dle plánu?' }
            ]
        }
    }
};
