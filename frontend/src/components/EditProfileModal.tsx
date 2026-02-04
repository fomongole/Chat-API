'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { useConfigStore } from '@/store/useConfigStore';
import { api } from '@/lib/api';
import { toast } from "sonner";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const COLORS = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Purple', value: '#7c3aed' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Pink', value: '#db2777' },
    { name: 'Black', value: '#18181b' },
];

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { user, setAuth, token } = useAuthStore();
    const { primaryColor, setPrimaryColor } = useConfigStore();
    const { theme, setTheme } = useTheme();

    const [activeTab, setActiveTab] = useState<'profile' | 'appearance'>('profile');

    // Form State
    const [about, setAbout] = useState(user?.about || '');
    const [isPrivate, setIsPrivate] = useState((user as any)?.isPrivate || false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.image || null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setAbout(user.about || '');
            setIsPrivate((user as any).isPrivate || false);
            setPreviewUrl(user.image || null);
        }
    }, [user]);

    // GUARD: Only block if the modal is hidden
    if (!isOpen) return null;

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
            formData.append('isPrivate', String(isPrivate));

            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            const response = await api.put('/users/profile', formData);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 p-0 rounded-2xl w-full max-w-md shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col min-h-[300px] max-h-[90vh]">

                {!user ? (
                    /* PROFESSIONAL LOADING STATE */
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-12">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Loading Profile</p>
                            <p className="text-xs text-zinc-500">Retrieving your details...</p>
                        </div>
                    </div>
                ) : (
                    /* MODAL CONTENT */
                    <>
                        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex-1 p-4 text-sm font-bold transition-colors ${activeTab === 'profile' ? 'bg-zinc-50 dark:bg-zinc-800/50 text-primary border-b-2 border-primary' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                            >
                                Profile Details
                            </button>
                            <button
                                onClick={() => setActiveTab('appearance')}
                                className={`flex-1 p-4 text-sm font-bold transition-colors ${activeTab === 'appearance' ? 'bg-zinc-50 dark:bg-zinc-800/50 text-primary border-b-2 border-primary' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                            >
                                Appearance
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {activeTab === 'profile' ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 bg-zinc-100 dark:bg-zinc-800 relative group">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-zinc-400">
                                                    {user.username[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                            </div>
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange} />
                                        </div>
                                        <p className="text-xs text-zinc-500">Click avatar to change</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">About</label>
                                        <Input
                                            value={about}
                                            onChange={(e) => setAbout(e.target.value)}
                                            className="bg-zinc-50 dark:bg-zinc-950"
                                            placeholder="Write something about yourself..."
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                        <div>
                                            <h4 className="font-semibold text-sm">Private Profile</h4>
                                            <p className="text-xs text-zinc-500">Hide your details from others</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsPrivate(!isPrivate)}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors ${isPrivate ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    <div className="flex gap-2 justify-end pt-4">
                                        <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                                        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-zinc-500 uppercase">Theme</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                onClick={() => setTheme('light')}
                                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 ${theme === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-zinc-200 dark:border-zinc-800'}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                                                <span className="text-xs font-semibold">Light</span>
                                            </button>
                                            <button
                                                onClick={() => setTheme('dark')}
                                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 ${theme === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-zinc-200 dark:border-zinc-800'}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                                                <span className="text-xs font-semibold">Dark</span>
                                            </button>
                                            <button
                                                onClick={() => setTheme('system')}
                                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 ${theme === 'system' ? 'border-primary bg-primary/5 text-primary' : 'border-zinc-200 dark:border-zinc-800'}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                                                <span className="text-xs font-semibold">System</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-zinc-500 uppercase">Primary Color</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {COLORS.map((color) => (
                                                <button
                                                    key={color.value}
                                                    onClick={() => setPrimaryColor(color.value)}
                                                    className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${primaryColor === color.value ? 'border-zinc-900 dark:border-white scale-110' : 'border-transparent'}`}
                                                    style={{ backgroundColor: color.value }}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                        <Button onClick={onClose} className="w-full">Done</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}