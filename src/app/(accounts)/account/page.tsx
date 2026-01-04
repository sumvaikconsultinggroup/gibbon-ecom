'use client'

import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import { Field, Fieldset, Label } from '@/shared/fieldset'
import { Input, InputGroup } from '@/shared/input'
import { Select } from '@/shared/select'
import { Calendar01Icon, Mail01Icon, MapsLocation01Icon, SmartPhone01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useUser, useAuth } from '@/context/UserAuthContext'
import { zodResolver } from '@hookform/resolvers/zod'

import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
import React, { useEffect, useState } from 'react'
import { z } from 'zod'

// Zod validation schema matching the new billing-safe schema
const addressSchema = z.object({
  billing_address_type: z.enum(['home', 'office', 'other']),
  billing_customer_name: z.string().min(1, 'First name is required').trim(),
  billing_last_name: z.string().min(1, 'Last name is required').trim(),
  billing_addressLine: z.string().min(1, 'Address line is required').trim(),
  billing_city: z.string().min(1, 'City is required').trim(),
  billing_state: z.string().min(1, 'State is required').trim(),
  billing_country: z.string().min(1, 'Country is required').trim(),
  billing_pincode: z.string().min(1, 'Pincode is required').trim(),
})

const userSchema = z.object({
  billing_fullname: z.string().min(1, 'Full name is required').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  billing_phone: z.string().min(1, 'Phone number is required').trim(),
  billing_customer_dob: z.string().min(1, 'Date of birth is required'),
  billing_customer_gender: z.enum(['male', 'female', 'other']),
  billing_address: z.array(addressSchema).min(1, 'At least one address is required'),
})

type UserFormData = z.infer<typeof userSchema>

