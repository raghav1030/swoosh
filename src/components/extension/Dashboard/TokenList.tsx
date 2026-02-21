import React, { useState } from 'react'
import { Coins } from 'lucide-react'
import { TokenRowSkeleton } from './Skeletons'
import { Token } from '../Dashboard'
import EmptyState from './EmptyTaste';

interface TokenListProps {
    tokens: Token[];
    isLoading: boolean;
}

const TokenIcon = ({ token }: { token: Token }) => {
    const [imgError, setImgError] = useState(false);

    if (token.iconUrl && !imgError) {
        return (
            <img
                src={token.iconUrl}
                alt={token.symbol}
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
            />
        );
    }

    return <span>{token.symbol.charAt(0)}</span>;
};

const TokenList = ({ tokens, isLoading }: TokenListProps) => {
    if (isLoading) {
        return (
            <div className="flex flex-col w-full gap-2 pt-2">
                <TokenRowSkeleton />
                <TokenRowSkeleton />
                <TokenRowSkeleton />
            </div>
        )
    }

    if (tokens.length === 0) {
        return (
            <EmptyState
                icon={Coins}
                title="No tokens found"
                description="You don't have any tokens in this wallet yet."
            />
        )
    }

    return (
        <div className="flex flex-col w-full gap-2  animate-in fade-in duration-300">
            {tokens.map((token, index) => (
                <div
                    key={`${token.symbol}-${index}`}
                    className="flex items-center justify-between p-3 hover:bg-secondary/10  cursor-pointer transition-colors w-full"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center h-11 w-11 bg-secondary/10 rounded-full text-secondary/70 font-bold text-sm border border-secondary/5 overflow-hidden shrink-0">
                            <TokenIcon token={token} />
                        </div>
                        <div className="flex flex-col justify-center gap-1">
                            <span className="text-secondary font-bold text-base leading-none">{token.symbol}</span>
                            <span className="text-secondary/60 text-sm font-medium leading-none">{token.balance} {token.symbol}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end justify-center gap-1">
                        <span className="text-secondary font-bold text-base leading-none">{token.value}</span>
                        <span className={`text-sm font-medium leading-none ${token.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {token.change}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default TokenList