import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import React, { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'

const EnterRecoveryPhrase = ({ onNext }: { onNext: (phrase: string) => void }) => {
    const [words, setWords] = useState<string[]>(new Array(12).fill(''))
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const isValid = words.every(word => word.trim().length > 0)

    const processPaste = (text: string) => {
        const pastedWords = text.trim().split(/\s+/).filter(w => w).slice(0, 12)
        if (pastedWords.length === 0) return false;

        const newWords = [...words]
        pastedWords.forEach((word, index) => {
            newWords[index] = word
        })
        setWords(newWords)
        return true;
    }

    const handlePasteButton = async () => {
        try {
            const text = await navigator.clipboard.readText()
            if (text) processPaste(text)
        } catch (err) {
            toast.error("Clipboard access denied. Please paste manually.")
        }
    }

    const handleChange = (index: number, value: string) => {
        const newWords = [...words]
        newWords[index] = value.trim()
        setWords(newWords)
    }

    return (
        <div className='w-full flex flex-1 flex-col items-center justify-between p-5 pb-8 h-full'>
            <div className='w-full flex flex-col items-center gap-6'>
                <div className='flex flex-col items-center text-center gap-1'>
                    <h2 className='text-xl font-semibold text-secondary'>Recovery Phrase</h2>
                    <p className='text-secondary/50 text-sm'>Enter your 12-word phrase</p>
                </div>

                <div className='w-full flex gap-2'>
                    <Button className="flex-1 h-10 bg-secondary/10 hover:bg-secondary/20 text-secondary" onClick={handlePasteButton}>
                        <Clipboard size={14} className="mr-2" /> Paste
                    </Button>
                    <Button className="h-10 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400" onClick={() => setWords(new Array(12).fill(''))}>
                        <Trash2 size={16} />
                    </Button>
                </div>

                <div className='grid grid-cols-3 gap-2 w-full'>
                    {words.map((word, index) => (
                        <div key={index} className="relative flex items-center group">
                            <span className="absolute left-2 text-[10px] text-secondary/30 font-mono">
                                {index + 1}.
                            </span>
                            <input
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                value={word}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onPaste={(e) => {
                                    if (processPaste(e.clipboardData.getData('text'))) e.preventDefault()
                                }}
                                className="w-full h-9 bg-secondary/5 border border-secondary/10 rounded-sm pl-6 pr-1 text-xs text-secondary placeholder:text-secondary/20 focus:outline-none focus:border-secondary/50 transition-all"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full mt-auto pt-6">
                <Button
                    className="w-full h-12 bg-secondary/95 hover:bg-secondary rounded-sm text-black font-semibold text-lg"
                    onClick={() => { if (isValid) onNext(words.join(' ')) }}
                    disabled={!isValid}
                >
                    Import Wallet
                </Button>
            </div>
        </div>
    )
}

export default EnterRecoveryPhrase
