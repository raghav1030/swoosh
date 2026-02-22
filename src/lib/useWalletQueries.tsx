import { useQuery } from '@tanstack/react-query'
import { Network } from '@/lib/constants'
import { getNetworkBalance } from '@/lib/walletUtils'

export const useTokenPrices = () => {
    return useQuery({
        queryKey: ['tokenPrices'],
        queryFn: async () => {
            const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,ethereum&vs_currencies=usd&include_24hr_change=true')
            if (!res.ok) throw new Error('Failed to fetch prices')
            return res.json()
        },
        staleTime: 1000 * 60 * 5,
    })
}

export const useWalletBalance = (network: Network, publicKey: string) => {
    return useQuery({
        queryKey: ['balance', network, publicKey],
        queryFn: () => getNetworkBalance(network, publicKey),
        enabled: !!publicKey && !!network,
        staleTime: 1000 * 30,
    })
}