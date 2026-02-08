import React from 'react'
import { Link } from 'react-router'

const SocialCard = ({ link, icon, label }: { link: string, icon: React.ReactNode, label: string }) => {
    return (
        <Link to={link} target='_blank'>
            <div className='h-20 w-full px-4 rounded-md bg-background/5 hover:bg-background/2 cursor-pointer  flex flex-col items-start justify-center p-2 gap-1 ' >
                {icon}
                <p className='text-secondary/80 text-sm'>{label}</p>
            </div>
        </Link>
    )
}

export default SocialCard