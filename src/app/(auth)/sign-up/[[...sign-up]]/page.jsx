import { SignUp } from '@clerk/nextjs'

export default function PageSignUp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-neutral-900 dark:text-white lg:text-5xl">
              Join Us Today
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Create your account and start your shopping journey
            </p>
          </div>

          {/* Sign Up Component */}
          <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200',
                  formButtonSecondary: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium py-3 px-4 rounded-lg transition-colors duration-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-white',
                  card: 'shadow-none bg-transparent',
                  headerTitle: 'text-2xl font-bold text-neutral-900 dark:text-white',
                  headerSubtitle: 'text-neutral-600 dark:text-neutral-400',
                  socialButtonsBlockButton: 'border border-neutral-300 hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-700',
                  formFieldInput: 'border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary-500 focus:border-transparent dark:border-neutral-600 dark:bg-neutral-700 dark:text-white',
                  formFieldLabel: 'text-neutral-700 font-medium dark:text-neutral-300',
                  footerActionLink: 'text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300',
                  dividerLine: 'bg-neutral-300 dark:bg-neutral-600',
                  dividerText: 'text-neutral-500 dark:text-neutral-400',
                },
              }}
            />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Already have an account?{' '}
              <a
                href="/login"
                className="font-medium text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
