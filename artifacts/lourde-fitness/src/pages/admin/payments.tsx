import { useState } from "react";
import { AdminLayout } from "./layout";
import { useListPaymentMethods, useCreatePaymentMethod, useUpdatePaymentMethod, useDeletePaymentMethod } from "@workspace/api-client-react";
import { Loader2, Plus, Pencil, Trash2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/image-upload";

export function Payments() {
  const { data: methods, isLoading, refetch } = useListPaymentMethods();
  const createMethod = useCreatePaymentMethod();
  const updateMethod = useUpdatePaymentMethod();
  const deleteMethod = useDeletePaymentMethod();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    id: null,
    label: "",
    qrImageObjectPath: "",
    instructions: "",
    active: true
  });

  const handleEdit = (method: any) => {
    setFormData({
      id: method.id,
      label: method.label,
      qrImageObjectPath: method.qrImageObjectPath,
      instructions: method.instructions || "",
      active: method.active
    });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setFormData({
      id: null,
      label: "",
      qrImageObjectPath: "",
      instructions: "",
      active: true
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        label: formData.label,
        qrImageObjectPath: formData.qrImageObjectPath,
        instructions: formData.instructions || undefined,
        active: formData.active
      };

      if (formData.id) {
        await updateMethod.mutateAsync({ id: formData.id, data: payload });
      } else {
        await createMethod.mutateAsync({ data: payload });
      }
      setIsEditing(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this payment method?")) {
      try {
        await deleteMethod.mutateAsync({ id });
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
          <h1 className="font-serif text-3xl mb-1">Payment Methods</h1>
          <p className="text-muted-foreground">Manage QR codes and transfer instructions.</p>
        </div>
        {!isEditing && (
          <Button onClick={handleAddNew} className="rounded-full gap-2">
            <Plus className="w-4 h-4" /> Add Method
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-card border rounded-2xl p-6 shadow-sm max-w-2xl animate-in fade-in slide-in-from-bottom-4">
          <h2 className="font-serif text-xl mb-6">{formData.id ? "Edit Payment Method" : "New Payment Method"}</h2>
          <div className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Method Label (e.g. PromptPay, Venmo)</label>
              <input 
                type="text" className="w-full p-2 border rounded-md bg-background"
                value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">QR Code Image</label>
              <div className="w-48">
                <ImageUpload 
                  value={formData.qrImageObjectPath} 
                  onChange={path => setFormData({...formData, qrImageObjectPath: path})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Instructions (optional)</label>
              <textarea 
                className="w-full p-2 border rounded-md bg-background" rows={3}
                placeholder="E.g. Please include your phone number in the memo..."
                value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})}
              />
            </div>

            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="checkbox" className="rounded"
                  checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})}
                />
                Active (visible at checkout)
              </label>
            </div>

            <div className="flex gap-4 pt-4 border-t mt-4">
              <Button onClick={handleSave} disabled={createMethod.isPending || updateMethod.isPending || !formData.label || !formData.qrImageObjectPath}>
                {(createMethod.isPending || updateMethod.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex py-20 justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : methods?.length ? (
            methods.map(method => (
              <div key={method.id} className={`bg-card border rounded-2xl p-6 shadow-sm flex flex-col ${!method.active ? 'opacity-60 grayscale' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-serif text-xl">{method.label}</h3>
                  <div className="p-2 bg-primary/10 rounded-lg text-primary"><QrCode className="w-5 h-5" /></div>
                </div>
                
                {method.qrImageObjectPath && (
                  <div className="w-32 h-32 mx-auto border rounded-xl overflow-hidden mb-4 bg-background">
                    <img 
                      src={method.qrImageObjectPath.startsWith('http') ? method.qrImageObjectPath : `/api/storage/objects/${method.qrImageObjectPath}`} 
                      alt="QR" className="w-full h-full object-contain p-2" 
                    />
                  </div>
                )}
                
                {method.instructions && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{method.instructions}</p>
                )}
                
                <div className="flex justify-end gap-2 mt-auto pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(method)}>Edit</Button>
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(method.id)}>Delete</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-card border rounded-2xl">
              No payment methods found. Add one to enable checkout.
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}