import Dashboard from "@/components/extension/Dashboard"
import Login from "@/components/extension/Login"
import { Button } from "@/components/ui/button"
import { ShootingStars } from "@/components/ui/shooting-stars"
import { StarsBackground } from "@/components/ui/stars-background"
import { checkWalletStatus, unlockWallet, lockWallet } from "@/lib/extensionUtils"
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from "react"

export default function App() {
    // We removed 'no_wallet' from the state types since we handle it before setting state
    const [status, setStatus] = useState<'loading' | 'unlocked' | 'locked'>('loading')

    useEffect(() => {
        const initializeExtension = async () => {
            try {
                console.log()
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

                setStatus(currentStatus)
            } catch (error) {
                chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') })
                window.close()
            }
        }

        initializeExtension()
    }, [])

    const handleUnlock = async (password: string): Promise<boolean> => {
        const isSuccess = await unlockWallet(password)
        if (isSuccess) {
            setStatus('unlocked')
            return true
        }
        return false
    }

    const handleLock = async () => {
        await lockWallet()
        setStatus('locked')
    }

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="flex items-center justify-center h-full w-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                )
            case 'locked':
                return <Login onUnlock={handleUnlock} />
            case 'unlocked':
                return <Dashboard onLock={handleLock} />
            default:
                return null
        }
    }

    return (
        <div className="h-[600px] w-[400px] bg-black flex flex-col items-center justify-center relative overflow-hidden text-white">
            {status !== "locked" && <div className='flex-none w-full grid grid-cols-3 px-6 pt-6 pb-2 z-20'>
                <div className="flex items-center justify-start">
                    {(
                        <Button
                            className="text-secondary hover:text-white cursor-pointer transition-colors"
                        >
                            <ArrowLeft size={28} />
                        </Button>
                    )}
                </div>
            </div>}
            <div className="relative z-10 w-full h-full flex flex-col">
                {renderContent()}
            </div>

            <div className="absolute inset-0 z-0 pointer-events-none">
                <ShootingStars maxDelay={1} starWidth={15} />
                <StarsBackground />
            </div>
        </div>
    )
}