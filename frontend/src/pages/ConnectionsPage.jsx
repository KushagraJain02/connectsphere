import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import { getMyConnections, getPendingRequests, getSentRequests, acceptRequest, rejectRequest, removeConnection } from '../api/connectionApi';
import ConnectionCard from '../components/connection/ConnectionCard';
import { Users, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const ConnectionsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('connections');

  const { data: connections, isLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: () => getMyConnections().then(r => r.data),
  });

  const { data: pending } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: () => getPendingRequests().then(r => r.data),
  });

  const { data: sent } = useQuery({
    queryKey: ['sentRequests'],
    queryFn: () => getSentRequests().then(r => r.data),
  });

  const acceptMutation = useMutation({
    mutationFn: acceptRequest,
    onSuccess: () => { queryClient.invalidateQueries(['connections']); queryClient.invalidateQueries(['pendingRequests']); toast.success('Connected!'); },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectRequest,
    onSuccess: () => { queryClient.invalidateQueries(['pendingRequests']); },
  });

  const removeMutation = useMutation({
    mutationFn: removeConnection,
    onSuccess: () => { queryClient.invalidateQueries(['connections']); toast.success('Removed'); },
  });

  const tabs = [
    { key: 'connections', label: 'Connections', count: connections?.length },
    { key: 'pending', label: 'Pending', count: pending?.length },
    { key: 'sent', label: 'Sent', count: sent?.length },
  ];

  return (
    <Layout>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>My Network</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Manage your professional connections
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', padding: '0 24px' }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: '14px 20px', fontSize: 13, fontWeight: 600,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    background: activeTab === tab.key ? 'var(--primary-light)' : 'var(--bg-card)',
                    color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-muted)',
                    fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 'var(--radius-full)',
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Loader2 size={28} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeTab === 'connections' && (
              connections?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 80, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                  <Users size={48} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                  <p style={{ fontSize: 16, fontWeight: 600 }}>No connections yet</p>
                  <p style={{ fontSize: 13, marginTop: 6 }}>Start connecting with professionals</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {connections?.map(conn => (
                    <ConnectionCard key={conn.id} connection={conn} type="connected"
                      onRemove={() => removeMutation.mutate(conn.id)} />
                  ))}
                </div>
              )
            )}

            {activeTab === 'pending' && (
              pending?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                  <p>No pending requests</p>
                </div>
              ) : (
                pending?.map(req => (
                  <ConnectionCard key={req.id} connection={req} type="pending"
                    onAccept={() => acceptMutation.mutate(req.id)}
                    onReject={() => rejectMutation.mutate(req.id)} />
                ))
              )
            )}

            {activeTab === 'sent' && (
              sent?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                  <p>No sent requests</p>
                </div>
              ) : (
                sent?.map(req => (
                  <ConnectionCard key={req.id} connection={req} type="sent" />
                ))
              )
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ConnectionsPage;