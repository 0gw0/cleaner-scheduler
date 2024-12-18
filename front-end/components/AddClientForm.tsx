import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, X, Check, Trash } from 'lucide-react'
import axios from 'axios'

type Property = {
  address: string
  postalCode: string
  client: number
}

type ClientData = {
  name: string
  properties: Property[]
}

type ClientResponse = {
  id: number
  name: string
  status: string
  properties: Property[]
}


interface Client extends ClientResponse {}

interface AddClientFormProps {

  onClientAdded: (client: Client) => void;

}

const initialClientData: ClientData = {
  name: '',
  properties: [{ address: '', postalCode: '', client: 0 }],
}

export default function AddClientForm({ onClientAdded }: AddClientFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<ClientData>(initialClientData)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const isValid = formData.name.trim() !== '' &&
      formData.properties.every(
        (prop) => prop.address.trim() !== '' && prop.postalCode.trim() !== ''
      )
    setIsFormValid(isValid)
  }, [formData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const { name, value } = e.target
    if (index !== undefined) {
      const newProperties = [...formData.properties]
      newProperties[index] = { ...newProperties[index], [name]: value }
      setFormData({ ...formData, properties: newProperties })
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const addProperty = () => {
    setFormData((prev) => ({
      ...prev,
      properties: [...prev.properties, { address: '', postalCode: '', client: 0 }],
    }))
  }

  const removeProperty = (index: number) => {
    if (formData.properties.length > 1) {
      setFormData((prev) => ({
        ...prev,
        properties: prev.properties.filter((_, i) => i !== index),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Create client first
      const clientResponse = await axios.post<ClientResponse>('http://localhost:8080/clients', {
        name: formData.name
      })

      const clientId = clientResponse.data.id

      // Create all properties for the client
      const propertyPromises = formData.properties.map(property => 
        axios.post('http://localhost:8080/properties', {
          address: property.address,
          postalCode: property.postalCode,
          clientId: clientId
        })
      )

      const propertyResponses = await Promise.all(propertyPromises)
      
      // Construct the complete client object with properties
      const newClient: ClientResponse = {
        ...clientResponse.data,
        properties: propertyResponses.map(response => response.data)
      }

      // Call the callback to update the parent component
      onClientAdded(newClient)

      setShowSuccess(true)
      
      // Reset and close form after success
      setTimeout(() => {
        setIsOpen(false)
        setShowSuccess(false)
        setFormData(initialClientData)
      }, 1500)
    } catch (err) {
      console.error('Error creating client:', err)
      setError('Failed to create client. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeForm = () => {
    setIsOpen(false)
    setError(null)
    setFormData(initialClientData)
  }

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
        <Plus size={16} />
        Add a new client
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md relative"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{showSuccess ? 'Client Added!' : 'Add Client'}</CardTitle>
                  <CardDescription>
                    {showSuccess ? 'The client has been successfully added.' : 'Enter the client and property details.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    {!showSuccess ? (
                      <>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Client Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                            />
                          </div>

                          {formData.properties.map((property, index) => (
                            <div key={index} className="space-y-2 border p-4 rounded-lg">
                              <h3 className="font-semibold">Property {index + 1}</h3>
                              <div>
                                <Label htmlFor={`address-${index}`}>Address</Label>
                                <Input
                                  id={`address-${index}`}
                                  name="address"
                                  value={property.address}
                                  onChange={(e) => handleInputChange(e, index)}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor={`postalCode-${index}`}>Postal Code</Label>
                                <Input
                                  id={`postalCode-${index}`}
                                  name="postalCode"
                                  value={property.postalCode}
                                  onChange={(e) => handleInputChange(e, index)}
                                  pattern="[0-9]*"
                                  maxLength={6}
                                  required
                                />
                              </div>
                              {formData.properties.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => removeProperty(index)}
                                  className="mt-2"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Remove Property
                                </Button>
                              )}
                            </div>
                          ))}

                          <Button type="button" onClick={addProperty} className="mt-4 w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Property
                          </Button>
                        </div>

                        <Button 
                          type="submit" 
                          className="mt-4 w-full"
                          disabled={!isFormValid || isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'Confirm'}
                          {!isSubmitting && <Check className="ml-2 h-4 w-4" />}
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <p className="text-lg font-semibold mb-2">Client Added Successfully!</p>
                        <p className="text-sm text-gray-500">You will be redirected shortly.</p>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>

              <button
                onClick={closeForm}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}