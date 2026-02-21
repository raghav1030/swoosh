import React from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

const EmptyState = ({ icon: Icon, title, description }: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full py-12 text-center animate-in fade-in duration-500">
            <div className="h-14 w-14 bg-secondary/5 rounded-full flex items-center justify-center mb-4">
                <Icon size={24} className="text-secondary/30" />
            </div>
            <h3 className="text-secondary font-semibold text-base mb-1">{title}</h3>
            <p className="text-secondary/40 text-sm max-w-[200px] leading-relaxed">
                {description}
            </p>
        </div>
    )
}

export default EmptyState