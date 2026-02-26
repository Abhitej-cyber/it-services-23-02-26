"use client";

import { useState, useEffect } from "react";
import {
    User,
    Mail,
    Shield,
    MoreVertical,
    Plus,
    Search,
    Loader2,
    Building2,
    Briefcase,
    Trash2,
    Key,
    ShieldAlert
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Modal } from "@/components/ui/modal";

export default function UsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showOptionsId, setShowOptionsId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [resettingId, setResettingId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await fetch("/api/departments");
            const data = await res.json();
            setDepartments(data);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        setDeletingId(userId);
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchUsers();
                setShowOptionsId(null);
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete user");
            }
        } catch (error) {
            console.error("Failed to delete user", error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleResetPassword = async (userId: string) => {
        if (!confirm("Are you sure you want to reset this user's password to 'admin123'?")) return;
        setResettingId(userId);
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: "admin123" }),
            });
            if (res.ok) {
                alert("Password successfully reset to 'admin123'");
                setShowOptionsId(null);
            } else {
                const data = await res.json();
                alert(data.error || "Failed to reset password");
            }
        } catch (error) {
            console.error("Failed to reset password", error);
            alert("Failed to reset password");
        } finally {
            setResettingId(null);
        }
    };

    const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const body = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setIsAddModalOpen(false);
                fetchUsers();
            }
        } catch (error) {
            console.error("Failed to add user", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase())) &&
        (session?.user?.role === "HOD" ? user.role === "LAB_INCHARGE" : user.role === "HOD")
    );

    return (
        <div className="p-6 lg:p-10 space-y-8 min-h-[calc(100vh-2rem)] bg-slate-50/50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Briefcase className="h-4 w-4 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            {session?.user?.role === "HOD" ? "Lab Incharges" : "Department Heads"}
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-11">
                        {session?.user?.role === "HOD"
                            ? "Directory of departmental laboratory leadership"
                            : "Directory of institutional department leadership"}
                    </p>
                </div>

                <div className="relative z-10">
                    {session?.user?.role === "DEAN" && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[13px] tracking-widest uppercase rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <Plus className="h-4 w-4" strokeWidth={3} />
                            REGISTER NEW
                        </button>
                    )}
                </div>
            </div>

            {/* Advanced Search Bar */}
            <div className="bg-white p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 pl-2">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email address..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-blue-50/10 transition-all font-medium placeholder:text-slate-400 text-slate-900 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Directory Table */}
            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden relative">
                {loading ? (
                    <div className="p-32 flex flex-col items-center justify-center text-slate-400">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                            <Loader2 className="h-10 w-10 animate-spin text-blue-600 relative z-10" />
                        </div>
                        <p className="font-bold text-sm uppercase tracking-widest text-blue-600/80">Accessing Secure Directory...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto pb-4">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                                    <th className="px-10 py-6">User Information</th>
                                    <th className="px-6 py-6">Role & Security</th>
                                    <th className="px-6 py-6">Department</th>
                                    <th className="px-6 py-6">Status Indicator</th>
                                    {session?.user?.role === "DEAN" && <th className="px-10 py-6 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-10 py-5">
                                            <div className="flex items-center gap-5">
                                                <div className="h-14 w-14 rounded-[1.25rem] bg-slate-100 flex items-center justify-center text-slate-400 font-black group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300 transform group-hover:-translate-y-0.5">
                                                    <User className="h-6 w-6" strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 tracking-tight text-[15px]">{user.name}</p>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium bg-slate-100/50 w-fit px-2.5 py-1 rounded-md">
                                                        <Mail className="h-3 w-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-slate-700">
                                                <Shield className={`h-4 w-4 ${user.role === "ADMIN" ? "text-indigo-500" : "text-blue-500"}`} strokeWidth={2.5} />
                                                {user.role}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-slate-400" />
                                                <span className="font-bold text-xs text-slate-600 uppercase tracking-wider">
                                                    {user.department?.name || "Global / IT"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="relative flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white shadow-sm"></span>
                                                </div>
                                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Active</span>
                                            </div>
                                        </td>
                                        {session?.user?.role === "DEAN" && (
                                            <td className="px-10 py-5 text-right relative">
                                                <button
                                                    onClick={() => setShowOptionsId(showOptionsId === user.id ? null : user.id)}
                                                    className="p-3 bg-slate-50 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 hover:shadow-md transition-all duration-200"
                                                >
                                                    <MoreVertical className="h-5 w-5 text-slate-400" />
                                                </button>
                                                {showOptionsId === user.id && (
                                                    <div className="absolute right-12 top-14 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 z-20 overflow-hidden transform animate-in fade-in slide-in-from-top-2">
                                                        <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                                                            <ShieldAlert className="w-4 h-4 text-slate-400" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Admin Actions</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleResetPassword(user.id)}
                                                            disabled={resettingId === user.id}
                                                            className="w-full text-left px-5 py-3.5 text-slate-700 hover:bg-blue-50/50 hover:text-blue-700 text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-colors border-b border-slate-50"
                                                        >
                                                            {resettingId === user.id ? <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> : <Key className="h-4 w-4 text-blue-500" />}
                                                            Reset Password
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            disabled={deletingId === user.id}
                                                            className="w-full text-left px-5 py-3.5 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-colors"
                                                        >
                                                            {deletingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                            Delete Account
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Registration Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Register New Account"
                className="max-w-md !rounded-[2rem]"
            >
                <form onSubmit={handleAddUser} className="space-y-5 p-2">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                        <input name="name" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium placeholder:text-slate-400" placeholder="e.g. John Doe" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                        <input name="email" type="email" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium placeholder:text-slate-400" placeholder="user@example.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Security Password</label>
                        <input name="password" type="password" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium placeholder:text-slate-400" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Permission Role</label>
                        <select name="role" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-slate-700">
                            <option value="ADMIN">System Admin</option>
                            <option value="DEAN">Academic Dean</option>
                            <option value="HOD">Department Head</option>
                            <option value="LAB_INCHARGE">Lab Incharge</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Department Override</label>
                        <select name="departmentId" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-slate-700">
                            <option value="">No Department (Global)</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs hover:-translate-y-0.5"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "CREATE ACCESS ACCOUNT"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
