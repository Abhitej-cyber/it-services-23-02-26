import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Ticket, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: TicketData) => Promise<void>;
    onSuccess?: () => void;
}

export interface TicketData {
    title: string;
    description: string;
    category: "HARDWARE" | "SOFTWARE" | "NETWORK" | "OTHER";
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    affectedArea?: string;
}

export function CreateTicketModal({
    isOpen,
    onClose,
    onSubmit,
    onSuccess,
}: CreateTicketModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<TicketData>({
        title: "",
        description: "",
        category: "HARDWARE",
        priority: "MEDIUM",
        affectedArea: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (onSubmit) {
                await onSubmit(formData);
            }
            setFormData({
                title: "",
                description: "",
                category: "HARDWARE",
                priority: "MEDIUM",
                affectedArea: "",
            });
            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (error) {
            console.error("Failed to create ticket:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Ticket className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-black text-white">
                            Create Ticket
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="hover:bg-white/20 p-2 rounded-lg transition disabled:opacity-50"
                    >
                        <X className="h-5 w-5 text-white" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Brief description of the issue"
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                            >
                                <option value="HARDWARE">Hardware</option>
                                <option value="SOFTWARE">Software</option>
                                <option value="NETWORK">Network</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Priority *
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Affected Area
                        </label>
                        <input
                            type="text"
                            name="affectedArea"
                            value={formData.affectedArea}
                            onChange={handleChange}
                            placeholder="e.g., Lab 201, Server Room"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Detailed description of the issue..."
                            rows={4}
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-semibold transition",
                                loading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {loading ? "Creating..." : "Create Ticket"}
                        </motion.button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
