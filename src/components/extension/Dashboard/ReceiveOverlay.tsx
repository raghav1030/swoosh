import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Copy, Check, Info } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Wallet } from '@/store/useWalletStore'

interface ReceiveOverlayProps {
    isOpen: boolean;
    close: () => void;
    wallet: Wallet;
}

const ReceiveOverlay = ({ isOpen, close, wallet }: ReceiveOverlayProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!wallet?.publicKey) return;
        navigator.clipboard.writeText(wallet.publicKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!wallet) return null;

    return (
        <div className={`absolute inset-0 w-full h-full z-[100] flex flex-col justify-end transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            
            <div
                className="flex-1 w-full cursor-pointer bg-taupe-950/40 backdrop-blur-sm transition-opacity duration-500"
                style={{ opacity: isOpen ? 1 : 0 }}
                onClick={close}
            />

            
            <div className="w-full bg-taupe-950/95 backdrop-blur-xl border-t border-secondary/10 rounded-t-3xl flex flex-col items-center shadow-2xl relative pb-8">
                <div className="w-full flex flex-col items-center justify-center h-8 shrink-0">
                </div>

                <button onClick={close} className="absolute top-5 right-5 text-secondary/50 hover:text-secondary transition-colors bg-secondary/5 rounded-full p-1.5 z-10">
                    <X size={18} />
                </button>

                <div className="flex flex-col items-center w-full px-6 pt-2">
                    <h2 className="text-xl tracking-wide font-semibold text-secondary mb-6">Receive Assets</h2>

                    
                    <div className="bg-secondary p-4 rounded-2xl mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        <QRCodeSVG value={wallet.publicKey} size={200} level="Q" />
                    </div>

                    
                    <div className="bg-secondary/5 border border-secondary/10 rounded-xl p-4 w-full flex flex-col items-center gap-4 mb-6">
                        <span className="text-secondary/70 text-sm font-mono text-center break-all leading-relaxed px-2">
                            {wallet.publicKey}
                        </span>
                        <Button
                            variant="secondary"
                            className="w-full rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary border-none h-11 tracking-wide"
                            onClick={handleCopy}
                        >
                            {copied ? <Check size={16} className="mr-2 text-green-400" /> : <Copy size={16} className="mr-2" />}
                            {copied ? "Copied!" : "Copy Address"}
                        </Button>
                    </div>

                    
                    <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 w-full">
                        <Info size={20} className="text-yellow-500 shrink-0 mt-0.5" />
                        <p className="text-yellow-500/90 text-xs leading-relaxed">
                            This address can only receive assets on the <strong className="font-bold">{wallet.network}</strong> network. Sending other assets may result in permanent loss.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ReceiveOverlay;