import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, Droplets, Twitter, Lock, Loader2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import { Wallet } from '@/store/useWalletStore'
import { Network } from '@/lib/constants'
import { requestNetworkAirdrop } from '@/lib/walletUtils'

interface AirdropOverlayProps {
    isOpen: boolean;
    close: () => void;
    activeWallet: Wallet;
    onSuccess: () => void;
}

const AMOUNTS = [0.1, 0.5, 1, 5];
const LOCKOUT_KEY = 'solana_devnet_airdrop_lockout';

const AirdropOverlay = ({ isOpen, close, activeWallet, onSuccess }: AirdropOverlayProps) => {
    const [selectedAmount, setSelectedAmount] = useState<number>(1);
    const [hasTweeted, setHasTweeted] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'failed' | 'rate_limited'>('idle');

    useEffect(() => {
        if (isOpen) {
            const lockoutTime = localStorage.getItem(LOCKOUT_KEY);
            if (lockoutTime && parseInt(lockoutTime) > Date.now()) {
                setStatus('rate_limited');
            } else {
                setStatus('idle');
            }
        }
    }, [isOpen]);

    const handleTweet = () => {
        const text = encodeURIComponent(`Just came across the @swoosh extension and unlocked a 5 ${activeWallet.network === Network.Solana ? 'SOL' : 'ETH'} airdrop on Devnet! If you're a dev, give it a try! #SwooshExtension`);
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
        setTimeout(() => setHasTweeted(true), 1500);
    };

    const handleAirdrop = async () => {
        if (status === 'rate_limited') return;

        if (activeWallet.network === Network.Ethereum) {
            setStatus('rate_limited');
            return;
        }

        setStatus('loading');

        try {
            await requestNetworkAirdrop(activeWallet.network as Network, activeWallet.publicKey, selectedAmount);
            setStatus('success');
            onSuccess();
        } catch (error: any) {
            const errorStr = error.toString();
            console.error("Airdrop Error:", errorStr);

            if (
                errorStr.includes("429") ||
                errorStr.includes("limit") ||
                errorStr.includes("32603") ||
                errorStr.includes("Internal error") ||
                errorStr.includes("ETH_FAUCET_REQUIRED")
            ) {
                setStatus('rate_limited');
                if (activeWallet.network === Network.Solana) {
                    localStorage.setItem(LOCKOUT_KEY, (Date.now() + 12 * 60 * 60 * 1000).toString());
                }
            } else {
                setStatus('failed');
            }
        }
    };

    const isLocked = selectedAmount === 5 && !hasTweeted;
    const isEthereum = activeWallet.network === Network.Ethereum;

    return (
        <div className={`absolute inset-0 w-full h-full z-[100] flex flex-col justify-end transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="flex-1 w-full cursor-pointer bg-taupe-950/40 backdrop-blur-sm transition-opacity duration-500" style={{ opacity: isOpen ? 1 : 0 }} onClick={close} />

            <div className="w-full bg-taupe-950/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl flex flex-col items-center shadow-2xl relative overflow-hidden pb-8">

                <div className="flex items-center justify-between w-full p-4 h-16 shrink-0 relative z-20">
                    <div className="w-10" />
                    <h2 className="text-xl font-semibold text-white tracking-wide uppercase flex items-center gap-2">
                        <Droplets size={20} className="text-secondary" /> Airdrop
                    </h2>
                    <Button variant="ghost" size="icon" onClick={close} className="rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white w-10 h-10">
                        <X size={20} />
                    </Button>
                </div>

                <div className="flex flex-col items-center w-full px-6 pt-2 gap-8 relative">
                    <AnimatePresence mode="wait">

                        {status === 'loading' && (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-10 gap-4 w-full">
                                <Loader2 className="animate-spin text-secondary" size={48} />
                                <p className="text-white/70">Requesting {selectedAmount} {isEthereum ? 'ETH' : 'SOL'}...</p>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-10 gap-4 w-full">
                                <CheckCircle2 className="text-green-400" size={48} />
                                <p className="text-white font-medium text-lg">Airdrop Successful!</p>
                                <Button variant="secondary" onClick={close} className="mt-4 w-full h-12 text-lg font-semibold rounded-sm">Done</Button>
                            </motion.div>
                        )}

                        {status === 'failed' && (
                            <motion.div key="failed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-10 gap-4 w-full">
                                <AlertCircle className="text-red-400" size={48} />
                                <p className="text-white font-medium">Airdrop Failed</p>
                                <p className="text-white/50 text-sm text-center">The RPC node might be congested. Try a smaller amount.</p>
                                <Button onClick={() => setStatus('idle')} className="mt-4 w-full bg-white/10 text-white hover:bg-white/20 h-12 rounded-sm">Try Again</Button>
                            </motion.div>
                        )}

                        {status === 'rate_limited' && (
                            <motion.div key="rate_limited" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-6 gap-4 w-full">
                                <AlertCircle className="text-yellow-400" size={48} />
                                <p className="text-white font-semibold text-lg">
                                    {isEthereum ? 'External Faucet Required' : 'In-App Faucet Unavailable'}
                                </p>
                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
                                    <p className="text-yellow-500/90 text-xs text-center leading-relaxed font-medium">
                                        {isEthereum
                                            ? 'Ethereum Sepolia requires an external faucet to prevent testnet spam.'
                                            : 'The public Devnet node is either out of funds, overloaded, or has rate-limited your IP address.'}
                                    </p>
                                </div>
                                <Button
                                    onClick={() => window.open(isEthereum ? 'https://www.alchemy.com/faucets/arbitrum-sepolia' : `https://faucet.solana.com/?address=${activeWallet.publicKey}`, '_blank')}
                                    className="mt-4 w-full bg-secondary hover:bg-secondary/90 text-black font-semibold h-12 rounded-sm flex items-center justify-center gap-2"
                                >
                                    Use Web Faucet <ExternalLink size={16} />
                                </Button>
                                <p className="text-[10px] text-white/30 text-center px-4 mt-2">
                                    {isEthereum
                                        ? 'Pro tip: You will need a free Alchemy account to claim Sepolia ETH.'
                                        : 'Pro tip: Authenticate with GitHub on the Web Faucet for higher success rates.'}
                                </p>
                            </motion.div>
                        )}

                        {status === 'idle' && (
                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full gap-8">
                                <div className="flex flex-col items-center w-full gap-4">
                                    <p className="text-sm text-white/50 text-center">Select amount to fund your testnet wallet</p>

                                    <div className="grid grid-cols-4 gap-3 w-full">
                                        {AMOUNTS.map((amt) => (
                                            <button
                                                key={amt}
                                                onClick={() => setSelectedAmount(amt)}
                                                className={`
                                                    relative flex flex-col items-center justify-center h-14 rounded-sm border transition-all
                                                    ${selectedAmount === amt
                                                        ? 'bg-secondary/10 border-secondary text-secondary font-bold'
                                                        : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10 font-medium'
                                                    }
                                                `}
                                            >
                                                {amt}
                                                {amt === 5 && !hasTweeted && (
                                                    <Lock size={12} className="absolute -top-2 -right-2 bg-taupe-950 text-white/50 p-0.5 rounded-full" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="w-full flex flex-col gap-3 min-h-[100px] justify-end">
                                    {isLocked ? (
                                        <div className="flex flex-col gap-3 p-4 bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                                            <p className="text-xs text-[#1DA1F2] text-center leading-relaxed">
                                                High value airdrops are locked to prevent network spam. Post on X to unlock.
                                            </p>
                                            <Button
                                                onClick={handleTweet}
                                                className="w-full bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white font-semibold h-12 rounded-sm"
                                            >
                                                <Twitter size={16} className="mr-2 fill-current" /> Post to Unlock
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={handleAirdrop}
                                            className="w-full h-12 bg-secondary hover:bg-secondary/90 text-black font-semibold text-lg rounded-sm transition-all active:scale-[0.98]"
                                        >
                                            Request {selectedAmount} {isEthereum ? 'ETH' : 'SOL'}
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AirdropOverlay;