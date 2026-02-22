import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Clipboard } from 'lucide-react'

interface ShowPrimaryKeyProps {
    privateKey: string;
    onDone: () => void;
}

export const ShowPrimaryKey = ({ privateKey, onDone }: ShowPrimaryKeyProps) => {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = async () => {
        if (!privateKey) return;
        await navigator.clipboard.writeText(privateKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex flex-col w-full p-6 pt-2 gap-6 pb-8">
            <div className="flex flex-col gap-2 text-center">
                <p className="text-sm text-white/80">Never share this with anyone.</p>
            </div>
            <div onClick={copyToClipboard} className="w-full p-4 rounded-md border border-secondary/20 bg-secondary/5 cursor-pointer hover:bg-secondary/10 transition-colors break-all">
                <p className="text-secondary text-sm font-mono text-center">
                    {privateKey}
                </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md w-full">
                <div className="min-w-[2px] h-full bg-red-500/50 rounded-full" />
                <p className="text-xs tracking-wider text-red-200/80 leading-relaxed">
                    Never share your private key or enter it into an app or website. Anyone with your key will have complete control of this account.
                </p>
            </div>

            <div className="w-full mt-2 flex flex-col gap-3">
                <Button variant="outline" onClick={copyToClipboard} className="w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-sm">
                    <Clipboard size={16} className="mr-2" />
                    {copied ? "Copied!" : "Copy to Clipboard"}
                </Button>
                <Button onClick={onDone} className="w-full h-12 bg-secondary/95 hover:bg-secondary rounded-sm tracking-wide text-black font-semibold text-lg transition-all">
                    Done
                </Button>
            </div>
        </div>
    )
}