import { useState, useRef } from "react";
import { AdminLayout } from "./layout";
import { useListStudents, useUpdateStudent } from "@workspace/api-client-react";
import { Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Students() {
  const { data: students, isLoading, refetch } = useListStudents();
  const updateStudent = useUpdateStudent();
  const [searchTerm, setSearchTerm] = useState("");
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const updateRef = useRef(updateStudent.mutateAsync);
  updateRef.current = updateStudent.mutateAsync;

  const filtered = students?.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSaveNotes = async (id: number) => {
    try {
      await updateRef.current({
        id,
        data: { posturalAnalysis: editNotes }
      });
      setEditingId(null);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl mb-1">Students</h1>
          <p className="text-muted-foreground">Manage student profiles and instructor notes.</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="w-full pl-9 pr-4 py-2 bg-card border rounded-full text-sm focus:outline-none focus:ring-2 ring-primary/20"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex py-20 justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Experience</th>
                  <th className="px-6 py-4 font-medium min-w-[300px]">Instructor Notes</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(student => (
                  <tr key={student.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{student.name || "—"}</div>
                      <div className="text-xs text-muted-foreground capitalize mt-1 px-2 py-0.5 bg-secondary inline-block rounded-sm">{student.role}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{student.email}</div>
                      <div className="text-muted-foreground">{student.phone || "—"}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={student.priorExperience || ""}>
                      {student.priorExperience || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === student.id ? (
                        <div className="flex gap-2">
                          <textarea 
                            className="w-full p-2 border rounded text-sm bg-background"
                            value={editNotes}
                            onChange={e => setEditNotes(e.target.value)}
                            placeholder="Add postural analysis or notes..."
                            rows={3}
                          />
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{student.posturalAnalysis || "—"}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === student.id ? (
                        <div className="flex flex-col gap-2">
                          <Button size="sm" onClick={() => handleSaveNotes(student.id)}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditingId(student.id);
                          setEditNotes(student.posturalAnalysis || "");
                        }}>Edit Notes</Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}