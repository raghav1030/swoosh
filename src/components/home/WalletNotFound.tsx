import { Button } from "../ui/button"
import { ShieldX } from "lucide-react"

interface WalletNotFoundProps {
    onCreateNew: () => void;
    onTryAgain: () => void;
}

const WalletNotFound = ({ onCreateNew, onTryAgain }: WalletNotFoundProps) => {
    return (
        <div className='w-full h-full flex flex-col justify-between p-2 gap-4'>
            <div className="text-center space-y-2 animate-fade-in">
                <h2 className="text-2xl font-semibold text-secondary tracking-wide">
                    Import Funded Accounts
                </h2>
                <p className="text-secondary/60 tracking-wide">
                    Select one or more funded accounts to import
                </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-6 p-4 bg-secondary/5 rounded">
                <ShieldX size={30} className="font-bold text-secondary/90" />
                <div className="flex flex-col items-center justify-center gap-3">
                    <h3 className="text-xl font-semibold  text-secondary">
                        No funded account found
                    </h3>
                    <h4 className="text font-semibold tracking-wide text-secondary/60 max-w-[90%] text-center">
                        You can use the provided recovery phrase to create a new wallet, or use advanced search

                    </h4>
                    <Button
                        className={`w-full h-12 bg-secondary/95 hover:bg-secondary rounded-sm tracking-wide text-black font-semibold text-lg`}
                        onClick={() => onCreateNew()}
                    >
                        Create New Wallet
                    </Button>
                </div>
            </div>

            <Button
                className="w-full flex bg-transparent items-center justify-center h-12 hover:bg-transparent hover:text-secondary text-secondary/90 text-lg"
                onClick={() => onTryAgain()}
            >                Go Back
            </Button>
        </div>
    )
}

export default WalletNotFound