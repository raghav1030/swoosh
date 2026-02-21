import { useState } from 'react'
import { WindIcon } from '../ui/wind'
import { Field, FieldGroup } from '../ui/field'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Link } from 'react-router'

interface WelcomeProps {
    setStep: (step: number) => void;
    setIsNewWallet: (isNew: boolean) => void;
}

const Welcome = ({ setStep, setIsNewWallet }: WelcomeProps) => {
    const [checked, setChecked] = useState(false)

    const handleStart = (isNew: boolean) => {
        setIsNewWallet(isNew)
        setStep(1)
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-around p-2 gap-8">
            <h2 className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-3xl md:text-5xl tracking-tight font-medium bg-clip-text text-transparent bg-gradient-to-b from-primary via-secondary to-secondary">
                <span>Swoosh</span>
                <span className="text-secondary text-lg font-thin">x</span>
                <span>Wallet</span>
            </h2>

            <div className="relative flex items-center justify-center group">
                <div className="relative h-44 w-44 rounded-full flex items-center justify-center">
                    <div className="absolute w-full h-full bg-primary/40 group-hover:bg-primary/60 blur-xl rounded-full transition-all duration-500" />
                    <span className="relative z-20 text-black dark:text-secondary">
                        <WindIcon animateOnRender={true}
                            size={75} className="text-secondary/60 group-hover:text-secondary/80 transition-colors duration-300" />
                    </span>
                </div>
            </div>

            <div className="w-full flex flex-col items-center justify-center gap-2 text-center">
                <p className="tracking-wide text-2xl text-secondary font-bold">
                    Welcome to Swoosh
                </p>
                <p className="text-secondary/80 px-4 font-semibold">
                    You'll use this wallet to send and receive crypto and NFTs
                </p>
            </div>

            <div className="w-full flex justify-center items-center">
                <FieldGroup className="max-w-sm w-full">
                    <Field orientation="horizontal" className="flex justify-center items-center gap-3 w-full">
                        <Checkbox
                            checked={checked}
                            onCheckedChange={(c) => setChecked(!!c)}
                            id="terms-checkbox"
                            name="terms-checkbox"
                        />
                        <Label
                            htmlFor="terms-checkbox"
                            className="flex items-center gap-1 cursor-pointer select-none"
                        >
                            <span className={`text-secondary text-md transition-opacity duration-300 ${checked ? 'opacity-100' : 'opacity-60'}`}>
                                I agree to the
                            </span>
                            <Link to='/tnc'>
                                <span className="text-blue-400 hover:text-blue-300 flex justify-center items-center gap-1">
                                    Terms of Service.
                                </span>
                            </Link>
                        </Label>
                    </Field>
                </FieldGroup>
            </div>

            <div className="flex flex-col items-center justify-center w-full gap-3">
                <Button
                    size="lg"
                    disabled={!checked}
                    className="w-full cursor-pointer h-13 bg-primary rounded-sm text-lg tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleStart(true)}
                >
                    Create New Wallet
                </Button>
                <Button
                    size="lg"
                    disabled={!checked}
                    className="w-full cursor-pointer h-13 bg-secondary/20 hover:bg-secondary/30 rounded-sm text-lg tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleStart(false)}
                >
                    I already have a wallet
                </Button>
            </div>
        </div>
    )
}

export default Welcome