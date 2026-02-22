import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check } from 'lucide-react'

const AVATAR_SEEDS = [
    "Daisy", "Felix", "Leo", "Bella", "Cleo",
    "Milo", "Luna", "Oliver", "Jasper", "Chloe",
    "Max", "Zoe", "Finn", "Ruby", "Oscar",
    "Mia", "Atlas", "Jade", "Hugo", "Ivy"
]

interface ProfileProps {
    accountName: string;
    setAccountName: (name: string) => void;
    avatarSeed: string;
    setAvatarSeed: (seed: string) => void;
    onSave: () => void;
}

export const Profile = ({ accountName, setAccountName, avatarSeed, setAvatarSeed, onSave }: ProfileProps) => {
    const currentAvatarUrl = `https://api.dicebear.com/9.x/identicon/svg?seed=${avatarSeed}`;

    return (
        <div className="flex flex-col w-full p-6 gap-6 pb-8">
            <div className="flex flex-col items-center w-full shrink-0">
                <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center border-2 border-secondary/50 overflow-hidden">
                    <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
                <Label className="text-white/70">Choose Avatar</Label>
                <div className="grid grid-cols-5 gap-3 w-full">
                    {AVATAR_SEEDS.map((seed) => {
                        const url = `https://api.dicebear.com/9.x/identicon/svg?seed=${seed}`;
                        const isSelected = avatarSeed === seed;

                        return (
                            <div
                                key={seed}
                                onClick={() => setAvatarSeed(seed)}
                                className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all border-2 bg-secondary/5 hover:bg-secondary/10 ${isSelected ? 'border-secondary scale-105' : 'border-transparent'
                                    }`}
                            >
                                <img src={url} alt={seed} className="w-full h-full object-cover p-1" />
                                {isSelected && (
                                    <div className="absolute inset-0 bg-taupe-950/40 flex items-center justify-center backdrop-blur-[1px]">
                                        <Check size={18} className="text-secondary" />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="flex flex-col gap-2 w-full mt-2">
                <Label className="text-white/70">Account Name</Label>
                <Input
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="h-12 bg-white/5 border-white/10 text-white focus-visible:ring-secondary/50 rounded-sm"
                />
            </div>

            <div className="pt-2">
                <Button onClick={onSave} className="w-full h-12 bg-secondary text-black font-semibold hover:bg-secondary/90 rounded-sm">
                    Save Changes
                </Button>
            </div>
        </div>
    )
}