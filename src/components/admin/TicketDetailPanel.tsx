import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/text-area';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  X,
  Send,
  Clock,
  User,
  Flag,
  Tag,
  AlertTriangle,
  CheckCircle,
  Lock,
  Smartphone,
  Globe,
  MessageSquare,
  Eye,
  ArrowUpCircle,
  History,
} from 'lucide-react';
import { 
  SupportTicketWithDetails, 
  SupportTicketMessage, 
  TicketStatus,
  TicketPriority,
} from '@/types/admin';
import { supportTicketService } from '@/services/supportTicketService';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bgColor: string }> = {
  open: { label: 'Open', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  in_progress: { label: 'In Progress', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  pending_user: { label: 'Pending User', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  resolved: { label: 'Resolved', color: 'text-green-600', bgColor: 'bg-green-100' },
  closed: { label: 'Closed', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  escalated: { label: 'Escalated', color: 'text-red-600', bgColor: 'bg-red-100' },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; icon: React.ReactNode }> = {
  critical: { label: 'Critical', color: 'text-red-600', icon: <AlertTriangle className="h-4 w-4" /> },
  high: { label: 'High', color: 'text-orange-600', icon: <Flag className="h-4 w-4" /> },
  medium: { label: 'Medium', color: 'text-yellow-600', icon: <Flag className="h-4 w-4" /> },
  low: { label: 'Low', color: 'text-green-600', icon: <Flag className="h-4 w-4" /> },
};

const CATEGORY_LABELS: Record<string, { en: string; am: string }> = {
  technical_issue: { en: 'Technical Issue', am: 'የስርዓት ችግር' },
  account_login: { en: 'Account & Login', am: 'መለያ እና መግቢያ' },
  animal_management: { en: 'Animal Management', am: 'እንስሳት አስተዳደር' },
  marketplace: { en: 'Marketplace', am: 'ገበያ' },
  milk_recording: { en: 'Milk Recording', am: 'የሚልክ መመዝገብ' },
  offline_sync: { en: 'Offline & Sync', am: 'ኦፍላይን እና ስንክሮክ' },
  data_export: { en: 'Data & Export', am: 'ውሂብ እና ማውጣት' },
  other: { en: 'Other', am: 'ሌላ' },
};

interface TicketDetailPanelProps {
  ticket: SupportTicketWithDetails;
  open: boolean;
  onClose: () => void;
  onStatusChange: (ticketId: string, status: TicketStatus) => void;
  onTicketUpdate: () => void;
}

export const TicketDetailPanel: React.FC<TicketDetailPanelProps> = ({
  ticket,
  open,
  onClose,
  onStatusChange,
  onTicketUpdate,
}) => {
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);

  useEffect(() => {
    if (open && ticket?.id) {
      loadMessages();
    }
  }, [open, ticket?.id]);

  const loadMessages = async () => {
    try {
      const data = await supportTicketService.getTicketMessages(ticket.id);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await supportTicketService.addMessage(
        ticket.id,
        newMessage,
        'admin',
        isInternal
      );
      setNewMessage('');
      setIsInternal(false);
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    try {
      await onStatusChange(ticket.id, newStatus);
      setShowStatusDialog(false);
      onTicketUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEscalate = async () => {
    try {
      await supportTicketService.escalateTicket(ticket.id);
      setShowEscalateDialog(false);
      onTicketUpdate();
    } catch (error) {
      console.error('Error escalating ticket:', error);
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    const config = STATUS_CONFIG[status];
    return (
      <Badge className={`${config.bgColor} ${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    const config = PRIORITY_CONFIG[priority];
    return (
      <Badge variant="outline" className={`${config.color} border-current`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[600px] bg-white shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">
              {ticket.ticket_number}
            </span>
            {getPriorityBadge(ticket.priority)}
            {getStatusBadge(ticket.status)}
          </div>
          <h2 className="font-semibold mt-1">{ticket.subject}</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="details" className="h-full flex flex-col">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="messages">
              Messages ({messages.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 m-0 p-4 space-y-4">
            {/* User Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 font-medium">
                      {ticket.user?.full_name || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2">{ticket.user?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="ml-2">{ticket.user?.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Region:</span>
                    <span className="ml-2">{ticket.user_region || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Device Info */}
            {ticket.user_device_info && Object.keys(ticket.user_device_info).length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Device Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {ticket.user_device_info.os && (
                      <div>
                        <span className="text-muted-foreground">OS:</span>
                        <span className="ml-2">{ticket.user_device_info.os}</span>
                      </div>
                    )}
                    {ticket.user_device_info.app_version && (
                      <div>
                        <span className="text-muted-foreground">App Version:</span>
                        <span className="ml-2">{ticket.user_device_info.app_version}</span>
                      </div>
                    )}
                    {ticket.user_device_info.browser && (
                      <div>
                        <span className="text-muted-foreground">Browser:</span>
                        <span className="ml-2">{ticket.user_device_info.browser}</span>
                      </div>
                    )}
                    {ticket.user_device_info.device && (
                      <div>
                        <span className="text-muted-foreground">Device:</span>
                        <span className="ml-2">{ticket.user_device_info.device}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ticket Details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Ticket Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <span className="ml-2 font-medium">
                        {CATEGORY_LABELS[ticket.category]?.en || ticket.category}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <span className="ml-2">
                        {format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Assigned To:</span>
                      <span className="ml-2">
                        {ticket.assigned_admin?.full_name || 'Unassigned'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">SLA Deadline:</span>
                      <span className="ml-2">
                        {ticket.sla_deadline 
                          ? format(new Date(ticket.sla_deadline), 'MMM d, yyyy h:mm a')
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-muted-foreground">Description:</span>
                    <p className="mt-1 p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                      {ticket.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SLA Info */}
            {ticket.first_response_at && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    SLA Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">First Response:</span>
                      <span className="ml-2">
                        {format(new Date(ticket.first_response_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {ticket.resolved_at && (
                      <div>
                        <span className="text-muted-foreground">Resolved:</span>
                        <span className="ml-2">
                          {format(new Date(ticket.resolved_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatusDialog(true)}
              >
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Change Status
              </Button>
              {ticket.status !== 'escalated' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEscalateDialog(true)}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Escalate
                </Button>
              )}
              {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate('resolved')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Resolved
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="flex-1 m-0 p-4 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto opacity-50" />
                  <p className="mt-2">No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.sender_type === 'admin'
                        ? 'bg-blue-50 ml-8'
                        : msg.is_internal
                        ? 'bg-yellow-50 ml-8'
                        : 'bg-gray-100 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">
                        {msg.sender_type === 'admin' ? 'Admin' : msg.sender_type === 'system' ? 'System' : 'User'}
                        {msg.is_internal && (
                          <Badge variant="outline" className="ml-2 text-yellow-600">
                            Internal
                          </Badge>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="border-t pt-4">
              <div className="flex gap-2 mb-2">
                <Button
                  variant={isInternal ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setIsInternal(!isInternal)}
                  className={isInternal ? 'bg-yellow-100' : ''}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Internal Note
                </Button>
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() || loading}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Press Ctrl+Enter to send
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Ticket Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {(['open', 'in_progress', 'pending_user', 'resolved', 'closed'] as TicketStatus[]).map((status) => (
              <Button
                key={status}
                variant={ticket.status === status ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => handleStatusUpdate(status)}
              >
                {getStatusBadge(status)}
                <span className="ml-2">{STATUS_CONFIG[status].label}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Escalate Dialog */}
      <Dialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate Ticket</DialogTitle>
            <DialogDescription>
              This will mark the ticket as escalated and increase priority to Critical.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEscalateDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleEscalate}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Escalate Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
