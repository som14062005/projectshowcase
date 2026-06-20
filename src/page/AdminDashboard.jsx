import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [copiedLink, setCopiedLink] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchProjects();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/projects`,
        { projectName: newProjectName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects([...projects, response.data]);
      setNewProjectName('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating project:', error);
      alert(error.response?.data?.message || 'Error creating project');
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(projects.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  const generateProjectLink = (slug) => {
    const baseUrl = window.location.origin;
return `${baseUrl}/projects/${slug}`;
  };

  const copyProjectLink = (projectId, slug) => {
    const link = generateProjectLink(slug);
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(projectId);
      setTimeout(() => setCopiedLink(null), 2000);
    }).catch(() => {
      alert('❌ Failed to copy link');
    });
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cli-bg text-cli-green font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4 animate-pulse">Loading...</div>
          <div className="text-cli-green-dim">Fetching your projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cli-bg text-cli-green font-mono p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="border-2 border-cli-green p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-cli-green-bright mb-1">Admin Dashboard</h1>
              <p className="text-sm text-cli-green-dim">Manage your portfolio projects</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-all"
            >
              [LOGOUT]
            </button>
          </div>
        </div>

        {/* Create New Project Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-cli-green text-cli-bg font-bold hover:bg-cli-green-bright transition-all"
          >
            + CREATE NEW PROJECT
          </button>
        </div>

        {/* Projects List */}
        <div className="grid gap-4">
          {projects.length === 0 ? (
            <div className="border border-cli-green-dim p-8 text-center">
              <p className="text-cli-green-dim mb-4">No projects yet. Create your first project!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 border border-cli-green text-cli-green hover:bg-cli-green hover:text-cli-bg transition-all"
              >
                + CREATE PROJECT
              </button>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project._id}
                className="border-2 border-cli-green p-4 sm:p-6 hover:border-cli-green-bright transition-all"
              >
                <div className="flex flex-col gap-4">

                  {/* Project Info */}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-cli-green-bright mb-2">
                      {project.projectName}
                    </h2>
                    <div className="text-sm text-cli-green-dim space-y-1">
                      <div>Slug: {project.slug}</div>
                      <div>Created: {new Date(project.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Shareable Link Section */}
                  <div className="border border-cli-green-dim p-4 bg-cli-bg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-cli-green-bright font-bold">📎 Shareable Link:</span>
                      <span className="text-xs px-2 py-1 border border-blue-500 text-blue-500">
                        🌐 PUBLIC
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <input
                        type="text"
                        value={generateProjectLink(project.slug)}
                        readOnly
                        className="flex-1 bg-cli-bg border border-cli-green text-cli-green p-2 text-sm font-mono outline-none"
                      />
                      <button
                        onClick={() => copyProjectLink(project._id, project.slug)}
                        className={`px-4 py-2 font-bold transition-all text-sm whitespace-nowrap border-2 ${
                          copiedLink === project._id
                            ? 'bg-cli-green-bright text-cli-bg border-cli-green-bright'
                            : 'bg-cli-green text-cli-bg hover:bg-cli-green-bright border-cli-green'
                        }`}
                      >
                        {copiedLink === project._id ? '✓ COPIED!' : '📋 COPY LINK'}
                      </button>
                    </div>

                    <p className="text-xs text-cli-green-dim mt-2">
                      🌐 This link provides direct public access to the project
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/admin/project/${project._id}/edit`)}
                      className="px-4 py-2 border border-cli-green text-cli-green hover:bg-cli-green hover:text-cli-bg transition-all text-sm"
                    >
                      ✏️ EDIT CONTENT
                    </button>
                    <button
                      onClick={() => deleteProject(project._id)}
                      className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-all text-sm"
                    >
                      🗑️ DELETE
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-cli-bg border-2 border-cli-green p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-cli-green-bright mb-4">Create New Project</h2>

              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createProject()}
                placeholder="Enter project name..."
                className="w-full bg-cli-bg border border-cli-green text-cli-green p-3 mb-4 outline-none focus:border-cli-green-bright"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={createProject}
                  className="flex-1 px-4 py-2 bg-cli-green text-cli-bg font-bold hover:bg-cli-green-bright transition-all"
                >
                  CREATE
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewProjectName('');
                  }}
                  className="flex-1 px-4 py-2 border border-cli-green-dim text-cli-green-dim hover:border-cli-green hover:text-cli-green transition-all"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;