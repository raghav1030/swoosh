import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { PlusCircle } from "lucide-react"
import { Wallet } from '@/store/useWalletStore'
import { useAddAccountUI } from './AddAccountOverlay'

interface ProfileDropdownProps {
    wallets: Wallet[];
    activeAccountIndex: number;
    setActiveAccountIndex: (index: number) => void;
    onLock: () => void;
    onOpenSettings: () => void;
}

const ProfileDropdown = ({
    wallets,
    activeAccountIndex,
    setActiveAccountIndex,
    onLock,
    onOpenSettings,
}: ProfileDropdownProps) => {
    const [open, setOpen] = useState(false)
    const [activeCmd, setActiveCmd] = useState("")
    const openAddAccount = useAddAccountUI(state => state.open)

    const truncateAddress = (address: string) => {
        if (!address) return ''
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    const activeWallet = wallets[activeAccountIndex] || wallets[0]
    const activeAvatarUrl = `https://api.dicebear.com/9.x/identicon/svg?seed=${activeWallet?.avatar || activeWallet?.publicKey}`;

    const currentNetworkWallets = wallets
        .map((w, index) => ({ ...w, originalIndex: index }))
        .filter(w => w.network === activeWallet?.network)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="aspect-square rounded-full h-10 w-10 border-secondary/20 p-0 overflow-hidden bg-secondary/5 hover:bg-secondary/10 transition-all"
                >
                    <img src={activeAvatarUrl} alt="Profile" className="w-full h-full object-cover" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-72 p-0 border-secondary/10 rounded-sm bg-taupe-950/95 backdrop-blur-xl" align="start">
                <Command
                    className="bg-transparent text-secondary"
                    value={activeCmd}
                    onValueChange={setActiveCmd}
                    onMouseLeave={() => setActiveCmd("")}
                >
                    <CommandInput placeholder="Search accounts..." className="text-secondary placeholder:text-secondary/40 border-none focus:ring-0" />
                    <CommandList className="custom-scrollbar max-h-[300px]">
                        <CommandEmpty>No accounts found.</CommandEmpty>

                        <CommandGroup className="text-secondary/50">
                            {currentNetworkWallets.map((wallet) => {
                                const isActive = activeAccountIndex === wallet.originalIndex;
                                const avatarUrl = `https://api.dicebear.com/9.x/identicon/svg?seed=${wallet.avatar || wallet.publicKey}`;

                                return (
                                    <CommandItem
                                        key={wallet.publicKey}
                                        value={`Account ${wallet.originalIndex + 1} ${wallet.name || ''} ${wallet.publicKey}`}
                                        onSelect={() => {
                                            setActiveAccountIndex(wallet.originalIndex)
                                            setOpen(false)
                                        }}
                                        className={`flex items-center justify-between cursor-pointer rounded-xs transition-colors duration-75 ${isActive ? 'bg-secondary/5' : ''
                                            } data-[selected=true]:bg-secondary/10 data-[selected=true]:text-secondary`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center overflow-hidden border ${isActive ? 'border-secondary' : 'border-secondary/20'}`}>
                                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`font-medium ${isActive ? 'text-secondary' : 'text-secondary/90'}`}>
                                                    {wallet.name || `Account ${wallet.originalIndex + 1}`}
                                                </span>
                                                <span className="text-xs text-secondary/50 font-mono">
                                                    {truncateAddress(wallet.publicKey)}
                                                </span>
                                            </div>
                                        </div>
                                    </CommandItem>
                                )
                            })}

                            <CommandItem
                                value="Add New Account"
                                onSelect={() => {
                                    setOpen(false)
                                    openAddAccount('options', activeWallet?.network)
                                }}
                                className="cursor-pointer mt-2 font-semibold text-secondary data-[selected=true]:bg-secondary/20 data-[selected=true]:text-secondary rounded-xs transition-colors duration-75"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                <span>Add New Account</span>
                            </CommandItem>
                        </CommandGroup>

                        <CommandSeparator className="bg-secondary/10" />

                        <CommandGroup className="text-secondary/50">
                            <CommandItem
                                value="Settings"
                                onSelect={() => {
                                    setOpen(false)
                                    onOpenSettings()
                                }}
                                className="cursor-pointer font-semibold data-[selected=true]:bg-secondary/10 data-[selected=true]:text-secondary rounded-xs transition-colors duration-75"
                            >
                                <span>Settings</span>
                            </CommandItem>
                        </CommandGroup>

                        <CommandSeparator className="bg-secondary/10" />

                        <CommandGroup className="text-secondary/50">
                            <CommandItem
                                value="Lock Swoosh"
                                onSelect={() => {
                                    setOpen(false)
                                    onLock()
                                }}
                                className="cursor-pointer text-red-400 font-semibold data-[selected=true]:bg-red-500/20 data-[selected=true]:text-red-400 rounded-xs rounded-b-sm transition-colors duration-75"
                            >
                                <span>Lock Swoosh</span>
                            </CommandItem>
                        </CommandGroup>

                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default ProfileDropdown