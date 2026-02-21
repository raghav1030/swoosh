import React from 'react'
import { ArrowRightLeft } from 'lucide-react'
import { TransactionRowSkeleton } from './Skeletons'
import { Transaction } from '../Dashboard';
import EmptyState from './EmptyTaste';

interface TransactionListProps {
    transactions: Transaction[];
    isLoading: boolean;
}

const TransactionList = ({ transactions, isLoading }: TransactionListProps) => {
    if (isLoading) {
        return (
            <div className="flex flex-col w-full gap-1 pt-2">
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
        <div className="flex flex-col w-full gap-1 pt-2 animate-in fade-in duration-300">
            {/* We will map real transactions here later */}
        </div>
    )
}

export default TransactionList