'use client'
import SocialsList from '@/shared/SocialsList/SocialsList'
import { Input } from '@/shared/input'
import { Textarea } from '@/shared/textarea'
import { Mail01Icon, MapsLocation01Icon, SmartPhone01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Zod validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Please enter a valid email address').trim(),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number').trim(),
  message: z.string().min(10, 'Message must be at least 10 characters').trim(),
})

type ContactFormData = z.infer<typeof contactSchema>

type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error'

const info = [
  {
    title: 'OFFICE ADDRESS',
    desc: '123 Fitness Avenue, Supplement City, 110011',
    icon: MapsLocation01Icon,
  },
  {
    title: 'EMAIL US',
    desc: 'support@gibbonnutrition.com',
    icon: Mail01Icon,
  },
  {
    title: 'CALL US',
    desc: '+91 987 654 3210',
    icon: SmartPhone01Icon,
  },
]

const PageContact = () => {
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setSubmissionStatus('loading')
    try {
      await axios.post('/api/contact', data)
      setSubmissionStatus('success')
      reset() // Clear the form on success
    } catch (error) {
      console.error('Contact form submission error:', error)
      setSubmissionStatus('error')
    }
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#E3F2FD] via-white to-[#BBDEFB] pt-12 pb-16 font-family-roboto sm:py-16 lg:py-24 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-[#3086C8]/10 blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 h-96 w-96 rounded-full bg-[#1B198F]/10 blur-3xl"></div>
      </div>

      <div className="container relative z-10 mx-auto flex max-w-7xl flex-col gap-y-16 lg:gap-y-20">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="font-family-antonio text-5xl font-black uppercase tracking-tight text-[#1B198F] md:text-6xl lg:text-7xl">
            Get in Touch
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-neutral-700 md:text-xl dark:text-neutral-300">
            Have questions about our products, your order, or partnerships? We are here to help!
          </p>
        </div>

        <div className="grid shrink-0 grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Side - Contact Info */}
          <div className="space-y-8">
            {/* Info Cards */}
            {info.map((item, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1B198F] to-[#3086C8] text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                    <HugeiconsIcon icon={item.icon} size={24} />
                  </div>
                  <div>
                    <p className="font-family-antonio text-sm font-black uppercase tracking-wider text-[#1B198F] dark:text-[#3086C8]">
                      {item.title}
                    </p>
                    <span className="mt-2 block text-base font-medium text-neutral-700 dark:text-neutral-300">
                      {item.desc}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Follow Us Card */}
            <div className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1B198F] to-[#3086C8] text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                  <HugeiconsIcon icon={MapsLocation01Icon} size={24} />
                </div>
                <div>
                  <p className="font-family-antonio text-sm font-black uppercase tracking-wider text-[#1B198F] dark:text-[#3086C8]">
                    FOLLOW US
                  </p>
                  <SocialsList className="mt-3" />
                </div>
              </div>
            </div>

            {/* Additional Feature Box */}
            <div className="rounded-2xl bg-gradient-to-br from-[#1B198F] to-[#3086C8] p-8 text-white shadow-xl">
              <h3 className="font-family-antonio text-2xl font-black uppercase">Why Choose Gibbon?</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Lab Tested & Certified Products</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Fast & Secure Delivery</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Expert Customer Support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div>
            <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800 lg:p-10">
              {/* Decorative corner elements */}
              <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-[#3086C8]/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 h-32 w-32 bg-gradient-to-tr from-[#1B198F]/20 to-transparent"></div>

              <div className="relative">
                <div className="mb-6">
                  <h2 className="font-family-antonio text-3xl font-black uppercase text-[#1B198F] dark:text-[#3086C8]">
                    Send us a Message
                  </h2>
                  <p className="mt-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Fill out the form below and we will get back to you as soon as possible
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block font-family-antonio text-sm font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">
                        Full name
                      </label>
                        <Input
                          {...register('name')}
                          placeholder="John Doe"
                          type="text"
                          className="rounded-md  border-neutral-300 px-4 py-3 transition-all duration-200 focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700/50"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="mb-2 block font-family-antonio text-sm font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">
                        Email address
                      </label>
                        <Input
                          {...register('email')}
                          type="email"
                          placeholder="john.doe@example.com"
                          className="rounded-md border-neutral-300 px-4 py-3 transition-all duration-200 focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700/50"
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="mb-2 block font-family-antonio text-sm font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">
                        Phone number
                      </label>
                        <Input
                          {...register('phoneNumber')}
                          type="tel"
                          placeholder="+91 98765 43210"
                          className="rounded-md  border-neutral-300 px-4 py-3 transition-all duration-200 focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700/50"
                        />
                        {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>}
                    </div>
                    <div>
                      <label className="mb-2 block font-family-antonio text-sm font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">
                        Message
                      </label>
                        <Textarea
                          {...register('message')}
                          rows={5}
                          placeholder="How can we help you?"
                          className="rounded-md  border-neutral-300 px-4 py-3 transition-all duration-200 focus:border-[#3086C8] focus:ring-2 focus:ring-[#3086C8]/20 dark:border-neutral-600 dark:bg-neutral-700/50"
                        />
                        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
                    </div>
                      <button
                        type="submit"
                        disabled={submissionStatus === 'loading'}
                        className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#1B198F] to-[#3086C8] py-3 font-family-antonio text-base font-bold uppercase tracking-wide text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {submissionStatus === 'loading' ? 'Sending...' : 'Send Message'}
                      </button>

                      {submissionStatus === 'success' && (
                        <div className="mt-4 rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
                          <p className="font-medium text-green-700 dark:text-green-400">
                            ✓ Message sent successfully! We will get back to you soon.
                          </p>
                        </div>
                      )}
                      {submissionStatus === 'error' && (
                        <div className="mt-4 rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
                          <p className="font-medium text-red-700 dark:text-red-400">
                            ✗ Failed to send message. Please try again later.
                          </p>
                        </div>
                      )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PageContact