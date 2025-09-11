'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  MessageSquare, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Calendar,
  Plus,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  apiKey: string;
  userId: string;
  currentConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  onCreateNew: () => void;
}

export function ConversationList({ 
  apiKey, 
  userId, 
  currentConversationId,
  onConversationSelect,
  onCreateNew 
}: ConversationListProps) {
  // React Query hooks
  const { 
    conversations, 
    isLoading: loading, 
    error: queryError
  } = useDifyConversations(userId, apiKey);
  
  const { 
    renameConversation, 
    deleteConversation 
  } = useDifyMutations(userId, apiKey);
  
  // Dialog states
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<DifyConversation | null>(null);
  const [newName, setNewName] = useState('');

  const error = queryError?.message || null;

  const handleRename = async () => {
    if (!selectedConversation || !newName.trim()) return;

    try {
      await renameConversation.mutateAsync({
        conversationId: selectedConversation.id,
        name: newName.trim()
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

  const openRenameDialog = (conversation: DifyConversation) => {
    setSelectedConversation(conversation);
    setNewName(conversation.name || '');
    setRenameDialogOpen(true);
  };

  const openDeleteDialog = (conversation: DifyConversation) => {
    setSelectedConversation(conversation);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </CardTitle>
            <Button 
              size="sm" 
              onClick={onCreateNew}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 border-b">
              {error}
            </div>
          )}
          
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-2 space-y-1">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs">Start a new chat to begin</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      currentConversationId === conversation.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => onConversationSelect(conversation.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate">
                          {conversation.name || 'Untitled Conversation'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openRenameDialog(conversation)}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(conversation)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
            <DialogDescription>
              Enter a new name for this conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Conversation name"
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRenameDialogOpen(false)}
              disabled={renameConversation.isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRename}
              disabled={renameConversation.isLoading || !newName.trim()}
            >
              {renameConversation.isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Rename
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
              Are you sure you want to delete &quot;{selectedConversation?.name || 'this conversation'}&quot;? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteConversation.isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteConversation.isLoading}
            >
              {deleteConversation.isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
