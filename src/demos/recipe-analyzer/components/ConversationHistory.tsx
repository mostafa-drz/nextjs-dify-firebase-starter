'use client';

/**
 * @fileoverview Conversation history component for Recipe Analyzer demo
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useDifyConversations, useDifyMutations } from '@/lib/hooks/useDify';
import { DifyConversation } from '@/types/dify';
import {
  History,
  MessageSquare,
  Plus,
  Loader2,
  AlertTriangle,
  Edit2,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConversationHistoryProps {
  userId: string;
  currentConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  onCreateNew: () => void;
}

export function ConversationHistory({
  userId,
  currentConversationId,
  onConversationSelect,
  onCreateNew,
}: ConversationHistoryProps) {
  const router = useRouter();

  // Use React Query hooks for conversations and mutations
  const { conversations, isLoading, error } = useDifyConversations(userId);
  const { renameConversation, deleteConversation } = useDifyMutations(userId);

  // Dialog states
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<DifyConversation | null>(null);
  const [newName, setNewName] = useState('');

  const handleConversationClick = (conversationId: string) => {
    onConversationSelect(conversationId);
    // Update URL with conversation parameter
    router.push(`/demos/recipe-analyzer?conversation=${conversationId}`);
  };

  const handleCreateNewClick = () => {
    onCreateNew();
    // Clear conversation parameter from URL
    router.push('/demos/recipe-analyzer');
  };

  const handleRename = async () => {
    if (!selectedConversation || !newName.trim()) return;

    try {
      await renameConversation.mutateAsync({
        conversationId: selectedConversation.id,
        name: newName.trim(),
      });

      setRenameDialogOpen(false);
      setNewName('');
    } catch (err) {
      console.error('Error renaming conversation:', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedConversation) return;

    try {
      await deleteConversation.mutateAsync(selectedConversation.id);
      setDeleteDialogOpen(false);

      // If we deleted the current conversation, redirect to new chat
      if (currentConversationId === selectedConversation.id) {
        onCreateNew();
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  const openRenameDialog = useCallback((conversation: DifyConversation) => {
    setSelectedConversation(conversation);
    setNewName(conversation.name || '');
    setRenameDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((conversation: DifyConversation) => {
    setSelectedConversation(conversation);
    setDeleteDialogOpen(true);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <CardTitle className="text-lg">Conversations</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateNewClick}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Your recipe analysis history</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center px-4 py-8">
            <AlertTriangle className="text-destructive mb-2 h-6 w-6" />
            <p className="text-destructive text-center text-sm">
              {error instanceof Error ? error.message : 'Failed to load conversations'}
            </p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-8">
            <MessageSquare className="text-muted-foreground mb-2 h-8 w-8" />
            <p className="text-muted-foreground mb-3 text-center text-sm">No conversations yet</p>
            <Button variant="outline" size="sm" onClick={handleCreateNewClick}>
              Start analyzing
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-1 p-4">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group hover:bg-accent rounded-lg p-3 transition-colors ${
                    currentConversationId === conversation.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => handleConversationClick(conversation.id)}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="truncate text-sm font-medium">
                          {conversation.name || 'Recipe Analysis'}
                        </h4>
                        {conversation.status === 'active' && (
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      {conversation.introduction && (
                        <p className="text-muted-foreground line-clamp-2 text-xs">
                          {conversation.introduction}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-muted-foreground shrink-0 text-xs">
                        {formatDate(conversation.updated_at.toString())}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openRenameDialog(conversation)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(conversation)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
            <DialogDescription>Enter a new name for this conversation.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter conversation name..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={!newName.trim() || renameConversation.isPending}
            >
              {renameConversation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Renaming...
                </>
              ) : (
                'Rename'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedConversation?.name || 'Recipe Analysis'}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteConversation.isPending}
            >
              {deleteConversation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
