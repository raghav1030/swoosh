import React, { useState } from 'react'
import { ArrowRightLeft, ArrowUpRight, ArrowDownLeft, RefreshCcw, Copy, Check } from 'lucide-react'
import { TransactionRowSkeleton } from './Skeletons'
import { Transaction } from '../Dashboard'
import EmptyState from './EmptyTaste'

interface TransactionListProps {
    transactions: Transaction[];
    isLoading: boolean;
}

const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
        case 'send': return <ArrowUpRight size={18} className="text-secondary" />
        case 'receive': return <ArrowDownLeft size={18} className="text-green-400" />
        case 'swap': return <RefreshCcw size={18} className="text-blue-400" />
        default: return <ArrowRightLeft size={18} className="text-secondary/50" />
    }
}

const getTransactionTitle = (type: Transaction['type']) => {
    switch (type) {
        case 'send': return 'Sent'
        case 'receive': return 'Received'
        case 'swap': return 'Swapped'
        default: return 'Transaction'
    }
}


const truncateId = (id: string) => {
    if (!id) return '';
    return `${id.slice(0, 8)}...${id.slice(-8)}`;
}

const TransactionRow = ({ tx }: { tx: Transaction }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(tx.id);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="flex items-center justify-between w-full p-3 rounded-md bg-taupe-950 border border-white/5 hover:bg-taupe-950/50 hover:border-white/10 transition-all">
            <div className="flex items-center gap-3 w-full overflow-hidden">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-taupe-950/20 border border-white/5 shrink-0">
                    {getTransactionIcon(tx.type)}
                </div>

                <div className="flex flex-col items-start w-full min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white/90 whitespace-nowrap">
                            {getTransactionTitle(tx.type)} {tx.symbol}
                        </span>
                        <span className="text-[10px] text-white/30">•</span>
                        <span className="text-[11px] text-white/40">{tx.date}</span>
                    </div>

                    <div
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 mt-1 cursor-pointer group w-fit"
                        title="Copy Transaction ID"
                    >
                        <span className="text-[11px] text-white/50 font-mono tracking-tight group-hover:text-white/80 transition-colors">
                            {truncateId(tx.id)}
                        </span>
                        <div className="text-white/30 group-hover:text-white/80 transition-colors">
                            {isCopied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end shrink-0 pl-2">
                <span className={`text-sm font-semibold tracking-wide ${tx.type === 'receive' ? 'text-green-400' : 'text-white'}`}>
                    {tx.type === 'receive' ? '+' : '-'}{tx.amount}
                </span>

                {tx.status === 'completed' && (
                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mt-0.5">Success</span>
                )}
                {tx.status === 'pending' && (
                    <span className="text-[10px] text-yellow-500/80 uppercase tracking-wider font-semibold mt-0.5">Pending...</span>
                )}
                {tx.status === 'failed' && (
                    <span className="text-[10px] text-red-400/80 uppercase tracking-wider font-semibold mt-0.5">Failed</span>
                )}
            </div>
        </div>
    )
}

const TransactionList = ({ transactions, isLoading }: TransactionListProps) => {
    if (isLoading) {
        return (
            <div className="flex flex-col w-full gap-2 p-2">
                <TransactionRowSkeleton />
                <TransactionRowSkeleton />
                <TransactionRowSkeleton />
                <TransactionRowSkeleton />
            </div>
        )
    }

    if (transactions.length === 0) {
        return (
            <EmptyState
                icon={ArrowRightLeft}
                title="No transactions"
                description="Your recent activity will appear here."
            />
        )
    }

    return (
        <div className="flex flex-col w-full gap-2 animate-in fade-in duration-300">
            {transactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
            ))}
        </div>
    )
}

export default TransactionList