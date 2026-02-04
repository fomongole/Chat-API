export function getMessageDateLabel(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    // Reset times to compare dates only
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (messageDate.getTime() === today.getTime()) {
        return "Today";
    } else if (messageDate.getTime() === yesterday.getTime()) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

export function formatMessageTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}