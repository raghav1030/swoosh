import { Button } from '@/components/ui/button'
import { CopyIcon, type CopyIconHandle } from '@/components/ui/copy'
import { useState, useRef, useEffect } from 'react'

const ShowMnemonics = ({ mnemonic, onNext }: { mnemonic: string; onNext: () => void }) => {
    const [copied, setCopied] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    const copyIconRef = useRef<CopyIconHandle>(null)

    const words = mnemonic ? mnemonic.split(' ') : []

    const copyToClipboard = async () => {
        if (mnemonic) {
            await navigator.clipboard.writeText(mnemonic)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    useEffect(() => {
        if (copyIconRef.current) {
            if (isHovered) {
                copyIconRef.current.startAnimation()
            } else {
                copyIconRef.current.stopAnimation()
            }
        }
    }, [isHovered])

    return (
        <div className='w-full flex flex-col items-center justify-center p-8 pt-2 gap-6'>
            <div className='w-full flex flex-col items-center justify-center gap-2 text-center'>
                <h2 className='text-2xl font-semibold text-secondary tracking-wide'>Secret Recovery Phrase</h2>
                <p className='text-secondary/80 text-sm max-w-xs tracking-wide'>
                    Save these words in a safe place. Do not share them with anyone.
                </p>
            </div>

            <div
                className={`grid grid-cols-3 gap-2 w-full p-4 rounded-md relative cursor-pointer transition-all duration-300 border
                    ${isHovered
                        ? 'bg-background/5 border-secondary/20'
                        : 'bg-background/0 border-secondary/10'
                    }
                `}
                onClick={copyToClipboard}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {words.map((word, index) => (
                    <div key={index} className='rounded-xs bg-secondary/10 flex items-center justify-start gap-2 p-2.5 px-4 select-none'>
                        <p className='text-secondary/40 text-md'>{index + 1}</p>
                        <p className='text-secondary text-md'>{word}</p>
                    </div>
                ))}

                <div className='col-span-3 w-full flex items-center justify-center gap-2 mt-2 transition-colors duration-300'>
                    <CopyIcon
                        ref={copyIconRef}
                        size={20}
                        className={isHovered ? 'text-secondary' : 'text-secondary/50'}
                    />
                    <p className={`font-medium ${isHovered ? 'text-secondary' : 'text-secondary/50'}`}>
                        {copied ? 'Copied to clipboard!' : 'Click anywhere to Copy'}
                    </p>
                </div>
            </div>

            <div className='flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md w-full'>
                <div className="min-w-[2px] h-[90%] bg-red-500/50 rounded-full" />
                <p className='text-sm tracking-wider text-red-200/80 leading-relaxed'>
                    Never share your secret or enter it into an app or website.
                    Anyone with your secret will have complete control of your account.
                </p>
            </div>

            <div className="w-full pt-2">
                <Button
                    className="w-full h-12 bg-secondary/95 hover:bg-secondary rounded-sm tracking-wide text-black font-semibold text-lg transition-all"
                    size={'lg'}
                    onClick={() => onNext()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}

export default ShowMnemonics