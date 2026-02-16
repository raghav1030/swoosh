import * as CryptoJS from 'crypto-js';
import { useWalletStore } from '../store/useWalletStore';
import { keypairGenerators } from '../lib/walletUtils';
import { Network } from '@/lib/constants';

export const unlockWallet = async (password: string): Promise<boolean> => {
    try {
        const storageData = await chrome.storage.local.get(['encryptedMnemonic', 'selectedNetworks']);
        const { encryptedMnemonic, selectedNetworks } = storageData;

        if (!encryptedMnemonic) {
            throw new Error("WALLET_NOT_FOUND");
        }

        const bytes = CryptoJS.AES.decrypt(encryptedMnemonic, password);
        const decryptedMnemonic = bytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedMnemonic) {
            return false;
        }

        const networksToGenerate: Network[] = selectedNetworks && selectedNetworks.length > 0
            ? selectedNetworks
            : [Network.Solana];

        const generatedWallets = keypairGenerators.fromMnemonic(decryptedMnemonic, networksToGenerate);

        const store = useWalletStore.getState();
        store.setWallets(generatedWallets);
        store.setMnemonic(decryptedMnemonic);
        store.setSelectedNetworks(networksToGenerate);

        return true;
    } catch (error) {
        return false;
    }
};

export const lockWallet = async (): Promise<void> => {
    const store = useWalletStore.getState();
    store.setWallets([]);
    store.setMnemonic('');
    store.setImportedPrivateKey('');
    store.setPassword('');
};

export const checkWalletStatus = async (): Promise<'unlocked' | 'locked' | 'no_wallet'> => {
    const currentWallets = useWalletStore.getState().wallets;

    if (currentWallets && currentWallets.length > 0) {
        return 'unlocked';
    }

    const storageData = await chrome.storage.local.get(['hasWallet']);
    if (storageData.hasWallet) {
        return 'locked';
    }

    return 'no_wallet';
};