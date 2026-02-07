import { Key } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import { Network } from '@/lib/constants'
import { isValidPrivateKey } from '@/lib/walletUtils' // Import the validator
import { Textarea } from '../ui/textarea'

interface EnterPrivateKeyProps {
    onNext: (key: string) => void;
    network: Network;
}

const EnterPrivateKey = ({ onNext, network }: EnterPrivateKeyProps) => {
    const [privateKey, setPrivateKey] = useState('')
    const [isValid, setIsValid] = useState(false)
    const [isTouched, setIsTouched] = useState(false)

    useEffect(() => {
        if (!privateKey) {
            setIsValid(false)
            return
        }

        const valid = isValidPrivateKey(network, privateKey.trim());
        setIsValid(valid);
    }, [privateKey, network])

    const handleSubmit = () => {
        if (!isValid) {
            toast.error(`Invalid ${network} Private Key format`)
            return
        }
        onNext(privateKey.trim())
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrivateKey(e.target.value)
        if (!isTouched) setIsTouched(true)
    }

    return (
        <div className='w-full flex flex-1 flex-col items-center  justify-between p-5 gap-12'>
            <div className='flex flex-col items-center gap-4'>
                <div className='flex items-center justify-center rounded-full size-20 bg-secondary/10 border border-white/5'>
                    <Key className='size-11 rounded-full text-secondary' />
                </div>

                <div className='flex flex-col items-center justify-center gap-2 text-center '>
                    <h3 className='text-2xl tracking-wider font-semibold text-secondary'>
                        Enter {network} Private Key
                    </h3>
                    <p className='font-medium tracking-wide text-secondary/70 text-sm max-w-xs'>
                        Paste your private key string below to import your wallet.
                    </p>
                </div>
            </div>

            <div className="w-full flex flex-col items-center justify-center gap-4">
                <div className="w-[90%] flex flex-col items-center justify-center gap-2">
                    <textarea
                        value={privateKey}
                        onChange={handleChange}
                        className={`w-full h-24 max-h-24 overflow-y-auto bg-background/5 border rounded-sm p-4 text-sm text-secondary placeholder:text-secondary/20 focus:outline-none transition-colors resize-none
                                    ${isTouched && !isValid && privateKey
                                ? 'border-red-500/50 focus:border-red-500'
                                : 'border-white/10 focus:border-secondary/50'
                            }
                        `}
                    />

                    {isTouched && !isValid && privateKey && (
                        <p className="text-xs font-semibold tracking-wide text-red-400 self-start">
                            The private key format is not valid for this network
                        </p>
                    )}
                </div>



            </div>
            <Button
                className={`w-full h-13 bg-secondary/70 hover:bg-secondary/80 rounded-sm tracking-wide text-black font-semibold text-md transition-opacity`}
                size={'lg'}
                onClick={handleSubmit}
                disabled={!isValid}
            >
                Import Wallet
            </Button>
        </div>
    )
}

export default EnterPrivateKey