'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { getCurrentUser, isAdmin, getRoleDisplayName, UserRole } from '@/lib/auth';
import { showSuccess, showError } from '@/lib/toast';

interface Post {
  id: number;
  title: string;
  content: string;
  author_id: number;
  visibility: 'public' | 'role_based' | 'user_specific' | 'private';
  status: string;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_role: string;
  visibilityDetails: {
    roles: string[];
    users: Array<{ id: number; name: string; role: string }>;
  };
  replies?: Reply[];
}

interface Reply {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_role: string;
  author_id: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
}

interface VisibilityOptions {
  roles: string[];
  users: User[];
}

export default function PostBoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [replyingToPost, setReplyingToPost] = useState<Post | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [visibilityOptions, setVisibilityOptions] = useState<VisibilityOptions>({ roles: [], users: [] });
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'role_based' | 'user_specific' | 'private'>('public');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    fetchPosts();
    fetchVisibilityOptions();
  }, []);

  const fetchPosts = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      const token = Buffer.from(JSON.stringify(user)).toString('base64');
      const response = await fetch('/api/post-board/optimized', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      } else {
        showError('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      showError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchVisibilityOptions = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      const token = Buffer.from(JSON.stringify(user)).toString('base64');
      const response = await fetch('/api/post-board/visibility-options', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVisibilityOptions(data);
      }
    } catch (error) {
      console.error('Error fetching visibility options:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      const user = getCurrentUser();
      if (!user) return;

      const token = Buffer.from(JSON.stringify(user)).toString('base64');
      const response = await fetch('/api/post-board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          visibility,
          selectedRoles: visibility === 'role_based' ? selectedRoles : [],
          selectedUsers: visibility === 'user_specific' ? selectedUsers : []
        })
      });

      if (response.ok) {
        showSuccess('Post created successfully');
        setCreateDialogOpen(false);
        resetForm();
        fetchPosts();
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showError('Failed to create post');
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setEditDialogOpen(true);
  };

  const handlePrivacySettings = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setVisibility(post.visibility);
    setSelectedRoles(post.visibilityDetails.roles);
    setSelectedUsers(post.visibilityDetails.users.map(u => u.id));
    setPrivacyDialogOpen(true);
  };

  const handleReply = (post: Post) => {
    setReplyingToPost(post);
    setReplyContent('');
    setReplyDialogOpen(true);
  };

  const handleCreateReply = async () => {
    if (!replyingToPost || !replyContent.trim()) {
      showError('Please enter a reply');
      return;
    }

    try {
      const user = getCurrentUser();
      if (!user) return;

      const token = Buffer.from(JSON.stringify(user)).toString('base64');
      const response = await fetch(`/api/post-board/${replyingToPost.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: replyContent.trim()
        })
      });

      if (response.ok) {
        showSuccess('Reply added successfully');
        setReplyDialogOpen(false);
        setReplyingToPost(null);
        setReplyContent('');
        fetchPosts(); // Refresh to get updated replies
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to add reply');
      }
    } catch (error) {
      console.error('Error creating reply:', error);
      showError('Failed to add reply');
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost || !title.trim() || !content.trim()) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      const user = getCurrentUser();
      if (!user) return;

      const token = Buffer.from(JSON.stringify(user)).toString('base64');
      const response = await fetch(`/api/post-board/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          visibility: editingPost.visibility,
          selectedRoles: editingPost.visibilityDetails.roles,
          selectedUsers: editingPost.visibilityDetails.users.map(u => u.id)
        })
      });

      if (response.ok) {
        showSuccess('Note updated successfully');
        setEditDialogOpen(false);
        setEditingPost(null);
        resetForm();
        fetchPosts();
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      showError('Failed to update note');
    }
  };

  const handleUpdatePrivacy = async () => {
    if (!editingPost || !title.trim() || !content.trim()) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      const user = getCurrentUser();
      if (!user) return;

      const token = Buffer.from(JSON.stringify(user)).toString('base64');
      const response = await fetch(`/api/post-board/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          visibility,
          selectedRoles: visibility === 'role_based' ? selectedRoles : [],
          selectedUsers: visibility === 'user_specific' ? selectedUsers : []
        })
      });

      if (response.ok) {
        showSuccess('Privacy settings updated successfully');
        setPrivacyDialogOpen(false);
        setEditingPost(null);
        resetForm();
        fetchPosts();
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to update privacy settings');
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      showError('Failed to update privacy settings');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const user = getCurrentUser();
      if (!user) return;

      const token = Buffer.from(JSON.stringify(user)).toString('base64');
      const response = await fetch(`/api/post-board/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showSuccess('Post deleted successfully');
        fetchPosts();
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showError('Failed to delete post');
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setVisibility('public');
    setSelectedRoles([]);
    setSelectedUsers([]);
  };

  const getVisibilityBadgeColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'role_based': return 'bg-blue-100 text-blue-800';
      case 'user_specific': return 'bg-purple-100 text-purple-800';
      case 'private': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityDescription = (post: Post) => {
    const isAdminUser = isAdmin();
    
    switch (post.visibility) {
      case 'public':
        return 'Everyone can see this post';
      case 'role_based':
        const roleText = `Only ${post.visibilityDetails.roles.join(', ')} can see this post`;
        return isAdminUser ? `${roleText} (You can see this as admin)` : roleText;
      case 'user_specific':
        const userText = `Only ${post.visibilityDetails.users.map(u => u.name).join(', ')} can see this post`;
        return isAdminUser ? `${userText} (You can see this as admin)` : userText;
      case 'private':
        return isAdminUser ? 'Only author and admin can see this post (You can see this as admin)' : 'Only you and admin can see this post';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Note Board</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                      <DialogTrigger asChild>
              <Button>Create New Note</Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title"
                />
              </div>
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter post content"
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="visibility">Visibility *</Label>
                <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Everyone can see</SelectItem>
                    <SelectItem value="role_based">Role-based - Specific roles only</SelectItem>
                    <SelectItem value="user_specific">User-specific - Specific users only</SelectItem>
                    <SelectItem value="private">Private - Only you and admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {visibility === 'role_based' && (
                <div>
                  <Label>Select Roles</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {visibilityOptions.roles.map((role) => (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox
                          id={role}
                          checked={selectedRoles.includes(role)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRoles([...selectedRoles, role]);
                            } else {
                              setSelectedRoles(selectedRoles.filter(r => r !== role));
                            }
                          }}
                        />
                        <Label htmlFor={role} className="text-sm">{role}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {visibility === 'user_specific' && (
                <div>
                  <Label>Select Users</Label>
                  <div className="max-h-40 overflow-y-auto mt-2 space-y-2">
                    {visibilityOptions.users.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                        />
                        <Label htmlFor={`user-${user.id}`} className="text-sm">
                          {user.name} ({getRoleDisplayName(user.role as UserRole)})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePost}>
                  Create Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Note Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter note title"
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Content *</Label>
                <Textarea
                  id="edit-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter note content"
                  rows={6}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePost}>
                  Update Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Privacy Settings Dialog */}
        <Dialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Note Privacy Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="privacy-title">Title *</Label>
                <Input
                  id="privacy-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter note title"
                />
              </div>
              <div>
                <Label htmlFor="privacy-content">Content *</Label>
                <Textarea
                  id="privacy-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter note content"
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="privacy-visibility">Visibility *</Label>
                <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Everyone can see</SelectItem>
                    <SelectItem value="role_based">Role-based - Specific roles only</SelectItem>
                    <SelectItem value="user_specific">User-specific - Specific users only</SelectItem>
                    <SelectItem value="private">Private - Only you and admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {visibility === 'role_based' && (
                <div>
                  <Label>Select Roles</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {visibilityOptions.roles.map((role) => (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox
                          id={`privacy-role-${role}`}
                          checked={selectedRoles.includes(role)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRoles([...selectedRoles, role]);
                            } else {
                              setSelectedRoles(selectedRoles.filter(r => r !== role));
                            }
                          }}
                        />
                        <Label htmlFor={`privacy-role-${role}`} className="text-sm">{role}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {visibility === 'user_specific' && (
                <div>
                  <Label>Select Users</Label>
                  <div className="max-h-40 overflow-y-auto mt-2 space-y-2">
                    {visibilityOptions.users.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`privacy-user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                        />
                        <Label htmlFor={`privacy-user-${user.id}`} className="text-sm">
                          {user.name} ({getRoleDisplayName(user.role as UserRole)})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setPrivacyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePrivacy}>
                  Update Privacy Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reply Dialog */}
        <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Reply</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {replyingToPost && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Replying to:</p>
                  <p className="font-medium">{replyingToPost.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {replyingToPost.replies ? replyingToPost.replies.length : 0} replies
                  </p>
                </div>
              )}
              <div>
                <Label htmlFor="reply-content">Reply *</Label>
                <Textarea
                  id="reply-content"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Enter your reply..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReply}>
                  Add Reply
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-gray-500">No notes found</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">
                        <span className="font-medium">Posted by:</span> {post.author_name} ({getRoleDisplayName(post.author_role as UserRole)})
                      </Badge>
                      <Badge className={getVisibilityBadgeColor(post.visibility)}>
                        {post.visibility.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {getVisibilityDescription(post)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {formatDate(post.created_at)}
                      {post.updated_at !== post.created_at && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          edited
                        </span>
                      )}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReply(post)}
                        disabled={post.replies && post.replies.length >= 5}
                      >
                        Reply
                      </Button>
                      {(currentUser?.id === post.author_id || isAdmin()) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPost(post)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrivacySettings(post)}
                          >
                            Privacy Settings
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </div>
                
                {/* Replies Section */}
                {post.replies && post.replies.length > 0 && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Replies</h4>
                    <div className="space-y-3">
                      {post.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {reply.author_name}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {getRoleDisplayName(reply.author_role as UserRole)}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatDate(reply.created_at)}
                                  {reply.updated_at !== reply.created_at && (
                                    <span className="ml-1 bg-gray-200 text-gray-600 px-1 py-0.5 rounded text-xs">
                                      edited
                                    </span>
                                  )}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 