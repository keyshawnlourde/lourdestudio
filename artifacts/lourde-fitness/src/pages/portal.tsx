import { useState, useEffect } from "react";
import { Redirect } from "wouter";
import { Show } from "@clerk/react";
import { useGetMyProfile, useUpdateMyProfile, useListMyPurchases, useListPackages } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/image-upload";
import { format, parseISO } from "date-fns";

export function Portal() {
  return (
    <>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
      <Show when="signed-in">
        <PortalContent />
      </Show>
    </>
  );
}

function PortalContent() {
  const { data: profile, isLoading: loadingProfile, refetch: refetchProfile } = useGetMyProfile();
  const { data: purchases, isLoading: loadingPurchases } = useListMyPurchases();
  const { data: packages } = useListPackages();
  const updateProfile = useUpdateMyProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
    goal: "",
    priorExperience: "",
    profileImageObjectPath: "",
  });

  useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        name: profile.name || "",
        age: profile.age?.toString() || "",
        phone: profile.phone || "",
        goal: profile.goal || "",
        priorExperience: profile.priorExperience || "",
        profileImageObjectPath: profile.profileImageObjectPath || "",
      });
    }
  }, [profile, isEditing]);

  const handleSave = async () => {
    if (!profile) return;
    try {
      await updateProfile.mutateAsync({
        data: {
          name: formData.name || undefined,
          age: formData.age ? Number(formData.age) : null,
          phone: formData.phone || null,
          goal: formData.goal || null,
          priorExperience: formData.priorExperience || null,
          profileImageObjectPath: formData.profileImageObjectPath || null,
        }
      });
      setIsEditing(false);
      refetchProfile();
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  if (loadingProfile) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Error loading profile</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-card py-16 border-b">
        <div className="container mx-auto px-4 max-w-4xl flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-md shrink-0">
            {profile.profileImageObjectPath ? (
              <img 
                src={profile.profileImageObjectPath.startsWith('http') ? profile.profileImageObjectPath : `/api/storage/objects/${profile.profileImageObjectPath}`} 
                alt={profile.name || "Profile"} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground font-serif text-3xl">
                {profile.name?.charAt(0) || "?"}
              </div>
            )}
          </div>
          <div className="text-center md:text-left">
            <h1 className="font-serif text-4xl text-foreground mb-2">{profile.name}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl grid md:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-8">
          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="font-serif text-2xl">Profile Details</h2>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSave} disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md bg-background"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Age</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded-md bg-background"
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-md bg-background"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Profile Photo</label>
                  <div className="w-32">
                    <ImageUpload 
                      value={formData.profileImageObjectPath} 
                      onChange={(path) => setFormData({ ...formData, profileImageObjectPath: path })} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prior Experience</label>
                  <textarea 
                    className="w-full p-2 border rounded-md bg-background min-h-[80px]"
                    value={formData.priorExperience}
                    onChange={e => setFormData({ ...formData, priorExperience: e.target.value })}
                    placeholder="e.g. 2 years yoga, beginner pole"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fitness Goals</label>
                  <textarea 
                    className="w-full p-2 border rounded-md bg-background min-h-[80px]"
                    value={formData.goal}
                    onChange={e => setFormData({ ...formData, goal: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Age</div>
                    <div>{profile.age || "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Phone</div>
                    <div>{profile.phone || "—"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground mb-1">Prior Experience</div>
                    <div>{profile.priorExperience || "None specified."}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground mb-1">Fitness Goals</div>
                    <div>{profile.goal || "None specified."}</div>
                  </div>
                  {profile.posturalAnalysis && (
                    <div className="col-span-2 bg-muted/30 p-4 rounded-lg border">
                      <div className="text-sm font-medium text-primary mb-1">Instructor Notes (Postural Analysis)</div>
                      <div className="text-sm">{profile.posturalAnalysis}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="font-serif text-2xl mb-6 border-b pb-4">Purchase History</h2>
            
            {loadingPurchases ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : !purchases?.length ? (
              <div className="text-muted-foreground text-sm py-4">No purchases yet.</div>
            ) : (
              <div className="space-y-4">
                {purchases.map(purchase => {
                  const pkg = packages?.find(p => p.id === purchase.packageId);
                  return (
                    <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-xl bg-background">
                      <div>
                        <div className="font-medium">{pkg?.name || `Package #${purchase.packageId}`}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(parseISO(purchase.submittedAt), 'MMM d, yyyy')} • ${Number(purchase.amount).toFixed(2)}
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full uppercase tracking-wider font-medium
                        ${purchase.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                          purchase.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                          'bg-red-100 text-red-700'}`}
                      >
                        {purchase.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
            <h3 className="font-serif text-xl mb-2 text-primary">Class Credits</h3>
            {/* Real app would calculate total available credits. Here we just show a placeholder or mock value */}
            <div className="text-5xl font-serif text-foreground mb-4 mt-4">
              --
            </div>
            <p className="text-sm text-muted-foreground mb-6">Credits available to book classes</p>
            <Button className="w-full rounded-full" onClick={() => window.location.href = '/timetable'}>Book a Class</Button>
          </div>
        </div>
      </div>
    </div>
  );
}