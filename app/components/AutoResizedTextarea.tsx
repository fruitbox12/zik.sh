import React, { useState, useRef, useEffect, RefObject } from "react";

interface AutoResizedTextareaProps {
    loading: boolean;
    defaultValue?: string;
    placeholder?: string;
    autoComplete?: string;
    onMessage: (message: string) => void;
    onStop: () => void;
}

function AutoResizedTextarea(props: AutoResizedTextareaProps) {
    const textareaRef: RefObject<HTMLTextAreaElement> = useRef(null);
    const [loading, setLoading] = useState(props.loading);
    const [value, setValue] = useState(props.defaultValue || "");

    useEffect(() => {
        setLoading(props.loading);
    }, [props.loading]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            handleResize();
        }

        window.addEventListener("textarea-resize", handleResize);

        return () => {
            window.removeEventListener("textarea-resize", handleResize);
        };
    }, []);

    const handleResize = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            if (loading) {
                return;
            }
            props.onMessage(event.currentTarget.value);
            clear();
        }
    };

    const handleSubmit = (event: React.MouseEvent) => {
        event.preventDefault();
        if (loading) {
            return;
        }
        props.onMessage(value);
        clear();
    };

    const clear = () => {
        setValue("");
    };

    return (
        <>
            <textarea
                value={value}
                onChange={event => setValue(event.target.value)}
                ref={textareaRef}
                onInput={handleResize}
                onKeyDown={handleKeyDown}
                placeholder={props.placeholder || ""}
                autoComplete={props.autoComplete || ""}
            />
            <span
                className={`material-symbols-outlined ${value.trim().length > 0 ? "active" : ""} ${loading ? "loading" : ""}`}
                onClick={loading ? props.onStop : handleSubmit}
            >
                {!loading ? "send" : "stop"}
            </span>
            {loading && <div style={{ position: "absolute", right: 25, bottom: 15 }}><div className="dot-falling" /></div>}
        </>
    );
}

export default AutoResizedTextarea;
