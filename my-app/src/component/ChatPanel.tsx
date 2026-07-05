import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getChatHistory, type ChatMessageItem } from "../api/chatAPI";
import type { Study } from "../types/study";

type ChatPanelProps = {
    selectedStudy: Study;
    onClose: () => void;
};

const ChatPanel: React.FC<ChatPanelProps> = ({ selectedStudy, onClose }) => {
    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [inputText, setInputText] = useState("");
    const [connected, setConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const stompClientRef = useRef<Client | null>(null);

    const getMyName = () => {
        const savedUser = sessionStorage.getItem("user");
        if (savedUser) {
            try {
                return JSON.parse(savedUser).name || "알 수 없는 사용자";
            } catch {
                return "알 수 없는 사용자";
            }
        }
        return "알 수 없는 사용자";
    };
    const userName = getMyName();

    // 스크롤 맨 아래로 이동
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 1. 이전 채팅 내역 가져오기
    const fetchHistory = async () => {
        try {
            const history = await getChatHistory(selectedStudy.id);
            setMessages(history);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error("이전 채팅을 불러오지 못했습니다.", error);
        }
    };

    useEffect(() => {
        fetchHistory();

        // 2. 웹소켓 STOMP 클라이언트 생성 및 활성화
        const client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:9090/ws-stomp"),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => {
                console.log("[STOMP Debug]", str);
            },
            onConnect: () => {
                console.log("STOMP Connected!");
                setConnected(true);
                // 스터디별 채널 구독
                client.subscribe(`/topic/study/${selectedStudy.id}`, (message) => {
                    const receivedMsg: ChatMessageItem = JSON.parse(message.body);
                    setMessages((prev) => {
                        // 중복 메시지 방지
                        if (prev.some((m) => m.id === receivedMsg.id)) {
                            return prev;
                        }
                        return [...prev, receivedMsg];
                    });
                    setTimeout(scrollToBottom, 50);
                });
            },
            onDisconnect: () => {
                console.log("STOMP Disconnected");
                setConnected(false);
            },
            onStompError: (frame) => {
                console.error("STOMP 오류 발생:", frame.headers["message"]);
            },
        });

        stompClientRef.current = client;
        client.activate();

        // 언마운트 및 스터디 변경 시 소켓 리소스 해제
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [selectedStudy.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        if (!stompClientRef.current || !connected) {
            alert("서버와 연결이 원활하지 않습니다.");
            return;
        }

        // 메시지 발행 (Publish)
        stompClientRef.current.publish({
            destination: `/app/chat/${selectedStudy.id}`,
            body: JSON.stringify({
                sender: userName,
                message: inputText.trim(),
            }),
        });

        setInputText("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === "Enter") {
            handleSend();
        }
    };

    // 타임스탬프 이쁘게 변환
    const formatTime = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch {
            return isoString;
        }
    };

    return (
        <>
            <style>{`
                .chat-sidebar {
                    position: fixed;
                    top: 0;
                    right: 0;
                    width: 380px;
                    height: 100vh;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    box-shadow: -5px 0 25px rgba(0, 0, 0, 0.08);
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    border-left: 1px solid rgba(255, 255, 255, 0.4);
                    animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }

                .chat-header {
                    padding: 20px;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.4);
                }

                .chat-header h2 {
                    font-size: 17px;
                    margin: 0;
                    color: #111;
                    font-weight: 700;
                }

                .chat-header p {
                    font-size: 12px;
                    margin: 4px 0 0 0;
                    color: #666;
                }

                .close-chat-btn {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #999;
                    transition: color 0.2s;
                }

                .close-chat-btn:hover {
                    color: #333;
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .message-row {
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                    max-width: 85%;
                }

                .message-row.mine {
                    align-self: flex-end;
                    flex-direction: row-reverse;
                }

                .message-row.others {
                    align-self: flex-start;
                }

                .sender-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #e8f0fe;
                    color: #1a73e8;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 12px;
                    font-weight: 700;
                    border: 1px solid rgba(26, 115, 232, 0.15);
                    flex-shrink: 0;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.03);
                }

                .message-bubble-wrapper {
                    display: flex;
                    flex-direction: column;
                }

                .message-row.mine .message-bubble-wrapper {
                    align-items: flex-end;
                }

                .message-row.others .message-bubble-wrapper {
                    align-items: flex-start;
                }

                .message-sender {
                    font-size: 11px;
                    color: #5f6368;
                    margin-bottom: 4px;
                    font-weight: 700;
                }

                .message-bubble {
                    padding: 10px 14px;
                    border-radius: 12px;
                    font-size: 13px;
                    line-height: 1.5;
                    word-break: break-all;
                }

                .message-row.mine .message-bubble {
                    background: #1a73e8;
                    color: #fff;
                    border-top-right-radius: 2px;
                    box-shadow: 0 4px 10px rgba(26, 115, 232, 0.15);
                }

                .message-row.others .message-bubble {
                    background: #f1f3f4;
                    color: #333;
                    border-top-left-radius: 2px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
                }

                .message-meta {
                    font-size: 10px;
                    color: #9aa0a6;
                    margin-top: 4px;
                }

                .chat-input-bar {
                    padding: 16px 20px;
                    border-top: 1px solid rgba(0, 0, 0, 0.06);
                    background: rgba(255, 255, 255, 0.6);
                    display: flex;
                    gap: 10px;
                }

                .chat-input {
                    flex: 1;
                    padding: 10px 14px;
                    border: 1px solid #dadce0;
                    border-radius: 20px;
                    font-size: 13px;
                    background: #fff;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .chat-input:focus {
                    border-color: #1a73e8;
                }

                .chat-send-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #1a73e8;
                    color: #fff;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 14px;
                    transition: background 0.2s, transform 0.1s;
                }

                .chat-send-btn:hover {
                    background: #1557b0;
                }

                .chat-send-btn:active {
                    transform: scale(0.95);
                }

                .connection-status {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    margin-right: 6px;
                }

                .connection-status.online { background-color: #34a853; }
                .connection-status.offline { background-color: #ea4335; }
            `}</style>

            <div className="chat-sidebar" onClick={(e) => e.stopPropagation()}>
                <div className="chat-header">
                    <div>
                        <h2>{selectedStudy.name} 대화방</h2>
                        <p style={{ display: 'flex', alignItems: 'center' }}>
                            <span className={`connection-status ${connected ? "online" : "offline"}`} />
                            {connected ? "실시간 연결됨" : "연결 시도 중..."}
                        </p>
                    </div>
                    <button className="close-chat-btn" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="chat-messages">
                    {messages.map((msg) => {
                        const isMine = msg.sender === userName;
                        return (
                            <div
                                key={msg.id}
                                className={`message-row ${isMine ? "mine" : "others"}`}
                            >
                                {!isMine && (
                                    <div className="sender-avatar">
                                        {msg.sender ? msg.sender[0] : "U"}
                                    </div>
                                )}
                                <div className="message-bubble-wrapper">
                                    {!isMine && <span className="message-sender">{msg.sender}</span>}
                                    <div className="message-bubble">{msg.message}</div>
                                    <span className="message-meta">{formatTime(msg.timestamp)}</span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-bar">
                    <input
                        type="text"
                        className="chat-input"
                        placeholder="메시지를 입력하세요..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={!connected}
                    />
                    <button className="chat-send-btn" onClick={handleSend} disabled={!connected}>
                        ➔
                    </button>
                </div>
            </div>
        </>
    );
};

export default ChatPanel;
