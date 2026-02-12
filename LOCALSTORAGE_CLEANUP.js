// Add this to app/page.js or create a new useEffect in the main component
// This will clear old localStorage data on first load after deployment

useEffect(() => {
    // Check if this is first load after fresh launch
    const FRESH_LAUNCH_DATE = '2026-02-12'; // Today's date
    const lastClear = localStorage.getItem('last_data_clear');

    if (!lastClear || lastClear < FRESH_LAUNCH_DATE) {
        // Clear all old app data
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.startsWith('ncp_') ||
                key.includes('username') ||
                key.includes('user_id') ||
                key.includes('incident') ||
                key.includes('chat')
            )) {
                keysToRemove.push(key);
            }
        }

        // Remove all identified keys
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Mark that we've cleared data
        localStorage.setItem('last_data_clear', FRESH_LAUNCH_DATE);

        console.log('🧹 Old data cleared for fresh launch');
    }
}, []);
