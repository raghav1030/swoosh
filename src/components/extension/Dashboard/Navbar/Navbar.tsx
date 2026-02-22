import { Wallet } from '@/store/useWalletStore'
import ProfileDropdown from '../ProfileDropdown';
import NavbarButtonGroup from './NavbarButtonGroup';

interface NavbarProps {
    wallets: Wallet[];
    activeAccountIndex: number;
    setActiveAccountIndex: (index: number) => void;
    activeWallet: Wallet;
    onLock: () => void;
    onOpenSettings: () => void;
}

const Navbar = ({
    wallets,
    activeAccountIndex,
    setActiveAccountIndex,
    onLock,
    onOpenSettings,
    activeWallet,
}: NavbarProps) => {
    return (
        <div className='w-full h-16 px-4 flex items-center justify-between shrink-0 relative'>

            <ProfileDropdown
                wallets={wallets}
                activeAccountIndex={activeAccountIndex}
                setActiveAccountIndex={setActiveAccountIndex}
                onLock={onLock}
                onOpenSettings={onOpenSettings}
            />

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