import { useEffect, useRef, useState } from 'react'
import { ImportWalletOptions as ImportWalletOptionsEnum } from '../lib/constants'
import { generateMnemonic, validateMnemonic, keypairGenerators } from '../lib/walletUtils'
import { useWalletStore } from '../store/useWalletStore'
import SelectNetwork from '../components/home/SelectNetwork'
import SetupPassword from '../components/home/SetupPassword'
import ShowMnemonics from '../components/home/ShowMnemonics'
import Stepper from '../components/home/Stepper'
import Welcome from '../components/home/Welcome'
import { ShootingStars } from '../components/ui/shooting-stars'
import { StarsBackground } from '../components/ui/stars-background'
import { ArrowLeft } from 'lucide-react'
import SettingUpWallets from '../components/home/SettingUpWallets'
import ImportWalletOptions from '../components/home/ImportWalletOptions'
import EnterRecoveryPhrase from '../components/home/EnterRecoveryPhrase'
import { toast } from 'sonner'
import EnterPrivateKey from '../components/home/EnterPrivateKey'
import { motion, AnimatePresence } from 'framer-motion'
import WalletCreationSuccess from '@/components/home/WalletCreationSuccess'
import { scanForAccounts } from '@/lib/networkUtils'
import WalletNotFound from '@/components/home/WalletNotFound'

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
  const [isProcessing, setIsProcessing] = useState(false)
  const hasGenerated = useRef(false)

  // Normal flow ends at Step 6 (Success).
  // Extended flow (Not Found -> Create New) goes to Step 9.
  const totalSteps = step >= 7 ? 9 : 6

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
    // Case: Back from Password (Step 8) -> Wallet Not Found (Step 7)
    if (step === 8) {
      setIsNewWallet(false) // Revert state so we are back in "Import" mode logic
      navigate(7)
      return
    }
    // Case: Back from Wallet Not Found (Step 7) -> Enter Phrase (Step 3)
    if (step === 7) {
      setIsNewWallet(false) // Vital: Revert state so Step 3 shows Input, not Mnemonic Generation
      navigate(3)
      return
    }
    // Prevent going back during processing (Step 4) or Success (Step 6 or 9)
    if (step === 4 || step === 6 || step === 9) return

    if (step > 0) navigate(step - 1)
  }

  const handleNext = () => {
    // Modified: Only generate a NEW mnemonic if we don't already have one.
    if (step === 2 && isNewWallet && !mnemonic) {
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

  // Handle the "Create New Wallet" button on the Not Found screen
  const handleCreateFromExisting = () => {
    setIsNewWallet(true) // Switch mode to New Wallet logic
    navigate(8) // Go to Password Setup (Step 8)
  }

  const processWalletGeneration = async () => {
    if (hasGenerated.current) return
    hasGenerated.current = true
    setIsProcessing(true)

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

      // 1. Scan for accounts
      const scanResults = await scanForAccounts(generatedWallets[0].publicKey)
      const hasActiveAccounts = scanResults.some(r => r.exists)

      // 2. Decide next step
      setWallets(generatedWallets)
      setIsProcessing(false)

      if (isNewWallet) {
        navigate(6) // Success (Normal Flow)
      } else {
        if (hasActiveAccounts) {
          navigate(6) // Success (Import Flow)
        } else {
          navigate(7) // Wallet Not Found Screen
        }
      }

    } catch (error) {
      console.error(error)
      toast.error("Generation Failed")
      hasGenerated.current = false
      setIsProcessing(false)
      navigate(step - 1)
    }
  }

  useEffect(() => {
    if (step <= 0) {
      setMnemonic('')
      setImportedPrivateKey('')
      setWallets([])
      setPassword('')
      hasGenerated.current = false
      setIsProcessing(false)
    }

    if (step < 4) {
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
        return <SettingUpWallets isNewWallet={isNewWallet} selectedNetworks={selectedNetworks} isProcessing={isProcessing} onComplete={() => { }} />
      case 5:
        // Optional "Middle" step if you needed padding, currently skipping to 6 in logic, 
        // but if your flow is strictly 1->2->3->4->5->6, you might want this to be something.
        // Based on previous code, Step 4 was SettingUpWallets. 
        // If you want 6 steps total, maybe Step 5 is a "Finalizing" or just empty transition?
        // OR: You can just map success to 6 directly. 
        // For now, let's assume we jump straight to 6 for success.
        return null
      case 6:
        return <WalletCreationSuccess />
      case 7:
        return <WalletNotFound onCreateNew={handleCreateFromExisting} onTryAgain={handleBack} />
      case 8:
        // Reuse SetupPassword. On Next, go to Step 9 (Success)
        return <SetupPassword setPassword={setPassword} onNext={() => navigate(9)} />
      case 9:
        return <WalletCreationSuccess />
      default:
        return null
    }
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden p-4">
      <div className="relative z-10 flex flex-col border border-white/20 rounded-xl dark:border-white/20 w-full max-w-lg min-h-[600px] bg-black/40 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className='flex-none w-full grid grid-cols-3 px-6 pt-6 pb-2 z-20'>
          <div className="flex items-center justify-start">
            {/* Show Back button on all steps > 0 except Success (6 & 9) and Processing (4) */}
            {step > 0 && step !== 4 && step !== 6 && step !== 9 && (
              <button
                onClick={handleBack}
                className="text-secondary hover:text-white cursor-pointer transition-colors"
              >
                <ArrowLeft size={28} />
              </button>
            )}
          </div>
          <div className="flex items-center justify-center">
            {/* Always show Stepper if we aren't on Success (6 or 9) */}
            {step > 0 && step !== 6 && step !== 9 && (
              <Stepper step={step} totalSteps={totalSteps} />
            )}
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