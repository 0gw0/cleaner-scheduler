import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle body scroll lock when the modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Adding transition classes when modal opens/closes
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.classList.remove('opacity-0', 'scale-95')
      modalRef.current.classList.add('opacity-100', 'scale-100')
    } else if (modalRef.current) {
      modalRef.current.classList.remove('opacity-100', 'scale-100')
      modalRef.current.classList.add('opacity-0', 'scale-95')
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out">
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl mx-auto my-6 transition-all duration-300 ease-in-out transform opacity-0 scale-95"
      >
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          <div className="flex items-center justify-between p-5 border-b border-solid border-gray-200 rounded-t">
            <h3 className="text-xl font-bold text-gray-800">Task Details</h3>
            <Button
              variant="ghost"
              onClick={onClose}
              className="p-1 text-black float-right text-2xl leading-none font-semibold outline-none focus:outline-none"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative p-6 flex-auto text-gray-700">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Modal
