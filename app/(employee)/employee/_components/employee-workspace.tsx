"use client";

import { useState, useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { Chat } from "@/components/chat";

import { ReadonlyText } from "@/components/readonly-text";
import { Info as InfoIcon } from "lucide-react";
// Dummy TicketDetails component for demonstration
function TicketDetails({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 h-full w-full relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
        title="Close Ticket Details"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6"/></svg>
      </button>
      <h2 className="font-semibold text-base mb-2 pr-8">Ticket Details</h2>
      <div className="text-sm text-zinc-700 dark:text-zinc-200">All ticket details go here.</div>
    </div>
  );
}
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";

export default function EmployeeWorkspace({
  chatId,
  initialMessages,
  initialChatModel,
  isReadonly,
  session,
  autoResume,
  complaintId,
}: {
  chatId: string;
  initialMessages: any[];
  initialChatModel: string;
  isReadonly: boolean;
  session: any;
  autoResume: boolean;
  complaintId: string;
}) {

  // Collapse sidebar when readonly text is visible
  const { setOpen } = useSidebar();
  // Local state for workspace visibility
  const [openWorkSpace, setOpenWorkSpace] = useState(false);
  const [showTicketDetails, setShowTicketDetails] = useState(true);
  const handleToggleWorkSpace = () => {
    setOpenWorkSpace((v) => !v);
  };
  const handleToggleTicketDetails = () => {
    setShowTicketDetails((v) => !v);
  };

  useEffect(() => {
    if (openWorkSpace) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [openWorkSpace, setOpen]);
  const [textInput, setTextInput] = useState("This is a sample summary of the complaint with ref Id #00000. Add more details here as needed.");

  if (!session?.user) return null;

  return (
    <>
      <header className="w-full py-4 px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between z-40">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Complaint Resolution Assistant</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleWorkSpace}
            className="px-3 py-2 rounded bg-black text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
            style={{ minWidth: 0, minHeight: 0 }}
          >
            {openWorkSpace ? "Close Workspace" : "Open Workspace"}
          </button>
        </div>
      {/* Floating button to toggle ticket details (only when closed) */}
      {openWorkSpace && !showTicketDetails && (
        <button
          onClick={handleToggleTicketDetails}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg transition-colors flex items-center justify-center bg-black text-white hover:bg-zinc-800"
          title="Show Ticket Details"
        >
          <InfoIcon size={22} />
        </button>
      )}
      </header>
      <div className={openWorkSpace ? "flex w-full flex-1 gap-4 overflow-hidden" : "w-full flex-1 overflow-hidden"}>
        {/* Left: Chat */}
        <motion.div
          className={
            openWorkSpace
              ? "min-w-0 rounded-lg p-1 bg-zinc-100 dark:bg-zinc-900 h-full flex flex-col"
              : "min-w-0 bg-white h-full flex flex-col"
          }
          animate={openWorkSpace ? { flexBasis: '35%', width: '35%' } : { flexBasis: '100%', width: '100%' }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          style={{ flexGrow: 0, flexShrink: 0, minWidth: 0 }}
        >   
                <Chat
                id={chatId}
                complaintId={complaintId}
                initialMessages={initialMessages}
                initialChatModel={DEFAULT_CHAT_MODEL}
                isReadonly={false}
                session={session}
                autoResume={true}/>
                      
        </motion.div>
        {/* Right: ReadonlyText (top half) and TicketDetails (bottom half) */}
        <AnimatePresence>
          <motion.div
            className={openWorkSpace ? "min-w-0 flex-1 flex flex-col min-h-0" : "min-w-0 flex-1 min-h-0"}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {openWorkSpace && (
              <>
                <div className={showTicketDetails ? "flex-1 min-h-0 flex flex-col" : "flex-1 min-h-0"} style={{ height: showTicketDetails ? '50%' : '100%' }}>
                  <ReadonlyText 
                    content={textInput}
                    header="Resolution Summary"
                  />
                </div>
                <AnimatePresence initial={false}>
                  {showTicketDetails && (
                    <motion.div
                      key="ticket-details"
                      className="flex-1 min-h-0 border-t border-zinc-200 dark:border-zinc-800 overflow-auto"
                      initial={{ opacity: 0, y: 40, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: '100%' }}
                      exit={{ opacity: 0, y: 40, height: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      <TicketDetails onClose={handleToggleTicketDetails} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
