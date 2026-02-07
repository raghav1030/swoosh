import { networkIconRegistry, ImportWalletOptions as ImportWalletOptionsEnum } from '@/lib/constants'
import type { Network } from '@/lib/constants'
import { ChevronRight, KeyRound, ListOrdered } from 'lucide-react'

const optionDetails = {
    [ImportWalletOptionsEnum.RecoveryPhrase]: {
        label: "Secret Recovery Phrase",
        icon: ListOrdered
    },
    [ImportWalletOptionsEnum.PrivateKey]: {
        label: "Private Key",
        icon: KeyRound
    }
}


const ImportWalletOptions = ({
    setImportWalletOption,
    selectedNetwork,
    onNext
}: {

    setImportWalletOption: (option: ImportWalletOptionsEnum) => void;
    selectedNetwork: Network;
    onNext: () => void
}) => {

    const handleOptionClick = (option: ImportWalletOptionsEnum) => {
        setImportWalletOption(option)
        onNext()
    }
    return (
        <div className='w-full flex flex-1 flex-col items-center  justify-start p-5 gap-12'>
            <div className='flex flex-col items-center gap-4'>
                <div className='flex items-center justify-center rounded-full size-20 bg-secondary/10 border border-white/5'>
                    <img
                        src={networkIconRegistry[selectedNetwork]}
                        alt={selectedNetwork}
                        className='rounded-full size-12 object-cover'
                    />
                </div>

                <div className='flex flex-col items-center justify-center gap-4 text-center '>
                    <h3 className='text-2xl tracking-wide font-semibold text-secondary'>
                        Import {selectedNetwork} wallet
                    </h3>
                    <p className='font-medium tracking-wide text-secondary/70 text-sm'>
                        Choose a method
                    </p>
                </div>
            </div>

            <div className='w-full grid grid-cols-1 gap-3 '>
                {Object.values(ImportWalletOptionsEnum).map((option) => {
                    const details = optionDetails[option]
                    const Icon = details.icon
                    return (
                        <div
                            key={option}
                            onClick={() => handleOptionClick(option)}
                            className='group flex items-center justify-between gap-4 p-2 rounded-xl border border-white/10 bg-white/5 
                                     cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]'
                        >
                            <div className='flex items-center justify-start gap-3'>

                                <div className='flex items-center justify-center size-10 rounded-full bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-black transition-colors duration-300'>
                                    <Icon size={20} />
                                </div>

                                <div className='flex flex-col items-start'>
                                    <span className='text-lg font-semibold text-secondary'>
                                        {details?.label}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className='text-secondary/90 group-hover:text-secondary  transition-colors duration-300' />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ImportWalletOptions