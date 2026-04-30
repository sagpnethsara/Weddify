import { formatDate } from '@/lib/utils'

export default function ApprovalTable({ vendors, onApprove, onReject }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white p-6 shadow-soft">
      <h2 className="font-heading text-2xl">Pending Vendor Approvals</h2>
      <table className="mt-4 min-w-full text-left text-sm">
        <thead>
          <tr className="text-textSecondary">
            <th className="pb-2">Business</th>
            <th className="pb-2">Category</th>
            <th className="pb-2">Location</th>
            <th className="pb-2">Submitted</th>
            <th className="pb-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor._id} className="border-t border-border">
              <td className="py-3">{vendor.businessName}</td>
              <td className="py-3">{vendor.category}</td>
              <td className="py-3">{vendor.location}</td>
              <td className="py-3">{formatDate(vendor.createdAt)}</td>
              <td className="py-3">
                <div className="flex gap-2">
                  <button onClick={() => onApprove(vendor._id)} className="rounded-lg bg-success px-3 py-1 text-white">Approve</button>
                  <button onClick={() => onReject(vendor._id)} className="rounded-lg bg-error px-3 py-1 text-white">Reject</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
