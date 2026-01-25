export const questions = {
    long: {
        narative: {
            title: 'Narativ/Seasonality',
            items: [
                { id: 'htf_alignment', text: 'Je vyšší timeframe v souladu?' },
                { id: 'sr_zone', text: 'Jsme u významné S/R zóny?' },
                { id: 'trend', text: 'Je trh v trendu?' }
            ]
        },
        analysis: {
            title: 'Technická analýza',
            items: [
                { id: 'entry_pattern', text: 'Je potvrzený vstupní pattern?' },
                { id: 'rrr_ok', text: 'Je RRR alespoň 1:2?' },
                { id: 'liquidity_taken', text: 'Je likvidita vybraná?' }
            ]
        },
        entry: {
            title: 'Entry model',
            items: [
                { id: 'sl_defined', text: 'Je stop-loss jasně definovaný?' },
                { id: 'position_size', text: 'Je velikost pozice správná?' },
                { id: 'trade_plan', text: 'Je trade v souladu s plánem?' }
            ]
        }
    },

    short: {
        narative: {
            title: 'Narativ/Seasonality',
            items: [
                { id: 'htf_bearish', text: 'Je vyšší timeframe bearish?' },
                { id: 'resistance', text: 'Jsme u rezistence?' },
                { id: 'structure_clear', text: 'Je struktura trhu jasná?' }
            ]
        },
        analysis: {
            title: 'Technická analýza',
            items: [
                { id: 'entry_pattern', text: 'Je potvrzený short pattern?' },
                { id: 'rrr_ok', text: 'Je RRR alespoň 1:2?' },
                { id: 'liquidity_above_high', text: 'Je likvidita nad high?' }
            ]
        },
        entry: {
            title: 'Entry model',
            items: [
                { id: 'sl_above_high', text: 'Je stop-loss nad high?' },
                { id: 'risk_fixed', text: 'Je risk fixní?' },
                { id: 'trade_plan', text: 'Je trade dle plánu?' }
            ]
        }
    }
};
