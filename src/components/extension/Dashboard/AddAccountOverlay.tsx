// components/extension/AddAccountOverlay.tsx
import React, { useState, useRef, useEffect } from 'react'
import { create } from 'zustand'
import { Button } from '@/components/ui/button'
import { X, ChevronRight, KeyRound, ListOrdered, Clipboard, Trash2, Key, Plus, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useWalletStore, Wallet } from '@/store/useWalletStore'
import { networkIconRegistry, Network } from '@/lib/constants'
import { isValidPrivateKey, keypairGenerators } from '@/lib/walletUtils'
import { scanForAccounts } from '@/lib/networkUtils'

interface AddAccountUIState {
    isOpen: boolean;
    initialStep: 'select_network' | 'options';
    targetNetwork?: string;
    open: (step?: 'select_network' | 'options', network?: string) => void;
    close: () => void;
}

export const useAddAccountUI = create<AddAccountUIState>((set) => ({
    isOpen: false,
    initialStep: 'options',
    targetNetwork: undefined,
    open: (step = 'options', network) => set({ isOpen: true, initialStep: step, targetNetwork: network }),
    close: () => set({ isOpen: false }),
}))

enum ImportWalletOptionsEnum {
    RecoveryPhrase = 'RecoveryPhrase',
    PrivateKey = 'PrivateKey'
}

const NetworkTab = ({ network, toggleNetwork, isSelected, isDisabled }: { network: string, toggleNetwork: () => void, isSelected: boolean, isDisabled: boolean }) => {
    const IconComponent = networkIconRegistry[network as Network] as any;

    return (
        <div
            onClick={() => !isDisabled && toggleNetwork()}
            className={`group flex items-center justify-between gap-4 p-3 rounded-xl border transition-all duration-300 ${isDisabled
                ? 'border-secondary/5 bg-secondary/5 opacity-40 cursor-not-allowed'
                : isSelected
                    ? 'border-secondary bg-secondary/10 cursor-pointer shadow-[0_0_15px_rgba(var(--secondary),0.1)]'
                    : 'border-secondary/10 bg-secondary/5 hover:bg-secondary/10 hover:border-secondary/20 cursor-pointer hover:scale-[1.02]'
                }`}
        >
            <div className='flex items-center justify-start gap-4'>
                <div className={`flex items-center justify-center h-10 w-10 rounded-full transition-colors duration-300 ${isSelected && !isDisabled ? 'bg-secondary text-black' : 'bg-secondary/10 text-secondary group-hover:bg-secondary/20'
                    }`}>
                    {IconComponent ? (
                        typeof IconComponent === 'string' ? (
                            <img src={IconComponent} alt={network} className="w-5 h-5 object-cover" />
                        ) : (
                            <IconComponent className="w-5 h-5" />
                        )
                    ) : (
                        <div className="w-5 h-5 bg-secondary/20 rounded-full" />
                    )}
                </div>
                <div className='flex flex-col items-start'>
                    <span className={`text-base font-semibold transition-colors ${isSelected && !isDisabled ? 'text-secondary' : 'text-secondary'
                        }`}>
                        {network}
                    </span>
                    {isDisabled && (
                        <span className="text-xs text-secondary/50 font-medium">Already Added</span>
                    )}
                </div>
            </div>

            {isSelected && !isDisabled && (
                <Check className='text-secondary transition-colors duration-300' size={22} />
            )}
        </div>
    )
}

