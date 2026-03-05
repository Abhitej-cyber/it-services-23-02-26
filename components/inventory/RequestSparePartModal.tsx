import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Package, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RequestSparePartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: SparePartRequest) => Promise<void>;
}

export interface SparePartRequest {
    partName: string;
    quantity: number;
    category: string;
    urgency: "LOW" | "MEDIUM" | "HIGH";
    description: string;
}

export function RequestSparePartModal({
    isOpen,
    onClose,
    onSubmit,
}: RequestSparePartModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<SparePartRequest>({
        partName: "",
        quantity: 1,
        category: "HARDWARE",
        urgency: "MEDIUM",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (onSubmit) {
                await onSubmit(formData);
            }
            setFormData({
                partName: "",
                quantity: 1,
                category: "HARDWARE",
                urgency: "MEDIUM",
                description: "",
            });
            onClose();
        } catch (error) {
            console.error("Failed to submit spare part request:", error);
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
            [name]: name === "quantity" ? parseInt(value) || 1 : value,
        }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-black text-white">
                            Request Spare Part
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-white/20 p-2 rounded-lg transition"
                    >
                        <X className="h-5 w-5 text-white" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Part Name *
                        </label>
                        <input
                            type="text"
                            name="partName"
                            value={formData.partName}
                            onChange={handleChange}
                            placeholder="e.g., Server RAM, HDD"
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Quantity *
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                min="1"
                                required
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
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
                                <option value="NETWORKING">Networking</option>
                                <option value="PERIPHERAL">Peripheral</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Urgency *
                        </label>
                        <select
                            name="urgency"
                            value={formData.urgency}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                        >
                            <option value="LOW">Low - Standard delivery</option>
                            <option value="MEDIUM">
                                Medium - 5-7 business days
                            </option>
                            <option value="HIGH">High - Urgent</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Additional details about this request..."
                            rows={3}
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
                            {loading ? "Submitting..." : "Submit Request"}
                        </motion.button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
