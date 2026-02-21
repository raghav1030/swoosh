import React, { useState, useEffect } from 'react'
import { useWalletStore } from '@/store/useWalletStore'
import { Button } from '@/components/ui/button'
import { RefreshCw, Coins, ArrowRightLeft, ArrowDownFromLine, ArrowUpFromLine } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Dashboard/Navbar'
import { BalanceSkeleton } from './Dashboard/Skeletons'
import TransactionList from './Dashboard/TransactionList'
import TokenList from './Dashboard/TokenList'
import ReceiveOverlay from './Dashboard/ReceiveOverlay'
import SendOverlay from './Dashboard/Send/SendOverlay'
import { Network, networkIconRegistry } from '@/lib/constants'

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

  const [isReceiveOpen, setIsReceiveOpen] = useState(false)
  const [isSendOpen, setIsSendOpen] = useState(false)

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
    if (isManualRefresh) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      setTotalBalance("$0.00")

      const nativeToken: Token = activeWallet.network === Network.Solana
        ? { symbol: 'SOL', name: 'Solana', balance: '0.00', value: '$0.00', change: '0.00%', isPositive: true, iconUrl: networkIconRegistry[Network.Solana] }
        : { symbol: 'ETH', name: 'Ethereum', balance: '0.00', value: '$0.00', change: '0.00%', isPositive: true, iconUrl: networkIconRegistry[Network.Ethereum] }

      setTokens([nativeToken])
      setTransactions([])
    } catch (error) {
      console.error(error)
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

  return (
    <div className='flex flex-col w-full h-full bg-black text-white relative'>
      <Navbar
        wallets={wallets}
        activeAccountIndex={activeAccountIndex}
        setActiveAccountIndex={setActiveAccountIndex}
        activeWallet={activeWallet}
        onLock={onLock}
      />

      <div className='flex flex-col flex-1 w-full h-full overflow-hidden'>
        <div className="flex items-center justify-center w-full gap-8 px-4 pt-4 border-b border-white/10 shrink-0">
          <button
            onClick={() => handleTabSwitch('tokens')}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${activeTab === 'tokens'
              ? 'border-secondary text-secondary font-semibold'
              : 'border-transparent text-white/50 hover:text-white font-medium'
              }`}
          >
            <Coins size={16} />
            Tokens
          </button>
          <button
            onClick={() => handleTabSwitch('transactions')}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${activeTab === 'transactions'
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
                          className={`flex items-center justify-center h-8 w-8 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all ${isRefreshing ? 'animate-spin text-secondary' : ''}`}
                        >
                          <RefreshCw size={18} />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-4 items-center justify-center w-full gap-4">
                    <div />
                    <Button
                      onClick={() => setIsReceiveOpen(true)}
                      className="flex flex-col items-center justify-center flex-1 h-14 gap-1 rounded-xl bg-secondary hover:bg-secondary/90 text-black font-semibold text-sm transition-transform"
                    >
                      <ArrowDownFromLine size={22} />
                      <span>Receive</span>
                    </Button>
                    <Button
                      onClick={() => setIsSendOpen(true)}
                      className="flex flex-col items-center justify-center flex-1 h-14 gap-1 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/5 font-semibold text-sm transition-transform"
                    >
                      <ArrowUpFromLine size={22} />
                      <span>Send</span>
                    </Button>
                    <div />
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
    </div>
  )
}

export default Dashboard