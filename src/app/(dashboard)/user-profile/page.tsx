import { UserProfile } from '@clerk/nextjs'

export default function UserProfilePage() {
  return (
    <div className="p-5 flex justify-center">
      <UserProfile />
    </div>
  )
}
