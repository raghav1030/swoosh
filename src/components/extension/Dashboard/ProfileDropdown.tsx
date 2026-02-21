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
import {
    Check,
    Lock,
    PlusCircle,
    Settings
} from "lucide-react"

interface Wallet {
    network: string;
    publicKey: string;
    privateKey: string;
}

interface ProfileDropdownProps {
    wallets: Wallet[];
    activeAccountIndex: number;
    setActiveAccountIndex: (index: number) => void;
    onLock: () => void;
}

const ProfileDropdown = ({ wallets, activeAccountIndex, setActiveAccountIndex, onLock }: ProfileDropdownProps) => {
    const [open, setOpen] = useState(false)
    const [activeCmd, setActiveCmd] = useState("")

    const truncateAddress = (address: string) => {
        if (!address) return ''
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    const handleAddNewAccount = () => {
        alert("Add new account functionality coming soon!")
        setOpen(false)
    }

    const handleOpenSettings = () => {
        alert("Opening Settings...")
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="aspect-square rounded-full h-10 w-10 border-secondary/10 text-secondary bg-secondary/5 hover:bg-secondary/10 hover:text-secondary transition-all"
                >
                    A{activeAccountIndex + 1}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-72 p-0 border-secondary/10 rounded-sm bg-black/95 backdrop-blur-xl" align="start">
                <Command
                    className="bg-transparent text-secondary"
                    value={activeCmd}
                    onValueChange={setActiveCmd}
                    onMouseLeave={() => setActiveCmd("")}
                >
                    <CommandInput placeholder="Search by public key..." className="text-secondary placeholder:text-secondary/40 border-none focus:ring-0" />
                    <CommandList className="custom-scrollbar">
                        <CommandEmpty>No accounts found.</CommandEmpty>

                        <CommandGroup className="text-secondary/50">
                            {wallets.map((wallet, index) => {
                                const isActive = activeAccountIndex === index;

                                return (
                                    <CommandItem
                                        key={wallet.publicKey}
                                        value={`Account ${index + 1} ${wallet.publicKey}`}
                                        onSelect={() => {
                                            setActiveAccountIndex(index)
                                            setOpen(false)
                                        }}
                                        className={`flex items-center justify-between cursor-pointer  rounded-xs transition-colors duration-75 ${isActive ? 'bg-secondary/5' : ''
                                            } data-[selected=true]:bg-secondary/10 data-[selected=true]:text-secondary`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-xs transition-colors duration-75 ${isActive ? 'bg-secondary text-black' : 'bg-secondary/10 text-secondary'
                                                }`}>
                                                A{index + 1}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`font-medium ${isActive ? 'text-secondary' : 'text-secondary/90'}`}>
                                                    Account {index + 1}
                                                </span>
                                                <span className="text-xs text-secondary/50 font-mono">
                                                    {truncateAddress(wallet.publicKey)}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-medium ${isActive ? 'text-secondary' : 'text-secondary/70'}`}>
                                            $0.00
                                        </span>
                                    </CommandItem>
                                )
                            })}

                            <CommandItem
                                value="Add New Account"
                                onSelect={handleAddNewAccount}
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
                                onSelect={handleOpenSettings}
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