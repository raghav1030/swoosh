import * as CryptoJS from 'crypto-js';
import { useWalletStore, Wallet } from '../store/useWalletStore';
import { keypairGenerators } from '../lib/walletUtils';
import { Network } from '@/lib/constants';
import { scanForAccounts } from '@/lib/networkUtils';

export const unlockWallet = async (password: string): Promise<boolean> => {
    try {
        if (!window.chrome || !window.chrome.storage) {
            return false;
        }

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

        let allActiveWallets: Wallet[] = [];

        for (const network of networksToGenerate) {
            let emptyWalletCount = 0;
            let accountIndex = 0;
            const GAP_LIMIT = 1;

            while (emptyWalletCount < GAP_LIMIT) {
                const generatedWallets = keypairGenerators.fromMnemonic(decryptedMnemonic, [network], accountIndex);
                const currentWallet = generatedWallets[0];

                if (accountIndex === 0) {
                    allActiveWallets.push(currentWallet);
                    accountIndex++;
                    continue;
                }

                const scanResults = await scanForAccounts(currentWallet.publicKey);
                const hasActiveAccounts = scanResults.some((r: any) => r.exists);

                if (hasActiveAccounts) {
                    allActiveWallets.push(currentWallet);
                    emptyWalletCount = 0;
                } else {
                    emptyWalletCount++;
                }

                accountIndex++;
            }
        }

        const store = useWalletStore.getState();
        store.setWallets(allActiveWallets);
        store.setMnemonic(decryptedMnemonic);
        store.setSelectedNetworks(networksToGenerate);
        store.setPassword(password);

        return true;
    } catch (error) {
        console.error("Unlock error:", error);
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

    if (!window.chrome || !window.chrome.storage) {
        return 'no_wallet';
    }

    try {
        const storageData = await chrome.storage.local.get(['hasWallet']);
        if (storageData.hasWallet) {
            return 'locked';
        }
    } catch (error) {
        return 'no_wallet';
    }

    return 'no_wallet';
};