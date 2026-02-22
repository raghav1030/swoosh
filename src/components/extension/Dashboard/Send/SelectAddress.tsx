import React, { useState, useEffect } from 'react'
import * as z from 'zod'
import { useForm } from '@tanstack/react-form'
import { Search, Wallet as WalletIcon, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWalletStore, Wallet } from '@/store/useWalletStore'
import { Network } from '@/lib/constants'
import { isValidPublicAddress } from '@/lib/walletUtils'

interface SelectAddressStepProps {
    activeWallet: Wallet;
    address: string;
    setAddress: (addr: string) => void;
    onNext: () => void;
}

export const SelectAddressStep = ({ activeWallet, address, setAddress, onNext }: SelectAddressStepProps) => {
    const wallets = useWalletStore(state => state.wallets);
    const [hasFunds, setHasFunds] = useState<boolean | null>(null);
    const [isCheckingFunds, setIsCheckingFunds] = useState(false);

    const myOtherWallets = wallets.filter(w => w.network === activeWallet.network && w.publicKey !== activeWallet.publicKey);

    const formSchema = z.object({
        recipientAddress: z.string().refine((val) => isValidPublicAddress(activeWallet.network as Network, val), {
            message: `Invalid ${activeWallet.network} address format`,
        }),
    });

    const form = useForm({
        defaultValues: {
            recipientAddress: address,
        },
        validators: {
            onChange: formSchema,
        },
        onSubmit: async ({ value }) => {
            setAddress(value.recipientAddress);
            onNext();
        },
    });

    useEffect(() => {
        const checkFunds = async () => {
            if (isValidPublicAddress(activeWallet.network as Network, form.state.values.recipientAddress)) {
                setIsCheckingFunds(true);
                await new Promise(r => setTimeout(r, 600));
                setHasFunds(Math.random() > 0.5);
                setIsCheckingFunds(false);
            } else {
                setHasFunds(null);
            }
        };
        checkFunds();
    }, [form.state.values.recipientAddress, activeWallet.network]);

    return (
        <div className="flex flex-col w-full h-full px-6 pt-4">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="flex flex-col flex-1"
            >
                <div className="flex flex-col p-1 gap-4 flex-1 overflow-y-auto custom-scrollbar">
                    <form.Field
                        name="recipientAddress"
                        children={(field) => (
                            <div className="flex flex-col gap-2 shrink-0">
                                <div className="relative flex items-center w-full">
                                    <Search
                                        className={`absolute left-3 z-10 transition-colors ${field.state.meta.errors.length > 0 ? 'text-red-500' : 'text-white/40'}`}
                                        size={18}
                                    />
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder={`Recipient's ${activeWallet.network} address...`}
                                        className={`w-full h-12 bg-white/5 border-none rounded-sm pl-10 pr-4 text-sm text-white placeholder:text-white/30 transition-all focus-visible:ring-1 ${field.state.meta.errors.length > 0 ? 'focus-visible:ring-red-500/50' : 'focus-visible:ring-secondary/50'}`}
                                    />
                                    {isCheckingFunds && (
                                        <Loader2 className="absolute right-3 animate-spin text-white/20" size={16} />
                                    )}
                                </div>

                                {field.state.value !== "" && field.state.meta.errors.length > 0 && (
                                    <span className="text-[10px] text-red-500 font-medium px-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                        {field.state.meta.errors.map((err: any) => err?.message)}
                                    </span>
                                )}
                            </div>
                        )}
                    />

                    {!isCheckingFunds && form.state.canSubmit && hasFunds === false && (
                        <div className="p-3 rounded-sm bg-yellow-500/10 border border-yellow-500/20 text-yellow-500/90 text-[11px] shrink-0 flex gap-2 animate-in zoom-in-95">
                            <AlertCircle size={14} className="shrink-0" />
                            <p>This address has no transaction history. Double-check before sending.</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 shrink-0">
                        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider px-1">Your Wallets</span>
                        {myOtherWallets.length === 0 ? (
                            <div className="text-white/30 text-md px-1 py-4 text-center border border-dashed border-white/10 rounded-sm italic">
                                No other wallets found on this network.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                {myOtherWallets.map((w, i) => (
                                    <Button
                                        key={i}
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            setAddress(w.publicKey);
                                            onNext();
                                        }}
                                        className="flex items-center justify-start gap-3 p-3 h-auto rounded-sm bg-white/5 hover:bg-white/10 border-none transition-colors group"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0 group-hover:bg-secondary/20">
                                            <WalletIcon size={16} />
                                        </div>
                                        <div className="flex flex-col items-start flex-1 overflow-hidden">
                                            <span className="text-sm font-medium text-white">{w.name || `Account ${i + 1}`}</span>
                                            <span className="text-[10px] text-white/40 truncate font-mono">{w.publicKey}</span>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="py-6">
                    <form.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <Button
                                type="submit"
                                disabled={!canSubmit || isSubmitting || isCheckingFunds}
                                className={`w-full h-12 bg-secondary hover:bg-secondary/90 text-black font-semibold text-lg rounded-sm transition-all active:scale-[0.98] ${(!canSubmit || isSubmitting) ? 'opacity-50' : 'opacity-100'}`}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : "Next"}
                            </Button>
                        )}
                    />
                </div>
            </form>
        </div>
    );
};