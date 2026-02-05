import { useEffect, useState } from 'react'
import './App.css'
import { Network } from './lib/constants' // Ensure this is imported as a Value, not just Type if used in logic
import { generateKeypair, generateMnemonic, generateSeed } from './lib/walletUtils'
import SelectNetwork from './components/home/SelectNetwork'
import SetupPassword from './components/home/SetupPassword'
import ShowMnemonics from './components/home/ShowMnemonics'
import Stepper from './components/home/Stepper'
import Welcome from './components/home/Welcome'
import { ShootingStars } from './components/ui/shooting-stars'
import { StarsBackground } from './components/ui/stars-background'
import { ArrowLeft } from 'lucide-react'
import SettingUpWallets from './components/home/SettingUpWallets'

function App() {
  const [step, setStep] = useState(0)
  const [isNewWallet, setIsNewWallet] = useState<boolean>(false)
  const [selectedNetworks, setSelectedNetworks] = useState<Network[]>([])
  const [password, setPassword] = useState<string>('')
  const [mnemonic, setMnemonic] = useState<string>('')
  const [wallets, setWallets] = useState<any[]>([])

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleNext = () => {
    if (step === 2 && isNewWallet) {
      const mn = generateMnemonic()
      setMnemonic(mn)
    }
    setStep(step + 1)
  }

  const performWalletGeneration = () => {
    if (mnemonic && selectedNetworks.length > 0) {
      try {
        const seed = generateSeed(mnemonic);
        const generatedWallets = selectedNetworks.map(network => {
          return {
            network,
            ...generateKeypair({ network, seed, mnemonic })
          };
        });

        setWallets(generatedWallets);
      } catch (e) {
        console.error(e);
      }
    }
  }

  useEffect(() => {
    if (step === 4) {
      performWalletGeneration();
    }
  }, [step]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return <Welcome setStep={setStep} setIsNewWallet={setIsNewWallet} />
      case 1:
        return isNewWallet
          ? <SelectNetwork selectedNetworks={selectedNetworks} setSelectedNetworks={setSelectedNetworks} onNext={handleNext} />
          : <div>Import Existing Wallet Step</div>
      case 2:
        return isNewWallet
          ? <SetupPassword setPassword={setPassword} onNext={handleNext} />
          : <div>Import Wallet Details Step</div>
      case 3:
        return isNewWallet
          ? <ShowMnemonics mnemonic={mnemonic} onNext={handleNext} />
          : <div>Import Wallet Details Step</div>
      case 4:
        return isNewWallet
          ? <SettingUpWallets selectedNetworks={selectedNetworks} onComplete={() => console.log("hi")} />
          : <div>Loading ... </div>
      default:
        return null
    }
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-around border border-white/20 rounded-md dark:border-white/20 max-w-xl min-w-md mx-auto bg-black/40 backdrop-blur-sm">
        <div className='w-full grid grid-cols-3 px-4 my-3'>
          <div className="flex items-center">
            {step > 0 && (
              <ArrowLeft className="cursor-pointer text-secondary" size={30} onClick={handleBack} />
            )}
          </div>
          <Stepper step={step} totalSteps={4} />
          <div />
        </div>

        {renderStep()}

      </div>
      <div className="absolute inset-0 z-0">
        <ShootingStars maxDelay={1} starWidth={15} />
        <StarsBackground />
      </div>
    </div>
  )
}

export default App