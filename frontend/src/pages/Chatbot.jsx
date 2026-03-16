import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { hideBotpress } from "../components/botpressControl";
import Navbar from "../components/Navbar";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  query,
  orderBy,
  getDocs,
  getDoc
} from "firebase/firestore";
import { db, auth } from "../firebase";

export default function Chatbot() {

  const location = useLocation();

  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [title, setTitle] = useState("Legal Consultation");
  const [editingTitle, setEditingTitle] = useState(false);

  const chatEndRef = useRef(null);

  // AUTO SCROLL
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // LOAD EXISTING CONVERSATION
  useEffect(() => {

    if (location.state?.conversationId) {

      setConversationId(location.state.conversationId);
      loadMessages(location.state.conversationId);

    } else {

      createConversation();

    }

  }, [location.state]);

  // HIDE BOTPRESS WIDGET
  useEffect(() => {

    hideBotpress();
  
  }, []);

  // LOAD MESSAGES
  const loadMessages = async (conversationId) => {

    try {

      const conversationRef = doc(db, "conversations", conversationId);
      const conversationSnap = await getDoc(conversationRef);

      if (conversationSnap.exists()) {
        setTitle(conversationSnap.data().title || "Legal Consultation");
      }

      const q = query(
        collection(db, "conversations", conversationId, "messages"),
        orderBy("timestamp")
      );

      const snapshot = await getDocs(q);

      const msgs = snapshot.docs.map((doc) => doc.data());

      setMessages(msgs);

    } catch (error) {
      console.error("Error loading messages:", error);
    }

  };

  // CREATE CONVERSATION
  const createConversation = async () => {

    const user = auth.currentUser;
    if (!user) return;

    try {

      const docRef = await addDoc(collection(db, "conversations"), {
        userId: user.uid,
        model: "gemini",
        title: "New Legal Consultation",
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });

      setConversationId(docRef.id);

      const welcomeMessage = {
        sender: "bot",
        text: {
          type: "text",
          content: "Gemini Legal AI ready. Describe your issue.",
        },
      };

      setMessages([welcomeMessage]);

      await addDoc(
        collection(db, "conversations", docRef.id, "messages"),
        {
          ...welcomeMessage,
          timestamp: serverTimestamp(),
        }
      );

    } catch (error) {
      console.error("Error creating conversation:", error);
    }

  };

  // SAVE MESSAGE
  const saveMessage = async (sender, text) => {

    if (!conversationId) return;

    try {

      await addDoc(
        collection(db, "conversations", conversationId, "messages"),
        {
          sender,
          text,
          timestamp: serverTimestamp(),
        }
      );

      await updateDoc(doc(db, "conversations", conversationId), {
        lastUpdated: serverTimestamp(),
      });

    } catch (error) {
      console.error("Error saving message:", error);
    }

  };

  // UPDATE TITLE
  const updateTitle = async () => {

    if (!conversationId) return;

    try {

      await updateDoc(doc(db, "conversations", conversationId), {
        title: title
      });

      setEditingTitle(false);

    } catch (error) {
      console.error("Title update failed:", error);
    }

  };

  // BUILD CONTEXT HISTORY
  const buildHistory = (msgs) => {

    return msgs.slice(-12).map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content:
        m.text?.type === "structured"
          ? JSON.stringify(m.text.content)
          : m.text?.content,
    }));

  };

  // SEND MESSAGE
  const sendMessage = async () => {

    if (!input.trim() || !conversationId) return;

    const user = auth.currentUser;
    if (!user) return;

    const userMessage = input.trim();

    const userPayload = {
      type: "text",
      content: userMessage,
    };

    const updatedMessages = [
      ...messages,
      { sender: "user", text: userPayload },
    ];

    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    await saveMessage("user", userPayload);

    // AI TITLE GENERATION (FIRST MESSAGE)
    if (messages.length === 1) {

      try {

        const res = await fetch(
          "https://virtualadvocate-production.up.railway.app/generate-title",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: userMessage,
              user_id: user.uid,
            }),
          }
        );

        const data = await res.json();

        setTitle(data.title);

        await updateDoc(doc(db, "conversations", conversationId), {
          title: data.title,
        });

      } catch (error) {
        console.error("AI title generation failed:", error);
      }

    }

    try {

      const response = await fetch(
        "https://virtualadvocate-production.up.railway.app/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            user_id: user.uid,
            history: buildHistory(updatedMessages),
          }),
        }
      );

      const data = await response.json();

      const botReply =
        data?.type && data?.content
          ? { type: data.type, content: data.content }
          : {
              type: "text",
              content: "I am unable to process that right now.",
            };

      const finalMessages = [
        ...updatedMessages,
        { sender: "bot", text: botReply },
      ];

      setMessages(finalMessages);

      await saveMessage("bot", botReply);

    } catch (error) {

      console.error("Chat error:", error);

      const errorReply = {
        type: "text",
        content: "Server error occurred.",
      };

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: errorReply },
      ]);

      await saveMessage("bot", errorReply);

    } finally {
      setIsTyping(false);
    }

  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8F87F1] to-[#C68EFD]">

      <Navbar />

      <div className="flex justify-center px-4 md:px-10 py-8">

        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col h-[85vh]">

          <div className="px-6 py-4 border-b flex justify-between items-center">

            {editingTitle ? (

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={updateTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") updateTitle();
                }}
                className="font-bold text-xl text-[#090979] border-b outline-none"
                autoFocus
              />

            ) : (

              <h2
                className="font-bold text-xl text-[#090979] cursor-pointer"
                onClick={() => setEditingTitle(true)}
                title="Click to rename"
              >
                {title}
              </h2>

            )}

          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-[#9EC6F3]">

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-4 max-w-[75%] ${
                  msg.sender === "user"
                    ? "ml-auto text-right"
                    : "mr-auto text-left"
                }`}
              >

                <div
                  className={`px-4 py-3 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-[#090979] text-white"
                      : "bg-[#BDDDE4] text-[#090979]"
                  }`}
                >

                  {msg.text?.type === "structured" ? (
                    <>
                      <p className="font-semibold mb-2">Summary:</p>
                      <p className="mb-3">{msg.text.content.summary}</p>

                      {msg.text.content.applicable_laws?.length > 0 && (
                        <>
                          <p className="font-semibold mt-2">Applicable Laws:</p>
                          <ul className="list-disc ml-5">
                            {msg.text.content.applicable_laws.map((law, i) => (
                              <li key={i}>{law}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {msg.text.content.legal_options?.length > 0 && (
                        <>
                          <p className="font-semibold mt-2">Legal Options:</p>
                          <ul className="list-disc ml-5">
                            {msg.text.content.legal_options.map((opt, i) => (
                              <li key={i}>{opt}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {msg.text.content.next_steps?.length > 0 && (
                        <>
                          <p className="font-semibold mt-2">Next Steps:</p>
                          <ul className="list-disc ml-5">
                            {msg.text.content.next_steps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      <p className="text-xs mt-3 italic">
                        {msg.text.content.note}
                      </p>
                    </>
                  ) : (
                    msg.text?.content
                  )}

                </div>

              </div>
            ))}

            {isTyping && (
              <div className="text-sm italic text-gray-600">
                Virtual Advocate is thinking...
              </div>
            )}

            <div ref={chatEndRef} />

          </div>

          <div className="p-4 border-t flex items-center gap-3 bg-white">

            <textarea
              className="flex-1 resize-none rounded-lg border px-3 py-2 focus:outline-none"
              placeholder="Type your legal issue..."
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="px-4 py-2 rounded-lg bg-[#090979] text-white disabled:opacity-50"
            >
              Send
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
