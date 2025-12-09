import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import './BlogList.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://pankaj-finxt-backend.onrender.com/api';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      console.log('Fetching blogs from:', `${API_BASE}/blogs`);
      const response = await axios.get(`${API_BASE}/blogs`);
      setBlogs(response.data.blogs || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      const token = localStorage.getItem('token');
      console.log('Deleting blog:', `${API_BASE}/blogs/${id}`);
      await axios.delete(`${API_BASE}/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBlogs();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting blog: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePublish = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const url = `${API_BASE}/blogs/${id}`;
      console.log('Updating publish status:', url, 'to:', !currentStatus);
      
      try {
        // Try PATCH first
        await axios.patch(url, 
          { published: !currentStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (patchError) {
        // Fallback to PUT if PATCH fails
        if (patchError.response?.status === 404) {
          console.log('PATCH failed, trying PUT...');
          await axios.put(url, 
            { published: !currentStatus },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          throw patchError;
        }
      }
      
      fetchBlogs();
    } catch (error) {
      console.error('Publish error:', error);
      alert('Error updating publish status: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="blog-list-container">
        <div className="header">
          <h1>Blog Posts</h1>
          <Link to="/blogs/create" className="btn-primary">Create New Blog</Link>
        </div>
        {blogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No blogs found. Create your first blog post!</p>
          </div>
        ) : (
          <table className="blog-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map(blog => (
                <tr key={blog._id}>
                  <td>{blog.title}</td>
                  <td>{blog.slug}</td>
                  <td>{blog.tags?.join(', ') || 'No tags'}</td>
                  <td>
                    <span className={`status-badge ${blog.published ? 'published' : 'draft'}`}>
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button 
                      onClick={() => handlePublish(blog._id, blog.published)} 
                      className={`btn-publish ${blog.published ? 'unpublish' : ''}`}
                    >
                      {blog.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <Link to={`/blogs/edit/${blog._id}`} className="btn-edit">Edit</Link>
                    <button onClick={() => handleDelete(blog._id)} className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default BlogList;
