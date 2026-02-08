import { Network } from "@/lib/constants"
import { Button } from "../ui/button"
import NetworkTab from "./NetworkTab"

interface SelectNetworkProps {
    isNewWallet: boolean;
    selectedNetworks: Network[];
    setSelectedNetworks: (networks: Network[]) => void;
    onNext: () => void;
}

const SelectNetwork = ({ isNewWallet, selectedNetworks, setSelectedNetworks, onNext }: SelectNetworkProps) => {

    const toggleNetwork = (network: Network) => {
        if (isNewWallet) {
            if (selectedNetworks.includes(network)) {
                setSelectedNetworks(selectedNetworks.filter((n) => n !== network))
            } else {
                setSelectedNetworks([...selectedNetworks, network])
            }
        } else {
            setSelectedNetworks([network])
            onNext();
        }
    }

    return (
        <div className='w-full flex flex-1 flex-col items-center  justify-between p-5 gap-8'>
            <div className=' w-full flex flex-col items-center justify-center gap-4'>
                <h2 className='text-2xl font-semibold text-secondary text-center'>
                    {isNewWallet ? "Select one or more networks" : "Select a network"}
                </h2>
                <p className='text-secondary/80 tracking-wide text-center '>
                    {isNewWallet ? "You can always change this later." : "Choose the network you want to import."}
                </p>
            </div>
            <div className=" w-[90%] flex flex-col items-center justify-center gap-4">

                <div className='grid grid-cols-1 w-full gap-2 '>
                    <NetworkTab
                        network={Network.Solana}
                        toggleNetwork={() => toggleNetwork(Network.Solana)}
                        isSelected={selectedNetworks.includes(Network.Solana)}
                    />
                    <NetworkTab
                        network={Network.Ethereum}
                        toggleNetwork={() => toggleNetwork(Network.Ethereum)}
                        isSelected={selectedNetworks.includes(Network.Ethereum)}
                    />
                </div>
                <div className="w-full text-center">
                    <p className="text-secondary/60 text-lg tracking-wide">
                        More networks coming soon!
                    </p>
                </div>
            </div>


            {<div className="w-full">
                <Button
                    disabled={selectedNetworks.length === 0}
                    className={`w-full h-12 bg-secondary/95 hover:bg-secondary ${selectedNetworks.length > 0 ? 'opacity-100' : 'opacity-80'} rounded-sm tracking-wide text-black font-semibold text-lg`}
                    size={'lg'}
                    onClick={onNext}
                >
                    {!isNewWallet
                        ? "Import Wallet"
                        : selectedNetworks.length > 1
                            ? "Set up wallets"
                            : "Set up wallet"
                    }
                </Button>
            </div>}
        </div>
    )
}

export default SelectNetwork