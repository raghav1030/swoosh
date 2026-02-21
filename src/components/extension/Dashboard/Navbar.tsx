import React from 'react'
import ProfileDropdown from './ProfileDropdown'
import NavbarButtonGroup from './NavbarButtonGroup'

interface Wallet {
    network: string;
    publicKey: string;
    privateKey: string;
}

interface NavbarProps {
    wallets: Wallet[];
    activeAccountIndex: number;
    setActiveAccountIndex: (index: number) => void;
    activeWallet: Wallet;
    onLock: () => void;
}

const Navbar = ({ wallets, activeAccountIndex, setActiveAccountIndex, activeWallet, onLock }: NavbarProps) => {
    return (
        <div className='w-full h-16 px-4 flex items-center justify-between shrink-0 relative'>
            <div className="absolute left-4 z-10">
                <ProfileDropdown
                    wallets={wallets}
                    activeAccountIndex={activeAccountIndex}
                    setActiveAccountIndex={setActiveAccountIndex}
                    onLock={onLock}
                />
            </div>

            <div className="flex-1 flex items-center justify-center w-full z-0">
                <NavbarButtonGroup
                    wallets={wallets}
                    activeAccountIndex={activeAccountIndex}
                    setActiveAccountIndex={setActiveAccountIndex}
                    activeWallet={activeWallet}
                />
            </div>
        </div>
    )
}

export default Navbar