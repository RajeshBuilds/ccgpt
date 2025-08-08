import { Artifact } from '@/components/create-artifact';
import { DiffView } from '@/components/diffview';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { Editor } from '@/components/text-editor';
import { Markdown } from '@/components/markdown';
import {
  ClockRewind,
  CopyIcon,
  MessageIcon,
  PenIcon,
  RedoIcon,
  UndoIcon,
  EyeIcon,
} from '@/components/icons';
import type { Suggestion } from '@/lib/db/schema';
import { toast } from 'sonner';
import { getSuggestions } from '../actions';
import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TextArtifactMetadata {
  suggestions: Array<Suggestion>;
}

export const textArtifact = new Artifact<'text', TextArtifactMetadata>({
  kind: 'text',
  description: 'Useful for text content, like drafting essays and emails.',
  initialize: async ({ documentId, setMetadata }) => {
    const suggestions = await getSuggestions({ documentId });

    setMetadata({
      suggestions,
    });
  },
  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    if (streamPart.type === 'data-suggestion') {
      setMetadata((metadata) => {
        return {
          suggestions: [...metadata.suggestions, streamPart.data],
        };
      });
    }

    if (streamPart.type === 'data-textDelta') {
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          content: draftArtifact.content + streamPart.data,
          isVisible:
            draftArtifact.status === 'streaming' &&
            draftArtifact.content.length > 400 &&
            draftArtifact.content.length < 450
              ? true
              : draftArtifact.isVisible,
          status: 'streaming',
        };
      });
    }
  },
  content: ({
    mode,
    status,
    content,
    isCurrentVersion,
    currentVersionIndex,
    onSaveContent,
    getDocumentContentById,
    isLoading,
    metadata,
  }) => {
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');
    const [localContent, setLocalContent] = useState(content);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Update local content when external content changes (but not when we're typing)
    useEffect(() => {
      if (status === 'streaming') {
        setLocalContent(content);
        setHasUnsavedChanges(false);
      } else if (content !== localContent && !hasUnsavedChanges) {
        // Only update if the content is different and we don't have unsaved changes
        // This handles cases like loading new documents or version changes
        setLocalContent(content);
      }
    }, [content, status, hasUnsavedChanges]);

    if (isLoading) {
      return <DocumentSkeleton artifactKind="text" />;
    }

    if (mode === 'diff') {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);

      return <DiffView oldContent={oldContent} newContent={newContent} />;
    }

    const handleContentChange = useCallback((newContent: string) => {
      setLocalContent(newContent);
      setHasUnsavedChanges(newContent !== content);
    }, [content]);

    const handleSave = useCallback(async () => {
      if (!hasUnsavedChanges) return;
      
      setIsSaving(true);
      try {
        await onSaveContent(localContent, true);
        setHasUnsavedChanges(false);
        toast.success('Document saved successfully');
      } catch (error) {
        toast.error('Failed to save document');
      } finally {
        setIsSaving(false);
      }
    }, [localContent, hasUnsavedChanges, onSaveContent]);

    return (
      <>
        <div className="flex flex-col h-full">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'preview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('preview')}
                className="flex items-center gap-2"
              >
                <EyeIcon size={16} />
                Preview Only
              </Button>
              <Button
                variant={viewMode === 'edit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('edit')}
                className="flex items-center gap-2"
              >
                <PenIcon size={16} />
                Edit & Preview
              </Button>
              
              {/* Save Button - only show in edit mode */}
              {viewMode === 'edit' && (
                <Button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || isSaving}
                  size="sm"
                  className="ml-4"
                >
                  {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {viewMode === 'edit' && hasUnsavedChanges && (
                <span className="text-orange-600 dark:text-orange-400">● Unsaved changes</span>
              )}
              <span>
                {viewMode === 'edit' ? 'Markdown editor with live preview' : 'Read-only preview'}
              </span>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {viewMode === 'preview' ? (
              <div className="prose dark:prose-invert max-w-none p-8 md:p-20 overflow-y-auto flex-1">
                <Markdown>{localContent}</Markdown>
              </div>
            ) : (
              <>
                {/* Side-by-side Markdown Editor */}
                <div className="flex-1 flex flex-col border-r">
                  <div className="p-3 border-b bg-muted/50 text-sm font-medium text-muted-foreground">
                    Markdown Source
                  </div>
                  <Textarea
                    value={localContent}
                    onChange={(e) => {
                      handleContentChange(e.target.value);
                    }}
                    className="flex-1 resize-none border-0 rounded-none focus-visible:ring-0 font-mono text-sm"
                    placeholder="Write your markdown here..."
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="p-3 border-b bg-muted/50 text-sm font-medium text-muted-foreground">
                    Live Preview
                  </div>
                  <div className="prose dark:prose-invert max-w-none p-6 overflow-y-auto flex-1">
                    <Markdown>{localContent || '*Start typing to see preview...*'}</Markdown>
                  </div>
                </div>
              </>
            )}

            {metadata?.suggestions && metadata.suggestions.length > 0 ? (
              <div className="md:hidden h-dvh w-12 shrink-0" />
            ) : null}
          </div>
        </div>
      </>
    );
  },
  actions: [
    {
      icon: <ClockRewind size={18} />,
      description: 'View changes',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('toggle');
      },
      isDisabled: ({ currentVersionIndex, setMetadata }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy to clipboard',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard!');
      },
    },
  ],
  toolbar: [
    {
      icon: <PenIcon />,
      description: 'Add final polish',
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: 'user',
          parts: [
            {
              type: 'text',
              text: 'Please add final polish and check for grammar, add section titles for better structure, and ensure everything reads smoothly.',
            },
          ],
        });
      },
    },
    {
      icon: <MessageIcon />,
      description: 'Request suggestions',
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: 'user',
          parts: [
            {
              type: 'text',
              text: 'Please add suggestions you have that could improve the writing.',
            },
          ],
        });
      },
    },
  ],
});