const SelectNetwork = ({ existingNetworks, onNext }: { existingNetworks: string[], onNext: (network: string) => void }) => {
    const [selectedNetworks, setSelectedNetworks] = useState<Network[]>([])

    const toggleNetwork = (network: Network) => {
        if (existingNetworks.includes(network)) return;
        setSelectedNetworks([network])
    }

    return (
        <div className='w-full flex flex-1 flex-col items-center justify-between p-5 gap-8 h-full'>
            <div className='w-full flex flex-col items-center justify-center gap-4'>
                <h2 className='text-2xl font-semibold text-secondary text-center tracking-wide'>
                    Select a network
                </h2>
                <p className='text-secondary/60 tracking-wide text-center text-sm'>
                    Choose the network you want to add.
                </p>
            </div>

            <div className="w-[90%] flex flex-col items-center justify-center gap-4">
                <div className='grid grid-cols-1 w-full gap-3'>
                    <NetworkTab
                        network={Network.Solana}
                        toggleNetwork={() => toggleNetwork(Network.Solana)}
                        isSelected={selectedNetworks.includes(Network.Solana)}
                        isDisabled={existingNetworks.includes(Network.Solana)}
                    />
                    <NetworkTab
                        network={Network.Ethereum}
                        toggleNetwork={() => toggleNetwork(Network.Ethereum)}
                        isSelected={selectedNetworks.includes(Network.Ethereum)}
                        isDisabled={existingNetworks.includes(Network.Ethereum)}
                    />
                </div>
                <div className="w-full text-center mt-2">
                    <p className="text-secondary/40 text-sm tracking-wide">
                        More networks coming soon!
                    </p>
                </div>
            </div>

            <div className="w-full mt-auto pt-6">
                <Button
                    disabled={selectedNetworks.length === 0}
                    className={`w-full h-12 bg-secondary/95 hover:bg-secondary ${selectedNetworks.length > 0 ? 'opacity-100' : 'opacity-50 cursor-not-allowed'} rounded-sm tracking-wide text-black font-semibold text-lg`}
                    size={'lg'}
                    onClick={() => selectedNetworks.length > 0 && onNext(selectedNetworks[0])}
                >
                    Continue
                </Button>
            </div>
        </div>
    )
}

const AccountOptions = ({ selectedNetwork, onNext, onCreateNew }: {
    selectedNetwork: string;
    onNext: (step: 'mnemonic' | 'private_key') => void;
    onCreateNew: () => void;
}) => {
    return (
        <div className='w-full flex flex-1 flex-col items-center justify-start p-5 gap-8'>
            <div className='flex flex-col items-center gap-3'>
                <div className='flex items-center justify-center rounded-full h-14 w-14 bg-secondary/10 border border-secondary/5'>
                    {typeof networkIconRegistry[selectedNetwork as Network] === 'string' ? (
                        <img src={networkIconRegistry[selectedNetwork as Network] as string} alt={selectedNetwork} className='rounded-full h-8 w-8 object-cover' />
                    ) : (
                        <div className="h-8 w-8 bg-secondary/10 rounded-full" />
                    )}
                </div>
                <div className='flex flex-col items-center justify-center gap-1 text-center'>
                    <h3 className='text-lg tracking-wide font-semibold text-secondary'>
                        Add {selectedNetwork} Account
                    </h3>
                </div>
            </div>

            <div className='w-full flex flex-col gap-6'>
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-secondary/50 uppercase tracking-wider px-1">
                        Create
                    </span>
                    <div
                        onClick={onCreateNew}
                        className='group flex items-center justify-between gap-4 p-3 rounded-xl border border-secondary/10 bg-secondary/5 cursor-pointer transition-all duration-300 hover:bg-secondary/10 hover:border-secondary/20'
                    >
                        <div className='flex items-center justify-start gap-3'>
                            <div className='flex items-center justify-center h-10 w-10 rounded-full bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-black transition-colors duration-300'>
                                <Plus size={20} />
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-sm font-semibold text-secondary'>
                                    Create New Account
                                </span>
                                <span className='text-xs text-secondary/50'>
                                    Derive from existing phrase
                                </span>
                            </div>
                        </div>
                        <ChevronRight className='text-secondary/30 group-hover:text-secondary/70 transition-colors duration-300' />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-secondary/50 uppercase tracking-wider px-1">
                        Import Existing
                    </span>

                    <div
                        onClick={() => onNext('mnemonic')}
                        className='group flex items-center justify-between gap-4 p-3 rounded-xl border border-secondary/10 bg-secondary/5 cursor-pointer transition-all duration-300 hover:bg-secondary/10 hover:border-secondary/20'
                    >
                        <div className='flex items-center justify-start gap-3'>
                            <div className='flex items-center justify-center h-10 w-10 rounded-full bg-secondary/10 text-secondary group-hover:bg-secondary/20 transition-colors duration-300'>
                                <ListOrdered size={20} />
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-sm font-semibold text-secondary'>
                                    Import Recovery Phrase
                                </span>
                            </div>
                        </div>
                        <ChevronRight className='text-secondary/30 group-hover:text-secondary/70 transition-colors duration-300' />
                    </div>

                    <div
                        onClick={() => onNext('private_key')}
                        className='group flex items-center justify-between gap-4 p-3 rounded-xl border border-secondary/10 bg-secondary/5 cursor-pointer transition-all duration-300 hover:bg-secondary/10 hover:border-secondary/20'
                    >
                        <div className='flex items-center justify-start gap-3'>
                            <div className='flex items-center justify-center h-10 w-10 rounded-full bg-secondary/10 text-secondary group-hover:bg-secondary/20 transition-colors duration-300'>
                                <KeyRound size={20} />
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-sm font-semibold text-secondary'>
                                    Import Private Key
                                </span>
                            </div>
                        </div>
                        <ChevronRight className='text-secondary/30 group-hover:text-secondary/70 transition-colors duration-300' />
                    </div>
                </div>
            </div>
        </div>
    )
}

