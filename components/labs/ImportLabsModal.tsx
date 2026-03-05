import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { FileUp, X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImportLabsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (file: File) => Promise<void>;
    onSuccess?: () => Promise<void> | void;
}

export function ImportLabsModal({
    isOpen,
    onClose,
    onSubmit,
    onSuccess,
}: ImportLabsModalProps) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFile = (selectedFile: File) => {
        setError(null);
        
        // Validate file type
        if (!["text/csv", "application/json"].includes(selectedFile.type)) {
            setError("Please upload a CSV or JSON file");
            return;
        }

        // Validate file size (max 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB");
            return;
        }

        setFile(selectedFile);
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a file");
            return;
        }

        setLoading(true);
        try {
            if (onSubmit) {
                await onSubmit(file);
            }
            if (onSuccess) {
                await onSuccess();
            }
            setFile(null);
            setError(null);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to import labs");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <FileUp className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-black text-white">
                            Import Labs
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
                    {error && (
                        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer",
                            dragActive
                                ? "border-teal-500 bg-teal-50"
                                : "border-slate-300 hover:border-teal-400 hover:bg-slate-50"
                        )}
                    >
                        <input
                            type="file"
                            id="file-input"
                            accept=".csv,.json"
                            onChange={handleInputChange}
                            disabled={loading}
                            className="hidden"
                        />
                        <label
                            htmlFor="file-input"
                            className="flex flex-col items-center gap-2 cursor-pointer"
                        >
                            <FileUp className="h-8 w-8 text-teal-600" />
                            <div>
                                <p className="font-semibold text-slate-900">
                                    {file ? file.name : "Drop file or click to select"}
                                </p>
                                <p className="text-sm text-slate-500 mt-1">
                                    CSV or JSON file (max 5MB)
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <p className="text-sm text-blue-900">
                            <strong>Format:</strong> Ensure your file has columns for:
                            <br />
                            <code className="text-xs">name, code, capacity, location, inchargeId</code>
                        </p>
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
                            disabled={loading || !file}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-semibold transition",
                                (loading || !file) && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {loading ? "Importing..." : "Import"}
                        </motion.button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
