"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { AdminLayout } from "@/components/admin-layout";
import { Mail, CheckCircle2, Trash2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "unread" | "read";
  createdAt: any;
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgData: ContactMessage[] = [];
      snapshot.forEach((doc) => {
        msgData.push({ id: doc.id, ...doc.data() } as ContactMessage);
      });
      setMessages(msgData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "messages", id), {
        status: "read"
      });
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteDoc(doc(db, "messages", id));
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" ? true : msg.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout title="Messages">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-zinc-900">Contact Messages</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all bg-white"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl p-1">
            <Filter size={16} className="text-zinc-400 ml-2" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium text-zinc-700 py-1.5 px-2"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] border border-zinc-200/60 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-zinc-500">Loading messages...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              <Mail className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
              <p>No messages found matching your criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredMessages.map((msg) => (
                <div key={msg.id} className={`p-6 transition-colors ${msg.status === 'unread' ? 'bg-pink-50/30' : 'bg-white'}`}>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg font-semibold ${msg.status === 'unread' ? 'text-zinc-900' : 'text-zinc-700'}`}>
                          {msg.name}
                        </h3>
                        {msg.status === 'unread' && (
                          <span className="bg-pink-100 text-rose-600 text-xs px-2 py-0.5 rounded-full font-medium">New</span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500 font-medium">{msg.email}</p>

                      <div className="mt-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-zinc-700 whitespace-pre-wrap">
                        {msg.message}
                      </div>

                      <div className="text-xs text-zinc-400 mt-2">
                        Received on: {msg.createdAt?.toDate().toLocaleDateString()} at {msg.createdAt?.toDate().toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <a href={`mailto:${msg.email}?subject=Re: Your message to Lucky Balls`} target="_blank" rel="noopener noreferrer">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 rounded-full border-zinc-200 bg-white hover:bg-zinc-50"
                        >
                          <Mail size={16} className="text-blue-600" />
                          Reply via Email
                        </Button>
                      </a>

                      {msg.status === 'unread' && (
                        <Button
                          onClick={() => markAsRead(msg.id)}
                          size="sm"
                          variant="outline"
                          className="gap-2 rounded-full border-zinc-200 bg-white"
                        >
                          <CheckCircle2 size={16} className="text-green-600" />
                          Mark as Read
                        </Button>
                      )}
                      <Button
                        onClick={() => deleteMessage(msg.id)}
                        size="icon"
                        variant="ghost"
                        className="rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
