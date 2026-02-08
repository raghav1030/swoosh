import { useEffect, useState } from 'react'
import { Network, networkIconRegistry } from '@/lib/constants'

interface SettingUpWalletsProps {
    selectedNetworks: Network[];
    onComplete: () => void;
    isNewWallet: boolean;
    isProcessing: boolean;
}

const SettingUpWallets = ({ selectedNetworks, onComplete, isNewWallet, isProcessing }: SettingUpWalletsProps) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [hasStarted, setHasStarted] = useState(false)

    useEffect(() => {
        if (isProcessing) {
            setHasStarted(true)
        }
    }, [isProcessing])

    useEffect(() => {
        if (hasStarted && !isProcessing) {
            onComplete()
        }
    }, [hasStarted, isProcessing, onComplete])

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % selectedNetworks.length)
        }, 1000)

        return () => clearTimeout(timer)
    }, [selectedNetworks.length])

    const currentNetwork = selectedNetworks[currentIndex] || selectedNetworks[0];

    return (
        <div className='w-full flex flex-1 flex-col items-center  justify-between p-5 gap-12'>
            <div className="text-center space-y-2 animate-fade-in">
                <h2 className="text-2xl font-semibold text-secondary tracking-wide">
                    Setting up <span className="text-white font-bold">{currentNetwork}</span> Wallet
                </h2>
                <p className="text-secondary/60 text-sm">
                    {isNewWallet ? "Generating" : "Importing"} keys and encrypting data...
                </p>
            </div>

            <div className="relative flex items-center justify-center w-32 h-32">
                <div className="absolute inset-0 w-full h-full rounded-full border-4 border-secondary/20 border-t-secondary animate-spin" />
                <div className="absolute inset-2 w-28 h-28 rounded-full border-2 border-secondary/10 border-b-secondary/50 animate-spin-slow-reverse" />
                <div className="relative z-10 flex items-center justify-center w-20 h-20 bg-black/50 rounded-full backdrop-blur-sm border border-white/10 shadow-xl">
                    <img
                        src={networkIconRegistry[currentNetwork]}
                        alt={currentNetwork}
                        className='rounded-full size-16 object-cover'
                    />
                </div>
            </div>
            <div className="flex gap-2">
                {selectedNetworks.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/20'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}

export default SettingUpWallets