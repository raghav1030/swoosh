import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Copy } from 'lucide-react'

interface ShowSeedPhraseProps {
    mnemonic: string | null;
    onDone: () => void;
}

export const ShowSeedPhrase = ({ mnemonic, onDone }: ShowSeedPhraseProps) => {
    const [copied, setCopied] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [isChecked, setIsChecked] = useState(false)

    const words = mnemonic ? mnemonic.split(' ') : []

    const copyToClipboard = async () => {
        if (!mnemonic) return;
        await navigator.clipboard.writeText(mnemonic)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex flex-col items-center justify-start w-full px-6 pt-2 pb-8 gap-6">
            <div
                className={`grid grid-cols-3 gap-2 w-full p-4 rounded-md relative cursor-pointer transition-all duration-300 border ${isHovered ? 'bg-background/5 border-secondary/20' : 'bg-background/0 border-secondary/10'}`}
                onClick={copyToClipboard}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {words.map((word, index) => (
                    <div key={index} className="rounded-xs bg-secondary/10 flex items-center justify-start gap-2 p-2.5 px-3 select-none">
                        <p className="text-secondary/40 text-sm">{index + 1}</p>
                        <p className="text-secondary text-sm font-medium">{word}</p>
                    </div>
                ))}
                <div className="col-span-3 w-full flex items-center justify-center gap-2 mt-2 transition-colors duration-300">
                    <Copy size={16} className={isHovered ? 'text-secondary' : 'text-secondary/50'} />
                    <p className={`font-medium text-sm ${isHovered ? 'text-secondary' : 'text-secondary/50'}`}>
                        {copied ? 'Copied to clipboard!' : 'Click anywhere to Copy'}
                    </p>
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-md w-full">
                <Checkbox
                    id="security-check"
                    checked={isChecked}
                    onCheckedChange={(checked) => setIsChecked(!!checked)}
                    className="mt-1 border-white/50 data-[state=checked]:bg-secondary data-[state=checked]:text-black"
                />
                <label htmlFor="security-check" className="text-sm text-white/70 leading-relaxed cursor-pointer select-none">
                    I understand that these are confidential and anyone with this phrase can access my funds.
                </label>
            </div>

            <div className="w-full mt-2">
                <Button
                    disabled={!isChecked}
                    onClick={onDone}
                    className={`w-full h-12 bg-secondary/95 hover:bg-secondary rounded-sm tracking-wide text-black font-semibold text-lg transition-all ${!isChecked && 'opacity-50 cursor-not-allowed'}`}
                >
                    Done
                </Button>
            </div>
        </div>
    )
}