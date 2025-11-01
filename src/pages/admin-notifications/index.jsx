import React, { useState, useEffect } from 'react';
import { emailService } from '../../services/emailService';
import { userService } from '../../services/userService';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Alert, AlertDescription } from '@/components/ui/alert.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Toaster, toast } from 'sonner';

const AdminNotifications = () => {
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [emailData, setEmailData] = useState({
    subject: '',
    content: '',
    template: 'default'
  });
  const [filters, setFilters] = useState({
    membershipStatus: '',
    role: '',
    activeOnly: true
  });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadMembers();
    loadStats();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const result = await userService.getAllUsers();
      if (result.success) {
        setMembers(result.data);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await emailService.getEmailStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!emailData.subject || !emailData.content) {
      setResult({ success: false, error: 'Subject and content are required' });
      toast.error('Incomplete form', {
        description: 'Please enter both subject and content before sending.'
      });
      return;
    }

    if (selectedMembers.length === 0) {
      toast.warning('No recipients selected', {
        description: 'Select specific members or enable "Send to all" to send notifications.'
      });
    }

    setSending(true);
    setResult(null);

    // Show loading toast
    const loadingToastId = toast.loading('Sending emails...', {
      description: 'Preparing to send emails...'
    });

    try {
      let sendResult;

      if (selectedMembers.length > 0) {
        // Send to selected members
        sendResult = await emailService.sendBulkEmail(
          selectedMembers,
          emailData.subject,
          emailData.content,
          emailData.template
        );
      } else {
        // Send to all members with filters
        sendResult = await emailService.sendEmailToAllMembers(
          filters,
          emailData.subject,
          emailData.content,
          emailData.template
        );
      }

      setResult(sendResult);
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      if (sendResult.success) {
        // SUCCESS: Show success toast
        const totalSent = sendResult.summary?.sent || 0;
        toast.success('Emails sent successfully! 🎉', {
          description: `Successfully sent emails to ${totalSent} recipient${totalSent === 1 ? '' : 's'}`
        });
        
        // Reset form on success
        setEmailData({ subject: '', content: '', template: 'default' });
        setSelectedMembers([]);
        loadStats(); // Refresh stats
      } else if (sendResult.error) {
        // FAILURE: Show error toast
        toast.error('Failed to send emails', {
          description: sendResult.error || 'An error occurred while sending emails.'
        });
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.dismiss(loadingToastId);
      setResult({ success: false, error: error.message });
      toast.error('Error sending emails', {
        description: error.message || 'An unexpected error occurred.'
      });
    } finally {
      setSending(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map(member => member.id));
    }
  };

  const handleSelectMember = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const filteredMembers = members.filter(member => {
    if (filters.membershipStatus && member.membership_status !== filters.membershipStatus) {
      return false;
    }
    if (filters.role && member.role !== filters.role) {
      return false;
    }
    if (filters.activeOnly && member.membership_status !== 'active') {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" expand={true} richColors />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Notifications</h1>
          <p className="text-gray-600 mt-2">Send emails to members from the admin dashboard</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-gray-600">Total Emails</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
              <div className="text-gray-600">Sent</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-gray-600">Failed</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">{stats.today}</div>
              <div className="text-gray-600">Today</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Email Composer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Email Form */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Compose Email</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template
                  </label>
                  <Select
                    value={emailData.template}
                    onChange={(e) => setEmailData({ ...emailData, template: e.target.value })}
                  >
                    <option value="default">Default Template</option>
                    <option value="announcement">Announcement</option>
                    <option value="course_update">Course Update</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <Input
                    type="text"
                    placeholder="Email subject..."
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Write your email content here..."
                    value={emailData.content}
                    onChange={(e) => setEmailData({ ...emailData, content: e.target.value })}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {selectedMembers.length > 0 
                      ? `Sending to ${selectedMembers.length} selected members`
                      : `Sending to all ${filteredMembers.length} filtered members`
                    }
                  </div>
                  <Button
                    onClick={handleSendEmail}
                    disabled={sending || !emailData.subject || !emailData.content}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {sending ? 'Sending...' : 'Send Email'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Result Display */}
            {result && (
              <div className={`p-4 rounded-lg ${
                result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? '✓ Email sent successfully!' : '✗ Failed to send email'}
                </div>
                {result.error && (
                  <div className="text-red-600 mt-1">{result.error}</div>
                )}
                {result.summary && (
                  <div className="mt-2 text-sm text-gray-600">
                    Sent: {result.summary.sent} | Failed: {result.summary.failed} | Total: {result.summary.total}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Member Selection & Filters */}
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membership Status
                  </label>
                  <Select
                    value={filters.membershipStatus}
                    onChange={(e) => setFilters({ ...filters, membershipStatus: e.target.value })}
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <Select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  >
                    <option value="">All Roles</option>
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </Select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activeOnly"
                    checked={filters.activeOnly}
                    onChange={(e) => setFilters({ ...filters, activeOnly: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="activeOnly" className="ml-2 block text-sm text-gray-700">
                    Active Members Only
                  </label>
                </div>
              </div>
            </div>

            {/* Member Selection */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Select Members</h2>
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  size="sm"
                >
                  {selectedMembers.length === filteredMembers.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="text-center text-gray-500">Loading members...</div>
                ) : filteredMembers.length === 0 ? (
                  <div className="text-center text-gray-500">No members found</div>
                ) : (
                  filteredMembers.map(member => (
                    <div
                      key={member.id}
                      className={`flex items-center p-3 rounded border cursor-pointer transition-colors ${
                        selectedMembers.includes(member.id)
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => handleSelectMember(member.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => handleSelectMember(member.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {member.full_name || 'Unnamed Member'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {member.email} • {member.role}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 text-sm text-gray-600">
                {selectedMembers.length} of {filteredMembers.length} members selected
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
