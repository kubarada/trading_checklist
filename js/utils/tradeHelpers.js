export function getSession(datetime) {
    const hour = new Date(datetime).getHours();

    if (hour >= 2 && hour < 6) return 'asia';
    if (hour >= 9 && hour < 14) return 'london';
    if (hour >= 14 && hour < 22) return 'ny';

    return 'off';
}

export function getGrade(score) {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    return 'B';
}
