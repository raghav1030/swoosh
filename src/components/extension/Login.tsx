import React, { useState } from 'react'
import * as z from 'zod'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '../ui/input'
import { Eye, EyeOff, Loader2, AlertTriangle, Menu, Heart, HelpCircle, Info, ChevronRight } from 'lucide-react'
import { WindIcon } from '../ui/wind'

interface LoginProps {
  onUnlock: (password: string) => Promise<boolean>
}

const Login = ({ onUnlock }: LoginProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const formSchema = z.object({
    password: z.string().min(1, "Password is required")
  })

  const form = useForm({
    defaultValues: {
      password: '',
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      setAuthError(null)
      const isSuccess = await onUnlock(value.password)

      if (!isSuccess) {
        setAuthError("Incorrect password. Please try again.")
      }
    },
  })

  const handleResetWallet = async () => {
    try {
      const isExtension = typeof window !== 'undefined' &&
        window.chrome &&
        window.chrome.runtime &&
        window.chrome.runtime.id &&
        window.chrome.storage;

      if (isExtension) {
        await window.chrome.storage.local.clear()
        window.chrome.tabs.create({ url: window.chrome.runtime.getURL('index.html') })
        window.close()
      } else {
        localStorage.clear()
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to reset wallet:", error)
    }
  }

  const menuOptions = [
    {
      id: 'reset',
      label: 'Reset Swoosh',
      icon: AlertTriangle,
      action: () => {
        setShowMenu(false)
        setShowForgotPassword(true)
      }
    },
    {
      id: 'appreciate',
      label: 'Appreciate Developer',
      icon: Heart,
      action: () => {
        const text = encodeURIComponent("I really like Swoosh and its implementation! Kudos to @raghavgandhi14");
        window.open(`https://x.com/intent/tweet?text=${text}`, '_blank');
      }
    },
    {
      id: 'support',
      label: 'Help & Support',
      icon: HelpCircle,
      action: () => { }
    },
    {
      id: 'about',
      label: 'About Swoosh',
      icon: Info,
      action: () => { }
    }
  ]

  return (
    <div className='w-full h-full relative flex flex-col items-center justify-center p-4 py-8'>
      <button
        onClick={() => setShowMenu(true)}
        className="absolute top-6 right-6 text-secondary/70 hover:text-secondary transition-colors z-30"
      >
        <Menu size={28} />
      </button>

      <div className='w-full h-[90%] flex flex-col items-center justify-center gap-6 group'>
        <div className="flex flex-col relative rounded-full items-center justify-center gap-4 h-52 w-52 shrink-0">
          <div className="absolute w-full h-full bg-secondary/20 group-hover:bg-secondary/25 blur-xl rounded-full transition-all duration-500" />

          <h2 className="text-3xl md:text-5xl tracking-tight font-medium bg-clip-text text-transparent bg-linear-to-b from-primary via-secondary to-secondary z-20">
            <span>Swoosh</span>
          </h2>
          <span className="relative z-20 text-black dark:text-secondary">
            <WindIcon
              size={75}
              animateOnRender={true}
              className="text-secondary/80 group-hover:text-secondary transition-colors duration-300"
            />
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="w-full flex flex-col items-center justify-center gap-6 flex-1"
        >
          <div className='w-full flex flex-col items-center justify-center gap-2'>
            <form.Field
              name="password"
              children={(field) => (
                <div className="flex flex-col gap-2 w-full">
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        setAuthError(null)
                        field.handleChange(e.target.value)
                      }}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className={`w-full h-12 bg-background/12 hover:bg-background/10 rounded-sm px-4 pr-10 text-secondary placeholder:text-secondary/50 placeholder:text-lg placeholder:font-normal tracking-wide focus-visible:outline-none focus-visible:border-secondary focus-visible:ring-secondary/50 transition-all ${authError
                        ? 'border-red-500/50 focus-visible:ring-red-500/50 focus-visible:border-red-500'
                        : 'border-transparent'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>

                  {field.state.value !== "" && field.state.meta.errors.length > 0 ? (
                    <p className="text-red-400 text-sm tracking-wide">
                      {field.state.meta.errors.map((p: any) => p?.message).join(', ')}
                    </p>
                  ) : null}

                  {authError && (
                    <p className="text-red-400 text-sm tracking-wide">
                      {authError}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <div className="w-full flex flex-col">
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className={`w-full h-12 bg-secondary/95 hover:bg-secondary rounded-sm text-black font-semibold text-lg transition-opacity ${!canSubmit || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                  size={'lg'}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'Unlock'}
                </Button>
              </div>
            )}
          />
        </form>

        <div
          className="text-secondary/70 text-lg cursor-pointer hover:text-secondary/90 transition-colors"
          onClick={() => setShowForgotPassword(true)}
        >
          Forgot password?
        </div>
      </div>

      <div
        className={`absolute inset-0 w-full h-full z-50 flex flex-col justify-end transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${showMenu ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div
          className="flex-1 w-full cursor-pointer"
          onClick={() => setShowMenu(false)}
        />
        <div className="w-full bg-taupe-950/95 backdrop-blur-md rounded-t-3xl flex flex-col items-center shadow-2xl gap-4 p-4">
          <div className="w-full flex flex-col items-center justify-center">
            <div className="w-12 h-1.5 bg-secondary/20 rounded-full" />
          </div>

          <div className='w-full '>
            <div className="w-full bg-secondary/10 backdrop-blur-lg flex flex-col gap-3 p-4 rounded-3xl">
              {menuOptions.map((option) => {
                const Icon = option.icon
                return (
                  <div
                    key={option.id}
                    onClick={option.action}
                    className='group flex items-center justify-between gap-4 p-2 rounded-xl border border-secondary/10 bg-secondary/5 cursor-pointer transition-all duration-300 hover:bg-secondary/10 hover:border-secondary/20 hover:scale-[1.02]'
                  >
                    <div className='flex items-center justify-start gap-3'>
                      <div className='flex items-center justify-center h-10 w-10 rounded-full bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-black transition-colors duration-300'>
                        <Icon size={20} />
                      </div>
                      <div className='flex flex-col items-start'>
                        <span className='text-lg font-semibold text-secondary'>
                          {option.label}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className='text-secondary/90 group-hover:text-secondary transition-colors duration-300' />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`absolute inset-0 w-full h-full z-50 flex flex-col justify-end transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${showForgotPassword ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div
          className="flex-1 w-full cursor-pointer"
          onClick={() => setShowForgotPassword(false)}
        />

        <div className="w-full bg-taupe-950/90 backdrop-blur-lg rounded-t-3xl flex flex-col items-center shadow-2xl gap-6 px-4 pt-4 pb-8">
          <div className="w-full flex flex-col items-center">
            <div className="w-12 h-1.5 bg-secondary/20 rounded-full" />
          </div>

          <div className="flex flex-col items-center justify-center max-w-sm gap-4 text-center">
            <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertTriangle size={32} className="text-red-500" />
            </div>

            <h2 className="text-2xl font-semibold text-secondary tracking-wide">
              Reset Wallet
            </h2>

            <p className="text-secondary/70 text-base leading-relaxed">
              Swoosh does not keep a copy of your password. If you forgot it, you must reset the extension and import your wallet again using your Secret Recovery Phrase.
            </p>

            <p className="text-red-400 text-sm font-medium">
              Warning: This will delete your current wallet data from this device.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <Button
              className="w-full h-12 bg-red-500 hover:bg-red-600 text-secondary font-semibold text-lg rounded-sm"
              onClick={handleResetWallet}
            >
              Reset Extension
            </Button>
            <Button
              className="w-full h-12 bg-transparent hover:bg-secondary/5 text-secondary font-semibold text-lg rounded-sm border border-secondary/20"
              onClick={() => setShowForgotPassword(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login