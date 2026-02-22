import { Network } from "./constants";
import * as bip from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import { HDNodeWallet, isAddress, Wallet, JsonRpcProvider, parseEther, formatEther } from 'ethers';
import bs58 from 'bs58';
import { Transaction } from "@/components/extension/Dashboard";

import {
    address as kitAddress,
    createSolanaRpc,
    createSolanaRpcSubscriptions,
    createTransactionMessage,
    setTransactionMessageFeePayerSigner,
    setTransactionMessageLifetimeUsingBlockhash,
    appendTransactionMessageInstructions,
    pipe,
    signTransactionMessageWithSigners,
    getSignatureFromTransaction,
    sendAndConfirmTransactionFactory,
    createKeyPairSignerFromBytes,
    lamports,
    airdropFactory
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";

const SOLANA_DEVNET_RPC = 'https://api.devnet.solana.com';
const SOLANA_DEVNET_WSS = 'wss://api.devnet.solana.com';
const ETHEREUM_SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';

export interface Keypair {
    privateKey: string;
    publicKey: string;
}

const createEthKeypair = (mnemonic: string, accountIndex: number = 0): Keypair => {
    const path = `m/44'/60'/0'/0/${accountIndex}`;
    const wallet = HDNodeWallet.fromPhrase(mnemonic, "", path);
    return { publicKey: wallet.address, privateKey: wallet.privateKey };
}

const createSolKeypair = (seed: Buffer, accountIndex: number = 0): Keypair => {
    const path = `m/44'/501'/${accountIndex}'/0'`;
    const derivedSeed = derivePath(path, seed.toString('hex')).key;
    const keyPair = nacl.sign.keyPair.fromSeed(derivedSeed);
    return {
        publicKey: bs58.encode(keyPair.publicKey),
        privateKey: bs58.encode(keyPair.secretKey)
    };
}

const generateMnemonic = () => bip.generateMnemonic();
const generateSeed = (mnemonic: string) => bip.mnemonicToSeedSync(mnemonic);
const validateMnemonic = (mnemonic: string): boolean => bip.validateMnemonic(mnemonic);

const generateKeypair = ({ network, seed, mnemonic, accountIndex = 0 }: {
    network: Network, seed: Buffer, mnemonic: string, accountIndex?: number
}): Keypair => {
    switch (network) {
        case Network.Ethereum: return createEthKeypair(mnemonic, accountIndex);
        case Network.Solana: return createSolKeypair(seed, accountIndex);
        default: throw new Error("Unsupported network");
    }
}

const isValidPrivateKey = (network: Network, privateKey: string): boolean => {
    try {
        if (network === Network.Ethereum) {
            new Wallet(privateKey);
            return true;
        } else if (network === Network.Solana) {
            const decoded = bs58.decode(privateKey);
            return decoded.length === 64;
        }
    } catch (e) {
        return false;
    }
    return false;
}

export const isValidPublicAddress = (network: Network, addressStr: string): boolean => {
    try {
        if (!addressStr) return false;
        if (network === Network.Ethereum) {
            return isAddress(addressStr);
        } else if (network === Network.Solana) {
            kitAddress(addressStr);
            return true;
        }
    } catch (e) {
        return false;
    }
    return false;
};

export const getNetworkBalance = async (network: Network, addressStr: string): Promise<string> => {
    try {
        if (network === Network.Solana) {
            const rpc = createSolanaRpc(SOLANA_DEVNET_RPC);
            const { value: balance } = await rpc.getBalance(kitAddress(addressStr)).send();
            return (Number(balance) / 1_000_000_000).toString();
        } else if (network === Network.Ethereum) {
            const provider = new JsonRpcProvider(ETHEREUM_SEPOLIA_RPC);
            const balance = await provider.getBalance(addressStr);
            return formatEther(balance);
        }
        return "0";
    } catch (error) {
        return "0";
    }
};

export const requestNetworkAirdrop = async (network: Network, addressStr: string, amount: number): Promise<void> => {
    if (network === Network.Solana) {
        const rpc = createSolanaRpc(SOLANA_DEVNET_RPC);
        const rpcSubscriptions = createSolanaRpcSubscriptions(SOLANA_DEVNET_WSS);

        const requestAirdrop = airdropFactory({ rpc, rpcSubscriptions });

        await requestAirdrop({
            recipientAddress: kitAddress(addressStr),
            lamports: lamports(BigInt(amount * 1_000_000_000)),
            commitment: "confirmed",
        });
        return;
    } else if (network === Network.Ethereum) {
        throw new Error("ETH_FAUCET_REQUIRED");
    }
};

export const sendNetworkAsset = async (network: Network, privateKey: string, toAddress: string, amount: string): Promise<string> => {
    if (network === Network.Solana) {
        const rpc = createSolanaRpc(SOLANA_DEVNET_RPC);
        const rpcSubscriptions = createSolanaRpcSubscriptions(SOLANA_DEVNET_WSS);

        const secretKeyBytes = bs58.decode(privateKey);
        const senderSigner = await createKeyPairSignerFromBytes(secretKeyBytes);

        const transferAmount = lamports(BigInt(Math.floor(parseFloat(amount) * 1_000_000_000)));

        const transferInstruction = getTransferSolInstruction({
            source: senderSigner,
            destination: kitAddress(toAddress),
            amount: transferAmount,
        });

        const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

        const transactionMessage = pipe(
            createTransactionMessage({ version: 0 }),
            (tx) => setTransactionMessageFeePayerSigner(senderSigner, tx),
            (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
            (tx) => appendTransactionMessageInstructions([transferInstruction], tx)
        );

        const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);
        await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
            signedTransaction,
            { commitment: "confirmed" }
        );

        return getSignatureFromTransaction(signedTransaction);

    } else if (network === Network.Ethereum) {
        const provider = new JsonRpcProvider(ETHEREUM_SEPOLIA_RPC);
        const wallet = new Wallet(privateKey, provider);
        const tx = await wallet.sendTransaction({
            to: toAddress,
            value: parseEther(amount)
        });
        const receipt = await tx.wait();
        if (!receipt) throw new Error("Transaction failed or dropped");
        return receipt.hash;
    }

    throw new Error("Unsupported network");
};

