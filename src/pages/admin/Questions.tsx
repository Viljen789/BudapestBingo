import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Trash2, Edit2, Check, X, PlusCircle } from 'lucide-react';

export default function Questions() {
  const { questions, addQuestion, updateQuestion, deleteQuestion, toggleQuestionActive } = useStore();
  const [newQuestionText, setNewQuestionText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestionText.trim()) {
      addQuestion(newQuestionText.trim());
      setNewQuestionText('');
    }
  };

  const startEditing = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = (id: string) => {
    if (editText.trim()) {
      updateQuestion(id, editText.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bingo Question Pool</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <PlusCircle size={20} className="text-budapest-green" />
          Add New Question
        </h2>
        
        <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="question" className="sr-only">Question Text</label>
            <input
              type="text"
              id="question"
              placeholder="e.g., Take a shot of Palinka"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-budapest-green focus:border-budapest-green"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="px-6 py-2 bg-budapest-green text-white font-medium rounded-md hover:bg-green-800 transition-colors whitespace-nowrap"
          >
            Add to Pool
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {questions.map((q) => (
            <li key={q.id} className="p-4 hover:bg-gray-50 flex items-center justify-between gap-4 transition-colors">
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <button
                  onClick={() => toggleQuestionActive(q.id)}
                  className={`flex-shrink-0 w-10 h-6 rounded-full transition-colors relative ${q.isActive ? 'bg-budapest-green' : 'bg-gray-300'}`}
                  title={q.isActive ? "Deactivate" : "Activate"}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${q.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
                
                {editingId === q.id ? (
                  <input
                    type="text"
                    className="flex-1 px-3 py-1 border border-budapest-green rounded text-sm focus:outline-none focus:ring-1 focus:ring-budapest-green"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(q.id)}
                    autoFocus
                  />
                ) : (
                  <p className={`text-sm font-medium ${q.isActive ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                    {q.text}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {editingId === q.id ? (
                  <>
                    <button onClick={() => saveEdit(q.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-full" title="Save">
                      <Check size={18} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" title="Cancel">
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditing(q.id, q.text)} className="p-2 text-gray-500 hover:text-budapest-green hover:bg-green-50 rounded-full transition-colors" title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => deleteQuestion(q.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
          
          {questions.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No questions added yet.
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}
