import React, { useState } from 'react'
import * as z from 'zod'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '../ui/input'
import { Eye, EyeOff } from 'lucide-react'

const SetupPassword = ({ setPassword, onNext }: { setPassword: (password: string) => void, onNext: () => void }) => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const formSchema = z.object({
        password: z.string().min(8, 'Password must be at least 8 characters long'),
        confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

    const form = useForm({
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
        validators: {
            onChange: formSchema,
        },
        onSubmit: async ({ value }) => {
            setPassword(value.password)
            onNext()
        },
    })

    return (
        <div className='w-full flex flex-1 flex-col items-center  justify-start p-5 gap-12'>
            <div className=' w-full flex flex-col items-center justify-center gap-4 max-w-[80%]'>
                <h2 className='text-2xl font-semibold text-secondary text-center'>Setup password</h2>
                <p className='text-secondary/80 tracking-wide text-center px-4'>
                    It should be at least 8 characters. You'll need this to unlock Swoosh.
                </p>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.handleSubmit()
                }}
                className="w-full flex flex-col items-center justify-between flex-1 "
            >
                <div className='w-full flex flex-col items-center justify-center gap-6'>

                    <form.Field
                        name="password"
                        children={(field) => (
                            <div className="flex flex-col gap-2 w-full">
                                <Label htmlFor={field.name} className="text-secondary/90 text-sm ">Password</Label>
                                <div className="relative">
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        type={showPassword ? "text" : "password"}
                                        className="w-full h-12 bg-background/12 hover:bg-background/10  rounded-sm px-4 pr-10 text-secondary placeholder:text-secondary/20 "
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="focus-visible:ring-primary/50 absolute right-3 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {field.state.value != "" && field.state.meta.errors.length > 0 ? (
                                    <p className="text-red-400 text-sm tracking-wide px-1">
                                        {field.state.meta.errors.map((p) => p?.message)}
                                    </p>
                                ) : null}
                            </div>
                        )}
                    />

                    <form.Field
                        name="confirmPassword"
                        children={(field) => (
                            <div className="flex flex-col gap-2 w-full">
                                <Label htmlFor={field.name} className="text-secondary/90 text-sm">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="w-full h-12 bg-background/12 hover:bg-background/10  rounded-sm px-4 pr-10 text-secondary placeholder:text-secondary/20 "
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary focus:outline-none"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {field.state.value != "" && field.state.meta.errors.length > 0 ? (
                                    <p className="text-red-400 text-sm tracking-wide px-1">
                                        {field.state.meta.errors.map((p) => p?.message)}
                                    </p>
                                ) : null}
                            </div>
                        )}
                    />

                </div>
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <div className="w-full mt-2">
                            <Button
                                type="submit"
                                disabled={!canSubmit}
                                className={`w-full h-13 bg-secondary/70 hover:bg-secondary/80 rounded-sm tracking-wide text-black font-semibold text-md transition-opacity ${!canSubmit ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                                size={'lg'}
                            >
                                {isSubmitting ? 'Setting up...' : 'Next'}
                            </Button>
                        </div>
                    )}
                />
            </form>
        </div>
    )
}

export default SetupPassword