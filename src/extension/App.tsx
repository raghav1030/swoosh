import { useEffect, useState } from 'react'
import { useWalletStore } from '@/store/useWalletStore'
import { Button } from '@/components/ui/button'

const App = () => {
    const { wallets } = useWalletStore()
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        useWalletStore.persist.rehydrate()
        setHydrated(true)
    }, [])

    const openOnboarding = () => {
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            // This opens the extension version of the page
            chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') })
        } else {
            // This handles local development (localhost:5173)
            window.open('/onboarding.html', '_blank')
        }
    }

    if (!hydrated) return <div className="h-[600px] w-[360px] bg-black" />

    if (wallets || wallets.length === 0) {
        return (
            <div className="h-[600px] w-[360px] bg-black text-white flex flex-col items-center justify-center p-6 gap-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
                        Swoosh
                    </h1>
                    <p className="text-gray-400 text-sm">
                        The next gen crypto wallet
                    </p>
                </div>
                <Button
                    onClick={openOnboarding}
                    className="w-full bg-white text-black hover:bg-gray-200"
                >
                    Get Started
                </Button>
            </div>
        )
    }

    return (
        <div className="h-[600px] w-[360px] bg-black text-white p-4">
            <div className="flex flex-col gap-4">
                <h1 className="text-xl font-bold">Dashboard</h1>
                <div className="p-4 bg-gray-900 rounded-lg">
                    <p className="text-gray-400 text-xs">Total Balance</p>
                    <p className="text-2xl font-bold">$0.00</p>
                </div>
                <div className="space-y-2">
                    {wallets.map((w, i) => (
                        <div key={i} className="text-sm text-gray-400 truncate">
                            {w.publicKey}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default App