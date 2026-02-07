import SolanaIcon from '../assets/logo-circle-solana@4x.png'
import EthereumIcon from '../assets/logo-circle-ethereum@4x.png'

export enum Network {
  Ethereum = 'Ethereum',
  Bitcoin = 'Bitcoin',
  Solana = 'Solana',
}

export enum ImportWalletOptions {
  RecoveryPhrase = 'RecoveryPhrase',
  PrivateKey = 'PrivateKey' 
}

const networkIconRegistry: { [key: string]: string } = {
  'Solana': SolanaIcon,
  'Ethereum': EthereumIcon,
};

const availableNetworks = []

export { networkIconRegistry };