const EnterPrivateKey = ({ onNext, network, isScanning }: { onNext: (key: string) => void; network: string; isScanning: boolean }) => {
    const [privateKey, setPrivateKey] = useState('')
    const [isValid, setIsValid] = useState(false)
    const [isTouched, setIsTouched] = useState(false)

    useEffect(() => {
        if (!privateKey) {
            setIsValid(false)
            return
        }
        const valid = isValidPrivateKey(network as Network, privateKey.trim());
        setIsValid(valid);
    }, [privateKey, network])

    const handleSubmit = () => {
        if (!isValid) return
        onNext(privateKey.trim())
    }

    return (
        <div className='w-full flex flex-1 flex-col items-center justify-between p-5 pb-8 h-full'>
            <div className='w-full flex flex-col items-center gap-6'>
                <div className='flex flex-col items-center gap-4'>
                    <div className='flex items-center justify-center rounded-full h-16 w-16 bg-secondary/10 border border-secondary/5'>
                        <Key className='h-8 w-8 text-secondary' />
                    </div>
                    <div className='flex flex-col items-center text-center gap-1'>
                        <h3 className='text-xl tracking-wider font-semibold text-secondary'>
                            Enter Private Key
                        </h3>
                        <p className='font-medium text-secondary/50 text-sm max-w-xs'>
                            Paste your {network} private key string below.
                        </p>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-2">
                    <textarea
                        value={privateKey}
                        onChange={(e) => {
                            setPrivateKey(e.target.value)
                            if (!isTouched) setIsTouched(true)
                        }}
                        placeholder="Paste private key here..."
                        className={`w-full h-24 bg-secondary/5 border rounded-md p-4 text-sm text-secondary placeholder:text-secondary/30 focus:outline-none transition-colors resize-none custom-scrollbar
                            ${isTouched && !isValid && privateKey ? 'border-red-500/50 focus:border-red-500' : 'border-secondary/10 focus:border-secondary/50'}`}
                    />
                    {isTouched && !isValid && privateKey && (
                        <p className="text-xs font-semibold tracking-wide text-red-400">
                            Invalid private key format.
                        </p>
                    )}
                </div>
            </div>

            <div className="w-full mt-auto pt-6">
                <Button
                    className="w-full h-12 bg-secondary/95 hover:bg-secondary rounded-sm text-black font-semibold text-lg"
                    onClick={handleSubmit}
                    disabled={!isValid || isScanning}
                >
                    {isScanning ? <Loader2 className="animate-spin" /> : "Import Wallet"}
                </Button>
            </div>
        </div>
    )
}

