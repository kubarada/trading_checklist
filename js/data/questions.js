export const questions = {
    long: {
        narative: {
            title: 'Narativ/Seasonality',
            items: [
                'Je vyšší timeframe v souladu?',
                'Jsme u významné S/R zóny?',
                'Je trh v trendu?'
            ]
        },
        analysis: {
            title: 'Technická analýza',
            items: [
                'Je potvrzený vstupní pattern?',
                'Je RRR alespoň 1:2?',
                'Je likvidita vybraná?'
            ]
        },
        entry: {
            title: 'Entry model',
            items: [
                'Je stop-loss jasně definovaný?',
                'Je velikost pozice správná?',
                'Je trade v souladu s plánem?'
            ]
        }
    },

    short: {
        narative: {
            title: 'Narativ/Seasonality',
            items: [
                'Je vyšší timeframe bearish?',
                'Jsme u rezistence?',
                'Je struktura trhu jasná?'
            ]
        },
        analysis: {
            title: 'Technická analýza',
            items: [
                'Je potvrzený short pattern?',
                'Je RRR alespoň 1:2?',
                'Je likvidita nad high?'
            ]
        },
        entry: {
            title: 'Entry model',
            items: [
                'Je stop-loss nad high?',
                'Je risk fixní?',
                'Je trade dle plánu?'
            ]
        }
    }
};
