import { useState } from "react";
import { AdminLayout } from "./layout";
import { useListClasses, useCreateClass, useUpdateClass, useDeleteClass } from "@workspace/api-client-react";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function Classes() {
  const { data: classes, isLoading, refetch } = useListClasses();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    id: null,
    title: "",
    instructor: "",
    dayOfWeek: 0,
    startTime: "18:00",
    endTime: "19:00",
    level: "All Levels",
    capacity: 10,
    description: ""
  });

  const handleEdit = (cls: any) => {
    setFormData({
      id: cls.id,
      title: cls.title,
      instructor: cls.instructor,
      dayOfWeek: cls.dayOfWeek,
      startTime: cls.startTime,
      endTime: cls.endTime,
      level: cls.level,
      capacity: cls.capacity,
      description: cls.description || ""
    });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setFormData({
      id: null,
      title: "",
      instructor: "",
      dayOfWeek: 1,
      startTime: "18:00",
      endTime: "19:00",
      level: "All Levels",
      capacity: 10,
      description: ""
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        title: formData.title,
        instructor: formData.instructor,
        dayOfWeek: Number(formData.dayOfWeek),
        startTime: formData.startTime,
        endTime: formData.endTime,
        level: formData.level,
        capacity: Number(formData.capacity),
        description: formData.description || undefined
      };

      if (formData.id) {
        await updateClass.mutateAsync({ id: formData.id, data: payload });
      } else {
        await createClass.mutateAsync({ data: payload });
      }
      setIsEditing(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this class?")) {
      try {
        await deleteClass.mutateAsync({ id });
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
          <h1 className="font-serif text-3xl mb-1">Classes</h1>
          <p className="text-muted-foreground">Manage the weekly timetable.</p>
        </div>
        {!isEditing && (
          <Button onClick={handleAddNew} className="rounded-full gap-2">
            <Plus className="w-4 h-4" /> Add Class
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-card border rounded-2xl p-6 shadow-sm max-w-2xl animate-in fade-in slide-in-from-bottom-4">
          <h2 className="font-serif text-xl mb-6">{formData.id ? "Edit Class" : "New Class"}</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input 
                  type="text" className="w-full p-2 border rounded-md bg-background"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructor</label>
                <input 
                  type="text" className="w-full p-2 border rounded-md bg-background"
                  value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Day</label>
                <select 
                  className="w-full p-2 border rounded-md bg-background"
                  value={formData.dayOfWeek} onChange={e => setFormData({...formData, dayOfWeek: e.target.value})}
                >
                  {DAYS.map((day, i) => <option key={day} value={i}>{day}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time (24h)</label>
                <input 
                  type="time" className="w-full p-2 border rounded-md bg-background"
                  value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Time (24h)</label>
                <input 
                  type="time" className="w-full p-2 border rounded-md bg-background"
                  value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Level</label>
                <input 
                  type="text" className="w-full p-2 border rounded-md bg-background"
                  value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Capacity</label>
                <input 
                  type="number" className="w-full p-2 border rounded-md bg-background"
                  value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                className="w-full p-2 border rounded-md bg-background" rows={3}
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSave} disabled={createClass.isPending || updateClass.isPending}>
                {(createClass.isPending || updateClass.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex py-20 justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Class</th>
                    <th className="px-6 py-4 font-medium">Schedule</th>
                    <th className="px-6 py-4 font-medium">Level & Capacity</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {classes?.map(cls => (
                    <tr key={cls.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{cls.title}</div>
                        <div className="text-muted-foreground text-xs mt-1">with {cls.instructor}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{DAYS[cls.dayOfWeek]}</div>
                        <div className="text-muted-foreground text-xs mt-1">{cls.startTime} - {cls.endTime}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{cls.level}</div>
                        <div className="text-muted-foreground text-xs mt-1">{cls.capacity} spots</div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(cls)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => handleDelete(cls.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {(!classes || classes.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                        No classes found. Add one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}