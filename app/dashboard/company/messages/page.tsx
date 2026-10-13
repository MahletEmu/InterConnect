'use client';

import React, { useState } from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { Send, Search, CheckCheck } from 'lucide-react';

export default function CompanyMessagesPage() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    currentCompany,
  } = useInterConnect();

  const [inputMessage, setInputMessage] = useState('');

  const activeConv =
    conversations.find((c) => c.id === activeConversationId) || conversations[0] || null;

  const currentMessages = activeConv ? messages[activeConv.id] || [] : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;
    sendMessage(activeConv.id, inputMessage);
    setInputMessage('');
  };

  return (
    <div className="min-h-screen bg-brand-canvas flex">
      <DashboardSidebar
        mobileOpen={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <DashboardTopbar onToggleMobileMenu={() => setMobileSidebar(!mobileSidebar)} />

        <main className="p-4 sm:p-6 flex-1 max-w-7xl w-full mx-auto flex flex-col space-y-4">

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-sky">
              Candidate Inquiries
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-navy mt-1">
              Recruiter Candidate Communications
            </h1>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft flex-1 flex flex-col md:flex-row overflow-hidden min-h-[520px]">
            {conversations.length === 0 || !activeConv ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-canvas border border-brand-border flex items-center justify-center text-brand-sky mb-3">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy mb-1.5">
                  No Candidate Conversations Yet
                </h3>
                <p className="text-xs text-brand-muted max-w-sm">
                  When applicants reach out or when you contact talent from your ATS pipeline, conversation threads will appear here.
                </p>
              </div>
            ) : (
              <>
                {/* Conversation list */}
                <div className="w-full md:w-80 border-r border-brand-border flex flex-col max-h-56 md:max-h-none shrink-0">
              <div className="p-3.5 border-b border-brand-border">
                <div className="relative">
                  <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search candidate chat..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-brand-canvas text-xs text-brand-text focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-brand-border/40">
                {conversations.map((conv) => {
                  const isSelected = conv.id === activeConv?.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConversationId(conv.id)}
                      className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                        isSelected ? 'bg-brand-tint/40' : 'hover:bg-brand-canvas'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-brand-canvas border border-brand-border flex items-center justify-center font-bold text-xs text-brand-navy shrink-0">
                        {conv.studentName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="font-heading font-extrabold text-xs text-brand-navy truncate">
                            {conv.studentName}
                          </h4>
                          <span className="text-[10px] text-brand-muted">{conv.lastMessageTime}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-brand-sky truncate mb-0.5">
                          {conv.roleTitle}
                        </p>
                        <p className="text-xs text-brand-muted truncate leading-tight">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="p-3.5 sm:p-4 border-b border-brand-border flex items-center justify-between bg-brand-canvas/30">
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-brand-navy">
                    {activeConv.studentName}
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Candidate for <span className="font-semibold text-brand-sky">{activeConv.roleTitle}</span>
                  </p>
                </div>
              </div>

              <div className="p-3.5 sm:p-5 flex-1 overflow-y-auto space-y-3">
                {currentMessages.map((msg) => {
                  const isMe = msg.senderRole === 'company';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-brand-muted mb-0.5 px-1">
                        {msg.senderName} · {msg.timestamp}
                      </span>
                      <div
                        className={`max-w-lg p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-brand-navy text-white rounded-br-xs shadow-soft'
                            : 'bg-brand-canvas text-brand-navy border border-brand-border rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-brand-muted px-1">
                        {isMe && <CheckCheck className="w-3 h-3 text-brand-sky" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSend} className="p-3 sm:p-3.5 border-t border-brand-border bg-white flex items-center gap-2.5">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Send candidate instructions as ${currentCompany?.name}...`}
                  className="flex-1 py-2.5 px-3.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white shadow-soft transition-all"
                >
                  <Send className="w-4 h-4 text-brand-sky" />
                </button>
              </form>
            </div>
              </>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
