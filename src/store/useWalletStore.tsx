import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ImportWalletOptions as ImportWalletOptionsEnum, Network } from '@/lib/constants'

export interface Wallet {
    network: Network;
    publicKey: string;
    privateKey: string;
    isImported?: boolean;
    importSource?: string;
}

interface WalletState {
    step: number;
    isNewWallet: boolean;
    selectedNetworks: Network[];
    importWalletOption: ImportWalletOptionsEnum | null;

    password: string;
    mnemonic: string;
    importedPrivateKey: string;

    wallets: Wallet[];
    activeAccountIndex: number;

    setStep: (step: number) => void;
    setIsNewWallet: (isNew: boolean) => void;
    setSelectedNetworks: (networks: Network[]) => void;
    setImportWalletOption: (option: ImportWalletOptionsEnum | null) => void;
    setPassword: (pass: string) => void;
    setMnemonic: (phrase: string) => void;
    setImportedPrivateKey: (key: string) => void;
    setWallets: (wallets: Wallet[]) => void;
    setActiveAccountIndex: (index: number) => void;
    resetFlow: () => void;
}

export const useWalletStore = create<WalletState>()(
    persist(
        (set) => ({
            step: 0,
            isNewWallet: false,
            selectedNetworks: [],
            importWalletOption: null,
            password: '',
            mnemonic: '',
            importedPrivateKey: '',
            wallets: [],
            activeAccountIndex: 0,

            setStep: (step: number) => set({ step }),
            setIsNewWallet: (isNewWallet: boolean) => set({ isNewWallet }),
            setSelectedNetworks: (selectedNetworks: Network[]) => set({ selectedNetworks }),
            setImportWalletOption: (importWalletOption: ImportWalletOptionsEnum | null) => set({ importWalletOption }),
            setPassword: (password: string) => set({ password }),
            setMnemonic: (mnemonic: string) => set({ mnemonic }),
            setImportedPrivateKey: (importedPrivateKey: string) => set({ importedPrivateKey }),
            setWallets: (wallets: Wallet[]) => set({ wallets }),
            setActiveAccountIndex: (activeAccountIndex: number) => set({ activeAccountIndex }),

            resetFlow: () => set({
                step: 0,
                isNewWallet: false,
                selectedNetworks: [],
                importWalletOption: null,
                password: '',
                mnemonic: '',
                importedPrivateKey: '',
                wallets: [],
                activeAccountIndex: 0,
            })
        }),
        {
            name: 'swoosh-wallet-storage',
            partialize: (state: WalletState) => ({
                step: state.step,
                isNewWallet: state.isNewWallet,
                selectedNetworks: state.selectedNetworks,
                importWalletOption: state.importWalletOption,
            }),
        }
    )
)