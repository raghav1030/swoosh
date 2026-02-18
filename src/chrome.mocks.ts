
export const initChromeMocks = () => {
    if (typeof window === 'undefined') return;

    if (!window.chrome) {
        window.chrome = {} as any;
    }

    if (!window.chrome.storage) {
        console.info("🛠️ Injecting Chrome Storage Mock for Local Dev");
        window.chrome.storage = {
            local: {
                get: async (keys: string[]) => {
                    const result: any = {};
                    keys.forEach(key => {
                        const val = localStorage.getItem(`mock_chrome_${key}`);
                        if (val !== null) result[key] = JSON.parse(val);
                    });
                    return result;
                },
                set: async (items: Record<string, any>) => {
                    Object.entries(items).forEach(([key, value]) => {
                        localStorage.setItem(`mock_chrome_${key}`, JSON.stringify(value));
                    });
                },
                clear: async () => {
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('mock_chrome_')) {
                            localStorage.removeItem(key);
                        }
                    });
                }
            }
        } as any;
    }

    if (!window.chrome.tabs) {
        console.info("🛠️ Injecting Chrome Tabs Mock for Local Dev");
        window.chrome.tabs = {
            create: async ({ url }: { url: string }) => {
                console.log(`[Mock] Opening tab: ${url}`);
                window.open(url, '_blank');
            }
        } as any;
    }

    if (!window.chrome.runtime) {
        window.chrome.runtime = {} as any;
    }
    if (!window.chrome.runtime.getURL) {
        window.chrome.runtime.getURL = (path: string) => `/${path}`;
    }
};