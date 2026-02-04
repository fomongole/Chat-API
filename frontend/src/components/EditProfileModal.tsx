'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { toast } from "sonner";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { user, setAuth, token } = useAuthStore();
    const [about, setAbout] = useState(user?.about || '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.image || null);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen || !user) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('about', about);
            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            const response = await api.put('/users/profile', formData);

            // Update local store with new user data
            if (token) {
                setAuth(response.data.data.user, token);
            }

            toast.success("Profile updated successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl w-full max-w-md shadow-xl border border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Preview */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-primary/20 bg-zinc-100">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-xl font-bold text-zinc-400">
                                    {user.username[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <label className="cursor-pointer text-xs text-primary font-bold hover:underline">
                            Change Photo
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>

                    {/* About Input */}
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase">About</label>
                        <Input
                            value={about}
                            onChange={(e) => setAbout(e.target.value)}
                            className="mt-1 bg-zinc-50 dark:bg-zinc-950"
                        />
                    </div>

                    <div className="flex gap-2 justify-end mt-4">
                        <Button type="button" onClick={onClose} className="bg-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}