const Stepper = ({ step, totalSteps }: { step: number, totalSteps: number }) => {
    return (
        <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? 'bg-primary' : 'bg-primary/30'}`} />
            ))}
        </div>
    )
}

export default Stepper