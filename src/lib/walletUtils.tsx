import { Network } from "./constants";
import * as bip from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import { Wallet, HDNodeWallet } from 'ethers';

const createEthKeypair = (mnemonic: string) => {
    const wallet = HDNodeWallet.fromPhrase(mnemonic);
    return {
        address: wallet.address,
        privateKey: wallet.privateKey
    };
}

const createSolKeypair = (seed: Buffer) => {
    const path = `m/44'/501'/0'/0'`;
    const derivedSeed = derivePath(path, seed.toString('hex')).key;
    return nacl.sign.keyPair.fromSeed(derivedSeed);
}

const generateMnemonic = () => {
    return bip.generateMnemonic();
}

const generateSeed = (mnemonic: string) => {
    return bip.mnemonicToSeedSync(mnemonic);
}

const generateKeypair = ({ network, seed, mnemonic }: {
    network: Network, seed: Buffer, mnemonic: string
}) => {
    switch (network) {
        case Network.Ethereum:
            return createEthKeypair(mnemonic);
        case Network.Solana:
            return createSolKeypair(seed);
        default:
            throw new Error("Unsupported network");
    }
}

export { generateKeypair, generateMnemonic, generateSeed}