import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Wallet as WalletIcon, ChevronRight } from 'lucide-react'
import { useWalletStore } from '@/store/useWalletStore'

interface WalletsProps {
  onSelect: () => void
}

const SelectWallet = ({ onSelect }: WalletsProps) => {
  const wallets = useWalletStore((state) => state.wallets)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  const truncateAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleContinue = () => {
    // If you add an setActiveWallet function to your store later, you can call it here:
    // useWalletStore.getState().setActiveWallet(wallets[selectedIndex])
    onSelect()
  }

  return (
    <div className='w-full h-full relative flex flex-col items-center justify-start p-6 pt-12'>
      <div className='w-full flex flex-col items-center justify-center gap-2 mb-8 text-center'>
        <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-2">
          <WalletIcon size={32} className="text-secondary" />
        </div>
        <h2 className="text-3xl font-semibold text-white tracking-wide">
          Your Wallets
        </h2>
        <p className="text-secondary/70 text-sm">
          Select an account to continue to the dashboard.
        </p>
      </div>

      <div className='w-full flex-1 overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar'>
        {wallets.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-secondary/50">
            No wallets found.
          </div>
        ) : (
          wallets.map((wallet, index) => (
            <div
              key={`${wallet.network}-${wallet.publicKey}-${index}`}
              onClick={() => setSelectedIndex(index)}
              className={`group flex items-center justify-between gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] ${selectedIndex === index
                  ? 'bg-secondary/10 border-secondary shadow-[0_0_15px_rgba(var(--secondary),0.1)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
            >
              <div className='flex items-center justify-start gap-4'>
                <div className={`flex items-center justify-center h-10 w-10 rounded-full transition-colors duration-300 ${selectedIndex === index ? 'bg-secondary text-black' : 'bg-white/10 text-secondary group-hover:bg-white/20'
                  }`}>
                  <WalletIcon size={20} />
                </div>
                <div className='flex flex-col items-start'>
                  <span className={`text-lg font-semibold transition-colors ${selectedIndex === index ? 'text-secondary' : 'text-white'
                    }`}>
                    Account {index + 1}
                  </span>
                  <span className='text-sm text-secondary/60 font-mono tracking-wider'>
                    {truncateAddress(wallet.publicKey)}
                  </span>
                </div>
              </div>

              {selectedIndex === index ? (
                <CheckCircle2 className='text-secondary transition-colors duration-300' size={24} />
              ) : (
                <ChevronRight className='text-secondary/50 group-hover:text-secondary/90 transition-colors duration-300' size={24} />
              )}
            </div>
          ))
        )}
      </div>

      <div className="w-full pt-6 mt-auto">
        <Button
          onClick={handleContinue}
          disabled={wallets.length === 0}
          className={`w-full h-12 bg-secondary/95 hover:bg-secondary rounded-sm text-black font-semibold text-lg transition-opacity ${wallets.length === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
            }`}
          size={'lg'}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

export default SelectWallet