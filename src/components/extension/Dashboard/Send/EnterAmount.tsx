import React, { useEffect, useRef, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { networkIconRegistry, Network } from "@/lib/constants"
import { Token } from "../../Dashboard"

interface EnterAmountStepProps {
    token: Token
    amount: string
    setAmount: (amt: string) => void
    onChangeToken: () => void
    onSend: () => void
    address: string
    onEditAddress: () => void
}

export const EnterAmountStep = ({
    token,
    amount,
    setAmount,
    onChangeToken,
    onSend,
    address,
    onEditAddress,
}: EnterAmountStepProps) => {
    const IconComponent =
        networkIconRegistry[token.symbol as Network] ||
        (networkIconRegistry[token.name as Network] as any)

    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const [fontSize, setFontSize] = useState(64)

    const numericBalance = useMemo(
        () => parseFloat(token.balance.replace(/,/g, "")) || 0,
        [token.balance]
    )

    const numericAmount = useMemo(
        () => parseFloat(amount) || 0,
        [amount]
    )

    const isInsufficient = numericAmount > numericBalance
    const isValid = numericAmount > 0 && !isInsufficient

    const handleChange = (value: string) => {
        const sanitized = value
            .replace(/[^0-9.]/g, "")
            .replace(/(\..*)\./g, "$1")

        const parts = sanitized.split(".")
        if (parts[1]?.length > 6) return

        setAmount(sanitized)
    }

    const handleMax = () => {
        setAmount(numericBalance.toString())
    }

    const truncateAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`

    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus()
            }
        }, 350)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        const container = containerRef.current
        const input = inputRef.current
        if (!container || !input) return

        requestAnimationFrame(() => {
            const baseSize = 64
            input.style.fontSize = `${baseSize}px`

            const ratio = container.offsetWidth / (input.scrollWidth || 1)
            const newSize = Math.max(28, Math.min(baseSize, baseSize * ratio))

            setFontSize(newSize)
        })
    }, [amount])

    return (
        <div className="flex flex-col w-full h-full px-6 pt-2">
            <div className="flex flex-col items-center justify-center flex-1 gap-8">
                <Button
                    variant="ghost"
                    onClick={onEditAddress}
                    className="flex items-center gap-2 h-auto px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 transition-all rounded-full"
                >
                    <span className="text-xs text-white/40 font-medium">To:</span>
                    <span className="text-xs text-secondary font-mono tracking-tight">
                        {truncateAddress(address)}
                    </span>
                </Button>

                <div className="flex flex-col items-center justify-center w-full gap-3">
                    <div
                        ref={containerRef}
                        className="flex items-center justify-center w-full max-w-[280px] overflow-hidden gap-1"
                    >
                        <Input
                            ref={inputRef}
                            type="text"
                            inputMode="decimal"
                            value={amount}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder="0"
                            style={{
                                fontSize: `${fontSize}px`,
                                transition: "font-size 0.1s ease-out",
                                width: amount.length > 0 ? `${amount.length + 0.5}ch` : "1.5ch",
                            }}
                            className="h-auto min-w-[20px] max-w-full border-none bg-transparent p-0 text-center font-bold text-white leading-none placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <span className="text-white/50 text-sm font-medium">
                            Available: {token.balance} {token.symbol}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 w-full shrink-0">
                    <Button
                        variant="ghost"
                        onClick={onChangeToken}
                        className="flex items-center gap-2 hover:text-secondary bg-white/5 hover:bg-white/10 border border-white/10 rounded-full h-auto px-4 py-2"
                    >
                        <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                            {IconComponent ? (
                                typeof IconComponent === "string" ? (
                                    <img src={IconComponent} alt={token.symbol} className="h-full w-full object-cover" />
                                ) : (
                                    <IconComponent className="h-3.5 w-3.5" />
                                )
                            ) : (
                                <img src={token.iconUrl} alt={token.symbol} className="h-full w-full object-cover" />
                            )}
                        </div>
                        <span className="font-semibold text-sm">{token.symbol}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={handleMax}
                        className="h-auto px-4 py-2 bg-secondary/10 hover:bg-secondary/20 hover:text-secondary text-secondary border border-secondary/20 font-bold text-sm transition-colors rounded-full"
                    >
                        MAX
                    </Button>
                </div>
            </div>

            <div className="py-6 shrink-0">
                <Button
                    disabled={!isValid}
                    onClick={onSend}
                    className={`w-full h-12 text-lg font-semibold rounded-sm transition-all duration-200 ${isInsufficient ? "bg-red-600 hover:bg-red-700 text-white" : isValid ? "bg-white text-black hover:bg-white/90" : "bg-white/20 text-white/40"}`}
                >
                    {isInsufficient ? "Insufficient Balance" : "Review & Send"}
                </Button>
            </div>
        </div>
    )
}