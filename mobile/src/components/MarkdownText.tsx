import React from "react";
import { Text, TextStyle, StyleProp, TouchableOpacity, Linking } from "react-native";

export interface MarkdownTextProps {
    content?: string;
    style?: StyleProp<TextStyle>;
    strongStyle?: StyleProp<TextStyle>;
    italicStyle?: StyleProp<TextStyle>;
    codeStyle?: StyleProp<TextStyle>;
    linkStyle?: StyleProp<TextStyle>;
}

// Very small markdown renderer supporting: **bold**, *italic*, `code`, [text](url), line breaks, and simple - list items
export default function MarkdownText({
    content = "",
    style,
    strongStyle,
    italicStyle,
    codeStyle,
    linkStyle,
}: MarkdownTextProps) {
    // Return as array of React elements parsed sequentially
    const elements: React.ReactNode[] = [];
    const text = String(content || "");

    // Regex to match link, bold, italic, code, or newline
    const tokenRe = /(\[([^\]]+)\]\((https?:\/\/[^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\r?\n)|(^-\s+([^\n]+))/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const pushText = (txt: string) => {
        if (!txt) return;
        elements.push(<Text key={elements.length} style={style}>{txt}</Text>);
    };

    while ((match = tokenRe.exec(text)) !== null) {
        const idx = match.index;
        if (idx > lastIndex) {
            pushText(text.substring(lastIndex, idx));
        }

        if (match[1]) {
            // link full match, match[2]=label, match[3]=url
            const label = match[2];
            const url = match[3];
            elements.push(
                <Text
                    key={elements.length}
                    style={linkStyle || style}
                    onPress={() => Linking.openURL(url)}
                >
                    {label}
                </Text>
            );
        } else if (match[4]) {
            // bold match[5]
            elements.push(<Text key={elements.length} style={strongStyle || { fontWeight: '600' }}>{match[5]}</Text>);
        } else if (match[6]) {
            // italic match[7]
            elements.push(<Text key={elements.length} style={italicStyle || { fontStyle: 'italic' }}>{match[7]}</Text>);
        } else if (match[8]) {
            // code match[9]
            elements.push(<Text key={elements.length} style={codeStyle || { fontFamily: 'monospace', backgroundColor: '#f3f4f6', paddingHorizontal: 4 }}>{match[9]}</Text>);
        } else if (match[10]) {
            // newline
            elements.push(<Text key={elements.length}>{"\n"}</Text>);
        } else if (match[11]) {
            // list item (very simple) match[12]
            elements.push(<Text key={elements.length}>{"• " + match[12] + "\n"}</Text>);
        }

        lastIndex = tokenRe.lastIndex;
    }

    if (lastIndex < text.length) {
        pushText(text.substring(lastIndex));
    }

    // If nothing parsed, return simple Text
    if (elements.length === 0) {
        return <Text style={style}>{text}</Text>;
    }

    // Wrap elements in a single Text to allow styling inheritance
    return <Text style={style}>{elements}</Text>;
}
