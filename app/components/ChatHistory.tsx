import { db } from "db";
import { useState } from "react";
import { useRouter } from "next/router";
import { useLiveQuery } from "dexie-react-hooks";

interface ChatHistoryProps {
    chatId: string;
    onChange?: (item: { title: string }) => void;
}

export default function ChatHistory(props: ChatHistoryProps) {
    const router = useRouter();
    const [editItem, setEditItem] = useState<string | null>(null);
    const [itemToBeDeleted, setItemToBeDeleted] = useState<string | null>(null);

    const chatHistory = useLiveQuery(() => db.chats.reverse().toArray(), []);

    const handleOperationCancellation = () => {
        setEditItem(null);
        setItemToBeDeleted(null);
    };

    const handleClick = (item: any) => {
        router.push(`/chat/?id=${item.uuid}`);
    };

    const handleChatDelete = async (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        await db.chats.where("uuid").equals(props.chatId).delete();
        await db.conversations.where("uuid").equals(props.chatId).delete();
        const firstChat = chatHistory?.find(item => item.uuid !== props.chatId);
        if (firstChat) {
            router.push(`/chat/?id=${firstChat.uuid}`);
        } else {
            router.push("/");
        }
        handleOperationCancellation();
    };

    const handleItemUpdate = async (id: number, newTitle: string, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        await db.chats.update(id, { title: newTitle });
        props.onChange?.({ title: newTitle });
        setEditItem(null);
    };

    const handleTitleEdit = (event: React.KeyboardEvent<HTMLLabelElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            const saveButton = event.currentTarget.parentElement?.querySelector(".checkmark") as HTMLButtonElement;
            saveButton?.click();
        }
    };

    return (
        <ul>
            {chatHistory?.map((item, index) => (
                <li
                    className={props.chatId === item.uuid ? "active" : ""}
                    onClick={() => editItem !== item.uuid && handleClick(item)}
                    key={index}
                >
                    <label
                        style={{ width: editItem === item.uuid ? "100%" : "auto" }}
                        className={"label_" + item.id}
                        onKeyDown={event => editItem === item.uuid && handleTitleEdit(event)}
                        contentEditable={editItem === item.uuid}
                    >
                        {item.title}
                    </label>
                    <div style={{ flex: 1 }} />
                    {item.uuid === props.chatId && editItem === null && itemToBeDeleted === null && (
                        <>
                            <button onClick={(e) => (setEditItem(item.uuid), e.stopPropagation(), setTimeout(() => document.querySelector(".label_" + item.id)?.focus(), 50))} className="edit">
                                <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button onClick={(e) => (setItemToBeDeleted(item.uuid), e.stopPropagation())} className="delete">
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        </>
                    )}
                    {item.uuid === props.chatId && editItem !== null && (
                        <button
                            onClick={(event) => handleItemUpdate(item.id, (document.querySelector(".label_" + item.id) as HTMLLabelElement)?.innerText, event)}
                            className="checkmark"
                        >
                            <span className="material-symbols-outlined">check</span>
                        </button>
                    )}
                    {item.uuid === props.chatId && itemToBeDeleted !== null && (
                        <button onClick={handleChatDelete} className="checkmark">
                            <span className="material-symbols-outlined">check</span>
                        </button>
                    )}
                    {item.uuid === props.chatId && (itemToBeDeleted || editItem) && (
                        <button onClick={handleOperationCancellation} className="cancel">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </li>
            ))}
        </ul>
    );
}
