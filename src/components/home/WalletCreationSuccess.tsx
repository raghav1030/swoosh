import { Link } from 'react-router';
import { Button } from '../ui/button'
import { FaGithub, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import SocialCard from './SocialCard';
import { WindIcon } from '../ui/wind';
import { useWalletStore } from '../../store/useWalletStore';
import { useState } from 'react';

const EXTENSION_ID = "jjikigjnfeogeefjleigkanlbdefhhpm"

const WalletCreationSuccess = () => {
    const { mnemonic, password } = useWalletStore();
    const [isSynced, setIsSynced] = useState(false);

    const handleSyncAndOpen = () => {
        console.log("Button clicked. Mnemonic present:", !!mnemonic);

        if (!window.chrome || !window.chrome.runtime) {
            alert("Chrome runtime not found. Are you in a supported browser?");
            return;
        }

        // Check if we are actually running inside the extension (onboarding.html)
        const isExtensionPage = window.location.protocol === 'chrome-extension:';

        if (isExtensionPage && window.chrome.storage) {
            console.log("Detected Extension Page: Saving directly to storage...");
            window.chrome.storage.local.set({
                mnemonic,
                password,
                hasWallet: true
            }, () => {
                setIsSynced(true);
                alert("Wallet saved to Swoosh! Use Shift+Alt+S to open.");
            });
        } else {
            console.log("Detected Web Page: Sending message to extension...", EXTENSION_ID);
            window.chrome.runtime.sendMessage(
                EXTENSION_ID,
                {
                    type: "SYNC_WALLET",
                    mnemonic: mnemonic,
                    password: password
                },
                (response) => {
                    // Check for errors in communication
                    if (window.chrome.runtime.lastError) {
                        console.error("Sync Error:", window.chrome.runtime.lastError.message);
                        alert("Extension not found. Check if the ID matches and Extension is enabled.");
                        return;
                    }

                    if (response?.success) {
                        console.log("Sync Response Success!");
                        setIsSynced(true);
                        alert("Swoosh Wallet Synced Successfully!");
                    } else {
                        console.warn("Sync failed or no response received.");
                    }
                }
            );
        }
    };

    return (
        <div className='w-full h-full flex flex-col justify-between p-2 gap-4'>

            <div className='w-full flex flex-col items-center justify-center gap-4 text-center flex-grow'>
                <div className='w-full flex flex-col gap-2 justify-center items-center'>

                    <h2 className='text-2xl font-semibold text-secondary tracking-wide'>You're all good!</h2>
                    <div className='text-secondary/80 max-w-xs tracking-wide flex items-center justify-center gap-1'>
                        Open Swoosh with <span className='text-blue-400 font-semibold'> Shift + Alt + S</span>
                    </div>
                </div>
                <div className='grid grid-cols-3 gap-2 w-full'>
                    <SocialCard link='https://www.linkedin.com/in/raghav-gandhi-766b4917b/' icon={<FaLinkedinIn size={25} className='text-blue-500' />} label="Let's Connect" />
                    <SocialCard link='https://x.com/RaghavGandhi14' icon={<FaXTwitter size={25} className='text-secondary/80' />} label="@RaghavGandhi14" />
                    <SocialCard link='https://github.com/raghav1030/swoosh' icon={<FaGithub size={25} className='text-secondary/80' />} label="Source Code" />
                </div>
            </div>

            <div className="w-full pt-2 group">
                <Button
                    className="w-full flex items-center justify-center h-12 bg-secondary/95 hover:bg-secondary rounded-sm tracking-wide text-black font-bold text-lg transition-all"
                    size={'lg'}
                    onClick={handleSyncAndOpen}
                >
                    {isSynced ? "Synced Successfully" : "Open Swoosh"}
                    <WindIcon size={75} className="text-black/60 group-hover:text-black transition-colors duration-300" />
                </Button>
            </div>
        </div>
    )
}

export default WalletCreationSuccess