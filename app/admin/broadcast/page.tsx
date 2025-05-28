'use client';

import React, { useEffect, useState } from 'react';
import { BroadcastForm } from '@/app/components/admin/BroadcastForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Clock, Send, Users } from 'lucide-react';

interface BroadcastHistory {
  id: string;
  subject: string;
  message: string;
  sentAt: string;
  recipientCount: number;
  openRate: number;
  clickRate: number;
  status: 'sent' | 'scheduled' | 'draft';
}

export default function BroadcastPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [history, setHistory] = useState<BroadcastHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBroadcastData();
  }, []);

  const fetchBroadcastData = async () => {
    try {
      const [groupsRes, historyRes] = await Promise.all([
        fetch('/api/admin/groups'),
        fetch('/api/admin/broadcast/history')
      ]);
      
      const groupsData = await groupsRes.json();
      const historyData = await historyRes.json();
      
      setGroups(groupsData.groups);
      setHistory(historyData.history);
    } catch (error) {
      console.error('Failed to fetch broadcast data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBroadcast = async (data: any) => {
    const response = await fetch('/api/admin/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send broadcast');
    }

    fetchBroadcastData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Broadcast Messages</h1>
        <p className="text-muted-foreground">
          Send messages to all sellers in your groups
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BroadcastForm groups={groups} onSend={handleSendBroadcast} />

        <Card>
          <CardHeader>
            <CardTitle>Broadcast History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No broadcasts sent yet
                </p>
              ) : (
                history.map((broadcast) => (
                  <div key={broadcast.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{broadcast.subject}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {broadcast.message}
                        </p>
                      </div>
                      <Badge variant={broadcast.status === 'sent' ? 'default' : 'secondary'}>
                        {broadcast.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(broadcast.sentAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {broadcast.recipientCount} recipients
                      </div>
                      {broadcast.status === 'sent' && (
                        <>
                          <div className="flex items-center gap-1">
                            <Send className="h-3 w-3" />
                            {broadcast.openRate}% opened
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}