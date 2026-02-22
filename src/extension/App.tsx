import Dashboard from "@/components/extension/Dashboard"
import Login from "@/components/extension/Login"
import { ShootingStars } from "@/components/ui/shooting-stars"
import { StarsBackground } from "@/components/ui/stars-background"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { checkWalletStatus, lockWallet, unlockWallet } from "@/lib/extensionUtils"
import SelectWallet from "@/components/extension/SelectWallets"
import AddAccountOverlay from "@/components/extension/Dashboard/AddAccountOverlay"

export default function App() {
    const [status, setStatus] = useState<'loading' | 'locked' | 'select_wallet' | 'dashboard'>('loading')
    const [direction, setDirection] = useState(1)

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 1,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 1,
        })
    }

    useEffect(() => {
        const initializeExtension = async () => {
            try {
                if (!window.chrome || !window.chrome.tabs) {
                    setStatus("locked")
                    return
                }
                const currentStatus = await checkWalletStatus()

                if (currentStatus === 'no_wallet') {
                    chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') })
                    window.close()
                    return
                }

                if (currentStatus === 'unlocked') {
                    setStatus('select_wallet')
                } else {
                    setStatus('locked')
                }
            } catch (error) {
                console.error("Initialization error:", error)
                chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') })
                window.close()
            }
        }

        initializeExtension()
    }, [])

    const handleUnlock = async (password: string): Promise<boolean> => {
        const isSuccess = await unlockWallet(password)
        if (isSuccess) {
            setDirection(1)
            setStatus('select_wallet')
            return true
        }
        return false
    }

    const handleSelectWallet = () => {
        setDirection(1)
        setStatus('dashboard')
    }

    const handleLock = async () => {
        await lockWallet()
        setDirection(-1)
        setStatus('locked')
    }

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <motion.div
                        key="loading"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="absolute inset-0 flex items-center justify-center h-full w-full"
                    >
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                    </motion.div>
                )
            case 'locked':
                return (
                    <motion.div
                        key="locked"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <Login onUnlock={handleUnlock} />
                    </motion.div>
                )
            case 'select_wallet':
                return (
                    <motion.div
                        key="select_wallet"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <SelectWallet onSelect={handleSelectWallet} />
                    </motion.div>
                )
            case 'dashboard':
                return (
                    <motion.div
                        key="dashboard"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <Dashboard onLock={handleLock} />
                    </motion.div>
                )
            default:
                return null
        }
    }

    return (
        <div className="h-[600px] w-[400px] bg-taupe-950 flex flex-col items-center justify-center relative overflow-hidden text-secondary">
            <div className="relative z-10 w-full h-full flex flex-col">
                <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                    {renderContent()}
                </AnimatePresence>
            </div>

            <AddAccountOverlay />

            <div className="absolute inset-0 z-0 pointer-events-none">
                <ShootingStars maxDelay={1} starWidth={15} />
                <StarsBackground />
            </div>
        </div>
    )
}