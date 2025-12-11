import React, { useState, useEffect } from 'react';
import { DataService } from '../services/storageService';
import { ADPMapping, ADPMaster, Model, Make } from '../types';
import { Card, Button, TableHeader, TableHead, TableRow, TableCell } from '../components/UI';
import { CheckCircle2, Clock, UserCheck, ArrowRight } from 'lucide-react';

export const MappingReviewView: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const mappings = DataService.getADPMappings();
    const adpMaster = DataService.getADPMaster();
    const models = DataService.getModels();
    const makes = DataService.getMakes();

    // Combine data for display
    const reviewData = mappings.map(m => {
        const adp = adpMaster.find(a => a.id === m.adpId);
        const model = models.find(mod => mod.id === m.modelId);
        const make = model ? makes.find(mk => mk.id === model.makeId) : null;
        const updatedByUser = m.updatedBy ? DataService.getUserName(m.updatedBy) : 'Unknown';
        const reviewedByUser = m.reviewedBy ? DataService.getUserName(m.reviewedBy) : null;

        return {
            ...m,
            adpDesc: adp ? `${adp.makeEnDesc} ${adp.modelEnDesc}` : 'Unknown ADP',
            sdDesc: model && make ? `${make.name} ${model.name}` : 'Unknown SD',
            updatedByName: updatedByUser,
            reviewedByName: reviewedByUser
        };
    })
    // Sort by updated date descending
    .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
    });

    setReviews(reviewData);
  };

  const handleMarkReviewed = (mappingId: string) => {
    const mappings = DataService.getADPMappings();
    const index = mappings.findIndex(m => m.id === mappingId);
    if (index === -1) return;

    // Update with current user (simulated)
    const updatedMappings = [...mappings];
    updatedMappings[index] = {
        ...updatedMappings[index],
        reviewedAt: new Date().toISOString(),
        reviewedBy: '1' // Current User ID
    };

    DataService.saveADPMappings(updatedMappings);
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Mapping Review</h1>
           <p className="text-slate-500">Review recent mapping changes and approve updates.</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <TableHeader>
              <TableHead>Status</TableHead>
              <TableHead>ADP Vehicle</TableHead>
              <TableHead>Mapped To (SD)</TableHead>
              <TableHead>Updated By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableHeader>
            <tbody>
              {reviews.map(item => {
                const isReviewed = !!item.reviewedAt;
                
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      {isReviewed ? (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                           <CheckCircle2 size={12} /> Reviewed
                         </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                           <Clock size={12} /> Pending
                         </span>
                      )}
                    </TableCell>
                    <TableCell>
                        <span className="font-medium text-slate-700">{item.adpDesc}</span>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2 text-indigo-600 font-medium">
                            <ArrowRight size={14} className="text-slate-300" />
                            {item.sdDesc}
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="text-slate-900">{item.updatedByName}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <span className="text-slate-500 text-xs">
                            {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-'}
                        </span>
                    </TableCell>
                    <TableCell>
                        {!isReviewed ? (
                             <Button 
                                variant="primary" 
                                className="h-8 text-xs py-0 px-3 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/10"
                                onClick={() => handleMarkReviewed(item.id)}
                            >
                                <UserCheck size={14} /> Mark Reviewed
                             </Button>
                        ) : (
                            <div className="text-xs text-slate-400 flex flex-col">
                                <span>Approved by {item.reviewedByName}</span>
                                <span>{new Date(item.reviewedAt).toLocaleDateString()}</span>
                            </div>
                        )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No mapping activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};