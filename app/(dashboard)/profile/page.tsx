import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  // DEV BYPASS: Disconnected from Supabase to prevent server freezing and rendering null
  const mockUser = {
    id: "dev_user_123",
    email: "manager@ecours.com",
    user_metadata: {
      full_name: "مستخدم تجريبي"
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <ProfileForm 
        initialName={mockUser.user_metadata.full_name} 
        email={mockUser.email}
        userId={mockUser.id}
      />
    </div>
  );
}
