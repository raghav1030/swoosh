import { networkIconRegistry } from "@/lib/constants";
import { Plus, ChevronRight, ListOrdered, KeyRound } from "lucide-react";

const AccountOptions = ({ selectedNetwork, onNext, onCreateNew }: {
    selectedNetwork: string;
    onNext: (step: 'mnemonic' | 'private_key') => void;
    onCreateNew: () => void;
}) => {
    return (
        <div className='w-full flex flex-1 flex-col items-center justify-start p-5 gap-8'>
            <div className='flex flex-col items-center gap-3'>
                <div className='flex items-center justify-center rounded-full h-14 w-14 bg-secondary/10 border border-secondary/5'>
                    {typeof networkIconRegistry[selectedNetwork] === 'string' ? (
                        <img src={networkIconRegistry[selectedNetwork] as string} alt={selectedNetwork} className='rounded-full h-8 w-8 object-cover' />
                    ) : (
                        <div className="h-8 w-8 bg-secondary/10 rounded-full" />
                    )}
                </div>
                <div className='flex flex-col items-center justify-center gap-1 text-center'>
                    <h3 className='text-lg tracking-wide font-semibold text-secondary'>
                        Add {selectedNetwork} Account
                    </h3>
                </div>
            </div>

            <div className='w-full flex flex-col gap-6'>
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-secondary/50 uppercase tracking-wider px-1">
                        Create
                    </span>
                    <div
                        onClick={onCreateNew}
                        className='group flex items-center justify-between gap-4 p-3 rounded-xl border border-secondary/10 bg-secondary/5 cursor-pointer transition-all duration-300 hover:bg-secondary/10 hover:border-secondary/20'
                    >
                        <div className='flex items-center justify-start gap-3'>
                            <div className='flex items-center justify-center h-10 w-10 rounded-full bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-black transition-colors duration-300'>
                                <Plus size={20} />
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-sm font-semibold text-secondary'>
                                    Create New Account
                                </span>
                                <span className='text-xs text-secondary/50'>
                                    Derive from existing phrase
                                </span>
                            </div>
                        </div>
                        <ChevronRight className='text-secondary/30 group-hover:text-secondary/70 transition-colors duration-300' />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-secondary/50 uppercase tracking-wider px-1">
                        Import Existing
                    </span>

                    <div
                        onClick={() => onNext('mnemonic')}
                        className='group flex items-center justify-between gap-4 p-3 rounded-xl border border-secondary/10 bg-secondary/5 cursor-pointer transition-all duration-300 hover:bg-secondary/10 hover:border-secondary/20'
                    >
                        <div className='flex items-center justify-start gap-3'>
                            <div className='flex items-center justify-center h-10 w-10 rounded-full bg-secondary/10 text-secondary group-hover:bg-secondary/20 transition-colors duration-300'>
                                <ListOrdered size={20} />
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-sm font-semibold text-secondary'>
                                    Import Recovery Phrase
                                </span>
                            </div>
                        </div>
                        <ChevronRight className='text-secondary/30 group-hover:text-secondary/70 transition-colors duration-300' />
                    </div>

                    <div
                        onClick={() => onNext('private_key')}
                        className='group flex items-center justify-between gap-4 p-3 rounded-xl border border-secondary/10 bg-secondary/5 cursor-pointer transition-all duration-300 hover:bg-secondary/10 hover:border-secondary/20'
                    >
                        <div className='flex items-center justify-start gap-3'>
                            <div className='flex items-center justify-center h-10 w-10 rounded-full bg-secondary/10 text-secondary group-hover:bg-secondary/20 transition-colors duration-300'>
                                <KeyRound size={20} />
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-sm font-semibold text-secondary'>
                                    Import Private Key
                                </span>
                            </div>
                        </div>
                        <ChevronRight className='text-secondary/30 group-hover:text-secondary/70 transition-colors duration-300' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AccountOptions