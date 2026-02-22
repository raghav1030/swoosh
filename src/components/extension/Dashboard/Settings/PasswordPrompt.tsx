import React, { useState } from 'react'
import * as z from 'zod'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useWalletStore } from '@/store/useWalletStore'
import CryptoJS from 'crypto-js'

interface PasswordPromptProps {
    onSuccess: () => void;
}

export const PasswordPrompt = ({ onSuccess }: PasswordPromptProps) => {
    const [showPassword, setShowPassword] = useState(false)
    const [authError, setAuthError] = useState<string | null>(null)
    const [isVerifying, setIsVerifying] = useState(false)

    const formSchema = z.object({
        password: z.string().min(1, "Password is required")
    })

    const form = useForm({
        defaultValues: { password: '' },
        validators: { onChange: formSchema },
        onSubmit: async ({ value }) => {
            setAuthError(null)
            setIsVerifying(true)

            try {
                let isValid = false;
                const storePassword = useWalletStore.getState().password;

                if (storePassword && value.password === storePassword) {
                    isValid = true;
                } else if (window.chrome && window.chrome.storage) {
                    const storageData = await chrome.storage.local.get(['encryptedMnemonic']);
                    if (storageData.encryptedMnemonic) {
                        const bytes = CryptoJS.AES.decrypt(storageData.encryptedMnemonic, value.password);
                        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                        if (decrypted) isValid = true;
                    }
                }

                if (isValid) {
                    form.reset()
                    onSuccess()
                } else {
                    setAuthError("Incorrect password. Please try again.")
                }
            } catch (error) {
                setAuthError("Incorrect password. Please try again.")
            } finally {
                setIsVerifying(false)
            }
        },
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
            }}
            className="flex flex-col w-full p-6 gap-6 pb-8"
        >
            <div className="flex flex-col gap-2">
                <p className="text-sm text-white/50">Verify it's you to reveal sensitive information.</p>
            </div>

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
                                className={`w-full h-12 bg-white/5 hover:bg-white/10 rounded-sm px-4 pr-10 text-white placeholder:text-white/30 tracking-wide focus:border-secondary ${authError ? 'border-red-500/50 focus-visible:ring-red-500/50' : 'border-white/10'}`}
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="focus-visible:ring-primary/50 absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {field.state.value !== "" && field.state.meta.errors.length > 0 && (
                            <p className="text-red-400 text-sm tracking-wide">
                                {field.state.meta.errors.map((p: any) => p?.message).join(', ')}
                            </p>
                        )}

                        {authError && (
                            <p className="text-red-400 text-sm tracking-wide">
                                {authError}
                            </p>
                        )}
                    </div>
                )}
            />

            <div className="mt-4">
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button
                            type="submit"
                            disabled={!canSubmit || isSubmitting || isVerifying}
                            className={`w-full h-12 bg-secondary/95 hover:bg-secondary rounded-sm text-black font-semibold text-lg transition-opacity ${!canSubmit || isSubmitting || isVerifying ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                        >
                            {isVerifying ? <Loader2 className="animate-spin" /> : 'Confirm'}
                        </Button>
                    )}
                />
            </div>
        </form>
    )
}