import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import './BlogList.css';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/blogs');
      // Fix: Extract blogs array from response data
      setBlogs(response.data.blogs || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBlogs();
    } catch (error) {
      alert('Error deleting blog');
    }
  };

  const handlePublish = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/blogs/${id}/publish`, 
        { published: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBlogs();
    } catch (error) {
      alert('Error updating publish status');
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
