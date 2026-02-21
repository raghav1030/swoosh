import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, Search, Wallet as WalletIcon, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useWalletStore, Wallet } from '@/store/useWalletStore'
import { Token } from '../types'
import { networkIconRegistry, Network } from '@/lib/constants'
import { Input } from '@/components/ui/input'

interface SendOverlayProps {
    isOpen: boolean;
    close: () => void;
    activeWallet: Wallet;
    tokens: Token[];
}

type Step = 'select_token' | 'select_address' | 'enter_amount' | 'status';

const SelectTokenStep = ({ tokens, onSelect }: { tokens: Token[], onSelect: (token: Token) => void }) => (
    <div className="flex flex-col w-full h-full relative">
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
                    )
                })
            )}
        </div>
    </div>
);

const SelectAddressStep = ({
    activeWallet,
    address,
    setAddress,
    onNext
}: {
    activeWallet: Wallet,
    address: string,
    setAddress: (addr: string) => void,
    onNext: () => void
}) => {
    const wallets = useWalletStore(state => state.wallets);
    const [isValidating, setIsValidating] = useState(false);
    const [hasFunds, setHasFunds] = useState<boolean | null>(null);

    const myOtherWallets = wallets.filter(w => w.network === activeWallet.network && w.publicKey !== activeWallet.publicKey);

    useEffect(() => {
        if (address.length > 20) {
            setIsValidating(true);
            const timer = setTimeout(() => {
                setIsValidating(false);
                setHasFunds(Math.random() > 0.5);
            }, 800);
            return () => clearTimeout(timer);
        } else {
            setHasFunds(null);
            setIsValidating(false);
        }
    }, [address]);

    return (
        <div className="flex flex-col w-full h-full px-6 pt-4 relative">
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar">
                <div className="relative flex items-center w-full shrink-0">
                    <Search className="absolute left-3 text-white/40" size={18} />
                    <Input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={`Search ${activeWallet.network} address...`}
                        className="w-full h-12 bg-white/5  rounded-sm pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus-visible:ring-secondary/50 transition-colors"
                    />
                </div>

                {address.length > 20 && !isValidating && hasFunds === false && (
                    <div className="p-3 rounded-sm bg-yellow-500/10 border border-yellow-500/20 text-yellow-500/90 text-xs shrink-0">
                        This address currently has no funds. Please ensure it is correct before sending.
                    </div>
                )}

                <div className="flex flex-col gap-2 shrink-0">
                    <span className="text-xs font-semibold text-white/50 uppercase tracking-wider px-1">Your Wallets</span>
                    {myOtherWallets.length === 0 ? (
                        <div className="text-white/30 text-sm px-1 py-2  text-center">No other wallets found.</div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {myOtherWallets.map((w, i) => (
                                <Button
                                    key={i}
                                    variant="ghost"
                                    onClick={() => setAddress(w.publicKey)}
                                    className="flex items-center justify-start gap-3 p-3 h-auto rounded-sm bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 cursor-pointer transition-colors"
                                >
                                    <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                                        <WalletIcon size={16} />
                                    </div>
                                    <div className="flex flex-col items-start flex-1 overflow-hidden">
                                        <span className="text-sm font-medium text-white">{w.importSource || `Account ${i + 2}`}</span>
                                        <span className="text-xs text-white/50 truncate font-mono">{w.publicKey}</span>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="py-6 shrink-0">
                <Button
                    disabled={address.length < 20 || isValidating}
                    onClick={onNext}
                    className="w-full h-12 bg-secondary hover:bg-secondary/90 text-black font-semibold text-lg rounded-sm"
                >
                    {isValidating ? <Loader2 className="animate-spin" /> : "Next"}
                </Button>
            </div>
        </div>
    );
};

const EnterAmountStep = ({
    token,
    amount,
    setAmount,
    onChangeToken,
    onSend,
    address,
    onEditAddress
}: {
    token: Token,
    amount: string,
    setAmount: (amt: string) => void,
    onChangeToken: () => void,
    onSend: () => void,
    address: string,
    onEditAddress: () => void
}) => {
    const IconComponent = networkIconRegistry[token.symbol as Network] || networkIconRegistry[token.name as Network] as any;
    const handleMax = () => setAmount(token.balance.replace(/,/g, ''));
    const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div className="flex flex-col w-full h-full px-6 pt-2 relative">
            <div className="flex flex-col items-center justify-center flex-1 gap-8">

                <Button
                    variant="ghost"
                    onClick={onEditAddress}
                    className="flex items-center gap-2 h-auto px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
                >
                    <span className="text-xs text-white/40 font-medium">To:</span>
                    <span className="text-xs text-secondary font-mono tracking-tight">{truncateAddress(address)}</span>
                </Button>

                <div className="flex flex-col items-center w-full gap-3">
                    <div className="relative w-full max-w-[240px] flex items-center justify-center">
                        <span className="absolute left-0 text-3xl font-bold text-white/30">$</span>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            autoFocus
                            className="h-auto border-none bg-transparent text-5xl font-bold text-white text-center focus-visible:ring-0 focus-visible:ring-offset-0 p-0 pl-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                    <span className="text-white/50 text-sm font-medium">
                        Available: {token.balance} {token.symbol}
                    </span>
                </div>

                <div className="flex items-center justify-center gap-4 w-full shrink-0">
                    <Button
                        variant="ghost"
                        onClick={onChangeToken}
                        className="flex items-center gap-2 h-auto px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full"
                    >
                        <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold overflow-hidden">
                            {IconComponent ? (
                                typeof IconComponent === 'string' ? (
                                    <img src={IconComponent} alt={token.symbol} className="h-full w-full object-cover" />
                                ) : (
                                    <IconComponent className="h-3.5 w-3.5" />
                                )
                            ) : (
                                <img src={token.iconUrl} alt={token.symbol} className="h-full w-full object-cover" />
                            )}
                        </div>
                        <span className="font-semibold text-sm">{token.symbol}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={handleMax}
                        className="h-auto px-4 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 rounded-full font-bold text-sm transition-colors"
                    >
                        MAX
                    </Button>
                </div>
            </div>

            <div className="py-6 shrink-0">
                <Button
                    disabled={!amount || parseFloat(amount) <= 0}
                    onClick={onSend}
                    className="w-full h-12 bg-secondary hover:bg-secondary/90 text-black font-semibold text-lg rounded-sm"
                >
                    Review & Send
                </Button>
            </div>
        </div>
    );
};

const StatusStep = ({ status, onClose }: { status: 'loading' | 'success' | 'failed', onClose: () => void }) => (
    <div className="flex flex-col items-center justify-center w-full h-full px-6 pb-6 relative">
        <div className="flex flex-col items-center justify-center flex-1 gap-6">
            {status === 'loading' && (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-secondary" size={64} />
                    <h2 className="text-2xl font-semibold text-white">Sending...</h2>
                    <p className="text-white/50 text-center px-4">Please wait while confirmed on the network.</p>
                </div>
            )}
            {status === 'success' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">Transaction Sent!</h2>
                    <p className="text-white/50 text-center">Your funds are on the way.</p>
                </div>
            )}
            {status === 'failed' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                        <XCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">Transaction Failed</h2>
                    <p className="text-white/50 text-center">Something went wrong. Please try again later.</p>
                </div>
            )}
        </div>
        {status !== 'loading' && (
            <Button onClick={onClose} className="w-full h-12 bg-white/10 hover:bg-white/20 text-white font-semibold text-lg rounded-sm">
                Done
            </Button>
        )}
    </div>
);

const SendOverlay = ({ isOpen, close, activeWallet, tokens }: SendOverlayProps) => {
    const [step, setStep] = useState<Step>('select_token');
    const [direction, setDirection] = useState(1);
    const [selectedToken, setSelectedToken] = useState<Token | null>(null);
    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [txStatus, setTxStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');

    useEffect(() => {
        if (isOpen) {
            setStep('select_token');
            setSelectedToken(null);
            setAddress('');
            setAmount('');
            setTxStatus('idle');
            setDirection(1);
        }
    }, [isOpen]);

    const navigateTo = (newStep: Step, dir: 1 | -1) => {
        setDirection(dir);
        setStep(newStep);
    }

    const stepTitles: Record<Step, string> = {
        'select_token': 'Select Asset',
        'select_address': 'Send to',
        'enter_amount': 'Amount',
        'status': ''
    };

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? '100%' : '-100%', opacity: 0 })
    };

    return (
        <div className={`absolute inset-0 w-full h-full z-[100] flex flex-col justify-end transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="flex-1 w-full cursor-pointer bg-black/40 backdrop-blur-sm transition-opacity duration-500" style={{ opacity: isOpen ? 1 : 0 }} onClick={close} />
            <div className="w-full h-[520px] bg-black/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl flex flex-col items-center shadow-2xl relative overflow-hidden">
                <div className="grid grid-cols-3 items-center w-full p-4 shrink-0 relative z-20 h-16">
                    <div className="flex justify-start">
                        {(step !== 'select_token' && step !== 'status') && (
                            <Button variant="ghost" size="icon" onClick={() => navigateTo(step === 'enter_amount' ? 'select_address' : 'select_token', -1)} className="rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white">
                                <ChevronLeft size={20} />
                            </Button>
                        )}
                    </div>
                    <div className="flex justify-center ">
                        <h2 className="text-lg font-semibold text-white whitespace-nowrap tracking-wide uppercase">{stepTitles[step]}</h2>
                    </div>
                    <div className="flex justify-end">
                        {step !== 'status' && (
                            <Button variant="ghost" size="icon" onClick={close} className="rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white">
                                <X size={20} />
                            </Button>
                        )}
                    </div>
                </div>
                <div className="flex-1 w-full relative">
                    <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                            className="absolute inset-0 w-full h-full flex flex-col overflow-hidden"
                        >
                            {step === 'select_token' && <SelectTokenStep tokens={tokens} onSelect={(t) => { setSelectedToken(t); navigateTo('select_address', 1); }} />}
                            {step === 'select_address' && <SelectAddressStep activeWallet={activeWallet} address={address} setAddress={setAddress} onNext={() => navigateTo('enter_amount', 1)} />}
                            {step === 'enter_amount' && selectedToken && <EnterAmountStep token={selectedToken} amount={amount} setAmount={setAmount} address={address} onEditAddress={() => navigateTo('select_address', -1)} onChangeToken={() => navigateTo('select_token', -1)} onSend={() => { navigateTo('status', 1); setTxStatus('loading'); setTimeout(() => setTxStatus('success'), 2000); }} />}
                            {step === 'status' && <StatusStep status={txStatus} onClose={close} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default SendOverlay;