import React from "react";
import Icon from "./Icon";

// Adapter for React Native Paper's Provider `settings.icon`
// It will receive props like { name, color, size } when Paper components use string icon names
export default function PaperIcon(props: { name: string; color?: string; size?: number }) {
    const { name, color = "#000", size = 24 } = props;
    return <Icon name={name as any} color={color} size={size} />;
}
