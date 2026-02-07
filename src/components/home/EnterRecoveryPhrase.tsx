import React, { useRef, useState } from 'react'
import { Button } from '../ui/button'
import { Clipboard, Trash2 } from 'lucide-react'
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
            console.error("Clipboard API failed:", err)
            toast.error("Clipboard access denied", {
                description: "Please paste manually into the first box.",

            })
        }
    }

    const handleClear = () => {
        setWords(new Array(12).fill(''))
        inputRefs.current[0]?.focus()
    }

    const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData('text')
        if (processPaste(text)) {
            e.preventDefault()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && words[index] === '' && index > 0) {
            e.preventDefault()
            inputRefs.current[index - 1]?.focus()
        }

        if (e.key === 'Enter' && index === 11 && isValid) {
            onNext(words.join(' '))
        }
    }

    const handleChange = (index: number, value: string) => {
        const newWords = [...words]
        newWords[index] = value.trim()
        setWords(newWords)
    }

    return (
        <div className='w-full flex flex-1 flex-col items-center  justify-between p-5 gap-12'>
            <div className='w-full flex flex-col items-center justify-center gap-2 text-center'>
                <h2 className='text-2xl font-semibold text-secondary tracking-wide'>Secret Recovery Phrase</h2>
                <p className='text-secondary/80 text-sm max-w-xs tracking-wide'>
                    Enter or paste your phrase
                </p>
            </div>

            <div className='w-full flex flex-col gap-4'>
                <div className='w-full flex gap-3'>
                    <Button
                        className="flex-1 h-11 bg-primary/80 hover:bg-primary rounded-sm tracking-wide text-secondary font-bold text-lg transition-all"
                        size={'lg'}
                        onClick={handlePasteButton}
                    >
                        <Clipboard size={15} className="mr-2" /> Paste Phrase
                    </Button>

                    {words.length > 0 && words.some((w) => w !== "") && <Button
                        className="h-11 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-sm text-red-400 hover:text-red-300 transition-all"
                        size={'lg'}
                        onClick={handleClear}
                        title="Clear all fields"
                    >
                        <Trash2 size={18} />
                    </Button>}
                </div>

                <div className='grid grid-cols-3 gap-3 w-full'>
                    {words.map((word, index) => (
                        <div key={index} className="relative flex items-center group">
                            <span className="absolute left-2 text-xs text-secondary/40 font-mono select-none group-focus-within:text-secondary/70 transition-colors">
                                {index + 1}.
                            </span>
                            <input
                                // @ts-ignore
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                value={word}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onPaste={handleInputPaste}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-full h-10 bg-background/10 border border-white/10 rounded-sm pl-7 pr-2 text-sm text-secondary placeholder:text-secondary/20 focus:outline-none focus:border-secondary/50 focus:bg-background/20 transition-all"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full pt-2">
                <Button
                    className={`w-full h-13 bg-secondary/70 hover:bg-secondary/80 rounded-sm tracking-wide text-black font-semibold text-md transition-opacity`}
                    size={'lg'}
                    onClick={() => {
                        if (isValid) onNext(words.join(' '))
                    }}
                    disabled={!isValid}
                >
                    Import Wallet
                </Button>
            </div>
        </div>
    )
}

export default EnterRecoveryPhrase