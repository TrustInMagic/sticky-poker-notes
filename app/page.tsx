'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Copy,
  Check,
  Edit3,
  Trash2,
  User,
  FileText,
  X,
  Layers,
  Loader2,
  Tag,
  Settings,
} from 'lucide-react';
import {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getTags,
  createTag,
  deleteTag,
} from './actions';

interface TagData {
  id: string;
  label: string;
  color: string;
}

interface Player {
  id: string;
  name: string;
  stakes: string | null;
  notes: string;
  tagId: string | null;
  tag: TagData | null;
  updatedAt: Date;
}

export default function PokerNotesApp() {
  // App State
  const [players, setPlayers] = useState<Player[]>([]);
  const [tags, setTags] = useState<TagData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Player Modal State
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerForm, setPlayerForm] = useState({
    name: '',
    stakes: '',
    notes: '',
    tagId: '',
  });
  const [isSubmittingPlayer, setIsSubmittingPlayer] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  // Tag Modal State
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagForm, setTagForm] = useState({ label: '', color: '#eab308' });
  const [isSubmittingTag, setIsSubmittingTag] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);

  // Initial Data Fetch
  const fetchData = async () => {
    setIsLoading(true);
    const [fetchedPlayers, fetchedTags] = await Promise.all([
      getPlayers(),
      getTags(),
    ]);
    setPlayers(fetchedPlayers);
    setTags(fetchedTags);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtering
  const filteredPlayers = useMemo(() => {
    return players.filter(
      (player) =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (player.stakes &&
          player.stakes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        player.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (player.tag?.label &&
          player.tag.label.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [players, searchQuery]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // --- Player Handlers ---
  const openPlayerModal = (player?: Player) => {
    setPlayerError(null);
    if (player) {
      setEditingPlayer(player);
      setPlayerForm({
        name: player.name,
        stakes: player.stakes || '',
        notes: player.notes,
        tagId: player.tagId || '',
      });
    } else {
      setEditingPlayer(null);
      setPlayerForm({ name: '', stakes: '', notes: '', tagId: '' });
    }
    setIsPlayerModalOpen(true);
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerForm.name.trim()) return;
    setIsSubmittingPlayer(true);
    setPlayerError(null);

    const payload = { ...playerForm, tagId: playerForm.tagId || null };
    const res = editingPlayer
      ? await updatePlayer(editingPlayer.id, payload)
      : await createPlayer(payload);

    if (res.success) {
      await fetchData();
      setIsPlayerModalOpen(false);
    } else {
      setPlayerError(res.error || 'An error occurred');
    }
    setIsSubmittingPlayer(false);
  };

  const handleDeletePlayer = async (id: string) => {
    if (confirm('Delete this player note?')) {
      const res = await deletePlayer(id);
      if (res.success) setPlayers(players.filter((p) => p.id !== id));
    }
  };

  // --- Tag Handlers ---
  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagForm.label.trim()) return;
    setIsSubmittingTag(true);
    setTagError(null);

    const res = await createTag(tagForm);
    if (res.success) {
      const updatedTags = await getTags();
      setTags(updatedTags);
      setTagForm({ label: '', color: '#eab308' }); // reset form
    } else {
      setTagError(res.error || 'Failed to create tag');
    }
    setIsSubmittingTag(false);
  };

  const handleDeleteTag = async (id: string) => {
    if (
      confirm(
        'Delete this tag? (Players with this tag will just lose the color)',
      )
    ) {
      const res = await deleteTag(id);
      if (res.success) {
        await fetchData(); // Refresh players too, as their tagId gets set to null
      }
    }
  };

  return (
    <div className='min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500 selection:text-neutral-950'>
      <header className='border-b border-neutral-800/80 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-10'>
        <div className='max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-400'>
              <Layers className='w-4 h-4' />
            </div>
            <h1 className='text-base font-medium tracking-tight text-neutral-100'>
              Poker<span className='text-emerald-400'>HUD</span> Notes
            </h1>
          </div>

          <div className='flex items-center gap-3'>
            <button
              onClick={() => setIsTagModalOpen(true)}
              className='flex items-center gap-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 font-medium px-3 py-1.5 rounded-lg transition-colors text-xs'
            >
              <Settings className='w-3.5 h-3.5' />
              Manage Tags
            </button>
            <button
              onClick={() => openPlayerModal()}
              className='flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-medium px-3 py-1.5 rounded-lg transition-colors text-xs shadow-sm shadow-emerald-500/20'
            >
              <Plus className='w-3.5 h-3.5' />
              New Player
            </button>
          </div>
        </div>
      </header>

      <main className='max-w-[1400px] mx-auto px-4 sm:px-6 py-6'>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500' />
            <input
              type='text'
              placeholder='Search names, tags, or notes...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full bg-neutral-900/80 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all'
            />
          </div>
          <div className='text-xs text-neutral-500 font-mono self-end sm:self-center'>
            TRACKED:{' '}
            <span className='text-neutral-300'>{filteredPlayers.length}</span>
          </div>
        </div>

        {isLoading ? (
          <div className='flex flex-col items-center justify-center py-20 gap-3 text-neutral-500'>
            <Loader2 className='w-5 h-5 animate-spin text-emerald-400' />
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className='text-center py-12 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/20'>
            <User className='w-8 h-8 text-neutral-600 mx-auto mb-2' />
            <h3 className='text-sm font-medium text-neutral-300 mb-1'>
              No players found
            </h3>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5'>
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                className='group relative flex flex-col justify-between bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700/80 rounded-xl p-3.5 transition-all duration-200 shadow-sm'
              >
                <div>
                  <div className='flex items-start justify-between gap-2 mb-2'>
                    <div className='truncate pr-2'>
                      <h2 className='text-sm font-semibold text-neutral-100 group-hover:text-emerald-400 transition-colors truncate'>
                        {player.name}
                      </h2>
                      <div className='flex items-center gap-1.5 mt-1 flex-wrap'>
                        {player.tag && (
                          <span
                            className='inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded text-neutral-950'
                            style={{ backgroundColor: player.tag.color }}
                          >
                            <Tag className='w-2.5 h-2.5' />
                            {player.tag.label}
                          </span>
                        )}
                        {player.stakes && (
                          <span className='inline-block px-1.5 py-0.5 text-[9px] font-mono font-medium bg-neutral-800 border border-neutral-700/50 text-neutral-400 rounded'>
                            {player.stakes}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className='flex items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0'>
                      <button
                        onClick={() => openPlayerModal(player)}
                        className='p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors'
                      >
                        <Edit3 className='w-3.5 h-3.5' />
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        className='p-1 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors'
                      >
                        <Trash2 className='w-3.5 h-3.5' />
                      </button>
                    </div>
                  </div>

                  <p className='text-[13px] text-neutral-300 whitespace-pre-wrap leading-relaxed font-sans mb-3 bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-800/40 min-h-[50px] max-h-[120px] overflow-y-auto custom-scrollbar'>
                    {player.notes || (
                      <span className='italic text-neutral-600'>
                        No notes...
                      </span>
                    )}
                  </p>
                </div>

                <div className='pt-2 border-t border-neutral-800/60 flex items-center justify-between'>
                  <span className='text-[10px] text-neutral-600 font-mono'>
                    {new Date(player.updatedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <div className='flex items-center gap-1'>
                    <button
                      onClick={() =>
                        copyToClipboard(player.name, `name-${player.id}`)
                      }
                      className='p-1.5 bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700/50 rounded transition-all active:scale-95'
                    >
                      {copiedId === `name-${player.id}` ? (
                        <Check className='w-3.5 h-3.5 text-emerald-400' />
                      ) : (
                        <User className='w-3.5 h-3.5 text-neutral-400' />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        copyToClipboard(player.notes, `notes-${player.id}`)
                      }
                      className='p-1.5 bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700/50 rounded transition-all active:scale-95'
                    >
                      {copiedId === `notes-${player.id}` ? (
                        <Check className='w-3.5 h-3.5 text-emerald-400' />
                      ) : (
                        <FileText className='w-3.5 h-3.5 text-neutral-400' />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- TAG MANAGER MODAL --- */}
      {isTagModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in'>
          <div className='bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-5 shadow-2xl'>
            <div className='flex items-center justify-between mb-4 border-b border-neutral-800 pb-3'>
              <h3 className='text-base font-semibold text-neutral-100 flex items-center gap-2'>
                <Settings className='w-4 h-4 text-emerald-400' /> Tag Manager
              </h3>
              <button
                onClick={() => setIsTagModalOpen(false)}
                className='text-neutral-500 hover:text-neutral-300'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            {/* Existing Tags */}
            <div className='mb-6 space-y-2'>
              <label className='block text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-2'>
                Your Tags
              </label>
              {tags.length === 0 ? (
                <p className='text-sm text-neutral-500 italic'>
                  No tags created yet.
                </p>
              ) : (
                <div className='flex flex-wrap gap-2'>
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className='flex items-center gap-1.5 px-2 py-1 bg-neutral-950 border border-neutral-800 rounded-md'
                    >
                      <div
                        className='w-2.5 h-2.5 rounded-full'
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className='text-xs text-neutral-200'>
                        {tag.label}
                      </span>
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        className='ml-1 text-neutral-600 hover:text-red-400'
                      >
                        <Trash2 className='w-3 h-3' />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Tag */}
            <form
              onSubmit={handleSaveTag}
              className='bg-neutral-950/50 p-3 rounded-xl border border-neutral-800/80'
            >
              <label className='block text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-2'>
                Create New Tag
              </label>
              {tagError && (
                <p className='text-xs text-red-400 mb-2'>{tagError}</p>
              )}
              <div className='flex items-center gap-2'>
                <input
                  type='text'
                  placeholder='e.g. Reg, Whale...'
                  value={tagForm.label}
                  onChange={(e) =>
                    setTagForm({ ...tagForm, label: e.target.value })
                  }
                  className='flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500/50'
                  required
                />
                <input
                  type='color'
                  value={tagForm.color}
                  onChange={(e) =>
                    setTagForm({ ...tagForm, color: e.target.value })
                  }
                  className='w-8 h-8 rounded cursor-pointer bg-neutral-900 border border-neutral-800 p-0.5'
                />
                <button
                  type='submit'
                  disabled={isSubmittingTag}
                  className='bg-neutral-800 hover:bg-neutral-700 text-neutral-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors'
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PLAYER MODAL --- */}
      {isPlayerModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in'>
          <div className='bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-5 shadow-2xl'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-base font-semibold text-neutral-100'>
                {editingPlayer ? 'Edit Player' : 'Add Player'}
              </h3>
              <button
                onClick={() => setIsPlayerModalOpen(false)}
                className='text-neutral-500 hover:text-neutral-300 p-1'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            {playerError && (
              <div className='mb-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[13px] text-red-400'>
                {playerError}
              </div>
            )}

            <form onSubmit={handleSavePlayer} className='space-y-3.5'>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1'>
                    Screen Name *
                  </label>
                  <input
                    type='text'
                    required
                    value={playerForm.name}
                    onChange={(e) =>
                      setPlayerForm({ ...playerForm, name: e.target.value })
                    }
                    className='w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500/50'
                  />
                </div>
                <div>
                  <label className='block text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1'>
                    Stakes
                  </label>
                  <input
                    type='text'
                    value={playerForm.stakes}
                    onChange={(e) =>
                      setPlayerForm({ ...playerForm, stakes: e.target.value })
                    }
                    className='w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500/50'
                  />
                </div>
              </div>

              {/* Tag Selection System */}
              <div className='p-3 border border-neutral-800/80 bg-neutral-950/50 rounded-xl'>
                <div className='flex items-center justify-between mb-2'>
                  <label className='block text-[11px] font-medium text-neutral-400 uppercase tracking-wider'>
                    Select Tag
                  </label>
                  {tags.length === 0 && (
                    <span className='text-[10px] text-neutral-500'>
                      Create tags in settings
                    </span>
                  )}
                </div>

                <div className='flex flex-wrap gap-2'>
                  {/* Option to select NO tag */}
                  <button
                    type='button'
                    onClick={() => setPlayerForm({ ...playerForm, tagId: '' })}
                    className={`px-2 py-1 text-xs rounded-md border transition-all ${
                      playerForm.tagId === ''
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    None
                  </button>

                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type='button'
                      onClick={() =>
                        setPlayerForm({ ...playerForm, tagId: tag.id })
                      }
                      className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-md border transition-all ${
                        playerForm.tagId === tag.id
                          ? 'ring-1 ring-offset-1 ring-offset-neutral-900 border-transparent'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor:
                          playerForm.tagId === tag.id
                            ? tag.color
                            : `${tag.color}40`,
                        color: playerForm.tagId === tag.id ? '#000' : tag.color,
                        borderColor:
                          playerForm.tagId === tag.id
                            ? 'transparent'
                            : tag.color,
                      }}
                    >
                      <div
                        className='w-2 h-2 rounded-full'
                        style={{
                          backgroundColor:
                            playerForm.tagId === tag.id ? '#000' : tag.color,
                        }}
                      />
                      <span className='font-medium'>{tag.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className='block text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1'>
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={playerForm.notes}
                  onChange={(e) =>
                    setPlayerForm({ ...playerForm, notes: e.target.value })
                  }
                  className='w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-[13px] text-neutral-100 focus:outline-none focus:border-emerald-500/50 resize-none'
                />
              </div>

              <div className='flex items-center justify-end gap-2 pt-2'>
                <button
                  type='button'
                  onClick={() => setIsPlayerModalOpen(false)}
                  className='px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isSubmittingPlayer}
                  className='flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors shadow-sm disabled:opacity-50'
                >
                  {isSubmittingPlayer && (
                    <Loader2 className='w-3.5 h-3.5 animate-spin' />
                  )}
                  {editingPlayer ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
      `,
        }}
      />
    </div>
  );
}
