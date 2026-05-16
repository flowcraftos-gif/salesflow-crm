import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[oklch(98.2%_0.006_254)]">
      <SignIn />
    </div>
  )
}
