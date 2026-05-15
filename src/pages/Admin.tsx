import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2, LogOut, FileText, Check, X } from 'lucide-react';
import Navbar from '../components/Navbar';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  createdAt: any;
  published: boolean;
  authorId: string;
}

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchPosts();
      } else {
        setPosts([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const fetchPosts = () => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
      setPosts(postsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. You might not have permission.");
      setLoading(false);
    });
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to login.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!currentPost.title || !currentPost.content) {
      setError('Title and content are required.');
      return;
    }

    try {
      if (currentPost.id) {
        // Update
        const postRef = doc(db, 'posts', currentPost.id);
        await updateDoc(postRef, {
          title: currentPost.title,
          content: currentPost.content,
          excerpt: currentPost.excerpt || '',
          published: currentPost.published || false,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create
        await addDoc(collection(db, 'posts'), {
          title: currentPost.title,
          content: currentPost.content,
          excerpt: currentPost.excerpt || '',
          published: currentPost.published || false,
          authorId: user.uid,
          createdAt: serverTimestamp()
        });
      }
      setIsEditing(false);
      setCurrentPost({});
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save post. Check permissions.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, 'posts', id));
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete post.");
    }
  };

  const handleEdit = (post: BlogPost) => {
    setCurrentPost(post);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentPost({ published: false });
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050a30] flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050a30] text-white flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a1142] border border-white/10 p-12 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full border border-[#d4af37] flex items-center justify-center text-[#d4af37] mx-auto mb-6">
            <FileText size={24} />
          </div>
          <h1 className="font-serif text-3xl mb-4">Admin Portal</h1>
          <p className="text-gray-400 font-light mb-8">Sign in to manage your blog posts.</p>
          
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          
          <button 
            onClick={handleLogin}
            className="w-full bg-[#d4af37] text-[#050a30] px-8 py-4 uppercase tracking-widest text-sm font-bold hover:bg-white transition-colors"
          >
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050a30] text-white selection:bg-[#d4af37] selection:text-[#050a30]">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="font-serif text-4xl mb-2">Dashboard</h1>
            <p className="text-gray-400 font-light text-sm">Logged in as {user.email}</p>
          </div>
          <div className="flex space-x-4">
            {!isEditing && (
              <button 
                onClick={handleCreateNew}
                className="flex items-center px-6 py-3 bg-[#d4af37] text-[#050a30] uppercase tracking-widest text-xs font-bold hover:bg-white transition-colors"
              >
                <Plus size={16} className="mr-2" /> New Post
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="flex items-center px-6 py-3 border border-white/20 hover:border-white transition-colors uppercase tracking-widest text-xs font-bold"
            >
              <LogOut size={16} className="mr-2" /> Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 mb-8 flex justify-between items-center">
            <p className="text-sm">{error}</p>
            <button onClick={() => setError('')}><X size={16} /></button>
          </div>
        )}

        {isEditing ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a1142] border border-white/5 p-8"
          >
            <h2 className="font-serif text-2xl mb-8">{currentPost.id ? 'Edit Post' : 'Create New Post'}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 block mb-2">Title</label>
                <input 
                  type="text" 
                  value={currentPost.title || ''}
                  onChange={e => setCurrentPost({...currentPost, title: e.target.value})}
                  className="w-full bg-transparent border-b border-white/20 pb-2 focus:outline-none focus:border-[#d4af37] transition-colors text-white text-xl font-serif"
                  placeholder="Post Title"
                  required
                />
              </div>
              
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 block mb-2">Excerpt (Short Summary)</label>
                <textarea 
                  value={currentPost.excerpt || ''}
                  onChange={e => setCurrentPost({...currentPost, excerpt: e.target.value})}
                  rows={2}
                  className="w-full bg-transparent border-b border-white/20 pb-2 focus:outline-none focus:border-[#d4af37] transition-colors text-white resize-none font-light"
                  placeholder="Brief summary for the blog list..."
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 block mb-2">Content</label>
                <textarea 
                  value={currentPost.content || ''}
                  onChange={e => setCurrentPost({...currentPost, content: e.target.value})}
                  rows={15}
                  className="w-full bg-transparent border border-white/10 p-4 focus:outline-none focus:border-[#d4af37] transition-colors text-white resize-y font-light leading-relaxed"
                  placeholder="Write your post content here..."
                  required
                />
              </div>

              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="published"
                  checked={currentPost.published || false}
                  onChange={e => setCurrentPost({...currentPost, published: e.target.checked})}
                  className="w-4 h-4 accent-[#d4af37]"
                />
                <label htmlFor="published" className="text-sm text-gray-300">Publish immediately</label>
              </div>

              <div className="flex space-x-4 pt-6 border-t border-white/10">
                <button 
                  type="submit"
                  className="px-8 py-3 bg-[#d4af37] text-[#050a30] uppercase tracking-widest text-xs font-bold hover:bg-white transition-colors flex items-center"
                >
                  <Check size={16} className="mr-2" /> Save Post
                </button>
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-8 py-3 border border-white/20 hover:border-white transition-colors uppercase tracking-widest text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <div className="bg-[#0a1142] border border-white/5 overflow-hidden">
            {posts.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-light">
                No posts found. Create your first post to get started.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-gray-500">
                    <th className="p-6 font-medium">Title</th>
                    <th className="p-6 font-medium">Status</th>
                    <th className="p-6 font-medium">Date</th>
                    <th className="p-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-6">
                        <p className="font-serif text-lg">{post.title}</p>
                      </td>
                      <td className="p-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-6 text-sm text-gray-400 font-light">
                        {post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMM d, yyyy') : 'Just now'}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end space-x-3">
                          <button 
                            onClick={() => handleEdit(post)}
                            className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
