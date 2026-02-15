import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as CryptoJS from 'crypto-js'

import { useWalletStore } from '@/store/useWalletStore'
import { keypairGenerators } from '@/lib/walletUtils'

import { ShootingStars } from '../components/ui/shooting-stars'
import { StarsBackground } from '../components/ui/stars-background'

import Dashboard from '@/components/extension/Dashboard'
import Login from '@/components/extension/Login'

const App = () => {
    const { wallets, setWallets, setPassword } = useWalletStore()
    const [hydrated, setHydrated] = useState(false)
    const [status, setStatus] = useState<'loading' | 'no_wallet' | 'locked' | 'unlocked'>('loading')
    const [encryptedMnemonic, setEncryptedMnemonic] = useState<string | null>(null)
    const [direction, setDirection] = useState(0)

    const initialized = useRef(false)

    /**
     * Redirects to the full-screen onboarding page.
     * window.close() is called to shut the popup immediately after the tab opens.
     */
    const openOnboarding = useCallback(() => {
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') })
            window.close()
        } else {
            window.open('/onboarding.html', '_blank')
        }
    }, [])

    useEffect(() => {
        if (initialized.current) return
        initialized.current = true

        const initExtension = async () => {
            try {
                // 1. Rehydrate Zustand persistent state
                await useWalletStore.persist.rehydrate()

                // 2. Check Chrome Storage for an existing encrypted vault
                if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                    chrome.storage.local.get(['hasWallet', 'encryptedMnemonic'], (result) => {
                        if (result?.hasWallet) {
                            setEncryptedMnemonic(result.encryptedMnemonic as string)

                            // If wallets exist in the current session memory, stay unlocked
                            const currentWallets = useWalletStore.getState().wallets
                            setStatus(currentWallets?.length > 0 ? 'unlocked' : 'locked')
                            setHydrated(true)
                        } else {
                            // REDIRECT LOGIC: No wallet found in storage
                            setStatus('no_wallet')
                            openOnboarding()
                        }
                    })
                } else {
                    // Dev Fallback: If not in extension environment, treat as new user
                    setStatus('no_wallet')
                    openOnboarding()
                }
            } catch (err) {
                console.error("Swoosh Init Error:", err)
                setStatus('no_wallet')
                setHydrated(true)
            }
        }

        initExtension()
    }, [openOnboarding])

    const handleUnlock = (pass: string) => {
        try {
            if (!encryptedMnemonic) return { success: false, error: "Vault empty" }

            const bytes = CryptoJS.AES.decrypt(encryptedMnemonic, pass)
            const decryptedMnemonic = bytes.toString(CryptoJS.enc.Utf8)

            if (!decryptedMnemonic) throw new Error("Invalid decryption")

            const derived = keypairGenerators.fromMnemonic(decryptedMnemonic, ['solana', 'ethereum'] as any)

            setWallets(derived)
            setPassword(pass)
            setDirection(1)
            setStatus('unlocked')

            return { success: true }
        } catch (e) {
            return { success: false, error: "Incorrect Password" }
        }
    }

    const handleLock = () => {
        setDirection(-1)
        setWallets([]) // Clear sensitive data from memory
        setStatus('locked')
    }

    const renderStep = () => {
        switch (status) {
            case 'locked':
                return <Login /*onUnlock={handleUnlock}*/ />
            case 'unlocked':
                return <Dashboard /*wallets={wallets} onLock={handleLock}*/ />
            case 'no_wallet':
                // Return empty while the redirect finishes
                return null
            default:
                return null
        }
    }

    // While initializing or redirecting, show the loading state
    if (!hydrated || status === 'loading' || status === 'no_wallet') {
        return (
            <div className="h-[600px] w-[360px] bg-black flex items-center justify-center text-white font-mono text-[10px] tracking-widest">
                {status === 'no_wallet' ? 'REDIRECTING...' : 'INITIALIZING_SWOOSH...'}
            </div>
        )
    }

    return (
        <div className="h-[600px] w-[360px] bg-black relative overflow-hidden flex flex-col shadow-2xl">
            <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
                <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                    <motion.div
                        key={status}
                        custom={direction}
                        variants={{
                            enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
                            center: { zIndex: 1, x: 0, opacity: 1 },
                            exit: (d: number) => ({ zIndex: 0, x: d < 0 ? '100%' : '-100%', opacity: 0 })
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="absolute inset-0 z-0 pointer-events-none">
                <ShootingStars maxDelay={1} starWidth={10} />
                <StarsBackground />
            </div>
        </div>
    )
}

export default App