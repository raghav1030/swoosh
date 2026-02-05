import { Network } from "@/lib/constants"
import { Button } from "../ui/button"
import NetworkTab from "./NetworkTab"

const SelectNetwork = ({ selectedNetworks, setSelectedNetworks, onNext }: { selectedNetworks: Network[], setSelectedNetworks: (networks: Network[]) => void, onNext: () => void }) => {

    const toggleNetwork = (network: Network) => {
        if (selectedNetworks.includes(network)) {
            setSelectedNetworks(selectedNetworks.filter((n) => n !== network))
        } else {
            setSelectedNetworks([...selectedNetworks, network])
        }
    }

    return (
        <div className='w-full flex flex-col items-center justify-center p-5 gap-8'>
            <div className=' w-full flex flex-col items-center justify-center gap-4'>

                <h2 className='text-2xl font-semibold text-secondary text-center'>Select one or more networks</h2>
                <p className='text-secondary/80 tracking-wide text-center '>You can always change this later.</p>
            </div>

            <div className='grid grid-cols-2 w-full gap-2 '>
                <NetworkTab network={Network.Solana} toggleNetwork={() => toggleNetwork(Network.Solana)} isSelected={selectedNetworks.includes(Network.Solana)} />
                <NetworkTab network={Network.Ethereum} toggleNetwork={() => toggleNetwork(Network.Ethereum)} isSelected={selectedNetworks.includes(Network.Ethereum)} />
            </div>

            <div className="w-full text-center">
                <p className="text-secondary/60 text-lg tracking-wide">
                    More networks coming soon!
                </p>
            </div>

            <div className="w-full">
                <Button
                    disabled={selectedNetworks.length === 0}
                    className={`w-full h-13 bg-secondary/80 hover:bg-secondary/90 ${selectedNetworks.length > 0 ? 'opacity-100' : 'opacity-80'} rounded-sm tracking-wide text-black font-semibold text-lg`}
                    size={'lg'}
                    onClick={onNext}
                >
                    {selectedNetworks.length === 1 ? "Set up wallet" : selectedNetworks.length > 1 ? "Set up wallets" : "Select Networks"}
                </Button>
            </div>
        </div>
    )
}

export default SelectNetwork