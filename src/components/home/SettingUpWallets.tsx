import { useEffect, useState } from 'react'
import { Network } from '@/lib/constants'
import { Loader2 } from 'lucide-react'

const NetworkLogo = ({ network }: { network: Network }) => {
    switch (network) {
        case Network.Solana:
            return <div className="text-4xl font-bold bg-gradient-to-tr from-purple-400 to-green-400 bg-clip-text text-transparent">SOL</div>
        case Network.Ethereum:
            return <div className="text-4xl font-bold bg-gradient-to-tr from-gray-400 to-white bg-clip-text text-transparent">ETH</div>
        default:
            return <div className="text-2xl text-white">?</div>
    }
}

interface SettingUpWalletsProps {
    selectedNetworks: Network[];
    onComplete: () => void;
}

const SettingUpWallets = ({ selectedNetworks, onComplete }: SettingUpWalletsProps) => {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (currentIndex >= selectedNetworks.length) {
            onComplete();
            return;
        }

        const timer = setTimeout(() => {
            setCurrentIndex((prev) => prev + 1)
        }, 2000)

        return () => clearTimeout(timer)
    }, [currentIndex, selectedNetworks, onComplete])

    const currentNetwork = selectedNetworks[currentIndex] || selectedNetworks[selectedNetworks.length - 1];

    if (currentIndex >= selectedNetworks.length) return null;

    return (
        <div className="w-full flex flex-col items-center justify-center p-8 gap-10 min-h-[300px]">
            <div className="text-center space-y-2 animate-fade-in">
                <h2 className="text-2xl font-semibold text-secondary tracking-wide">
                    Setting up <span className="text-white font-bold">{currentNetwork}</span> Wallet
                </h2>
                <p className="text-secondary/60 text-sm">
                    Generating keys and encrypting data...
                </p>
            </div>

            <div className="relative flex items-center justify-center w-32 h-32">
                <div className="absolute inset-0 w-full h-full rounded-full border-4 border-secondary/20 border-t-secondary animate-spin" />
                <div className="absolute inset-2 w-28 h-28 rounded-full border-2 border-secondary/10 border-b-secondary/50 animate-spin-slow-reverse" />
                <div className="relative z-10 flex items-center justify-center w-20 h-20 bg-black/50 rounded-full backdrop-blur-sm border border-white/10 shadow-xl">
                    <NetworkLogo network={currentNetwork} />
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