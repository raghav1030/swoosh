import { Network } from "./constants";
import * as bip from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import { HDNodeWallet, Wallet } from 'ethers';
import bs58 from 'bs58';

export interface Keypair {
    privateKey: string;
    publicKey: string;
}

const createEthKeypair = (mnemonic: string): Keypair => {
    const wallet = HDNodeWallet.fromPhrase(mnemonic);
    return {
        publicKey: wallet.address,
        privateKey: wallet.privateKey
    };
}

const createSolKeypair = (seed: Buffer): Keypair => {
    const path = `m/44'/501'/0'/0'`;
    const derivedSeed = derivePath(path, seed.toString('hex')).key;
    const keyPair = nacl.sign.keyPair.fromSeed(derivedSeed);

    return {
        publicKey: bs58.encode(keyPair.publicKey),
        privateKey: bs58.encode(keyPair.secretKey)
    };
}

const generateMnemonic = () => {
    return bip.generateMnemonic();
}

const generateSeed = (mnemonic: string) => {
    return bip.mnemonicToSeedSync(mnemonic);
}

const validateMnemonic = (mnemonic: string): boolean => {
    return bip.validateMnemonic(mnemonic);
}

const generateKeypair = ({ network, seed, mnemonic }: {
    network: Network, seed: Buffer, mnemonic: string
}): Keypair => {
    switch (network) {
        case Network.Ethereum:
            return createEthKeypair(mnemonic);
        case Network.Solana:
            return createSolKeypair(seed);
        default:
            throw new Error("Unsupported network");
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
    fromMnemonic: (phrase: string, networks: Network[]) => {
        if (!phrase) throw new Error("Mnemonic is required but was undefined.");
        if (networks.length === 0) throw new Error("No networks selected.");

        const seed = generateSeed(phrase);
        return networks.map(network => ({
            network,
            ...generateKeypair({ network, seed, mnemonic: phrase })
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