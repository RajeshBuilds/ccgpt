"use client";

import { useState, useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { Chat } from "@/components/chat";

import ComplaintSummary from "./complaint-summary";
import { Info as InfoIcon } from "lucide-react";
// Dummy TicketDetails component for demonstration
import TicketDetails from "./ticket-details";
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
  const [summaryBody, setSummaryBody] = useState("Select any ticket to view the summary");
  const [summaryHeader, setSummaryHeader] = useState<string>("Summary");
  const [complaintDetails, setComplaintDetails] = useState<any>(null);

  if (!session?.user) return null;

  return (
    <>
      <header className="w-full py-2 mt-3 px-6 dark:bg-zinc-900  border-zinc-200 dark:border-zinc-800 flex items-center justify-between z-40">
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
      <div className={openWorkSpace
        ? "flex w-full flex-1 gap-6 overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 px-4 md:px-8 py-3 md:py-3 rounded-2xl shadow-2xl"
        : "w-full flex-1 overflow-hidden bg-white dark:bg-zinc-900 px-2 md:px-4 py-3 md:py-3 rounded-2xl"}>
        <motion.div
          className={
            "min-w-0 rounded-2xl p-4 bg-white/80 dark:bg-zinc-900/80 h-full flex flex-col shadow-lg border border-zinc-200 dark:border-zinc-800"
          }
          animate={openWorkSpace ? { flexBasis: '35%', width: '35%' } : { flexBasis: '100%', width: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ flexGrow: 0, flexShrink: 0, minWidth: 0 }}
        >
                <Chat
                  id={chatId}
                  complaintId={complaintId}
                  initialMessages={initialMessages}
                  initialChatModel={DEFAULT_CHAT_MODEL}
                  isReadonly={false}
                  session={session}
                  autoResume={true}
                  updateComplaintSummary={(input) => {
                    if (!openWorkSpace) setOpenWorkSpace(true);
                    // Handles: { summary: { header: string, body: string } }
                    if (input && typeof input === 'object' && input.summary && typeof input.summary === 'object') {
                      const header = typeof input.summary.header === 'string' ? input.summary.header : 'Resolution Summary';
                      const body = typeof input.summary.body === 'string' ? input.summary.body : '';
                      setSummaryHeader(header);
                      setSummaryBody(body);
                    } else if (input && typeof input === 'object' && typeof input.summary === 'string') {
                      setSummaryHeader('Resolution Summary');
                      setSummaryBody(input.summary);
                    } else {
                      setSummaryHeader('Resolution Summary');
                      setSummaryBody(input.toString() || '');
                    }
                  }}
                  updateCurrentComplaintDetails={(details) => {
                    if (!openWorkSpace) setOpenWorkSpace(true);
                    setComplaintDetails(details?.complaint || details);
                  }}
                />
                      
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
                
                <div className="flex-1 min-h-0 flex flex-col mb-3">
                  <ComplaintSummary
                    content={summaryBody}
                    header={summaryHeader}
                    className="h-full flex-1 min-h-0 flex flex-col"
                    style={{ height: '100%' }}
                  />
                </div>
          
                <AnimatePresence initial={false}>
                  {showTicketDetails && (
                    <motion.div
                      key="ticket-details"
                      className="flex-1 min-h-0 border-zinc-200 dark:border-zinc-800 overflow-auto rounded-b-2xl shadow-md bg-white/80 dark:bg-zinc-900/80"
                      initial={{ opacity: 0, y: 40, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: '100%' }}
                      exit={{ opacity: 0, y: 40, height: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      <TicketDetails onClose={handleToggleTicketDetails} complaint={complaintDetails} />
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
