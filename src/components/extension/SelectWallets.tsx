import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Wallet as WalletIcon, ChevronRight } from 'lucide-react'
import { useWalletStore } from '@/store/useWalletStore'
import { Network, networkIconRegistry } from "@/lib/constants"

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
    useWalletStore.setState({ activeAccountIndex: selectedIndex })
    onSelect()
  }

  const groupedWallets = wallets.reduce((acc, wallet, index) => {
    if (!acc[wallet.network]) {
      acc[wallet.network] = [];
    }
    acc[wallet.network].push({ ...wallet, originalIndex: index });
    return acc;
  }, {} as Record<string, (typeof wallets[0] & { originalIndex: number })[]>);

  return (
    <div className='w-full h-full relative flex flex-col items-center justify-start p-6 pt-12'>
      <div className='w-full flex flex-col items-center justify-center gap-2 mb-8 text-center'>
        <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-2">
          <WalletIcon size={32} className="text-secondary" />
        </div>
        <h2 className="text-3xl font-semibold text-secondary tracking-wide">
          Your Wallets
        </h2>
        <p className="text-secondary/70 text-sm">
          Select an account to continue to the dashboard.
        </p>
      </div>

      <div className='w-full flex-1 overflow-y-auto flex flex-col gap-5 pr-2 custom-scrollbar'>
        {wallets.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-secondary/50">
            No wallets found.
          </div>
        ) : (
          Object.entries(groupedWallets).map(([network, networkWallets]) => (
            <div key={network} className="flex flex-col gap-2">
              <h3 className="text-secondary/50 text-xs font-semibold uppercase tracking-wider px-1">
                {network} Wallets
              </h3>

              <div className="flex flex-col gap-2">
                {networkWallets?.map((wallet) => {
                  const isSelected = selectedIndex === wallet.originalIndex;
                  const IconComponent = networkIconRegistry[wallet.network] as any;

                  return (
                    <div
                      key={`${wallet.network}-${wallet.publicKey}-${wallet.originalIndex}`}
                      onClick={() => setSelectedIndex(wallet.originalIndex)}
                      className={`group flex items-center justify-between gap-3 p-3 rounded-sm border cursor-pointer transition-colors duration-150 ${isSelected
                        ? 'bg-secondary/10 border-secondary'
                        : 'bg-secondary/5 border-secondary/10 hover:bg-secondary/10 hover:border-secondary/20'
                        }`}
                    >
                      <div className='flex items-center justify-start gap-3'>
                        <div className={`flex items-center justify-center  rounded-full transition-colors duration-150 '
                          }`}>
                          {IconComponent ? (
                            typeof IconComponent === 'string' ? (
                              <img src={IconComponent} alt={wallet.network} className="w-8 h-8" />
                            ) : (
                              <IconComponent className="w-4 h-4" />
                            )
                          ) : (
                            <WalletIcon size={16} />
                          )}
                        </div>
                        <div className='flex flex-col items-start'>
                          <span className={`text-base font-medium transition-colors ${isSelected ? 'text-secondary' : 'text-secondary/90'
                            }`}>
                            Account {wallet.originalIndex + 1}
                          </span>
                          <span className='text-xs text-secondary/50 font-mono tracking-wider'>
                            {truncateAddress(wallet.publicKey)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${isSelected ? 'text-secondary' : 'text-secondary/70'}`}>
                          $0.00
                        </span>
                        {isSelected ? (
                          <Check className='text-secondary' size={18} />
                        ) : (
                          <ChevronRight className='text-secondary/30 group-hover:text-secondary/50' size={18} />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
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