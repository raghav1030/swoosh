import { useState } from 'react';
import { Network } from '@/lib/constants';
import { sendNetworkAsset } from '@/lib/walletUtils';
import { Wallet } from '@/store/useWalletStore';

export function useWalletTransfer(activeWallet: Wallet) {
    const [isSending, setIsSending] = useState(false);
    const [signature, setSignature] = useState<string | null>(null);

    const send = async ({ destination, amount }: { destination: string, amount: string }) => {
        if (!activeWallet?.privateKey) throw new Error("No private key found.");

        setIsSending(true);
        setSignature(null);

        try {
            const sig = await sendNetworkAsset(
                activeWallet.network as Network,
                activeWallet.privateKey,
                destination,
                amount
            );
            setSignature(sig);
            return sig;
        } catch (err: any) {
            throw err;
        } finally {
            setIsSending(false);
        }
    };

    return { send, isSending, signature };
}