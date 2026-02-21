import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check, ChevronDown, PlusCircle, Wallet as WalletIcon, Plus } from 'lucide-react'
import { ButtonGroup } from '@/components/ui/button-group'
import { networkIconRegistry } from "@/lib/constants"
import { useAddAccountUI } from './AddAccountOverlay'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet } from '@/store/useWalletStore'

interface NavbarButtonGroupProps {
    wallets: Wallet[];
    activeAccountIndex: number;
    setActiveAccountIndex: (index: number) => void;
    activeWallet: Wallet;
}

const NavbarButtonGroup = ({ wallets, activeAccountIndex, setActiveAccountIndex, activeWallet }: NavbarButtonGroupProps) => {
    const [copied, setCopied] = useState(false)
    const openAddAccount = useAddAccountUI(state => state.open)

    const truncateAddress = (address: string) => {
        if (!address) return ''
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    const handleCopy = () => {
        if (!activeWallet?.publicKey) return
        navigator.clipboard.writeText(activeWallet.publicKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSelectNetwork = (network: string) => {
        const firstIndex = wallets.findIndex(w => w.network === network)
        if (firstIndex !== -1) {
            setActiveAccountIndex(firstIndex)
        }
    }

    const handleSelectAccount = (index: number) => {
        setActiveAccountIndex(index)
    }

    const uniqueNetworks = Array.from(new Set(wallets.map(w => w.network)))

    const currentNetworkWallets = wallets
        .map((w, index) => ({ ...w, originalIndex: index }))
        .filter(w => w.network === activeWallet?.network)

    // Group wallets by their import source
    const groupedBySource = currentNetworkWallets.reduce((acc, wallet) => {
        const source = wallet.importSource || 'Primary Phrase';
        if (!acc[source]) acc[source] = [];
        acc[source].push(wallet);
        return acc;
    }, {} as Record<string, typeof currentNetworkWallets>);

    const ActiveIconComponent = activeWallet ? (networkIconRegistry[activeWallet.network] as any) : null;

    return (
        <ButtonGroup>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-secondary/5 border-secondary/10 hover:bg-secondary/10 hover:text-secondary">
                        {ActiveIconComponent ? (
                            typeof ActiveIconComponent === 'string' ? (
                                <img src={ActiveIconComponent} alt={activeWallet.network} className="w-4 h-4" />
                            ) : (
                                <ActiveIconComponent className="w-4 h-4" />
                            )
                        ) : (
                            <WalletIcon size={16} />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-black/95 backdrop-blur-md border-secondary/10 text-secondary">
                    <DropdownMenuLabel className="text-xs text-secondary/50 uppercase tracking-wider">
                        Select Network
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-secondary/10" />
                    <DropdownMenuGroup>
                        {uniqueNetworks.map((network) => {
                            const IconComponent = networkIconRegistry[network] as any;
                            const isSelected = activeWallet?.network === network;

                            return (
                                <DropdownMenuItem
                                    key={network}
                                    onClick={() => handleSelectNetwork(network)}
                                    className="flex items-center justify-between cursor-pointer focus:bg-secondary/10 focus:text-secondary"
                                >
                                    <div className="flex items-center gap-2">
                                        {IconComponent ? (
                                            typeof IconComponent === 'string' ? (
                                                <img src={IconComponent} alt={network} className="w-3.5 h-3.5" />
                                            ) : (
                                                <IconComponent className="w-3.5 h-3.5" />
                                            )
                                        ) : (
                                            <WalletIcon size={14} className="text-secondary/70" />
                                        )}
                                        <span className="text-sm">{network}</span>
                                    </div>
                                    {isSelected && <Check size={14} className="text-secondary" />}
                                </DropdownMenuItem>
                            )
                        })}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-secondary/10" />
                    <DropdownMenuItem
                        onClick={() => openAddAccount('select_network')}
                        className="cursor-pointer focus:bg-secondary/10 focus:text-secondary text-secondary/80"
                    >
                        <Plus size={14} className="mr-2" />
                        Add Network
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="bg-secondary/5 border-secondary/10 hover:bg-secondary/10 hover:text-secondary flex items-center gap-2"
                    >
                        Account {activeAccountIndex + 1}
                        <ChevronDown size={14} className="text-secondary/50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 max-h-[400px] overflow-y-auto custom-scrollbar bg-black/95 backdrop-blur-md border-secondary/10 text-secondary">
                    {Object.entries(groupedBySource).map(([source, sourceWallets], groupIndex) => (
                        <React.Fragment key={source}>
                            {groupIndex !== 0 && <DropdownMenuSeparator className="bg-secondary/10" />}
                            <DropdownMenuLabel className="text-xs text-secondary/50 uppercase tracking-wider">
                                {source}
                            </DropdownMenuLabel>
                            <DropdownMenuGroup>
                                {sourceWallets.map((wallet) => {
                                    const isSelected = activeAccountIndex === wallet.originalIndex;

                                    return (
                                        <DropdownMenuItem
                                            key={`${wallet.publicKey}-${wallet.originalIndex}`}
                                            onClick={() => handleSelectAccount(wallet.originalIndex)}
                                            className="flex items-center justify-between cursor-pointer py-2 focus:bg-secondary/10 focus:text-secondary"
                                        >
                                            <div className='flex items-center gap-2'>
                                                <WalletIcon size={14} className={isSelected ? 'text-secondary' : 'text-secondary/70'} />
                                                <div className='flex flex-col items-start'>
                                                    <span className="text-sm font-medium">
                                                        Account {wallet.originalIndex + 1}
                                                    </span>
                                                    <span className='text-xs text-secondary/50 font-mono tracking-wider'>
                                                        {truncateAddress(wallet.publicKey)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-medium ${isSelected ? 'text-secondary' : 'text-secondary/70'}`}>
                                                    $0.00
                                                </span>
                                                {isSelected && <Check className='text-secondary' size={14} />}
                                            </div>
                                        </DropdownMenuItem>
                                    )
                                })}
                            </DropdownMenuGroup>
                        </React.Fragment>
                    ))}

                    <DropdownMenuSeparator className="bg-secondary/10" />
                    <DropdownMenuItem
                        onClick={() => openAddAccount('options', activeWallet?.network)}
                        className="cursor-pointer focus:bg-secondary/10 focus:text-secondary text-secondary/80"
                    >
                        <PlusCircle size={14} className="mr-2" />
                        Add New Account
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="bg-secondary/5 border-secondary/10 hover:bg-secondary/10 hover:text-secondary"
            >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-secondary/70" />}
            </Button>
        </ButtonGroup>
    )
}

export default NavbarButtonGroup