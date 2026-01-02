'use client'

import ButtonThird from '@/shared/Button/ButtonThird'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Radio, RadioField, RadioGroup } from '@/shared/radio'
import { useUser } from '@clerk/nextjs'
import { CreditCardPosIcon, Route02Icon, UserCircle02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import axios from 'axios'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type Tab = 'ContactInfo' | 'ShippingAddress' | 'PaymentMethod' | null

type IconSvgElement = React.ComponentProps<typeof HugeiconsIcon>['icon']

interface InformationProps {
  onUpdateUserInfo: (info: { 
    name: string; 
    lastName: string;
    phone: string; 
    address: string; 
    address1: string;
    email: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
  }) => void
  onUpdatePaymentMethod: (method: string) => void
  onUpdateValidation: (isValid: boolean) => void
}

export interface AddressDTO {
  billing_address_type: 'home' | 'office' | 'other'
  billing_customer_name: string
  billing_last_name: string
  billing_addressLine: string
  billing_city: string
  billing_state: string
  billing_country: string
  billing_pincode: string
}

export interface UserDTO {
  id: string
  clerkId: string
  billing_fullname: string
  email: string
  billing_phone: string
  billing_customer_gender: 'male' | 'female' | 'other'
  billing_customer_dob: string
  billing_address: AddressDTO[]
  wallet: { points: number }
  createdAt?: string
  updatedAt?: string
}

const Spinner = () => (
  <svg className="mr-2 -ml-1 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
)

const Information: React.FC<InformationProps> = ({ onUpdateUserInfo, onUpdatePaymentMethod, onUpdateValidation }) => {
  const [tabActive, setTabActive] = useState<Tab>('ContactInfo')
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<UserDTO | null>(null)
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0)
  const { user: clerkUser } = useUser()
  const [isContactInfoComplete, setIsContactInfoComplete] = useState(false)
  const [isShippingAddressComplete, setIsShippingAddressComplete] = useState(false)

  useEffect(() => {
    onUpdateValidation(isContactInfoComplete && isShippingAddressComplete)
  }, [isContactInfoComplete, isShippingAddressComplete, onUpdateValidation])

  useEffect(() => {
    if (userData) {
      const selectedAddress = userData.billing_address?.[selectedAddressIndex]
      onUpdateUserInfo({
        name: userData.billing_fullname || '',
        lastName: selectedAddress?.billing_last_name || '',
        phone: userData.billing_phone || '',
        email: userData.email || '',
        address: selectedAddress
          ? `${selectedAddress.billing_addressLine}, ${selectedAddress.billing_city}, ${selectedAddress.billing_state}`
          : '',
        address1: selectedAddress?.billing_addressLine || '',
        city: selectedAddress?.billing_city || '',
        state: selectedAddress?.billing_state || '',
        country: selectedAddress?.billing_country || '',
        zipcode: selectedAddress?.billing_pincode || '',
      })
      setIsShippingAddressComplete(!!selectedAddress)
    }
  }, [userData, selectedAddressIndex, onUpdateUserInfo])

  useEffect(() => {
    const fetchUserData = async () => {
      // Wait until Clerk has loaded the user
      if (!clerkUser) {
        setIsLoading(false)
        return
      }
      try {
        const response = await axios.get(`/api/users/${clerkUser.id}`)
        const user = response.data
        setUserData(response.data)
        if (user) {
          setIsContactInfoComplete(!!(user.billing_fullname && user.email && user.billing_phone))
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserData()
  }, [clerkUser])

  const handleUpdateUser = async (data: any) => {
    if (!userData?.clerkId) return
    try {
      // Merge new data with existing user data to prevent overwrites on the backend
      const updatedUserData = { ...userData, ...data }
      const response = await axios.put(`/api/users/${userData.clerkId}`, updatedUserData)
      setUserData(response.data.user)
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  const handleScrollToEl = (id: string) => {
    const element = document.getElementById(id)
    setTimeout(() => {
      element?.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-500 dark:border-neutral-700 dark:border-t-primary-500"></div>
        <p className="ml-3 text-lg text-neutral-600 dark:text-neutral-300">Loading Checkout...</p>
      </div>
    )
  }

  if (!userData) {
    return <p>Could not load user data. Please try again.</p>
  }

  const selectedAddress = userData.billing_address?.[selectedAddressIndex]

  console.log('userData.email, userData.billing_phone', userData.email, userData.billing_phone)

  return (
    <div className="space-y-6 font-family-roboto sm:space-y-8">
      <div
        id="ContactInfo"
        className="scroll-mt-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
      >
        <TabHeader
          title="Contact information"
          icon={UserCircle02Icon}
          value={[userData.billing_fullname, userData.email, userData.billing_phone]
            .filter(Boolean)
            .join(' / ')}
          isCompleted={isContactInfoComplete}
          onClickChange={() => {
            setTabActive('ContactInfo')
            handleScrollToEl('ContactInfo')
          }}
        />
        <div className={clsx('p-6', tabActive !== 'ContactInfo' && 'invisible hidden')}>
          <ContactInfo
            currentUser={userData}
            onUpdate={handleUpdateUser}
            onClose={() => {
              setTabActive(null)
            }}
            onValidationChange={setIsContactInfoComplete}
          />
        </div>
      </div>

      <div
        id="ShippingAddress"
        className="scroll-mt-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
      >
        <TabHeader
          title="Shipping address"
          icon={Route02Icon}
          value={
            selectedAddress
              ? `${selectedAddress.billing_addressLine}, ${selectedAddress.billing_city}, ${selectedAddress.billing_state}`
              : 'No address selected'
          }
          isCompleted={!!selectedAddress}
          disabled={!isContactInfoComplete}
          onClickChange={() => {
            if (!isContactInfoComplete) return
            setTabActive('ShippingAddress')
            handleScrollToEl('ShippingAddress')
          }}
        />
        <div className={clsx('p-6', tabActive !== 'ShippingAddress' && 'invisible hidden')}>
          <ShippingAddress
            currentUser={userData}
            onUpdate={handleUpdateUser}
            selectedAddressIndex={selectedAddressIndex}
            setSelectedAddressIndex={setSelectedAddressIndex}
            onClose={() => {
              setTabActive(null)
            }}
          />
        </div>
      </div>

      <div
        id="PaymentMethod"
        className="scroll-mt-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
      >
        <TabHeader
          title="Payment method"
          icon={CreditCardPosIcon}
          value="Prepaid/ COD"
          isCompleted={true}
          disabled={!isContactInfoComplete || !isShippingAddressComplete}
          onClickChange={() => {
            if (!isContactInfoComplete || !isShippingAddressComplete) return
            setTabActive('PaymentMethod')
            handleScrollToEl('PaymentMethod')
          }}
        />
        <div className={clsx('p-6', tabActive !== 'PaymentMethod' && 'invisible hidden')}>
          <PaymentMethod
            onClose={() => {
              setTabActive('ShippingAddress')
              handleScrollToEl('ShippingAddress')
            }}
            onUpdatePaymentMethod={onUpdatePaymentMethod}
            onUpdateValidation={onUpdateValidation}
          />
        </div>
      </div>
    </div>
  )
}

const TabHeader = ({
  title,
  icon,
  value,
  onClickChange,
  isCompleted,
  disabled,
}: {
  title: string
  icon: IconSvgElement
  value: string
  onClickChange: () => void
  isCompleted?: boolean
  disabled?: boolean
}) => {
  console.log('value', value)
  return (
    <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-700 dark:bg-neutral-800/50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={clsx('rounded-lg p-2', isCompleted ? 'bg-[#1B198F]' : 'bg-[#3086C8]')}>
            <HugeiconsIcon icon={icon} size={20} className="text-white" />
          </div>
          <div>
            <h3 className="flex items-center gap-3 font-family-antonio text-xl font-bold text-[#1B198F] uppercase dark:text-[#3086C8]">
              {title}
              {isCompleted && (
                <svg
                  className="h-6 w-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </h3>
            {value && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{value}</p>}
          </div>
        </div>
        <button
          className={clsx(
            'rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 hover:shadow-md dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600',
            disabled && 'cursor-not-allowed opacity-60'
          )}
          onClick={onClickChange}
          type="button"
          disabled={disabled}
        >
          Change
        </button>
      </div>
    </div>
  )
}

const ContactInfo = ({
  onClose,
  currentUser,
  onUpdate,
  onValidationChange,
}: {
  onClose: () => void
  currentUser: UserDTO
  onUpdate: (data: Partial<UserDTO>) => Promise<void>
  onValidationChange: (isValid: boolean) => void
}) => {
  const { isSignedIn } = useUser()
  const [fullName, setFullName] = useState(currentUser?.billing_fullname || '')
  const [phone, setPhone] = useState(currentUser?.billing_phone || '')
  const [email, setEmail] = useState(currentUser?.email || '')
  const [fullNameError, setFullNameError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    onValidationChange(!!(fullName && phone && email))
  }, [fullName, phone, email, onValidationChange])

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value)
    if (fullNameError && e.target.value) {
      setFullNameError('')
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value)
    if (phoneError && e.target.value) {
      setPhoneError('')
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (emailError && e.target.value) {
      setEmailError('')
    }
  }

  const validateFullName = () => {
    if (!fullName) {
      setFullNameError('Full name is required.')
      return false
    }
    setFullNameError('')
    return true
  }

  const validatePhone = () => {
    if (!phone) {
      setPhoneError('Phone number is required.')
      return false
    }
    const phoneRegex = /^(?:\d{10}|(?:\+91|91)\d{10})$/
    if (!phoneRegex.test(phone)) {
      setPhoneError('Phone number should be 10 digits without +91 or 12 digits with +91.')
      return false
    }
    setPhoneError('')
    return true
  }

  const validateEmail = () => {
    if (!email) {
      setEmailError('Email is required.')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.')
      return false
    }
    setEmailError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const isFullNameValid = validateFullName()
    const isPhoneValid = validatePhone()
    const isEmailValid = validateEmail()

    if (!isFullNameValid || !isPhoneValid || !isEmailValid) {
      return
    }

    setIsLoading(true)
    try {
      await onUpdate({
        billing_fullname: fullName,
        billing_phone: phone,
        email: email,
      })
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action="#" method="POST" onSubmit={handleSubmit}>
      <Fieldset>
        <FieldGroup className="mt-0!">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-family-antonio text-lg font-bold text-[#1B198F] uppercase dark:text-[#3086C8]">
              Contact information
            </h3>
            {!isSignedIn && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Already have an account?{' '}
                <Link className="font-medium text-[#3086C8] hover:underline" href="/sign-in?redirect_url=/checkout">
                  Log in
                </Link>
              </p>
            )}
          </div>
          <Field className="max-w-lg">
            <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              <span className="text-[#3086C8]">●</span> Full name
            </Label>
            <Input
              value={fullName}
              onChange={handleFullNameChange}
              onBlur={validateFullName}
              type="text"
              name="fullname"
              required
              placeholder="John Doe"
              className={clsx(
                'rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700',
                fullNameError ? 'border-red-500' : ''
              )}
            />
            {fullNameError && <p className="mt-1.5 text-sm font-medium text-red-600">{fullNameError}</p>}
          </Field>
          <Field className="max-w-lg">
            <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              <span className="text-[#3086C8]">●</span> Your phone number
            </Label>
            <Input
              value={phone}
              onChange={handlePhoneChange}
              onBlur={validatePhone}
              type="tel"
              name="phone"
              required
              className={clsx(
                'rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700',
                phoneError ? 'border-red-500' : ''
              )}
            />
            {phoneError && <p className="mt-1.5 text-sm font-medium text-red-600">{phoneError}</p>}
          </Field>
          <Field className="max-w-lg">
            <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              <span className="text-[#3086C8]">●</span> Email address
            </Label>
            <Input
              value={email}
              onChange={handleEmailChange}
              onBlur={validateEmail}
              type="email"
              name="email"
              required
              className={clsx(
                'rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700',
                emailError ? 'border-red-500' : ''
              )}
            />
            {emailError && <p className="mt-1.5 text-sm font-medium text-red-600">{emailError}</p>}
          </Field>
          <Field>
            <Label className="text-sm text-neutral-600 dark:text-neutral-400">
              We'll use this information to contact you about your order.
            </Label>
          </Field>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative overflow-hidden rounded-xl bg-linear-to-r from-[#1B198F] to-[#3086C8] px-8 py-3 font-family-antonio text-lg font-bold tracking-wide text-white uppercase shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? <Spinner /> : null}
              {isLoading ? 'Updating...' : 'Continue to Shipping'}
            </button>
            <ButtonThird type="button" onClick={onClose}>
              Cancel
            </ButtonThird>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}

const ShippingAddress = ({
  onClose,
  currentUser,
  onUpdate,
  selectedAddressIndex,
  setSelectedAddressIndex,
}: {
  onClose: () => void
  currentUser: UserDTO
  onUpdate: (data: Partial<UserDTO>) => Promise<void>
  selectedAddressIndex: number
  setSelectedAddressIndex: (index: number) => void
}) => {
  const [isAddingNew, setIsAddingNew] = useState(!currentUser?.billing_address?.length)
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null)
  const [tempSelectedIndex, setTempSelectedIndex] = useState(selectedAddressIndex)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (data: any) => {
    const newErrors: Record<string, string> = {}
    if (!data.billing_customer_name?.trim()) newErrors.firstName = 'First name is required'
    if (!data.billing_last_name?.trim()) newErrors.lastName = 'Last name is required'
    if (!data.billing_addressLine?.trim()) newErrors.address = 'Address is required'
    if (!data.billing_city?.trim()) newErrors.city = 'City is required'
    if (!data.billing_country?.trim()) newErrors.country = 'Country is required'
    if (!data.billing_state?.trim()) newErrors.state = 'State/Province is required'
    if (!data.billing_pincode?.trim()) {
      newErrors.zip = 'Postal code is required'
    } else if (!/^\d+$/.test(data.billing_pincode.trim())) {
      newErrors.zip = 'Postal code must contain only numbers'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formValues = Object.fromEntries(new FormData(e.target as HTMLFormElement))
    const addressData: AddressDTO = {
      billing_address_type: formValues['address-type'] as any,
      billing_customer_name: formValues['first-name'] as string,
      billing_last_name: formValues['last-name'] as string,
      billing_addressLine: formValues['address'] as string,
      billing_city: formValues['city'] as string,
      billing_state: formValues['state-province'] as string,
      billing_country: formValues['country'] as string,
      billing_pincode: formValues['postal-code'] as string,
    }

    if (!validate(addressData)) return

    setIsLoading(true)
    try {
      if (isAddingNew) {
        // Create new billing_address array with the new address appended
        const updatedAddresses = [...(currentUser?.billing_address || []), addressData]
        await onUpdate({ billing_address: updatedAddresses })

        // Update local state
        const newLength = updatedAddresses.length
        setTempSelectedIndex(newLength - 1)
        setSelectedAddressIndex(newLength - 1)
        setIsAddingNew(false)
      } else if (editingAddressIndex !== null) {
        const updatedAddresses = [...(currentUser?.billing_address || [])]
        updatedAddresses[editingAddressIndex] = addressData
        await onUpdate({ billing_address: updatedAddresses })
        setEditingAddressIndex(null)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    // Only update if selection has changed
    if (tempSelectedIndex !== selectedAddressIndex) {
      setSelectedAddressIndex(tempSelectedIndex)
    }
    onClose()
  }

  const addressToEdit = editingAddressIndex !== null ? currentUser?.billing_address?.[editingAddressIndex] : null
  const showForm = isAddingNew || editingAddressIndex !== null

  // Form for adding or editing an address
  if (showForm) {
    const existingTypes = currentUser?.billing_address?.map((a) => a.billing_address_type) || []
    const isHomeDisabled =
      existingTypes.includes('home') && (isAddingNew || addressToEdit?.billing_address_type !== 'home')
    const isOfficeDisabled =
      existingTypes.includes('office') && (isAddingNew || addressToEdit?.billing_address_type !== 'office')
    const defaultType = addressToEdit?.billing_address_type || (isHomeDisabled ? 'office' : 'home')

    return (
      <form onSubmit={handleSaveAddress}>
        <Fieldset>
          <h3 className="font-family-antonio text-lg font-bold text-[#1B198F] uppercase dark:text-[#3086C8]">
            {isAddingNew ? 'Add a new address' : 'Edit address'}
          </h3>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
              <Field>
                <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  <span className="text-[#3086C8]">●</span> Recipient first name
                </Label>
                <Input
                  placeholder="John"
                  type="text"
                  name="first-name"
                  defaultValue={addressToEdit?.billing_customer_name}
                  className={clsx(
                    'rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700',
                    errors.firstName ? 'border-red-500' : ''
                  )}
                  onChange={() => setErrors((prev) => ({ ...prev, firstName: '' }))}
                />
                {errors.firstName && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.firstName}</p>}
              </Field>
              <Field>
                <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  <span className="text-[#3086C8]">●</span> Recipient last name
                </Label>
                <Input
                  placeholder="Doe"
                  type="text"
                  name="last-name"
                  defaultValue={addressToEdit?.billing_last_name}
                  className={clsx(
                    'rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700',
                    errors.lastName ? 'border-red-500' : ''
                  )}
                  onChange={() => setErrors((prev) => ({ ...prev, lastName: '' }))}
                />
                {errors.lastName && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.lastName}</p>}
              </Field>
            </div>
            <Field>
              <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                <span className="text-[#3086C8]">●</span> Address
              </Label>
              <Input
                placeholder="123 Dream Avenue"
                type="text"
                name="address"
                defaultValue={addressToEdit?.billing_addressLine}
                className={clsx(
                  'rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700',
                  errors.address ? 'border-red-500' : ''
                )}
                onChange={() => setErrors((prev) => ({ ...prev, address: '' }))}
              />
              {errors.address && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.address}</p>}
            </Field>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
              <Field>
                <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  <span className="text-[#3086C8]">●</span> City
                </Label>
                <Input
                  placeholder="Mumbai"
                  type="text"
                  name="city"
                  defaultValue={addressToEdit?.billing_city}
                  className={clsx(
                    'rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700',
                    errors.city ? 'border-red-500' : ''
                  )}
                  onChange={() => setErrors((prev) => ({ ...prev, city: '' }))}
                />
                {errors.city && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.city}</p>}
              </Field>
              <Field>
                <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  <span className="text-[#3086C8]">●</span> Country
                </Label>
                <Input
                  placeholder="India"
                  type="text"
                  name="country"
                  defaultValue={addressToEdit?.billing_country}
                  className={clsx(
                    'rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700',
                    errors.country ? 'border-red-500' : ''
                  )}
                  onChange={() => setErrors((prev) => ({ ...prev, country: '' }))}
                />
                {errors.country && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.country}</p>}
              </Field>
              <Field>
                <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  <span className="text-[#3086C8]">●</span> State / Province
                </Label>
                <Input
                  placeholder="Maharashtra"
                  type="text"
                  name="state-province"
                  defaultValue={addressToEdit?.billing_state}
                  className={clsx(
                    'rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700',
                    errors.state ? 'border-red-500' : ''
                  )}
                  onChange={() => setErrors((prev) => ({ ...prev, state: '' }))}
                />
                {errors.state && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.state}</p>}
              </Field>
              <Field>
                <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  <span className="text-[#3086C8]">●</span> Postal code
                </Label>
                <Input
                  placeholder="400001"
                  type="text"
                  name="postal-code"
                  defaultValue={addressToEdit?.billing_pincode}
                  className={clsx(
                    'rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700',
                    errors.zip ? 'border-red-500' : ''
                  )}
                  onChange={() => setErrors((prev) => ({ ...prev, zip: '' }))}
                />
                {errors.zip && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.zip}</p>}
              </Field>
            </div>
            <Field>
              <Label className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Address Type</Label>
              <RadioGroup name="address-type" defaultValue={defaultType}>
                <RadioField>
                  <Radio value="home" disabled={isHomeDisabled} />
                  <Label>Home</Label>
                </RadioField>
                <RadioField>
                  <Radio value="office" disabled={isOfficeDisabled} />
                  <Label>Office</Label>
                </RadioField>
                <RadioField>
                  <Radio value="other" />
                  <Label>Other</Label>
                </RadioField>
              </RadioGroup>
            </Field>
            <div className="flex flex-wrap gap-2.5 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative overflow-hidden rounded-xl bg-linear-to-r from-[#1B198F] to-[#3086C8] px-8 py-3 font-family-antonio text-lg font-bold tracking-wide text-white uppercase shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? <Spinner /> : null}
                {isLoading ? 'Saving...' : 'Save Address'}
              </button>
              <ButtonThird
                type="button"
                onClick={() => {
                  setIsAddingNew(false)
                  setEditingAddressIndex(null)
                  setErrors({})
                }}
              >
                Cancel
              </ButtonThird>
            </div>
          </FieldGroup>
        </Fieldset>
      </form>
    )
  }

  // View for selecting an existing address
  return (
    <div className="space-y-6">
      <h3 className="font-family-antonio text-lg font-bold text-[#1B198F] uppercase dark:text-[#3086C8]">
        Choose a shipping address
      </h3>
      <RadioGroup value={String(tempSelectedIndex)} onChange={(val) => setTempSelectedIndex(Number(val))}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {currentUser?.billing_address?.map((address, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-xl border-2 border-neutral-200 bg-linear-to-br from-white to-neutral-50 p-4 shadow-sm transition-all hover:shadow-md dark:border-neutral-700 dark:from-neutral-800 dark:to-neutral-800/50"
            >
              <RadioField>
                <Radio value={String(index)} />
                <Label className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-[#3086C8]/10 px-2.5 py-0.5 text-xs font-bold text-[#3086C8] uppercase">
                      {address.billing_address_type}
                    </span>
                  </div>
                  {(address.billing_customer_name || address.billing_last_name) && (
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {address.billing_customer_name} {address.billing_last_name}
                    </p>
                  )}
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {address.billing_addressLine}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {address.billing_city}, {address.billing_state} {address.billing_pincode}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{address.billing_country}</p>
                </Label>
              </RadioField>
              <button
                type="button"
                onClick={() => {
                  setEditingAddressIndex(index)
                  setErrors({})
                }}
                className="absolute top-3 right-3 rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs font-semibold text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </RadioGroup>

      <ButtonThird
        type="button"
        onClick={() => {
          setIsAddingNew(true)
          setErrors({})
        }}
      >
        + Add a new address
      </ButtonThird>

      <div className="flex flex-wrap gap-2.5 pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="group relative overflow-hidden rounded-xl bg-linear-to-r from-[#1B198F] to-[#3086C8] px-8 py-3 font-family-antonio text-lg font-bold tracking-wide text-white uppercase shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
        >
          Submit
        </button>
        <ButtonThird type="button" onClick={onClose}>
          Cancel
        </ButtonThird>
      </div>
    </div>
  )
}

const PaymentMethod = ({
  onClose,
  onUpdatePaymentMethod,
}: {
  onClose: () => void
  onUpdatePaymentMethod: (method: string) => void
  onUpdateValidation: (isValid: boolean) => void
}) => {
  const [methodActive, setMethodActive] = useState<'Prepaid' | 'COD'>('Prepaid')
  const [isLoading, setIsLoading] = useState(false)

  const renderPrepaid = () => {
    const active = methodActive === 'Prepaid'
    return (
      <div>
        <RadioGroup
          name="payment-method"
          aria-label="Payment method"
          onChange={(e) => setMethodActive(e as any)}
          value={methodActive}
        >
          <RadioField className="sm:gap-x-6">
            <Radio className="pt-3" value="Prepaid" defaultChecked={active} />
            <Label className="flex-1">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#3086C8]/10 p-2">
                  <svg className="h-5 w-5 text-[#3086C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Prepaid (Online Payment)</span>
              </div>
            </Label>
          </RadioField>
        </RadioGroup>

        <div className={clsx('space-y-5 py-6 sm:pl-10', active ? 'block' : 'hidden')}>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            You will be redirected to a secure payment gateway to complete your payment via Credit/Debit Card, UPI, or
            NetBanking.
          </p>
        </div>
      </div>
    )
  }

  const renderCOD = () => {
    const active = methodActive === 'COD'
    return (
      <div>
        <RadioGroup
          name="payment-method"
          aria-label="Payment method"
          onChange={(e) => setMethodActive(e as any)}
          value={methodActive}
        >
          <RadioField className="sm:gap-x-6">
            <Radio className="pt-3" value="COD" defaultChecked={active} />
            <Label className="flex-1">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#1B198F]/10 p-2">
                  <svg className="h-5 w-5 text-[#1B198F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Cash on Delivery (COD)</span>
              </div>
            </Label>
          </RadioField>
        </RadioGroup>

        <div className={clsx('py-6 sm:pl-10', active ? 'block' : 'hidden')}>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Pay with cash upon delivery.</p>
        </div>
      </div>
    )
  }

  return (
    <form
      action="#"
      method="POST"
      onSubmit={async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
          onUpdatePaymentMethod(methodActive)
          onClose()
        } finally {
          setIsLoading(false)
        }
      }}
    >
      <Fieldset>
        <FieldGroup className="mt-0!">
          {renderPrepaid()}
          {renderCOD()}

          <div className="flex flex-wrap gap-2.5 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative overflow-hidden rounded-xl bg-linear-to-r from-[#1B198F] to-[#3086C8] px-8 py-3 font-family-antonio text-lg font-bold tracking-wide text-white uppercase shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? <Spinner /> : null}
              {isLoading ? 'Confirming...' : 'Confirm Payment Method'}
            </button>
            <ButtonThird type="button" onClick={onClose}>
              Back
            </ButtonThird>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}

export default Information
