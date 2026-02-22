import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Wallet as WalletIcon, ChevronRight, Loader2 } from 'lucide-react'
import { useWalletStore, Wallet } from '@/store/useWalletStore'
import { Network, networkIconRegistry } from "@/lib/constants"
import { useWalletBalance, useTokenPrices } from '@/lib/useWalletQueries'


const WalletRow = ({
  wallet,
  isSelected,
  onSelect
}: {
  wallet: Wallet & { originalIndex: number };
  isSelected: boolean;
  onSelect: () => void
}) => {
  const { data: rawBalance = "0", isLoading: isLoadingBalance } = useWalletBalance(wallet.network as Network, wallet.publicKey)
  const { data: prices, isLoading: isLoadingPrices } = useTokenPrices()

  const IconComponent = networkIconRegistry[wallet.network as Network] as any
  const coinId = wallet.network === Network.Solana ? 'solana' : 'ethereum'
  const symbol = wallet.network === Network.Solana ? 'SOL' : 'ETH'

  const price = prices?.[coinId]?.usd || (wallet.network === Network.Solana ? 145.20 : 3100.50)
  const numericBalance = parseFloat(rawBalance)
  const fiatValue = numericBalance * price

  const truncateAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div
      onClick={onSelect}
      className={`group flex items-center justify-between w-full p-3 rounded-md border cursor-pointer transition-all duration-200 ${isSelected
        ? 'bg-secondary/10 border-secondary/50 shadow-[0_0_15px_rgba(var(--secondary),0.05)]'
        : 'bg-taupe-950/20 border-white/5 hover:bg-taupe-950/60 hover:border-white/10'
        }`}
    >
      <div className='flex items-center gap-3 w-full overflow-hidden'>
        <div className={`flex items-center justify-center h-10 w-10 rounded-md shrink-0 transition-colors ${isSelected ? 'bg-secondary/20' : 'bg-taupe-950/20 group-hover:bg-taupe-950/30'
          }`}>
          {IconComponent ? (
            typeof IconComponent === 'string' ? (
              <img src={IconComponent} alt={wallet.network} className="w-5 h-5 object-contain" />
            ) : (
              <IconComponent className="w-5 h-5" />
            )
          ) : (
            <WalletIcon size={18} className={isSelected ? 'text-secondary' : 'text-white/50'} />
          )}
        </div>

        <div className='flex flex-col items-start min-w-0 pr-2'>
          <span className={`text-sm font-medium truncate w-full transition-colors ${isSelected ? 'text-secondary' : 'text-white/90'
            }`}>
            {wallet.name || `Account ${wallet.originalIndex + 1}`}
          </span>
          <span className='text-[11px] text-white/40 font-mono tracking-wider truncate w-full mt-0.5'>
            {truncateAddress(wallet.publicKey)}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end shrink-0 pl-2">
        {isLoadingBalance || isLoadingPrices ? (
          <Loader2 size={16} className="animate-spin text-white/30" />
        ) : (
          <>
            <span className={`text-sm font-semibold tracking-wide ${isSelected ? 'text-secondary' : 'text-white/90'
              }`}>
              ${fiatValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] font-mono text-white/40 mt-0.5">
              {numericBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {symbol}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

interface WalletsProps {
  onSelect: () => void
}

const SelectWallet = ({ onSelect }: WalletsProps) => {
  const wallets = useWalletStore((state) => state.wallets)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

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
                {networkWallets?.map((wallet) => (
                  <WalletRow
                    key={`${wallet.network}-${wallet.publicKey}-${wallet.originalIndex}`}
                    wallet={wallet}
                    isSelected={selectedIndex === wallet.originalIndex}
                    onSelect={() => setSelectedIndex(wallet.originalIndex)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="w-full pt-6 mt-auto">
        <Button
          onClick={handleContinue}
          disabled={wallets.length === 0}
          className={`w-full h-12 bg-secondary/95 hover:bg-secondary rounded-sm text-black font-semibold text-lg transition-opacity ${wallets.length === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
          size={'lg'}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

export default SelectWallet