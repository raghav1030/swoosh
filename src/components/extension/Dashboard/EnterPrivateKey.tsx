import { Button } from "@/components/ui/button";
import { Network } from "@/lib/constants";
import { isValidPrivateKey } from "@/lib/walletUtils";
import { Key } from "lucide-react";
import React, { useState, useRef, useEffect } from 'react'

const EnterPrivateKey = ({ onNext, network }: { onNext: (key: string) => void; network: string }) => {
    const [privateKey, setPrivateKey] = useState('')
    const [isValid, setIsValid] = useState(false)
    const [isTouched, setIsTouched] = useState(false)

    useEffect(() => {
        if (!privateKey) {
            setIsValid(false)
            return
        }
        const valid = isValidPrivateKey(network as Network, privateKey.trim());
        setIsValid(valid);
    }, [privateKey, network])

    const handleSubmit = () => {
        if (!isValid) return
        onNext(privateKey.trim())
    }

    return (
        <div className='w-full flex flex-1 flex-col items-center justify-between p-5 pb-8 h-full'>
            <div className='w-full flex flex-col items-center gap-6'>
                <div className='flex flex-col items-center gap-4'>
                    <div className='flex items-center justify-center rounded-full h-16 w-16 bg-secondary/10 border border-secondary/5'>
                        <Key className='h-8 w-8 text-secondary' />
                    </div>
                    <div className='flex flex-col items-center text-center gap-1'>
                        <h3 className='text-xl tracking-wider font-semibold text-secondary'>
                            Enter Private Key
                        </h3>
                        <p className='font-medium text-secondary/50 text-sm max-w-xs'>
                            Paste your {network} private key string below.
                        </p>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-2">
                    <textarea
                        value={privateKey}
                        onChange={(e) => {
                            setPrivateKey(e.target.value)
                            if (!isTouched) setIsTouched(true)
                        }}
                        placeholder="Paste private key here..."
                        className={`w-full h-24 bg-secondary/5 border rounded-md p-4 text-sm text-secondary placeholder:text-secondary/30 focus:outline-none transition-colors resize-none custom-scrollbar
                            ${isTouched && !isValid && privateKey ? 'border-red-500/50 focus:border-red-500' : 'border-secondary/10 focus:border-secondary/50'}`}
                    />
                    {isTouched && !isValid && privateKey && (
                        <p className="text-xs font-semibold tracking-wide text-red-400">
                            Invalid private key format.
                        </p>
                    )}
                </div>
            </div>

            <div className="w-full mt-auto pt-6">
                <Button
                    className="w-full h-12 bg-secondary/95 hover:bg-secondary rounded-sm text-black font-semibold text-lg"
                    onClick={handleSubmit}
                    disabled={!isValid}
                >
                    Import Wallet
                </Button>
            </div>
        </div>
    )
}

export default EnterPrivateKey;