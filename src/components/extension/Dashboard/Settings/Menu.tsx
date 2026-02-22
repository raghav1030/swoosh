import React from 'react'
import { Button } from '@/components/ui/button'
import { Shield, User, KeyRound } from 'lucide-react'

interface MenuProps {
    onNavigate: (step: 'profile' | 'password_prompt') => void;
    onSetTargetReveal: (target: 'reveal_seed' | 'reveal_pk') => void;
}

export const Menu = ({ onNavigate, onSetTargetReveal }: MenuProps) => {
    return (
        <div className="flex flex-col w-full p-4 gap-2 pb-8">
            <Button variant="ghost" onClick={() => onNavigate('profile')} className="w-full h-16 justify-start px-4 bg-white/5 hover:bg-white/10 rounded-sm">
                <User className="mr-4 text-white/50" size={20} />
                <div className="flex flex-col items-start">
                    <span className="text-white font-medium">Account Details</span>
                    <span className="text-xs text-white/50">Name and avatar</span>
                </div>
            </Button>
            <Button variant="ghost" onClick={() => { onSetTargetReveal('reveal_seed'); onNavigate('password_prompt') }} className="w-full h-16 justify-start px-4 bg-white/5 hover:bg-white/10 rounded-sm">
                <Shield className="mr-4 text-white/50" size={20} />
                <div className="flex flex-col items-start">
                    <span className="text-white font-medium">Show Secret Phrase</span>
                    <span className="text-xs text-white/50">Reveal your master seed phrase</span>
                </div>
            </Button>
            <Button variant="ghost" onClick={() => { onSetTargetReveal('reveal_pk'); onNavigate('password_prompt') }} className="w-full h-16 justify-start px-4 bg-white/5 hover:bg-white/10 rounded-sm">
                <KeyRound className="mr-4 text-white/50" size={20} />
                <div className="flex flex-col items-start">
                    <span className="text-white font-medium">Show Private Key</span>
                    <span className="text-xs text-white/50">Reveal the key for this specific account</span>
                </div>
            </Button>
        </div>
    )
}