const Page = () => {
  const { user, isSignedIn, isLoaded } = useUser()
  const { signOut } = useAuth()
  const router = useRouter()
  const userId = user?.id

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      billing_fullname: '',
      email: '',
      billing_phone: '',
      billing_customer_dob: '',
      billing_customer_gender: 'male',
      billing_address: [
        {
          billing_address_type: 'home',
          billing_customer_name: '',
          billing_last_name: '',
          billing_addressLine: '',
          billing_city: '',
          billing_state: '',
          billing_country: '',
          billing_pincode: ''
        },
      ],
    },
  })

  const [isLoading, setIsLoading] = useState(true)
  const [userExists, setUserExists] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/account')
    }
  }, [isSignedIn, isLoaded, router])

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isSignedIn || !userId) {
        setIsLoading(false)
        return
      }

      try {
        const response = await axios.get(`/api/users/${userId}`)
        const userData = response.data

        if (userData) {
          setUserExists(true)
          reset({
            billing_fullname: userData.billing_fullname || '',
            email: userData.email || '',
            billing_phone: userData.billing_phone || '',
            billing_customer_dob: userData.billing_customer_dob ? new Date(userData.billing_customer_dob).toISOString().split('T')[0] : '',
            billing_customer_gender: userData.billing_customer_gender || 'male',
            billing_address: userData.billing_address && userData.billing_address.length > 0 ? userData.billing_address : [
              {
                billing_address_type: 'home',
                billing_customer_name: '',
                billing_last_name: '',
                billing_addressLine: '',
                billing_city: '',
                billing_state: '',
                billing_country: '',
                billing_pincode: ''
              }
            ],
          })
        } else {
          setUserExists(false)
          reset({
            billing_fullname: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
            email: user?.emailAddresses[0]?.emailAddress || '',
            billing_phone: user?.phoneNumbers[0]?.phoneNumber || '',
            billing_customer_dob: '',
            billing_customer_gender: 'male',
            billing_address: [
              {
                billing_address_type: 'home',
                billing_customer_name: user?.firstName || '',
                billing_last_name: user?.lastName || '',
                billing_addressLine: '',
                billing_city: '',
                billing_state: '',
                billing_country: '',
                billing_pincode: ''
              }
            ],
          })
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)

        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setUserExists(false)
          reset({
            billing_fullname: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
            email: user?.emailAddresses[0]?.emailAddress || '',
            billing_phone: user?.phoneNumbers[0]?.phoneNumber || '',
            billing_customer_dob: '',
            billing_customer_gender: 'male',
            billing_address: [
              {
                billing_address_type: 'home',
                billing_customer_name: user?.firstName || '',
                billing_last_name: user?.lastName || '',
                billing_addressLine: '',
                billing_city: '',
                billing_state: '',
                billing_country: '',
                billing_pincode: ''
              }
            ],
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (isSignedIn && userId && user) {
      fetchUserData()
    }
  }, [isSignedIn, userId, user, reset])

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'billing_address',
  })

  const onSubmit = async (data: UserFormData) => {
    if (!isSignedIn || !userId) {
      alert('You must be signed in to update your account.')
      router.push('/sign-in?redirect_url=/account')
      return
    }

    try {
      const payload = {
        ...data,
        billing_customer_dob: new Date(data.billing_customer_dob).toISOString(),
      }

      let response

      if (userExists) {
        response = await axios.put(`/api/users/${userId}`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } else {
        console.log("the current payload which is going ",payload)
        response = await axios.post(`/api/users`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        setUserExists(true)
      }

      console.log('Success:', response.data)
      alert(userExists ? 'Account updated successfully!' : 'Account created successfully!')
    } catch (error) {
      console.error('Error updating account:', error)
      if (axios.isAxiosError(error)) {
        alert(`Error: ${error.response?.data?.message || error.message}`)
      } else {
        alert('An error occurred while updating the account')
      }
    }
  }

  const addAddress = () => {
    append({
      billing_address_type: 'other',
      billing_customer_name: '',
      billing_last_name: '',
      billing_addressLine: '',
      billing_city: '',
      billing_state: '',
      billing_country: '',
      billing_pincode: ''
    })
  }

  const removeAddress = async (index: number) => {
    if (fields.length <= 1) return

    const confirmed = window.confirm('Are you sure you want to remove this address?')
    if (!confirmed) return

    if (!userExists || !isSignedIn || !userId) {
      remove(index)
      return
    }

    try {
      const currentAddresses = fields.map((field) => ({
        billing_address_type: field.billing_address_type,
        billing_customer_name: field.billing_customer_name,
        billing_last_name: field.billing_last_name,
        billing_addressLine: field.billing_addressLine,
        billing_city: field.billing_city,
        billing_state: field.billing_state,
        billing_country: field.billing_country,
        billing_pincode: field.billing_pincode,
      }))

      const updatedAddresses = currentAddresses.filter((_, i) => i !== index)

      const response = await axios.put(`/api/users/${userId}`, {
        billing_address: updatedAddresses,
      })

      if (response.status === 200) {
        remove(index)
        alert('Address removed successfully')
      }
    } catch (error) {
      console.error('Error removing address:', error)
      if (axios.isAxiosError(error)) {
        alert(`Error: ${error.response?.data?.error || error.message}`)
      } else {
        alert('Failed to remove address')
      }
    }
  }

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-12 animate-spin rounded-full border-4 border-[#E3F2FD] border-t-[#3086C8]"></div>
        <p className="ml-3 font-family-roboto text-lg font-medium text-neutral-700 dark:text-neutral-300">Loading...</p>
      </div>
    )
  }

  // Show loading while fetching user data
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-12 animate-spin rounded-full border-4 border-[#E3F2FD] border-t-[#3086C8]"></div>
        <p className="ml-3 font-family-roboto text-lg font-medium text-neutral-700 dark:text-neutral-300">Loading your account...</p>
      </div>
    )
  }

  // Redirect message for unauthenticated users
  if (!isSignedIn) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="mb-4 font-family-roboto text-lg text-neutral-600 dark:text-neutral-300">
            Please sign in to access your account.
          </p>
          <ButtonPrimary onClick={() => router.push('/sign-in?redirect_url=/account')}>
            Sign In
          </ButtonPrimary>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-family-roboto">
      {/* Status Badge */}
      {!userExists && (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-[#3086C8] bg-[#E3F2FD]/50 p-4 dark:border-[#3086C8]/50 dark:bg-[#3086C8]/10">
          <svg className="h-6 w-6 shrink-0 text-[#3086C8]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold text-[#1B198F] dark:text-[#3086C8]">Complete Your Profile</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Fill in your information to get started</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Fieldset disabled={!isSignedIn}>
          {/* Personal Information Card */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800">
            <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-700 dark:bg-neutral-800/50">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#3086C8] p-2">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="font-family-antonio text-xl font-bold uppercase text-[#1B198F] dark:text-[#3086C8]">
                  Personal Information
                </h2>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* Full Name Field */}
              <Field>
                <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  <span className="text-[#3086C8]">●</span> Full name
                </Label>
                <Input
                  {...register('billing_fullname')}
                  placeholder="John Doe"
                  className="rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700"
                />
                {errors.billing_fullname && (
                  <p className="mt-1.5 text-sm font-medium text-red-600">{errors.billing_fullname.message}</p>
                )}
              </Field>

              {/* Email */}
              <Field>
                <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  <span className="text-[#3086C8]">●</span> Email
                </Label>
                <InputGroup className="rounded-lg border-2 border-neutral-200 focus-within:border-[#3086C8] focus-within:ring-2 focus-within:ring-[#3086C8]/20 dark:border-neutral-600">
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="example@email.com"
                    className="border-0 px-4 py-2.5 focus:ring-0 dark:bg-neutral-700"
                  />
                </InputGroup>
                {errors.email && (
                  <p className="mt-1.5 text-sm font-medium text-red-600">{errors.email.message}</p>
                )}
              </Field>

              {/* Phone */}
              <Field>
                <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  <span className="text-[#3086C8]">●</span> Phone number
                </Label>
                <InputGroup className="rounded-lg border-2 border-neutral-200 focus-within:border-[#3086C8] focus-within:ring-2 focus-within:ring-[#3086C8]/20 dark:border-neutral-600">
                  <Input
                    {...register('billing_phone')}
                    placeholder="+91 9876543210"
                    className="border-0 px-4 py-2.5 focus:ring-0 dark:bg-neutral-700"
                  />
                </InputGroup>
                {errors.billing_phone && (
                  <p className="mt-1.5 text-sm font-medium text-red-600">{errors.billing_phone.message}</p>
                )}
              </Field>

              {/* DOB and Gender */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field>
                  <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    <span className="text-[#3086C8]">●</span> Date of birth
                  </Label>
                  <InputGroup className="rounded-lg border-2 border-neutral-200 focus-within:border-[#3086C8] focus-within:ring-2 focus-within:ring-[#3086C8]/20 dark:border-neutral-600">
                    <Input
                      {...register('billing_customer_dob')}
                      type="date"
                      className="border-0 px-4 py-2.5 focus:ring-0 dark:bg-neutral-700"
                    />
                  </InputGroup>
                  {errors.billing_customer_dob && (
                    <p className="mt-1.5 text-sm font-medium text-red-600">{errors.billing_customer_dob.message}</p>
                  )}
                </Field>

                <Field>
                  <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    <span className="text-[#3086C8]">●</span> Gender
                  </Label>
                  <Select
                    {...register('billing_customer_gender')}
                    className="rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                  {errors.billing_customer_gender && (
                    <p className="mt-1.5 text-sm font-medium text-red-600">{errors.billing_customer_gender.message}</p>
                  )}
                </Field>
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800">
            <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-700 dark:bg-neutral-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#1B198F] p-2">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="font-family-antonio text-xl font-bold uppercase text-[#1B198F] dark:text-[#3086C8]">
                    Saved Addresses
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={addAddress}
                  className="flex items-center gap-2 rounded-lg bg-[#3086C8] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#1B198F] hover:shadow-md"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Address
                </button>
              </div>
            </div>

            <div className="space-y-4 p-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative overflow-hidden rounded-xl border-2 border-neutral-200 bg-linear-to-br from-white to-neutral-50 p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-700 dark:from-neutral-800 dark:to-neutral-800/50"
                >
                  {/* Address Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3086C8]/10 text-[#3086C8] dark:bg-[#3086C8]/20">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200">Address {index + 1}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 capitalize">{field.billing_address_type}</p>
                      </div>
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAddress(index)}
                        className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Address Type */}
                    <Field>
                      <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        <span className="text-[#3086C8]">●</span> Address type
                      </Label>
                      <Select
                        {...register(`billing_address.${index}.billing_address_type`)}
                        className="rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700"
                      >
                        <option value="home">Home</option>
                        <option value="office">Office</option>
                        <option value="other">Other</option>
                      </Select>
                      {errors.billing_address?.[index]?.billing_address_type && (
                        <p className="mt-1.5 text-sm font-medium text-red-600">{errors.billing_address[index]?.billing_address_type?.message}</p>
                      )}
                    </Field>

                    {/* Recipient Name Fields */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Field>
                        <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          <span className="text-[#3086C8]">●</span> Recipient first name
                        </Label>
                        <Input
                          {...register(`billing_address.${index}.billing_customer_name`)}
                          placeholder="John"
                          className="rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700"
                        />
                        {errors.billing_address?.[index]?.billing_customer_name && (
                          <p className="mt-1.5 text-sm font-medium text-red-600">{errors.billing_address[index]?.billing_customer_name?.message}</p>
                        )}
                      </Field>

                      <Field>
                        <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          <span className="text-[#3086C8]">●</span> Recipient last name
                        </Label>
                        <Input
                          {...register(`billing_address.${index}.billing_last_name`)}
                          placeholder="Doe"
                          className="rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700"
                        />
                        {errors.billing_address?.[index]?.billing_last_name && (
                          <p className="mt-1.5 text-sm font-medium text-red-600">{errors.billing_address[index]?.billing_last_name?.message}</p>
                        )}
                      </Field>
                    </div>

                    {/* Address Line */}
                    <Field>
                      <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        <span className="text-[#3086C8]">●</span> Address line
                      </Label>
                      <Input
                        {...register(`billing_address.${index}.billing_addressLine`)}
                        placeholder="123 Main Street"
                        className="rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700"
                      />
                      {errors.billing_address?.[index]?.billing_addressLine && (
                        <p className="mt-1.5 text-sm font-medium text-red-600">{errors.billing_address[index]?.billing_addressLine?.message}</p>
                      )}
                    </Field>

                    {/* City, State, Country, Pincode */}
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          <span className="text-[#3086C8]">●</span> City
                        </Label>
                        <Input
                          {...register(`billing_address.${index}.billing_city`)}
                          placeholder="Mumbai"
                          className="rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700"
                        />
                        {errors.billing_address?.[index]?.billing_city && (
                          <p className="mt-1.5 text-sm font-medium text-red-600">{errors.billing_address[index]?.billing_city?.message}</p>
                        )}
                      </Field>
                      <Field>
                        <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          <span className="text-[#3086C8]">●</span> State
                        </Label>
                        <Input
                          {...register(`billing_address.${index}.billing_state`)}
                          placeholder="Maharashtra"
                          className="rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700"
                        />
                        {errors.billing_address?.[index]?.billing_state && (
                          <p className="mt-1.5 text-sm font-medium text-red-600">{errors.billing_address[index]?.billing_state?.message}</p>
                        )}
                      </Field>
                      <Field>
                        <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          <span className="text-[#3086C8]">●</span> Country
                        </Label>
                        <Input
                          {...register(`billing_address.${index}.billing_country`)}
                          placeholder="India"
                          className="rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700"
                        />
                        {errors.billing_address?.[index]?.billing_country && (
                          <p className="mt-1.5 text-sm font-medium text-red-600">{errors.billing_address[index]?.billing_country?.message}</p>
                        )}
                      </Field>
                      <Field>
                        <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          <span className="text-[#3086C8]">●</span> Pincode
                        </Label>
                        <Input
                          {...register(`billing_address.${index}.billing_pincode`)}
                          placeholder="400001"
                          className="rounded-lg border-neutral-200 px-4 py-2.5 transition-all focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700"
                        />
                        {errors.billing_address?.[index]?.billing_pincode && (
                          <p className="mt-1.5 text-sm font-medium text-red-600">{errors.billing_address[index]?.billing_pincode?.message}</p>
                        )}
                      </Field>
                    </div>
                  </div>
                </div>
              ))}

              {errors.billing_address && typeof errors.billing_address.message === 'string' && (
                <p className="text-sm font-medium text-red-600">{errors.billing_address.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !isSignedIn}
              className="group relative overflow-hidden rounded-xl bg-linear-to-r from-[#1B198F] to-[#3086C8] px-8 py-4 font-family-antonio text-lg font-bold uppercase tracking-wide text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {userExists ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {userExists ? 'Update Account' : 'Create Account'}
                  </>
                )}
              </span>
            </button>
          </div>
        </Fieldset>
      </form>
    </div>
  )
}

export default Page