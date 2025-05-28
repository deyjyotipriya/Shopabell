'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '../ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Badge } from '@/app/components/ui/badge';
import { 
  Send, 
  AlertCircle, 
  Clock, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Bell,
  Calendar,
  Info
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface BroadcastFormProps {
  groups: { id: string; name: string; memberCount: number }[];
  onSend: (data: {
    title: string;
    message: string;
    targetGroups: string[];
    targetType: 'all' | 'sellers' | 'buyers' | 'custom';
    channel: 'whatsapp' | 'email' | 'sms' | 'push';
    scheduledAt?: string;
  }) => Promise<void>;
}

export const BroadcastForm: React.FC<BroadcastFormProps> = ({ groups, onSend }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'sellers' | 'buyers' | 'custom'>('all');
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'sms' | 'push'>('whatsapp');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!title.trim() || !message.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (scheduleType === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      setError('Please select both date and time for scheduled broadcast');
      return;
    }

    if (targetType === 'custom' && selectedGroups.length === 0) {
      setError('Please select at least one group');
      return;
    }

    setIsSending(true);
    try {
      const scheduledAt = scheduleType === 'scheduled' 
        ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
        : undefined;

      await onSend({
        title,
        message,
        targetGroups: targetType === 'custom' ? selectedGroups : [],
        targetType,
        channel,
        scheduledAt,
      });
      setSuccess(true);
      setTitle('');
      setMessage('');
      setSelectedGroups([]);
      setScheduledDate('');
      setScheduledTime('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send broadcast');
    } finally {
      setIsSending(false);
    }
  };

  const getRecipientCount = () => {
    const total = groups.reduce((sum, group) => sum + group.memberCount, 0);
    
    if (targetType === 'all') {
      return total;
    } else if (targetType === 'sellers') {
      // Estimate 40% are sellers
      return Math.floor(total * 0.4);
    } else if (targetType === 'buyers') {
      // Estimate 60% are buyers
      return Math.floor(total * 0.6);
    } else {
      return groups
        .filter(g => selectedGroups.includes(g.id))
        .reduce((sum, group) => sum + group.memberCount, 0);
    }
  };

  const getChannelIcon = () => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <Smartphone className="h-4 w-4" />;
      case 'push':
        return <Bell className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
        <CardTitle className="text-purple-800">Broadcast Message</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter message title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              disabled={isSending}
              className="border-purple-200 focus:border-purple-400"
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message here..."
              rows={6}
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
              disabled={isSending}
              className="border-purple-200 focus:border-purple-400"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="target">Target Audience</Label>
              <Select value={targetType} onValueChange={(value: any) => setTargetType(value)}>
                <SelectTrigger className="border-purple-200">
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="sellers">Sellers Only</SelectItem>
                  <SelectItem value="buyers">Buyers Only</SelectItem>
                  <SelectItem value="custom">Custom Groups</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Channel</Label>
              <RadioGroup value={channel} onValueChange={(value: any) => setChannel(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="whatsapp" id="whatsapp" />
                  <label htmlFor="whatsapp" className="flex items-center gap-2 cursor-pointer">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    WhatsApp
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Email
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sms" id="sms" />
                  <label htmlFor="sms" className="flex items-center gap-2 cursor-pointer">
                    <Smartphone className="h-4 w-4 text-purple-600" />
                    SMS
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="push" id="push" />
                  <label htmlFor="push" className="flex items-center gap-2 cursor-pointer">
                    <Bell className="h-4 w-4 text-orange-600" />
                    Push Notification
                  </label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div>
            <Label>Schedule</Label>
            <RadioGroup value={scheduleType} onValueChange={(value: any) => setScheduleType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="now" id="now" />
                <label htmlFor="now" className="cursor-pointer">Send immediately</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="scheduled" id="scheduled" />
                <label htmlFor="scheduled" className="cursor-pointer">Schedule for later</label>
              </div>
            </RadioGroup>
          </div>

          {scheduleType === 'scheduled' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScheduledTime(e.target.value)}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>
            </div>
          )}

          {targetType === 'custom' && (
            <div className="space-y-2">
              <Label>Select Groups</Label>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-purple-50/30">
                {groups.map((group) => (
                  <div key={group.id} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={group.id}
                      checked={selectedGroups.includes(group.id)}
                      onCheckedChange={(checked: boolean) => {
                        if (checked) {
                          setSelectedGroups([...selectedGroups, group.id]);
                        } else {
                          setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                        }
                      }}
                      className="border-purple-300 data-[state=checked]:bg-purple-600"
                    />
                    <label
                      htmlFor={group.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {group.name} 
                      <Badge variant="secondary" className="ml-2">
                        {group.memberCount} members
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Alert className="border-purple-200 bg-purple-50">
            <Info className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              <div className="flex items-center justify-between">
                <span>This message will be sent to approximately {getRecipientCount()} users</span>
                <div className="flex items-center gap-2">
                  {getChannelIcon()}
                  <span className="font-medium capitalize">{channel}</span>
                </div>
              </div>
              {scheduleType === 'scheduled' && scheduledDate && scheduledTime && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Calendar className="h-3 w-3" />
                  Scheduled for {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                </div>
              )}
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {scheduleType === 'scheduled' 
                  ? 'Message scheduled successfully!' 
                  : 'Message sent successfully!'}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            disabled={isSending} 
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          >
            {scheduleType === 'scheduled' ? (
              <>
                <Clock className="mr-2 h-4 w-4" />
                {isSending ? 'Scheduling...' : 'Schedule Broadcast'}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {isSending ? 'Sending...' : 'Send Broadcast'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};