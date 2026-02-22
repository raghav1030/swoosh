import React, { useState, useEffect } from 'react'
import { useWalletStore } from '@/store/useWalletStore'
import { Button } from '@/components/ui/button'
import { RefreshCw, Coins, ArrowRightLeft, ArrowDownFromLine, ArrowUpFromLine, Droplets, AlertTriangle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { BalanceSkeleton } from './Dashboard/Skeletons'
import TransactionList from './Dashboard/TransactionList'
import TokenList from './Dashboard/TokenList'
import ReceiveOverlay from './Dashboard/ReceiveOverlay'
import SendOverlay from './Dashboard/Send/SendOverlay'
import AirdropOverlay from './Dashboard/Airdrop/AirdropOverlay'
import AddAccountOverlay from './Dashboard/AddAccountOverlay'
import { Network, networkIconRegistry } from '@/lib/constants'
import { getNetworkBalance, getRecentTransactions } from '@/lib/walletUtils'
import Navbar from './Dashboard/Navbar/Navbar'
import SettingsOverlay from './Dashboard/Settings/SettingsOverlay'

export interface Token {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  change: string;
  isPositive: boolean;
  iconUrl?: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap';
  amount: string;
  symbol: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface DashboardProps {
  onLock: () => void;
}

const Dashboard = ({ onLock }: DashboardProps) => {
  const wallets = useWalletStore((state) => state.wallets)
  const activeAccountIndex = useWalletStore((state: any) => state.activeAccountIndex || 0)
  const setActiveAccountIndex = (index: number) => useWalletStore.setState({ activeAccountIndex: index })

  const activeWallet = wallets[activeAccountIndex] || wallets[0]

  const [activeTab, setActiveTab] = useState<'tokens' | 'transactions'>('tokens')
  const [tabDirection, setTabDirection] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showWarning, setShowWarning] = useState(true)

  const [isReceiveOpen, setIsReceiveOpen] = useState(false)
  const [isSendOpen, setIsSendOpen] = useState(false)
  const [isAirdropOpen, setIsAirdropOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)

  const [totalBalance, setTotalBalance] = useState<string>("$0.00")
  const [tokens, setTokens] = useState<Token[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 })
  }

  const handleTabSwitch = (newTab: 'tokens' | 'transactions') => {
    if (newTab === activeTab) return;
    setTabDirection(newTab === 'transactions' ? 1 : -1);
    setActiveTab(newTab);
  }

  const fetchAccountData = async (isManualRefresh = false) => {
    if (!activeWallet?.publicKey) return;

    if (isManualRefresh) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const rawBalance = await getNetworkBalance(activeWallet.network as Network, activeWallet.publicKey);

      const formattedBalance = parseFloat(rawBalance).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      });

      const coinId = activeWallet.network === Network.Solana ? 'solana' : 'ethereum';
      let liveUsdPrice = activeWallet.network === Network.Solana ? 145.20 : 3100.50;
      let priceChange24h = 0;

      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`);
        if (res.ok) {
          const data = await res.json();
          liveUsdPrice = data[coinId].usd;
          priceChange24h = data[coinId].usd_24h_change;
        }
      } catch (err) {
        console.log(err)
      }

      const fiatValue = (parseFloat(rawBalance) * liveUsdPrice);

      setTotalBalance(`$${fiatValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

      const isPositive = priceChange24h >= 0;
      const formattedChange = `${isPositive ? '+' : ''}${priceChange24h.toFixed(2)}%`;

      const nativeToken: Token = activeWallet.network === Network.Solana
        ? { symbol: 'SOL', name: 'Solana', balance: formattedBalance, value: `$${fiatValue.toFixed(2)}`, change: formattedChange, isPositive: isPositive, iconUrl: networkIconRegistry[Network.Solana] as string }
        : { symbol: 'ETH', name: 'Ethereum', balance: formattedBalance, value: `$${fiatValue.toFixed(2)}`, change: formattedChange, isPositive: isPositive, iconUrl: networkIconRegistry[Network.Ethereum] as string }

      setTokens([nativeToken])

      const recentTxs = await getRecentTransactions(activeWallet.network as Network, activeWallet.publicKey);
      setTransactions(recentTxs);

    } catch (error) {
      toast.error("Failed to sync wallet data.");
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (activeWallet) {
      fetchAccountData()
    }
  }, [activeWallet?.publicKey, activeWallet?.network])

  const networkLabel = activeWallet?.network === Network.Solana ? 'Solana Devnet' : 'Ethereum Sepolia';

  return (
    <div className='flex flex-col w-full h-full bg-taupe-950/60 text-white relative'>
      <Navbar
        wallets={wallets}
        activeAccountIndex={activeAccountIndex}
        setActiveAccountIndex={setActiveAccountIndex}
        activeWallet={activeWallet}
        onLock={onLock}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-yellow-500/10 border-b border-yellow-500/20 overflow-hidden shrink-0"
          >
            <div className="flex items-start justify-between p-3 px-4 gap-3">
              <p className="text-md font-medium text-yellow-500/90 leading-relaxed flex-1">
                We do not encourage the use of this wallet for real transactions. It is completely made for learning first base. You are currently connected to <strong>{networkLabel}</strong>.
              </p>
              <button onClick={() => setShowWarning(false)} className="text-yellow-500/50 hover:text-yellow-500 transition-colors shrink-0">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='flex flex-col flex-1 w-full h-full overflow-hidden'>
        <div className="flex items-center justify-center w-full gap-8 px-4 pt-4 border-b border-white/10 shrink-0">
          <button
            onClick={() => handleTabSwitch('tokens')}
            className={`flex items-center gap-2 pb-3 border-b-2 text-[14px] transition-colors ${activeTab === 'tokens'
              ? 'border-secondary text-secondary font-semibold'
              : 'border-transparent text-white/50 hover:text-white font-medium'
              }`}
          >
            <Coins size={16} />
            Tokens
          </button>
          <button
            onClick={() => handleTabSwitch('transactions')}
            className={`flex items-center gap-2 pb-3 border-b-2 text-[14px] transition-colors ${activeTab === 'transactions'
              ? 'border-secondary text-secondary font-semibold'
              : 'border-transparent text-white/50 hover:text-white font-medium'
              }`}
          >
            <ArrowRightLeft size={16} />
            Transactions
          </button>
        </div>

        <div className="relative flex-1 w-full overflow-hidden">
          <AnimatePresence mode="popLayout" custom={tabDirection} initial={false}>
            {activeTab === 'tokens' ? (
              <motion.div
                key="tokens"
                custom={tabDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col w-full h-full overflow-y-auto custom-scrollbar"
              >
                <div className="flex flex-col items-center justify-center w-full px-4 pt-8 pb-6 gap-6 shrink-0">
                  <div className="flex items-center justify-center w-full h-12">
                    {isLoading ? (
                      <BalanceSkeleton />
                    ) : (
                      <div className="flex items-center justify-center gap-3 w-full">
                        <h1 className="text-5xl -leading-1 font-bold text-white">
                          {totalBalance}
                        </h1>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => fetchAccountData(true)}
                          disabled={isRefreshing}
                          className={`flex items-center justify-center h-8 w-8 rounded-full text-white/50 hover:text-white hover:bg-taupe-950/10 transition-all ${isRefreshing ? 'animate-spin text-secondary' : ''}`}
                        >
                          <RefreshCw size={18} />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 items-center justify-center w-full gap-4 max-w-[270px]">
                    <Button
                      onClick={() => setIsReceiveOpen(true)}
                      className="flex flex-col items-center justify-center flex-1 h-15 gap-1 rounded-xl bg-taupe-950/90 hover:bg-taupe-950/50 text-white border border-white/5 font-semibold text-sm transition-transform"
                    >
                      <ArrowDownFromLine size={20} />
                      <span>Receive</span>
                    </Button>
                    <Button
                      onClick={() => setIsSendOpen(true)}
                      className="flex flex-col items-center justify-center flex-1 h-15 gap-1 rounded-xl bg-taupe-950/90 hover:bg-taupe-950/50 text-white border border-white/5 font-semibold text-sm transition-transform"
                    >
                      <ArrowUpFromLine size={20} />
                      <span>Send</span>
                    </Button>
                    <Button
                      onClick={() => setIsAirdropOpen(true)}
                      className="flex flex-col items-center justify-center flex-1 h-15 gap-1 rounded-xl bg-secondary hover:bg-secondary/90 text-black font-semibold text-sm transition-transform"
                    >
                      <Droplets size={20} />
                      <span>Airdrop</span>
                    </Button>
                  </div>
                </div>

                <div className="w-full h-[0.1px] bg-secondary/10" />

                <div className="w-full flex-1">
                  <TokenList tokens={tokens} isLoading={isLoading} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="transactions"
                custom={tabDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col w-full h-full p-2 overflow-y-auto custom-scrollbar"
              >
                <TransactionList transactions={transactions} isLoading={isLoading} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ReceiveOverlay
        isOpen={isReceiveOpen}
        close={() => setIsReceiveOpen(false)}
        wallet={activeWallet}
      />
      <SendOverlay
        isOpen={isSendOpen}
        close={() => setIsSendOpen(false)}
        activeWallet={activeWallet}
        tokens={tokens}
      />
      <AirdropOverlay
        isOpen={isAirdropOpen}
        close={() => setIsAirdropOpen(false)}
        activeWallet={activeWallet}
        onSuccess={() => fetchAccountData(true)}
      />
      <SettingsOverlay
        isOpen={isSettingsOpen}
        close={() => setIsSettingsOpen(false)}
        activeWallet={activeWallet}
      />
      <AddAccountOverlay
        isOpen={isAddAccountOpen}
        close={() => setIsAddAccountOpen(false)}
      />
    </div>
  )
}

export default Dashboard