import { Connection, PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";
import { Network } from "./constants";

const SOLANA_DEVNET_URL = "https://api.devnet.solana.com";
const ETH_SEPOLIA_URL = "https://ethereum-sepolia-rpc.publicnode.com";

export interface AccountActivity {
    network: Network;
    exists: boolean;
    balance: number;
}

const checkSolanaActivity = async (publicKey: string): Promise<AccountActivity> => {
    try {
        try {
            new PublicKey(publicKey);
        } catch (e) {
            return { network: Network.Solana, exists: false, balance: 0 };
        }

        const pubKey = new PublicKey(publicKey);
        const connection = new Connection(SOLANA_DEVNET_URL, "confirmed");

        const balanceLamports = await connection.getBalance(pubKey);
        const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 1 });
        const exists = balanceLamports > 0 || signatures.length > 0;

        return {
            network: Network.Solana,
            exists,
            balance: balanceLamports / 1_000_000_000,
        };
    } catch (error) {
        console.error("Error checking Solana activity:", error);
        return { network: Network.Solana, exists: false, balance: 0 };
    }
};

const checkEthereumActivity = async (publicKey: string): Promise<AccountActivity> => {
    try {
        if (!ethers.isAddress(publicKey)) {
            return { network: Network.Ethereum, exists: false, balance: 0 };
        }

        const provider = new ethers.JsonRpcProvider(ETH_SEPOLIA_URL);

        const [balanceWei, txCount] = await Promise.all([
            provider.getBalance(publicKey),
            provider.getTransactionCount(publicKey)
        ]);

        const exists = balanceWei > 0n || txCount > 0;

        return {
            network: Network.Ethereum,
            exists,
            balance: parseFloat(ethers.formatEther(balanceWei)),
        };
    } catch (error) {
        console.error("Error checking Ethereum activity:", error);
        return { network: Network.Ethereum, exists: false, balance: 0 };
    }
};

export const scanForAccounts = async (publicKey: string, networks: Network[] = [Network.Solana, Network.Ethereum]) => {
    const promises = networks.map(network => {
        if (network === Network.Solana) return checkSolanaActivity(publicKey);
        if (network === Network.Ethereum) return checkEthereumActivity(publicKey);
        return Promise.resolve(null);
    });

    const results = await Promise.all(promises);
    return results.filter((r): r is AccountActivity => r !== null);
};



// until sing salad salute miss will dentist huge dream kit drip call