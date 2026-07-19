import { useState } from "react";
import { AdminLayout } from "./layout";
import { useListPackages, useCreatePackage, useUpdatePackage, useDeletePackage } from "@workspace/api-client-react";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminPackages() {
  const { data: packages, isLoading, refetch } = useListPackages();
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();
  const deletePackage = useDeletePackage();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    id: null,
    name: "",
    description: "",
    category: "Class Pack",
    price: 0,
    originalPrice: "",
    sessionCount: 1,
    validityDays: 30,
    isPromo: false,
    active: true
  });

  const handleEdit = (pkg: any) => {
    setFormData({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      category: pkg.category,
      price: pkg.price,
      originalPrice: pkg.originalPrice || "",
      sessionCount: pkg.sessionCount,
      validityDays: pkg.validityDays,
      isPromo: pkg.isPromo,
      active: pkg.active
    });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setFormData({
      id: null,
      name: "",
      description: "",
      category: "Class Pack",
      price: 0,
      originalPrice: "",
      sessionCount: 1,
      validityDays: 30,
      isPromo: false,
      active: true
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        sessionCount: Number(formData.sessionCount),
        validityDays: Number(formData.validityDays),
        isPromo: Boolean(formData.isPromo),
        active: Boolean(formData.active)
      };

      if (formData.id) {
        await updatePackage.mutateAsync({ id: formData.id, data: payload });
      } else {
        await createPackage.mutateAsync({ data: payload });
      }
      setIsEditing(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this package?")) {
      try {
        await deletePackage.mutateAsync({ id });
        refetch();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl mb-1">Packages</h1>
          <p className="text-muted-foreground">Manage class packages and promotions.</p>
        </div>
        {!isEditing && (
          <Button onClick={handleAddNew} className="rounded-full gap-2">
            <Plus className="w-4 h-4" /> Add Package
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-card border rounded-2xl p-6 shadow-sm max-w-2xl animate-in fade-in slide-in-from-bottom-4">
          <h2 className="font-serif text-xl mb-6">{formData.id ? "Edit Package" : "New Package"}</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input 
                  type="text" className="w-full p-2 border rounded-md bg-background"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <input 
                  type="text" className="w-full p-2 border rounded-md bg-background"
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                className="w-full p-2 border rounded-md bg-background" rows={2}
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price ($)</label>
                <input 
                  type="number" className="w-full p-2 border rounded-md bg-background"
                  value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Original Price (optional)</label>
                <input 
                  type="number" className="w-full p-2 border rounded-md bg-background"
                  value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sessions Included</label>
                <input 
                  type="number" className="w-full p-2 border rounded-md bg-background"
                  value={formData.sessionCount} onChange={e => setFormData({...formData, sessionCount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Validity (Days)</label>
                <input 
                  type="number" className="w-full p-2 border rounded-md bg-background"
                  value={formData.validityDays} onChange={e => setFormData({...formData, validityDays: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="checkbox" className="rounded"
                  checked={formData.isPromo} onChange={e => setFormData({...formData, isPromo: e.target.checked})}
                />
                Is Promo (adds badge)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="checkbox" className="rounded"
                  checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})}
                />
                Active (visible on site)
              </label>
            </div>

            <div className="flex gap-4 pt-4 border-t mt-4">
              <Button onClick={handleSave} disabled={createPackage.isPending || updatePackage.isPending}>
                {(createPackage.isPending || updatePackage.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex py-20 justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : packages?.length ? (
            packages.map(pkg => (
              <div key={pkg.id} className={`bg-card border rounded-2xl p-6 shadow-sm relative ${!pkg.active ? 'opacity-60 grayscale' : ''}`}>
                {pkg.isPromo && <span className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-sm uppercase tracking-wider">Promo</span>}
                <div className="mb-4">
                  <h3 className="font-serif text-xl">{pkg.name}</h3>
                  <div className="text-sm text-muted-foreground">{pkg.category}</div>
                </div>
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="text-3xl font-serif">${Number(pkg.price).toFixed(2)}</span>
                  {pkg.originalPrice && <span className="text-sm text-muted-foreground line-through">${Number(pkg.originalPrice).toFixed(2)}</span>}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground mb-6">
                  <div>{pkg.sessionCount} Sessions</div>
                  <div>Valid for {pkg.validityDays} days</div>
                </div>
                <div className="flex justify-end gap-2 mt-auto pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(pkg)}>Edit</Button>
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(pkg.id)}>Delete</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-card border rounded-2xl">
              No packages found. Add one to get started.
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}