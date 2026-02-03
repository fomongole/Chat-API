import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
    const variants = {
        primary: "bg-primary text-white hover:opacity-90 shadow-sm",
        outline: "border border-zinc-200 bg-transparent hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900",
        ghost: "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}