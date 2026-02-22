import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft } from 'lucide-react'
import { useWalletStore, Wallet } from '@/store/useWalletStore'
import { toast } from 'sonner'
import { PasswordPrompt } from './PasswordPrompt'
import { Profile } from './Profile'
import { ShowPrimaryKey } from './ShowPrimaryKey'
import { ShowSeedPhrase } from './ShowSeedPhrase'
import { Menu } from './Menu'


interface SettingsOverlayProps {
    isOpen: boolean;
    close: () => void;
    activeWallet: Wallet;
}

type Step = 'menu' | 'profile' | 'password_prompt' | 'reveal_seed' | 'reveal_pk';

const SettingsOverlay = ({ isOpen, close, activeWallet }: SettingsOverlayProps) => {
    const [step, setStep] = useState<Step>('menu')
    const [direction, setDirection] = useState(1)
    const [targetReveal, setTargetReveal] = useState<'reveal_seed' | 'reveal_pk' | null>(null)
    const [accountName, setAccountName] = useState(activeWallet.name || "Account 1")
    const [avatarSeed, setAvatarSeed] = useState(activeWallet.avatar || activeWallet.publicKey)

    const mnemonic = useWalletStore(state => state.mnemonic)
    const wallets = useWalletStore(state => state.wallets)
    const setWallets = useWalletStore(state => state.setWallets)

    useEffect(() => {
        if (isOpen) {
            setStep('menu')
            setTargetReveal(null)
            setAccountName(activeWallet.name || "Account 1")
            setAvatarSeed(activeWallet.avatar || activeWallet.publicKey)
        }
    }, [isOpen, activeWallet])

    const navigateTo = (newStep: Step, dir: 1 | -1) => {
        setDirection(dir)
        setStep(newStep)
    }

    const handleSaveProfile = () => {
        const updatedWallets = wallets.map(w =>
            w.publicKey === activeWallet.publicKey ? { ...w, name: accountName, avatar: avatarSeed } : w
        )
        setWallets(updatedWallets)
        toast.success("Account details saved")
        close()
    }

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 0 })
    }

    const stepTitles: Record<Step, string> = {
        'menu': 'Settings',
        'profile': 'Account Details',
        'password_prompt': 'Security',
        'reveal_seed': 'Secret Phrase',
        'reveal_pk': 'Private Key'
    }

    const isRevealStep = step === 'reveal_seed' || step === 'reveal_pk';

    return (
        <div className={`absolute inset-0 w-full h-full z-[100] flex flex-col justify-end transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="flex-1 w-full cursor-pointer bg-taupe-950/40 backdrop-blur-sm transition-opacity duration-500" style={{ opacity: isOpen ? 1 : 0 }} onClick={() => !isRevealStep && close()} />

            <div className="w-full h-auto min-h-[300px] max-h-[90vh] bg-taupe-950/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl flex flex-col items-center shadow-2xl relative">
                <div className="flex items-center justify-between w-full p-4 h-16 shrink-0 border-b border-white/5 relative z-20">
                    <div className="flex justify-start w-10">
                        {step !== 'menu' && !isRevealStep && (
                            <Button variant="ghost" size="icon" onClick={() => navigateTo('menu', -1)} className="rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white">
                                <ChevronLeft size={20} />
                            </Button>
                        )}
                    </div>
                    <h2 className="text-lg font-semibold text-white tracking-wide">
                        {stepTitles[step]}
                    </h2>
                    <div className="flex justify-end w-10">
                        {!isRevealStep && (
                            <Button variant="ghost" size="icon" onClick={close} className="rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white w-10 h-10">
                                <X size={20} />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="w-full relative overflow-x-hidden overflow-y-auto custom-scrollbar">
                    
                    <AnimatePresence mode="wait" custom={direction} initial={false}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                            className="w-full flex flex-col"
                        >
                            {step === 'menu' && (
                                <Menu
                                    onNavigate={(s) => navigateTo(s, 1)}
                                    onSetTargetReveal={setTargetReveal}
                                />
                            )}

                            {step === 'profile' && (
                                <Profile
                                    accountName={accountName}
                                    setAccountName={setAccountName}
                                    avatarSeed={avatarSeed}
                                    setAvatarSeed={setAvatarSeed}
                                    onSave={handleSaveProfile}
                                />
                            )}

                            {step === 'password_prompt' && (
                                <PasswordPrompt
                                    onSuccess={() => targetReveal && navigateTo(targetReveal, 1)}
                                />
                            )}

                            {step === 'reveal_seed' && (
                                <ShowSeedPhrase
                                    mnemonic={mnemonic}
                                    onDone={() => navigateTo('menu', -1)}
                                />
                            )}

                            {step === 'reveal_pk' && (
                                <ShowPrimaryKey
                                    privateKey={activeWallet.privateKey}
                                    onDone={() => navigateTo('menu', -1)}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

export default SettingsOverlay