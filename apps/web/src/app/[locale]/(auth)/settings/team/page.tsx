import { auth } from '@clerk/nextjs';

import { ActivityLogComponent } from '@/components/team/ActivityLog';
import { InviteUserForm } from '@/components/team/InviteUserForm';
import { TeamMembersList } from '@/components/team/TeamMembersList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function TeamSettingsPage() {
  const { userId } = auth();
  
  // In a real app, you'd fetch the current user's role from the database
  // For now, we'll assume they're an admin
  const currentUserRole = 'admin';

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Team Management</h1>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="invite">Invite Users</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <TeamMembersList 
            currentUserId={userId || ''} 
            currentUserRole={currentUserRole}
          />
        </TabsContent>

        <TabsContent value="invite">
          <InviteUserForm />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityLogComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
}