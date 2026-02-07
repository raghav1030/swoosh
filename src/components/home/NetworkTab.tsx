import { networkIconRegistry } from '@/lib/constants'

const NetworkTab = ({ network, toggleNetwork, isSelected }: { network: string, toggleNetwork: (network: string) => void, isSelected: boolean }) => {
    return (
    <div className={`flex items-center justify-start gap-3 cursor-pointer hover:bg-background/15 bg-background/10 px-2 py-2 rounded-sm ${isSelected ? 'bg-secondary/20 ring ring-secondary/40' : ''}`} onClick={() => toggleNetwork(network)}>
            <img src={networkIconRegistry[network]} alt={network} className="w-8 h-8" />
            <p className=" text-secondary/90 tracking-wide">{network}</p>
        </div>)
}

export default NetworkTab