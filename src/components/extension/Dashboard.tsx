import React from 'react'

const Dashboard = () => {
  const [open, setOpen] = React.useState(false)
  const [wallet, selectedWallet] = React.useState(null)
  const handleComboboxSelect = (value: string) => {
    console.log("Selected:", value)
  }
  return (
    <div className='w-full h-full flex flex-col items-center justify-center p-2'>
      <div className='w-full grid grid-cols-3'>
        <div className="flex flex-col gap-4">
        
        </div>
      </div>
    </div>
  )
}

export default Dashboard
