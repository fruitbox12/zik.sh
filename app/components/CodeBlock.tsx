import highlight from "highlight.js";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import dark from "react-syntax-highlighter/dist/cjs/styles/prism/vs-dark";

interface CodeBlockProps {
    code: string;
    language?: string;
    title?: string;
}

export default function CodeBlock({ code, language: propLanguage, title }: CodeBlockProps) {
    const [language, setLanguage] = useState(propLanguage);
    const [copied, setCopied] = useState<boolean | null>(null);

    useEffect(() => {
        if (!propLanguage) {
            const result = highlight.highlightAuto(code);
            setLanguage(result ? result.language : "text");
        }
    }, [code, propLanguage]);

    useEffect(() => {
        setCopied(false);
    }, []);

    const handleCopy = () => {
        if (window.navigator.clipboard) {
            window.navigator.clipboard.writeText(code);
        } else {
            copyText(code);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const copyText = (text: string) => {
        const el = document.createElement('textarea');
        el.value = text;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        const selected = document.getSelection()?.rangeCount > 0 ? document.getSelection()?.getRangeAt(0) : false;
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        if (selected) {
            document.getSelection()?.removeAllRanges();
            document.getSelection()?.addRange(selected);
        }
    };

    return (
        <div className="codeblock">
            <header>
                <div className="title">{title || language || ""}</div>
                <div style={{ flex: 1 }} />
                <button onClick={handleCopy}>
                    {copied !== null && !copied && <span className="material-symbols-outlined">content_copy</span>}
                    {copied && <span className="material-symbols-outlined">check</span>}
                </button>
            </header>
            <SyntaxHighlighter style={dark} PreTag="div" language={language}>
                {code}
            </SyntaxHighlighter>
        </div>
    );
}