const EnterRecoveryPhrase = ({ onNext, isScanning }: { onNext: (phrase: string) => void; isScanning: boolean }) => {
    const [words, setWords] = useState<string[]>(new Array(12).fill(''))
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const isValid = words.every(word => word.trim().length > 0)

    const processPaste = (text: string) => {
        const pastedWords = text.trim().split(/\s+/).filter(w => w).slice(0, 12)
        if (pastedWords.length === 0) return false;

        const newWords = [...words]
        pastedWords.forEach((word, index) => {
            newWords[index] = word
        })
        setWords(newWords)
        return true;
    }

    const handlePasteButton = async () => {
        try {
            const text = await navigator.clipboard.readText()
            if (text) processPaste(text)
        } catch (err) {
            toast.error("Clipboard access denied. Please paste manually.")
        }
    }

    const handleChange = (index: number, value: string) => {
        const newWords = [...words]
        newWords[index] = value.trim()
        setWords(newWords)
    }

    return (
        <div className='w-full flex flex-1 flex-col items-center justify-between p-5 pb-8 h-full'>
            <div className='w-full flex flex-col items-center gap-6'>
                <div className='flex flex-col items-center text-center gap-1'>
                    <h2 className='text-xl font-semibold text-secondary'>Recovery Phrase</h2>
                    <p className='text-secondary/50 text-sm'>Enter your 12-word phrase</p>
                </div>

                <div className='w-full flex gap-2'>
                    <Button className="flex-1 h-10 bg-secondary/10 hover:bg-secondary/20 text-secondary" onClick={handlePasteButton}>
                        <Clipboard size={14} className="mr-2" /> Paste
                    </Button>
                    <Button className="h-10 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400" onClick={() => setWords(new Array(12).fill(''))}>
                        <Trash2 size={16} />
                    </Button>
                </div>

                <div className='grid grid-cols-3 gap-2 w-full'>
                    {words.map((word, index) => (
                        <div key={index} className="relative flex items-center group">
                            <span className="absolute left-2 text-[10px] text-secondary/30 font-mono">
                                {index + 1}.
                            </span>
                            <input
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                value={word}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onPaste={(e) => {
                                    if (processPaste(e.clipboardData.getData('text'))) e.preventDefault()
                                }}
                                className="w-full h-9 bg-secondary/5 border border-secondary/10 rounded-sm pl-6 pr-1 text-xs text-secondary placeholder:text-secondary/20 focus:outline-none focus:border-secondary/50 transition-all"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full mt-auto pt-6">
                <Button
                    className="w-full h-12 bg-secondary/95 hover:bg-secondary rounded-sm text-black font-semibold text-lg"
                    onClick={() => { if (isValid) onNext(words.join(' ')) }}
                    disabled={!isValid || isScanning}
                >
                    {isScanning ? <Loader2 className="animate-spin mr-2" /> : null}
                    {isScanning ? "Scanning Network..." : "Import Wallet"}
                </Button>
            </div>
        </div>
    )
}

// ----------------------------------------------------
// MAIN ADD ACCOUNT OVERLAY COMPONENT
// ----------------------------------------------------

const AddAccountOverlay = () => {
    const { isOpen, close, initialStep, targetNetwork } = useAddAccountUI()
    const wallets = useWalletStore(state => state.wallets)
    const mnemonic = useWalletStore(state => state.mnemonic)
    const setWallets = useWalletStore(state => state.setWallets)
    const setActiveAccountIndex = useWalletStore(state => state.setActiveAccountIndex)

    const existingNetworks = Array.from(new Set(wallets.map(w => w.network)))

    const [step, setStep] = useState<'select_network' | 'options' | 'mnemonic' | 'private_key'>('options')
    const [selectedNetwork, setSelectedNetwork] = useState<string>(Network.Solana)
    const [isScanning, setIsScanning] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setStep(initialStep)
            if (targetNetwork) {
                setSelectedNetwork(targetNetwork)
            } else if (!targetNetwork && existingNetworks.length > 0) {
                setSelectedNetwork(existingNetworks[0])
            }
        }
    }, [isOpen, initialStep, targetNetwork])

    const handleCreateNew = () => {
        try {
            if (!mnemonic) throw new Error("No root mnemonic found")
            const networkWallets = wallets.filter(w => w.network === selectedNetwork)
            const nextIndex = networkWallets.length

            const newWallets = keypairGenerators.fromMnemonic(mnemonic, [selectedNetwork as Network], nextIndex)
            const newWalletObj = { ...newWallets[0], importSource: 'Primary Phrase' }

            setWallets([...wallets, newWalletObj])
            setActiveAccountIndex(wallets.length)
            toast.success("New account created!")
            close()
        } catch (e) {
            toast.error("Failed to create account.")
        }
    }

    const handleImportMnemonic = async (phrase: string) => {
        setIsScanning(true)
        try {
            const firstGenerated = keypairGenerators.fromMnemonic(phrase, [selectedNetwork as Network], 0)[0];
            const existingFirstIndex = wallets.findIndex(w => w.publicKey === firstGenerated.publicKey && w.network === selectedNetwork);

            if (existingFirstIndex !== -1) {
                setActiveAccountIndex(existingFirstIndex);
                toast.info("This recovery phrase was already imported.");
                close();
                return;
            }

            const importedPhraseCount = new Set(wallets.filter(w => w.importSource?.includes('Imported Phrase')).map(w => w.importSource)).size
            const sourceName = `Imported Phrase ${importedPhraseCount + 1}`

            let activeAccounts: Wallet[] = [];
            let emptyWalletCount = 0;
            let accountIndex = 0;
            const GAP_LIMIT = 1;

            while (emptyWalletCount < GAP_LIMIT) {
                const generatedWallets = keypairGenerators.fromMnemonic(phrase, [selectedNetwork as Network], accountIndex);
                const currentWallet = generatedWallets[0];

                const isDuplicate = wallets.some(w => w.publicKey === currentWallet.publicKey && w.network === selectedNetwork) ||
                    activeAccounts.some(w => w.publicKey === currentWallet.publicKey);

                if (accountIndex === 0) {
                    if (!isDuplicate) activeAccounts.push({ ...currentWallet, isImported: true, importSource: sourceName });
                    accountIndex++;
                    continue;
                }

                const scanResults = await scanForAccounts(currentWallet.publicKey, [selectedNetwork as Network]);
                const hasHistory = scanResults.some((r: any) => r.exists);

                if (hasHistory) {
                    if (!isDuplicate) activeAccounts.push({ ...currentWallet, isImported: true, importSource: sourceName });
                    emptyWalletCount = 0;
                } else {
                    emptyWalletCount++;
                }
                accountIndex++;
            }

            if (activeAccounts.length > 0) {
                setWallets([...wallets, ...activeAccounts])
                // Focus the first newly imported account (which will be at the index of the old array's length)
                setActiveAccountIndex(wallets.length)
                toast.success(`Imported ${activeAccounts.length} account(s)!`)
            } else {
                toast.info("No new accounts found to import.")
            }

            close()
        } catch (e) {
            toast.error("Failed to import account.")
        } finally {
            setIsScanning(false)
        }
    }

    const handleImportPrivateKey = async (key: string) => {
        try {
            const newWallets = keypairGenerators.fromPrivateKey(key, [selectedNetwork as Network])
            const newWallet = newWallets[0];

            const existingIndex = wallets.findIndex(w => w.publicKey === newWallet.publicKey && w.network === selectedNetwork);

            if (existingIndex !== -1) {
                setActiveAccountIndex(existingIndex);
                toast.info("Account already imported.");
                close();
                return;
            }

            const importedWallets = newWallets.map(w => ({ ...w, isImported: true, importSource: 'Imported Private Key' }))
            setWallets([...wallets, ...importedWallets])
            setActiveAccountIndex(wallets.length)
            toast.success("Account imported successfully!")
            close()
        } catch (e) {
            toast.error("Failed to import private key.")
        }
    }

    return (
        <div className={`absolute inset-0 w-full h-full z-[100] flex flex-col justify-end transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="flex-1 w-full cursor-pointer bg-black/40 backdrop-blur-sm transition-opacity duration-500" style={{ opacity: isOpen ? 1 : 0 }} onClick={close} />

            <div className="w-full h-[540px] bg-black/95 backdrop-blur-xl border-t border-secondary/10 rounded-t-3xl flex flex-col items-center shadow-2xl relative">
                <div className="w-full flex flex-col items-center justify-center h-8 shrink-0">
                    <div className="w-12 h-1.5 bg-secondary/20 rounded-full mt-2" />
                </div>

                <button onClick={close} className="absolute top-5 right-5 text-secondary/50 hover:text-secondary transition-colors bg-secondary/5 rounded-full p-1.5 z-10">
                    <X size={18} />
                </button>

                <div className="flex-1 w-full overflow-y-auto custom-scrollbar">
                    {step === 'select_network' && (
                        <SelectNetwork
                            existingNetworks={existingNetworks}
                            onNext={(net) => {
                                setSelectedNetwork(net)
                                setStep('options')
                            }}
                        />
                    )}
                    {step === 'options' && (
                        <AccountOptions
                            selectedNetwork={selectedNetwork}
                            onNext={(nextStep) => setStep(nextStep)}
                            onCreateNew={handleCreateNew}
                        />
                    )}
                    {step === 'private_key' && (
                        <EnterPrivateKey network={selectedNetwork} onNext={handleImportPrivateKey} isScanning={isScanning} />
                    )}
                    {step === 'mnemonic' && (
                        <EnterRecoveryPhrase onNext={handleImportMnemonic} isScanning={isScanning} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default AddAccountOverlay