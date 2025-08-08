'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar';
import type { Chat } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';
import useSWR from 'swr';
import { ChatHistoryItem } from './chat-history-item';

interface ChatHistoryProps {
  customerId: number;
  setOpenMobile?: (open: boolean) => void;
}

export function ChatHistory({ customerId, setOpenMobile = () => {} }: ChatHistoryProps) {
  const { id } = useParams();
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch chats for the customer
  const { data: chatHistory, mutate, isLoading } = useSWR<{
    chats: Chat[];
    hasMore: boolean;
  }>(`/api/history?limit=50`, fetcher);

  const handleDelete = async (chatId: string) => {
    setDeleteId(chatId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
      method: 'DELETE',
    });

    toast.promise(deletePromise, {
      loading: 'Deleting chat...',
      success: () => {
        mutate((currentData) => {
          if (currentData) {
            return {
              ...currentData,
              chats: currentData.chats.filter((chat) => chat.id !== deleteId),
            };
          }
          return currentData;
        });

        return 'Chat deleted successfully';
      },
      error: 'Failed to delete chat',
    });

    setShowDeleteDialog(false);

    if (deleteId === id) {
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Chat History</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="px-2 py-2 text-sm text-muted-foreground">
            Loading chats...
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (!chatHistory || chatHistory.chats.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Chat History</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="px-2 py-2 text-sm text-muted-foreground">
            No chat history found.
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  // Group chats by isDraft flag
  const complaints = chatHistory.chats.filter((chat) => !chat.isDraft);
  const drafts = chatHistory.chats.filter((chat) => chat.isDraft);

  return (
    <>
      {/* My Complaints Section */}
      {complaints.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>My Complaints</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {complaints.map((chat) => (
                <ChatHistoryItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === id}
                  onDelete={handleDelete}
                  setOpenMobile={setOpenMobile}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Drafts Section */}
      {drafts.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Drafts</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {drafts.map((chat) => (
                <ChatHistoryItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === id}
                  onDelete={handleDelete}
                  setOpenMobile={setOpenMobile}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 