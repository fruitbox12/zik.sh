import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import CodeBlock from "components/CodeBlock";
import { useRef, useEffect, useState, RefObject } from "react";

interface AssistantMessageProps {
    content: string;
    autoExecute: boolean;
    onMessageRequest: (message: string) => void;
}

function AssistantMessage(props: AssistantMessageProps) {
    const button: RefObject<HTMLButtonElement> = useRef(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        if (props.autoExecute) {
            button?.current?.click();
        }
    }, [props.autoExecute]);

    async function execute(jsonStr: string) {
        try {
            const json = JSON.parse(jsonStr);

            if (typeof json.url !== "string") {
                throw new Error("URL is required");
            }

            // Validate URL
            new URL(json.url);

            json.options = json.options || {};

            if (typeof json.options.body !== "string") {
                json.options.body = JSON.stringify(json.options.body);
            }

            const response = await fetch(json.url, json.options);
            props.onMessageRequest("```json\n" + (await response.text()) + "\n```\n");
        } catch (error) {
            console.log(error);
            props.onMessageRequest("Request failed: " + error.toString());
        }
    }

    return (
        <>
            <ReactMarkdown
                children={props.content}
                remarkPlugins={[remarkGfm]}
                components={{
                    a: ({ node, inline, className, children, ...rest }) => (
                        !inline ? (
                            <a className={className} target="_blank" rel="nofollow noopener noreferrer" {...rest}>
                                {children}
                            </a>
                        ) : (
                            <span className={className} {...rest}>{children}</span>
                        )
                    ),
                    code({ node, inline, className, children, ...rest }) {
                        if (className === "language-plugin") {
                            return (
                                <div>
                                    <button style={{ display: "none" }} ref={button} onClick={() => execute(String(children))}>
                                        Execute
                                    </button>
                                    <div onClick={() => setShowDetails(!showDetails)} className="plugin-loader">
                                        <img src="/loader.svg" width="24" alt="Loader" />
                                        <span className="material-symbols-outlined">check</span>
                                        <label>Executing plugin...</label>
                                    </div>
                                    {showDetails && <code>{children}</code>}
                                </div>
                            );
                        }
                        if (inline) {
                            return <code className={className} {...rest}>{children}</code>;
                        }
                        const language = /language-(\w+)/.exec(className || '');
                        return <CodeBlock language={language && language[1]} code={String(children)} />;
                    }
                }}
            />
        </>
    );
}

export default AssistantMessage;
