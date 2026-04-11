import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeText?: string;
    icon?: React.ReactNode;
    description?: string;
}

export function MetricCard({ title, value, change, changeText, icon, description }: MetricCardProps) {
    const getChangeIcon = () => {
        if (!change) return null;
        if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
        if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
        return <Minus className="h-4 w-4 text-gray-500" />;
    };

    const getChangeColor = () => {
        if (!change) return "";
        if (change > 0) return "text-green-500";
        if (change < 0) return "text-red-500";
        return "text-gray-500";
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(change !== undefined || changeText) && (
                    <div className="flex items-center gap-1 mt-1">
                        {getChangeIcon()}
                        <span className={`text-xs ${getChangeColor()}`}>
                            {change !== undefined && `${change > 0 ? "+" : ""}${change}%`}
                            {changeText && ` ${changeText}`}
                        </span>
                        {description && <span className="text-xs text-muted-foreground ml-1">{description}</span>}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
