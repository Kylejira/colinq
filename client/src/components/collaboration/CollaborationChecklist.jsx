import { useState } from 'react';
import './CollaborationChecklist.css';

const CollaborationChecklist = ({ checklist = [], onUpdate, disabled }) => {
  const [newTask, setNewTask] = useState('');
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    onUpdate([...checklist, newItem]);
    setNewTask('');
  };

  const handleToggle = (id) => {
    const updated = checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onUpdate(updated);
  };

  const handleDelete = (id) => {
    const updated = checklist.filter(item => item.id !== id);
    onUpdate(updated);
  };

  const handleStartEdit = (item) => {
    setEditing(item.id);
    setEditText(item.text);
  };

  const handleSaveEdit = (id) => {
    if (!editText.trim()) return;
    
    const updated = checklist.map(item =>
      item.id === id ? { ...item, text: editText.trim() } : item
    );
    onUpdate(updated);
    setEditing(null);
    setEditText('');
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const progress = checklist.length > 0 
    ? Math.round((completedCount / checklist.length) * 100) 
    : 0;

  return (
    <div className="collaboration-checklist">
      <div className="checklist-header">
        <h3>Project Checklist</h3>
        {checklist.length > 0 && (
          <div className="progress-info">
            <span>{completedCount} / {checklist.length} completed</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {checklist.length === 0 ? (
        <p className="empty-message">
          No tasks yet. Add tasks to track your collaboration progress.
        </p>
      ) : (
        <ul className="checklist-items">
          {checklist.map(item => (
            <li key={item.id} className={item.completed ? 'completed' : ''}>
              {editing === item.id ? (
                <div className="edit-mode">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(item.id)}
                    autoFocus
                  />
                  <button onClick={() => handleSaveEdit(item.id)}>Save</button>
                  <button onClick={() => setEditing(null)}>Cancel</button>
                </div>
              ) : (
                <>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggle(item.id)}
                      disabled={disabled}
                    />
                    <span className="checkmark"></span>
                    <span className="task-text">{item.text}</span>
                  </label>
                  {!disabled && (
                    <div className="task-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => handleStartEdit(item)}
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {!disabled && (
        <form className="add-task-form" onSubmit={handleAddTask}>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
          />
          <button type="submit" disabled={!newTask.trim()}>
            Add
          </button>
        </form>
      )}
    </div>
  );
};

export default CollaborationChecklist;

