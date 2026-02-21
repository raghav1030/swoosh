import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"

export const BalanceSkeleton = () => (
    <div className="flex items-center justify-center w-full pb-8">
        <Skeleton className="h-[48px] w-48 rounded-xl bg-secondary/10" />
    </div>
)

export const TokenRowSkeleton = () => (
    <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-secondary/10" />
            <div className="flex flex-col gap-2">
                <Skeleton className="h-3.5 w-20 bg-secondary/10" />
                <Skeleton className="h-2.5 w-12 bg-secondary/10" />
            </div>
        </div>
        <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-3.5 w-16 bg-secondary/10" />
            <Skeleton className="h-2.5 w-10 bg-secondary/10" />
        </div>
    </div>
)

export const TransactionRowSkeleton = () => (
    <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-secondary/10" />
            <div className="flex flex-col gap-2">
                <Skeleton className="h-3.5 w-24 bg-secondary/10" />
                <Skeleton className="h-2.5 w-16 bg-secondary/10" />
            </div>
        </div>
        <Skeleton className="h-4 w-16 bg-secondary/10" />
    </div>
)