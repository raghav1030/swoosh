import { useEffect, useRef, useState } from 'react'
import './App.css'
import { ImportWalletOptions as ImportWalletOptionsEnum } from './lib/constants'
import { generateMnemonic, validateMnemonic, keypairGenerators } from './lib/walletUtils'
import { useWalletStore } from './store/useWalletStore'
import SelectNetwork from './components/home/SelectNetwork'
import SetupPassword from './components/home/SetupPassword'
import ShowMnemonics from './components/home/ShowMnemonics'
import Stepper from './components/home/Stepper'
import Welcome from './components/home/Welcome'
import { ShootingStars } from './components/ui/shooting-stars'
import { StarsBackground } from './components/ui/stars-background'
import { ArrowLeft } from 'lucide-react'
import SettingUpWallets from './components/home/SettingUpWallets'
import ImportWalletOptions from './components/home/ImportWalletOptions'
import EnterRecoveryPhrase from './components/home/EnterRecoveryPhrase'
import { toast } from 'sonner'
import EnterPrivateKey from './components/home/EnterPrivateKey'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const {
    step,
    isNewWallet,
    selectedNetworks,
    importWalletOption,
    mnemonic,
    importedPrivateKey,
    setStep,
    setIsNewWallet,
    setSelectedNetworks,
    setImportWalletOption,
    setPassword,
    setMnemonic,
    setImportedPrivateKey,
    setWallets
  } = useWalletStore()

  const [direction, setDirection] = useState(0)
  const hasGenerated = useRef(false)

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 1,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 1,
    })
  }

  const navigate = (nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1)
    setStep(nextStep)
  }

  const handleBack = () => {
    if (step > 0) navigate(step - 1)
  }

  const handleNext = () => {
    if (step === 2 && isNewWallet) {
      setMnemonic(generateMnemonic())
    }
    navigate(step + 1)
  }

  const handleImportMnemonic = (phrase: string) => {
    if (!validateMnemonic(phrase)) {
      toast.error("Invalid Recovery Phrase")
      return
    }
    setMnemonic(phrase)
    navigate(4)
  }

  const handleImportPrivateKey = (key: string) => {
    setImportedPrivateKey(key)
    navigate(4)
  }

  const processWalletGeneration = async () => {
    if (hasGenerated.current) return
    hasGenerated.current = true

    try {
      let generatedWallets = []
      const isMnemonicFlow = isNewWallet || importWalletOption === ImportWalletOptionsEnum.RecoveryPhrase
      const isPrivateKeyFlow = !isNewWallet && importWalletOption === ImportWalletOptionsEnum.PrivateKey

      if (isMnemonicFlow) {
        generatedWallets = keypairGenerators.fromMnemonic(mnemonic, selectedNetworks)
      } else if (isPrivateKeyFlow) {
        generatedWallets = keypairGenerators.fromPrivateKey(importedPrivateKey, selectedNetworks)
      } else {
        throw new Error("Unknown generation flow")
      }

      setWallets(generatedWallets)
    } catch (error) {
      console.error(error)
      toast.error("Generation Failed")
      hasGenerated.current = false
      navigate(step - 1)
    }
  }

  useEffect(() => {
    if (step <= 1) {
      setMnemonic('')
      setImportedPrivateKey('')
      setWallets([])
      setPassword('')
      setImportWalletOption(null)
      setSelectedNetworks([])
      hasGenerated.current = false
    }
  }, [step])

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(processWalletGeneration, 500)
      return () => clearTimeout(timer)
    }
  }, [step])

  const renderStep = () => {
    switch (step) {
      case 0:
        return <Welcome setIsNewWallet={setIsNewWallet} setStep={navigate} />
      case 1:
        return <SelectNetwork isNewWallet={isNewWallet} selectedNetworks={selectedNetworks} setSelectedNetworks={setSelectedNetworks} onNext={handleNext} />
      case 2:
        return isNewWallet
          ? <SetupPassword setPassword={setPassword} onNext={handleNext} />
          : <ImportWalletOptions onNext={handleNext} selectedNetwork={selectedNetworks[0]} setImportWalletOption={setImportWalletOption} />
      case 3:
        if (isNewWallet) return <ShowMnemonics mnemonic={mnemonic} onNext={handleNext} />
        if (importWalletOption === ImportWalletOptionsEnum.PrivateKey) return <EnterPrivateKey onNext={handleImportPrivateKey} network={selectedNetworks[0]} />
        return <EnterRecoveryPhrase onNext={handleImportMnemonic} />
      case 4:
        return <SettingUpWallets selectedNetworks={selectedNetworks} onComplete={() => console.log("Dashboard")} />
      default:
        return null
    }
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Added 'overflow-hidden' here to clip the sliding animations at the border */}
      <div className="relative z-10 flex flex-col border border-white/20 rounded-xl dark:border-white/20 w-full max-w-lg min-h-[600px] bg-black/40 backdrop-blur-sm shadow-2xl overflow-hidden">

        <div className='flex-none w-full grid grid-cols-3 px-6 pt-6 pb-2 z-20'>
          <div className="flex items-center justify-start">
            {step > 0 && <ArrowLeft className="cursor-pointer text-secondary hover:text-white transition-colors" size={28} onClick={handleBack} />}
          </div>
          <div className="flex items-center justify-center">
            <Stepper step={step} totalSteps={4} />
          </div>
          <div />
        </div>

        <div className="flex-1 relative w-full overflow-hidden">
          <AnimatePresence mode='popLayout' custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className=" inset-0 w-full h-full flex flex-col items-center justify-center p-4 "
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <ShootingStars maxDelay={1} starWidth={15} />
        <StarsBackground />
      </div>
    </div>
  )
}

export default App