export const getRecentTransactions = async (network: Network, addressStr: string): Promise<Transaction[]> => {
    if (network === Network.Solana) {
        try {
            const rpc = createSolanaRpc(SOLANA_DEVNET_RPC);

            const signatures = await rpc.getSignaturesForAddress(kitAddress(addressStr), { limit: 10 }).send();

            if (!signatures || !Array.isArray(signatures) || signatures.length === 0) return [];

            const txs: Transaction[] = [];

            for (const sigInfo of signatures) {
                try {
                    const tx = await rpc.getTransaction(sigInfo.signature, {
                        maxSupportedTransactionVersion: 0,
                    }).send();

                    if (!tx || !tx.meta) continue;

                    const accountKeys = tx.transaction.message.accountKeys.map((k: any) => k.toString());
                    const accountIndex = accountKeys.indexOf(addressStr);

                    if (accountIndex === -1) continue;

                    const preBalance = tx.meta.preBalances[accountIndex] || 0n;
                    const postBalance = tx.meta.postBalances[accountIndex] || 0n;
                    const change = Number(postBalance) - Number(preBalance);

                    if (change === 0) continue;

                    let displayChange = Math.abs(change);
                    if (change < 0 && displayChange > 5000) {
                        displayChange -= 5000;
                    }

                    const type = change > 0 ? 'receive' : 'send';

                    const amount = (displayChange / 1_000_000_000).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                    });

                    const date = sigInfo.blockTime
                        ? new Date(Number(sigInfo.blockTime) * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : 'Recent';

                    txs.push({
                        id: sigInfo.signature.toString(),
                        type,
                        amount,
                        symbol: 'SOL',
                        date,
                        status: sigInfo.err ? 'failed' : 'completed'
                    });
                } catch (e) {
                    continue;
                }
            }
            return txs;
        } catch (error) {
            return [];
        }
    }

    return [];
};

const getWalletFromPrivateKey = (network: Network, privateKey: string): Keypair => {
    try {
        if (network === Network.Ethereum) {
            const wallet = new Wallet(privateKey);
            return { publicKey: wallet.address, privateKey: wallet.privateKey };
        } else if (network === Network.Solana) {
            const secretKey = bs58.decode(privateKey);
            const pair = nacl.sign.keyPair.fromSecretKey(secretKey);
            return {
                publicKey: bs58.encode(pair.publicKey),
                privateKey: bs58.encode(pair.secretKey)
            };
        }
    } catch (e) {
        throw new Error("Invalid Private Key");
    }
    throw new Error("Unsupported Network");
}

const keypairGenerators = {
    fromMnemonic: (phrase: string, networks: Network[], accountIndex: number = 0) => {
        if (!phrase) throw new Error("Mnemonic is required but was undefined.");
        if (networks.length === 0) throw new Error("No networks selected.");

        const seed = generateSeed(phrase);
        return networks.map(network => ({
            network,
            ...generateKeypair({ network, seed, mnemonic: phrase, accountIndex })
        }));
    },

    fromPrivateKey: (key: string, networks: Network[]) => {
        if (!key) throw new Error("Private Key is required but was undefined.");
        if (networks.length === 0) throw new Error("No network selected.");

        const targetNetwork = networks[0];
        const wallet = getWalletFromPrivateKey(targetNetwork, key);

        return [{
            network: targetNetwork,
            ...wallet
        }];
    }
};

export {
    generateKeypair,
    generateMnemonic,
    validateMnemonic,
    generateSeed,
    getWalletFromPrivateKey,
    keypairGenerators,
    isValidPrivateKey
}