import React from 'react'
import { Button } from '@/components/ui/button'
import { networkIconRegistry, Network } from '@/lib/constants'
import { Token } from '../../Dashboard';

interface SelectTokenStepProps {
    tokens: Token[];
    onSelect: (token: Token) => void;
}

export const SelectTokenStep = ({ tokens, onSelect }: SelectTokenStepProps) => {
    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex flex-col flex-1 w-full overflow-y-auto custom-scrollbar px-4 pb-4 pt-2 gap-2">
                {tokens.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-white/40 text-sm">
                        No assets available to send.
                    </div>
                ) : (
                    tokens.map((token, index) => {
                        const IconComponent = networkIconRegistry[token.symbol as Network] || networkIconRegistry[token.name as Network] as any;
                        return (
                            <Button
                                key={`${token.symbol}-${index}`}
                                variant="ghost"
                                onClick={() => onSelect(token)}
                                className="flex items-center justify-between p-4 h-auto bg-white/5 hover:bg-white/10 rounded-sm transition-colors shrink-0 border-none"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center h-10 w-10 bg-white/10 rounded-full text-white/70 font-bold text-xs overflow-hidden">
                                        {IconComponent ? (
                                            typeof IconComponent === 'string' ? (
                                                <img src={IconComponent} alt={token.symbol} className="h-full w-full object-cover" />
                                            ) : (
                                                <IconComponent className="h-5 w-5" />
                                            )
                                        ) : (
                                            <img src={token.iconUrl} alt={token.symbol} className="h-full w-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-white font-semibold text-base">{token.symbol}</span>
                                        <span className="text-white/50 text-xs font-medium">{token.balance} {token.symbol}</span>
                                    </div>
                                </div>
                                <div className="text-white font-semibold">{token.value}</div>
                            </Button>
                        );
                    })
                )}
            </div>
        </div>
    );
};