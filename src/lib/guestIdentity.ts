
// lib/guestIdentity.ts
export function getGuestIdFromCookiesOrLocalStorage(): string | null {
    if (typeof window === 'undefined') return null;

    // Try to get from cookies first
    const fromCookie = document.cookie
        .split('; ')
        .find((c) => c.startsWith('koli_guest_id='))
        ?.split('=')[1];

    if (fromCookie) return fromCookie;

    // Fallback to local storage
    const fromLocal = window.localStorage.getItem('koli_guest_id');

    // If neither exists, generate one for this session (Self-healing)
    if (!fromLocal) {
        const newGuestId = 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        window.localStorage.setItem('koli_guest_id', newGuestId);
        return newGuestId;
    }

    return fromLocal || null;
}
