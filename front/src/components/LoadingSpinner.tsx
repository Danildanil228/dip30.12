export function LoadingSpinner({ text = "Загрузка..." }: { text?: string }) {
    return (
        <div className="flex justify-center items-center py-20 flex-col gap-4 text-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
            {text && <p className="text-muted-foreground">{text}</p>}
        </div>
    );
}
