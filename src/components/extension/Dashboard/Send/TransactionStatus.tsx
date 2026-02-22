import React from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StatusStepProps {
    status: 'loading' | 'success' | 'failed';
    onClose: () => void;
}

export const StatusStep = ({ status, onClose }: StatusStepProps) => (
    <div className="flex flex-col items-center justify-center w-full h-full px-6 pb-6">
        <div className="flex flex-col items-center justify-center flex-1 gap-6">
            {status === 'loading' && (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-secondary" size={64} />
                    <h2 className="text-2xl font-semibold text-white uppercase tracking-tighter">Sending...</h2>
                    <p className="text-white/50 text-center px-4">Please wait while the transaction is confirmed on the network.</p>
                </div>
            )}
            {status === 'success' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-semibold text-white uppercase tracking-tighter">Sent!</h2>
                    <p className="text-white/50 text-center">Your funds are on the way.</p>
                </div>
            )}
            {status === 'failed' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                        <XCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-semibold text-white uppercase tracking-tighter">Failed</h2>
                    <p className="text-white/50 text-center">Something went wrong. Please try again later.</p>
                </div>
            )}
        </div>
        {status !== 'loading' && (
            <Button onClick={onClose} className="w-full h-12 bg-white/10 hover:bg-white/20 text-white font-semibold text-lg rounded-sm">
                Done
            </Button>
        )}
    </div>
);