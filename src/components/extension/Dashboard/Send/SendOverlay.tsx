import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronLeft, X } from 'lucide-react'
import { Wallet } from '@/store/useWalletStore'
import { Token } from '../../Dashboard'
import { useWalletTransfer } from '@/lib/useWalletTransfer'
import { Network } from 'ethers'
import { EnterAmountStep } from './EnterAmount'
import { SelectAddressStep } from './SelectAddress'
import { SelectTokenStep } from './SelectToken'
import { StatusStep } from './TransactionStatus'


interface SendOverlayProps {
    isOpen: boolean;
    close: () => void;
    activeWallet: Wallet;
    tokens: Token[];
}

type Step = 'select_token' | 'select_address' | 'enter_amount' | 'status';

const SendOverlay = ({ isOpen, close, activeWallet, tokens }: SendOverlayProps) => {
    const [step, setStep] = useState<Step>('select_token');
    const [direction, setDirection] = useState(1);
    const [selectedToken, setSelectedToken] = useState<Token | null>(null);
    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState('');

    const [txStatus, setTxStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');
    const [txHash, setTxHash] = useState<string | null>(null);

    const { send } = useWalletTransfer(activeWallet);

    useEffect(() => {
        if (isOpen) {
            setStep('select_token');
            setSelectedToken(null);
            setAddress('');
            setAmount('');
            setTxStatus('idle');
            setTxHash(null);
            setDirection(1);
        }
    }, [isOpen]);

    const navigateTo = (newStep: Step, dir: 1 | -1) => {
        setDirection(dir);
        setStep(newStep);
    };

    const stepTitles: Record<Step, string> = {
        select_token: 'Select Asset',
        select_address: 'Send to',
        enter_amount: 'Amount',
        status: '',
    };

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 0 }),
    };

    const handleSend = async () => {
        navigateTo('status', 1);
        setTxStatus('loading');

        try {
            const signature = await send({ destination: address, amount: amount });
            setTxHash(signature);
            setTxStatus('success');
        } catch (error) {
            console.error("Transfer failed:", error);
            setTxStatus('failed');
        }
    };

    return (
        <div className={`absolute inset-0 w-full h-full z-[100] flex flex-col justify-end transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="flex-1 w-full cursor-pointer bg-taupe-950/40 backdrop-blur-sm transition-opacity duration-500" style={{ opacity: isOpen ? 1 : 0 }} onClick={close} />

            <div className="w-full h-[520px] bg-taupe-950/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl flex flex-col items-center shadow-2xl relative overflow-hidden">
                <div className="grid grid-cols-3 items-center w-full p-4 shrink-0 relative z-20 h-16">
                    <div className="flex justify-start">
                        {step !== 'select_token' && step !== 'status' && (
                            <Button variant="ghost" size="icon" onClick={() => navigateTo(step === 'enter_amount' ? 'select_address' : 'select_token', -1)} className="rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white">
                                <ChevronLeft size={20} />
                            </Button>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <h2 className="text-xl font-semibold text-white whitespace-nowrap ">
                            {stepTitles[step]}
                        </h2>
                    </div>

                    <div className="flex justify-end">
                        {step !== 'status' && (
                            <Button variant="ghost" size="icon" onClick={close} className="rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white">
                                <X size={20} />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex-1 w-full relative overflow-hidden">
                    <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                            className="absolute inset-0 w-full h-full flex flex-col"
                        >
                            {step === 'select_token' && <SelectTokenStep tokens={tokens} onSelect={(t) => { setSelectedToken(t); navigateTo('select_address', 1); }} />}
                            {step === 'select_address' && <SelectAddressStep activeWallet={activeWallet} address={address} setAddress={setAddress} onNext={() => navigateTo('enter_amount', 1)} />}
                            {step === 'enter_amount' && selectedToken && (
                                <EnterAmountStep
                                    token={selectedToken}
                                    amount={amount}
                                    setAmount={setAmount}
                                    address={address}
                                    onEditAddress={() => navigateTo('select_address', -1)}
                                    onChangeToken={() => navigateTo('select_token', -1)}
                                    onSend={handleSend}
                                />
                            )}
                            {step === 'status' && <StatusStep status={txStatus} txHash={txHash} network={activeWallet.network as Network} onClose={close} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SendOverlay;