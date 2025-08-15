'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listReports, verifyReport, reactToReport } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import type { Report } from '@/types/models';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'reviewing' | 'resolved'>('all');

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await listReports();
        setReports(data);
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const handleVerify = async (reportId: string, isAccurate: boolean) => {
    try {
      await verifyReport(reportId, isAccurate);
      // Reload reports to show updated verification
      const data = await listReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to verify report:', error);
    }
  };

  const handleReact = async (reportId: string, type: string) => {
    try {
      await reactToReport(reportId, type);
      // Reload reports to show new reaction
      const data = await listReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to react to report:', error);
    }
  };

  const filteredReports = reports.filter(report => 
    filter === 'all' || report.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Community Reports</h1>
          <div className="w-20 h-10 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community Reports</h1>
        <Link
          href="/reports/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Report
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'all', label: 'All' },
          { key: 'submitted', label: 'Submitted' },
          { key: 'reviewing', label: 'Reviewing' },
          { key: 'resolved', label: 'Resolved' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports list */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? "No reports have been submitted yet." 
                : `No ${filter} reports found.`}
            </p>
            <Link
              href="/reports/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit First Report
            </Link>
          </div>
        ) : (
          filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onVerify={handleVerify}
              onReact={handleReact}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ReportCardProps {
  report: Report;
  onVerify: (reportId: string, isAccurate: boolean) => void;
  onReact: (reportId: string, type: string) => void;
}

function ReportCard({ report, onVerify, onReact }: ReportCardProps) {
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const reactionCounts = (report.reactions || []).reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const verificationCount = (report.verifications || []).filter(v => v.isAccurate).length;

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{formatRelativeTime(report.timestamp)}</p>
          {report.location && (
            <p className="text-gray-500 text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {report.location}
            </p>
          )}
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
        </span>
      </div>

      <p className="text-gray-700 mb-4">{report.description}</p>

      {/* Images */}
      {report.images && report.images.length > 0 && (
        <div className="flex space-x-2 mb-4 overflow-x-auto">
          {report.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Report image ${index + 1}`}
              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            />
          ))}
        </div>
      )}

      {/* Verification status */}
      {verificationCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center text-green-700 text-sm">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified by {verificationCount} {verificationCount === 1 ? 'person' : 'people'}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Reactions */}
          {[
            { type: 'helpful', emoji: '👍', label: 'Helpful' },
            { type: 'concerning', emoji: '😰', label: 'Concerning' },
            { type: 'thankful', emoji: '🙏', label: 'Thank you' },
          ].map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => onReact(report.id, reaction.type)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <span>{reaction.emoji}</span>
              {reactionCounts[reaction.type] && (
                <span>{reactionCounts[reaction.type]}</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowVerifyModal(true)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Verify Report
        </button>
      </div>

      {/* Verify Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Verify Report</h3>
            <p className="text-gray-600 mb-6">
              Is this report accurate based on your knowledge of the area?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  onVerify(report.id, true);
                  setShowVerifyModal(false);
                }}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
              >
                Yes, Accurate
              </button>
              <button
                onClick={() => {
                  onVerify(report.id, false);
                  setShowVerifyModal(false);
                }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                No, Inaccurate
              </button>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}